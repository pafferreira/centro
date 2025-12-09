import { Worker, Room, RoomType, WorkerRole } from "../types";

export const initialWorkers: Worker[] = [
    { id: '1', name: 'Ana Silva', roles: [WorkerRole.Coordenador], isCoordinator: true, assignedRoomId: 'room1', present: true },
    { id: '2', name: 'Carlos Souza', roles: [WorkerRole.Medium], isCoordinator: false, assignedRoomId: 'room1', present: true },
    { id: '3', name: 'Beatriz Lima', roles: [WorkerRole.Dialogo], isCoordinator: false, assignedRoomId: 'room1', present: true },
    { id: '4', name: 'Davi Rocha', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'room1', present: true },
    { id: '5', name: 'Elisa Costa', roles: [WorkerRole.Coordenador], isCoordinator: true, assignedRoomId: 'room2', present: true },
    { id: '6', name: 'Felipe Almeida', roles: [WorkerRole.Medium], isCoordinator: false, assignedRoomId: 'room2', present: true },
    { id: '7', name: 'Gabriela Dias', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'room2', present: true },
    { id: '8', name: 'Heitor Pereira', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'loc1', present: true },
    { id: '9', name: 'Isabela Gomes', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: 'loc1', present: true },
    { id: '10', name: 'Júlia Martins', roles: [WorkerRole.Dialogo], isCoordinator: false, assignedRoomId: 'loc2', present: true },
    { id: '11', name: 'Lucas Fernandes', roles: [WorkerRole.Sustentacao], isCoordinator: false, assignedRoomId: null, present: true },
];

export const initialRooms: Room[] = [
    { id: 'room1', name: 'Sala de Passe 1', capacity: 8, type: RoomType.Passe, avatarIcon: 'DoorIcon' },
    { id: 'room2', name: 'Sala de Passe 2', capacity: 8, type: RoomType.Passe, avatarIcon: 'DoorIcon' },
    { id: 'loc1', name: 'Recepção', capacity: 5, type: RoomType.Outros },
    { id: 'loc2', name: 'Palestra', capacity: 50, type: RoomType.Outros },
];
