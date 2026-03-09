import { PasseAttendance, Room, WorkerRole, PasseType, AttendancePhase, AttendanceStatus, Worker } from "../types";
import { getAppRules } from "./storage";

export interface RoomDistribution {
    room: Room;
    attendances: PasseAttendance[];
}

interface RoomCapability {
    room: Room;
    hasMedium: boolean;
    hasDialogo: boolean;
    currentQueueSize: number;
}

function getAttendancePriority(attendance: PasseAttendance): number {
    if (attendance.attendancePhase === AttendancePhase.PrimeiraVez || attendance.attendancePhase === AttendancePhase.Retorno) {
        return 0;
    }
    if (attendance.attendancePhase === AttendancePhase.EmAtendimento && attendance.passeType === PasseType.A2) {
        return 1;
    }
    if (attendance.attendancePhase === AttendancePhase.EmAtendimento && attendance.passeType === PasseType.A1) {
        return 2;
    }
    return 3;
}

function getValidRoomsForAttendance(attendance: PasseAttendance, roomCapabilities: RoomCapability[]): RoomCapability[] {
    if (attendance.attendancePhase === AttendancePhase.PrimeiraVez || attendance.attendancePhase === AttendancePhase.Retorno) {
        return roomCapabilities.filter(r => r.hasMedium);
    }

    if (attendance.attendancePhase === AttendancePhase.EmAtendimento && attendance.passeType === PasseType.A2) {
        return roomCapabilities.filter(r => r.hasMedium && r.hasDialogo);
    }

    return roomCapabilities.filter(r => r.hasMedium);
}

function chooseRoom(validRooms: RoomCapability[], isBalanceActive: boolean): RoomCapability | null {
    if (validRooms.length === 0) {
        return null;
    }

    if (!isBalanceActive) {
        return validRooms[0];
    }

    return validRooms.reduce((prev, curr) => {
        if (curr.currentQueueSize !== prev.currentQueueSize) {
            return curr.currentQueueSize < prev.currentQueueSize ? curr : prev;
        }
        return curr.room.name.localeCompare(prev.room.name, 'pt-BR') < 0 ? curr : prev;
    });
}

export function distributeAttendances(attendances: PasseAttendance[], rooms: Room[], workersList: Worker[]): RoomDistribution[] {
    const roomCapabilities: RoomCapability[] = rooms
        .filter(r => r.type === 'Passe')
        .map(room => {
            const workersInRoom = workersList.filter(w => w.assignedRoomId === room.id && w.present);
            const hasMedium = workersInRoom.some(w => w.roles.includes(WorkerRole.Medium));
            const hasDialogo = workersInRoom.some(w => w.roles.includes(WorkerRole.Dialogo));
            return {
                room,
                hasMedium,
                hasDialogo,
                currentQueueSize: 0,
            };
        })
        .filter(r => r.hasMedium);

    const distribution: Record<string, PasseAttendance[]> = {};
    roomCapabilities.forEach(rc => {
        distribution[rc.room.id] = [];
    });

    const balanceRule = getAppRules().find(r => r.id === 'rule_dist_balance');
    const isBalanceActive = balanceRule ? balanceRule.isActive : false;

    const arrivalIndexById = new Map(attendances.map((att, idx) => [att.id, idx]));

    const allocateToRoom = (attendance: PasseAttendance, roomId: string, countInQueue: boolean): PasseAttendance => {
        const withRoom = attendance.allocatedRoomId === roomId
            ? attendance
            : { ...attendance, allocatedRoomId: roomId };

        distribution[roomId].push(withRoom);

        if (countInQueue) {
            const rc = roomCapabilities.find(r => r.room.id === roomId);
            if (rc) {
                rc.currentQueueSize += 1;
            }
        }

        return withRoom;
    };

    const activeInRoom = attendances.filter(
        a => a.status === AttendanceStatus.NaSala || a.status === AttendanceStatus.EmAtendimento
    );
    const atendidos = attendances.filter(a => a.status === AttendanceStatus.Atendido);
    const aguardando = attendances.filter(a => a.status === AttendanceStatus.Aguardando);

    activeInRoom.forEach(attendance => {
        const validRooms = getValidRoomsForAttendance(attendance, roomCapabilities);
        const keepCurrent = attendance.allocatedRoomId && validRooms.some(r => r.room.id === attendance.allocatedRoomId);

        if (keepCurrent) {
            allocateToRoom(attendance, attendance.allocatedRoomId!, true);
            return;
        }

        const chosenRoom = chooseRoom(validRooms, isBalanceActive);
        if (chosenRoom) {
            allocateToRoom(attendance, chosenRoom.room.id, true);
        }
    });

    atendidos.forEach(attendance => {
        if (attendance.allocatedRoomId && distribution[attendance.allocatedRoomId]) {
            allocateToRoom(attendance, attendance.allocatedRoomId, false);
            return;
        }

        const fallbackRoom = roomCapabilities[0];
        if (fallbackRoom) {
            allocateToRoom(attendance, fallbackRoom.room.id, false);
        }
    });

    const toAllocate: PasseAttendance[] = [];

    aguardando.forEach(attendance => {
        const validRooms = getValidRoomsForAttendance(attendance, roomCapabilities);
        const keepCurrent = attendance.allocatedRoomId && validRooms.some(r => r.room.id === attendance.allocatedRoomId);

        if (keepCurrent) {
            allocateToRoom(attendance, attendance.allocatedRoomId!, true);
        } else {
            toAllocate.push(attendance);
        }
    });

    toAllocate.sort((a, b) => {
        const priorityDiff = getAttendancePriority(a) - getAttendancePriority(b);
        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        return (arrivalIndexById.get(a.id) ?? 0) - (arrivalIndexById.get(b.id) ?? 0);
    });

    toAllocate.forEach(attendance => {
        const validRooms = getValidRoomsForAttendance(attendance, roomCapabilities);
        const chosenRoom = chooseRoom(validRooms, isBalanceActive);

        if (chosenRoom) {
            allocateToRoom(attendance, chosenRoom.room.id, true);
        }
    });

    return roomCapabilities.map(rc => ({
        room: rc.room,
        attendances: distribution[rc.room.id] || [],
    }));
}
