import { Worker, Room, RoomType, WorkerRole } from "../types";

type Assignment = { workerId: string; roomId: string };

/**
 * Generate room assignments according to rules:
 * - Distribute workers only to 'Passe' rooms and 'Recepção' using only workers marked as present.
 * - Handle 'Entrevista' first, using only workers with the Entrevista skill.
 * - Handle 'Recepção' first, using only workers with the Recepção skill.
 * - For each 'Passe' room, assign workers in order: Coordenador, Médium, Diálogo, Psicografa, Sustentação.
 * - A 'Passe' room only receives workers if it has a Coordenador assigned.
 * - If there are not enough workers for a role, fill remaining Passe slots with any available workers.
 * - Do not exceed room capacity for Recepção; Passe rooms can receive extra workers to avoid unassigned people.
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

  // 1) Handle Entrevista room (identified by name) before other rooms to preserve the specialized skill
  const entrevistaRooms = rooms.filter(r => r.name.toLowerCase().includes('entrevista'));
  for (const room of entrevistaRooms) {
    // Use only workers with Entrevista skill
    while (assignments.filter(a => a.roomId === room.id).length < room.capacity) {
      const filled = findAndAssign(w => hasRole(w, WorkerRole.Entrevista), room.id);
      if (!filled) break;
    }
  }

  // 2) Handle Recepção room (identified by name) before other rooms to preserve the specialized skill
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

  // 3) Handle Passe rooms (by type or name containing "Passe")
  const passeRooms = rooms.filter(r =>
    r.type === RoomType.Passe ||
    r.name.toLowerCase().includes('passe')
  );
  const passeRoomsWithCoordinator = new Set<string>();

  // 2.1) Coordenador: one per room, in room order
  for (const room of passeRooms) {
    const hasCoordinator = findAndAssign(w => w.isCoordinator === true, room.id);
    if (hasCoordinator) {
      passeRoomsWithCoordinator.add(room.id);
    }
  }

  const eligiblePasseRooms = passeRooms.filter(room => passeRoomsWithCoordinator.has(room.id));

  const assignRoleRoundRobin = (role: WorkerRole) => {
    if (eligiblePasseRooms.length === 0) return;
    let roomIndex = 0;
    while (true) {
      const targetRoom = eligiblePasseRooms[roomIndex % eligiblePasseRooms.length];
      const filled = findAndAssign(w => hasRole(w, role), targetRoom.id);
      if (!filled) break;
      roomIndex += 1;
    }
  };

  // 2.2) Médium -> Diálogo -> Psicografa -> Sustentação (round-robin across rooms)
  assignRoleRoundRobin(WorkerRole.Medium);
  assignRoleRoundRobin(WorkerRole.Dialogo);
  assignRoleRoundRobin(WorkerRole.Psicografa);
  assignRoleRoundRobin(WorkerRole.Sustentacao);

  // 3) Ensure no present worker remains unassigned: spread extras across Passe rooms
  if (passeRoomsWithCoordinator.size > 0) {
    let roomIndex = 0;
    for (const worker of avail.filter(w => !w.assigned)) {
      const room = eligiblePasseRooms[roomIndex % eligiblePasseRooms.length];
      worker.assigned = true;
      assignments.push({ workerId: worker.id, roomId: room.id });
      roomIndex += 1;
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
