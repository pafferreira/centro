import { Worker, Room, RoomType, WorkerRole } from "../types";

type Assignment = { workerId: string; roomId: string };

/**
 * Generate room assignments according to rules:
 * - Distribute workers only to 'Passe' rooms and 'Recepção' using only workers marked as present.
 * - Handle 'Recepção' first, using only workers with the Recepção skill.
 * - For each 'Passe' room, assign workers in order: Coordenador, Médium, Diálogo, Psicografa, Sustentação.
 * - If there are not enough workers for a role, leave remaining workers unassigned instead of overfilling rooms.
 * - Do not exceed room capacity.
 */
export function generateAssembly(workers: Worker[], rooms: Room[]): Assignment[] {
  const assignments: Assignment[] = [];

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

  // 1) Handle Recepção room (identified by name) before other rooms to preserve the specialized skill
  const recepcaoRooms = rooms.filter(r => r.name.toLowerCase().includes('recepção') || r.name.toLowerCase().includes('recepcao'));
  for (const room of recepcaoRooms) {
    // Use only workers with Recepção skill
    findAndAssign(w => hasRole(w, WorkerRole.Recepção), room.id);

    // Fill remaining slots
    while (assignments.filter(a => a.roomId === room.id).length < room.capacity) {
      const filled = findAndAssign(w => hasRole(w, WorkerRole.Recepção), room.id);
      if (!filled) break;
    }
  }

  // 2) Handle Passe rooms (by type or name containing "Passe")
  const passeRooms = rooms.filter(r =>
    r.type === RoomType.Passe ||
    r.name.toLowerCase().includes('passe')
  );
  for (const room of passeRooms) {
    // Assign in priority order: Coordenador, Médium, Diálogo, Psicografa, Sustentação

    // 1. Coordenador
    findAndAssign(w => w.isCoordinator === true, room.id);

    // 2. Médium
    findAndAssign(w => hasRole(w, WorkerRole.Medium), room.id);

    // 3. Diálogo
    findAndAssign(w => hasRole(w, WorkerRole.Dialogo), room.id);

    // 4. Psicografa
    findAndAssign(w => hasRole(w, WorkerRole.Psicografa), room.id);

    // 5. Fill remaining slots with Sustentação (do not overfill with other roles)
    while (assignments.filter(a => a.roomId === room.id).length < room.capacity) {
      const filled = findAndAssign(w => hasRole(w, WorkerRole.Sustentacao), room.id);
      if (!filled) break;
    }
  }

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
