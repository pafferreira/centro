import { PasseAttendance, Room, WorkerRole, PasseType, AttendancePhase, AttendanceStatus, Worker } from "../types";
import { getAppRules } from "./storage";

export interface RoomDistribution {
    room: Room;
    attendances: PasseAttendance[];
}

export function distributeAttendances(attendances: PasseAttendance[], rooms: Room[], workersList: Worker[]): RoomDistribution[] {
    // 1. Get available Passe rooms (that have at least one worker)
    // 2. Map workers to each room to determine capabilities

    interface RoomCapability {
        room: Room;
        hasMedium: boolean;
        hasDialogo: boolean;
        currentQueueSize: number;
    }

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
                currentQueueSize: 0
            };
        })
        .filter(r => r.hasMedium); // A room without a medium can't be used for passe at all

    // We will build the distribution result
    const distribution: Record<string, PasseAttendance[]> = {};
    roomCapabilities.forEach(rc => {
        distribution[rc.room.id] = [];
    });

    // 3. Separate attendances
    const atendidos = attendances.filter(a => a.status === AttendanceStatus.Atendido || a.status === AttendanceStatus.NaSala);
    const aguardando = attendances.filter(a => a.status === AttendanceStatus.Aguardando);

    atendidos.forEach(a => {
        if (a.allocatedRoomId && distribution[a.allocatedRoomId]) {
            distribution[a.allocatedRoomId].push(a);
        } else {
            // Unallocated but attended? Just put in an arbitrary or first room.
            const firstRoom = roomCapabilities[0];
            if (firstRoom) {
                distribution[firstRoom.room.id].push(a);
            }
        }
    });

    // We process aguardando. Those that are already allocated AND their allocated room is STILL valid, keep them.
    // Otherwise reallocate.

    const toAllocate: PasseAttendance[] = [];
    const distributionRules = getAppRules().filter(r => r.type === 'PASSE_DISTRIBUTION' && r.isActive && !r.isRestriction).sort((a, b) => a.order - b.order);
    const balanceRule = getAppRules().find(r => r.id === 'rule_dist_balance');
    const isBalanceActive = balanceRule ? balanceRule.isActive : false;

    aguardando.forEach(a => {
        let needsAllocation = true;
        if (a.allocatedRoomId && distribution[a.allocatedRoomId]) {
            const rc = roomCapabilities.find(r => r.room.id === a.allocatedRoomId);
            if (rc) {
                // Check if the room STILL satisfies the rules for this attendance
                let isStillValid = false;

                if (a.attendancePhase === AttendancePhase.PrimeiraVez || a.attendancePhase === AttendancePhase.Retorno) {
                    isStillValid = rc.hasMedium;
                } else if (a.attendancePhase === AttendancePhase.Normal && a.passeType === PasseType.A2) {
                    isStillValid = rc.hasMedium && rc.hasDialogo;
                } else if (a.attendancePhase === AttendancePhase.Normal && a.passeType === PasseType.A1) {
                    isStillValid = rc.hasMedium;
                }

                if (isStillValid) {
                    needsAllocation = false;
                    distribution[a.allocatedRoomId].push(a);
                    rc.currentQueueSize += 1;
                }
            }
        }
        if (needsAllocation) {
            toAllocate.push(a);
        }
    });

    // Sort based on dynamically set priorities
    const getPriority = (attendance: PasseAttendance): number => {
        for (let i = 0; i < distributionRules.length; i++) {
            const rule = distributionRules[i];
            if (rule.id === 'rule_dist_first_time' && attendance.attendancePhase === AttendancePhase.PrimeiraVez) return i;
            if (rule.id === 'rule_dist_retorno' && attendance.attendancePhase === AttendancePhase.Retorno) return i;
            if (rule.id === 'rule_dist_a2' && attendance.passeType === PasseType.A2) return i;
            if (rule.id === 'rule_dist_a1' && attendance.passeType === PasseType.A1 && attendance.attendancePhase === AttendancePhase.Normal) return i;
        }
        return 999; // Fallback se não bater em nenhuma regra ativa
    };

    toAllocate.sort((a, b) => getPriority(a) - getPriority(b));

    // Balance remaining
    toAllocate.forEach(attendance => {
        let validRooms = roomCapabilities;

        if (attendance.attendancePhase === AttendancePhase.PrimeiraVez || attendance.attendancePhase === AttendancePhase.Retorno) {
            // Needs Medium, all our valid rooms already have Medium
        } else if (attendance.attendancePhase === AttendancePhase.Normal && attendance.passeType === PasseType.A2) {
            // Needs Medium + Dialogo
            validRooms = roomCapabilities.filter(r => r.hasDialogo);
        } else if (attendance.attendancePhase === AttendancePhase.Normal && attendance.passeType === PasseType.A1) {
            // Any valid
        }

        if (validRooms.length > 0) {
            let chosenRoom = validRooms[0];
            if (isBalanceActive) {
                // Pick room with lowest queue size (balance)
                chosenRoom = validRooms.reduce((prev, curr) => {
                    return (curr.currentQueueSize < prev.currentQueueSize) ? curr : prev;
                });
            }

            // Allocate
            attendance.allocatedRoomId = chosenRoom.room.id;
            distribution[chosenRoom.room.id].push(attendance);
            chosenRoom.currentQueueSize += 1;
        } else {
            // If no valid room found, mark it unallocated or keep allocatedRoomId null
            attendance.allocatedRoomId = null;
        }
    });

    return roomCapabilities.map(rc => ({
        room: rc.room,
        attendances: distribution[rc.room.id] || []
    }));
}
