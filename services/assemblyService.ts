import { Worker, Room, RoomType, WorkerRole } from "../types";
import { getAppRules } from "../utils/storage";

type Assignment = { workerId: string; roomId: string };

/**
 * Generate room assignments according to Dynamic Rules set from Settings:
 * - Reads `getAppRules` and determines execution order
 * - Respects the Capacity Limit if active
 */
export function generateAssembly(workers: Worker[], rooms: Room[]): Assignment[] {
  const assignments: Assignment[] = [];

  const appRules = getAppRules().filter(r => r.type === 'ROOM_ASSEMBLY' && r.isActive);
  const isCapacityLimited = appRules.some(r => r.id === 'rule_capacity_limit');
  const sortableRules = appRules.filter(r => !r.isRestriction).sort((a, b) => a.order - b.order);

  // Use only present workers and make a mutable copy
  const avail = workers
    .filter(w => w.present !== false)
    .map(w => ({ ...w, assigned: false }));

  const findAndAssign = (predicate: (w: typeof avail[0]) => boolean, roomId: string) => {
    const idx = avail.findIndex(w => !w.assigned && predicate(w));
    if (idx >= 0) {
      avail[idx].assigned = true;
      assignments.push({ workerId: avail[idx].id, roomId });
      return true;
    }
    return false;
  };

  // Prepare quick role-check helpers
  const hasRole = (w: typeof avail[0], role: WorkerRole) => w.roles.includes(role);

  // Define role priority order for Passe rooms
  const roleOrder = [
    WorkerRole.Coordenador,
    WorkerRole.Medium,
    WorkerRole.Dialogo,
    WorkerRole.Psicografa,
    WorkerRole.Sustentacao
  ];

  // Helper to get role priority (lower number = higher priority)
  const getRolePriority = (worker: Worker): number => {
    if (worker.isCoordinator) return 0; // Coordenador has highest priority

    for (let i = 0; i < roleOrder.length; i++) {
      if (worker.roles.includes(roleOrder[i])) {
        return i;
      }
    }
    return roleOrder.length; // No matching role
  };

  // 1) Handle Entrevista room
  const entrevistaRooms = rooms.filter(r => r.name.toLowerCase().includes('entrevista'));
  for (const room of entrevistaRooms) {
    while (!isCapacityLimited || assignments.filter(a => a.roomId === room.id).length < room.capacity) {
      const filled = findAndAssign(w => hasRole(w, WorkerRole.Entrevista), room.id);
      if (!filled) break;
    }
  }

  // 2) Handle Recepção room
  const recepcaoRooms = rooms.filter(r => r.name.toLowerCase().includes('recepção') || r.name.toLowerCase().includes('recepcao'));
  for (const room of recepcaoRooms) {
    while (!isCapacityLimited || assignments.filter(a => a.roomId === room.id).length < room.capacity) {
      const filled = findAndAssign(w => hasRole(w, WorkerRole.Recepção), room.id);
      if (!filled) break;
    }
  }

  // 3) Handle Passe rooms
  const passeRooms = rooms.filter(r =>
    r.type === RoomType.Passe ||
    r.name.toLowerCase().includes('passe')
  );

  const assignRoleRoundRobin = (role: WorkerRole, validRooms: Room[]) => {
    if (validRooms.length === 0) return;
    let roomIndex = 0;
    let fullRoomsCount = 0;

    while (true) {
      if (fullRoomsCount >= validRooms.length) {
        break; // break if all rooms are full
      }

      const targetRoom = validRooms[roomIndex % validRooms.length];
      const currentCount = assignments.filter(a => a.roomId === targetRoom.id).length;

      if (isCapacityLimited && currentCount >= targetRoom.capacity) {
        fullRoomsCount++;
        roomIndex += 1;
        continue;
      }

      const filled = findAndAssign(w => hasRole(w, role), targetRoom.id);
      if (!filled) break; // no more non-assigned workers with this role

      fullRoomsCount = 0; // reset because we found a room that accepted a worker
      roomIndex += 1;
    }
  };

  // Dinamicamente processa as regras ativas ordenadas
  for (const rule of sortableRules) {
    if (rule.id === 'rule_coord_priority') {
      for (const room of passeRooms) {
        if (!isCapacityLimited || assignments.filter(a => a.roomId === room.id).length < room.capacity) {
          findAndAssign(w => w.isCoordinator === true, room.id);
        }
      }
    } else if (rule.id === 'rule_medium_dist') {
      assignRoleRoundRobin(WorkerRole.Medium, passeRooms);
    } else if (rule.id === 'rule_sust_fill') {
      assignRoleRoundRobin(WorkerRole.Sustentacao, passeRooms);
    }
  }

  // Garante a distribuição dos papéis sem regra customizável na UI para preencher eventuais furos
  assignRoleRoundRobin(WorkerRole.Dialogo, passeRooms);
  assignRoleRoundRobin(WorkerRole.Psicografa, passeRooms);

  // Sort assignments to maintain role order within each room
  const sortedAssignments = assignments.map(assignment => {
    const worker = workers.find(w => w.id === assignment.workerId);
    return {
      ...assignment,
      priority: worker ? getRolePriority(worker) : 999
    };
  }).sort((a, b) => {
    // First sort by room
    if (a.roomId !== b.roomId) {
      return a.roomId.localeCompare(b.roomId);
    }
    // Then by role priority
    return a.priority - b.priority;
  });

  // Return without priority field
  return sortedAssignments.map(({ workerId, roomId }) => ({ workerId, roomId }));
}

export default generateAssembly;
