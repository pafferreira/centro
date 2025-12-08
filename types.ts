export enum WorkerRole {
  Coordenador = "Coordenador",
  Medium = "Médium",
  Dialogo = "Diálogo",
  Psicografa = "Psicografa",
  Sustentacao = "Sustentação",
}

export interface Worker {
  id: string;
  name: string;
  contact?: string; // email or phone
  roles: WorkerRole[]; // A worker can have multiple skills
  isCoordinator: boolean; // Explicit toggle for room leadership
  assignedRoomId?: string | null;
  avatarUrl?: string;
}

export enum RoomType {
  Passe = "Passe",
  Outros = "Outros",
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  description?: string;
  avatarUrl?: string;
  /** Optional icon key to render an inline SVG icon for the room (e.g. 'SpaIcon') */
  avatarIcon?: string;
}

export type ViewState =
  | 'LOGIN'
  | 'DASHBOARD'
  | 'ROOM_ASSEMBLY'
  | 'WORKERS'
  | 'ROOMS'
  | 'LOCATIONS'
  | 'SETTINGS';
