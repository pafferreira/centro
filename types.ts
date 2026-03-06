export enum WorkerRole {
  Coordenador = "Coordenador",
  Medium = "Médium",
  Dialogo = "Diálogo",
  Psicografa = "Psicografa",
  Sustentacao = "Sustentação",
  Entrevista = "Entrevista",
  Recepção = "Recepção"
}

export interface Assistido {
  id: string;
  nome: string;
  telefone?: string;
  dataNascimento?: string;
  observacoes?: string;
}

export interface FichaAssistencia {
  id: string;
  assistidoId: string;
  entrevistadorId?: string | null;
  dataEntrevista: string;
  qtdA2: number;
  qtdA1: number;
  tipoFicha: 'Inicial' | 'Acompanhamento';
  statusFicha: 'Ativa' | 'Concluida';
}

export interface Worker {
  id: string;
  name: string;
  contact?: string; // email or phone
  roles: WorkerRole[]; // A worker can have multiple skills
  isCoordinator: boolean; // Explicit toggle for room leadership
  present?: boolean; // Present in the center for allocation
  assignedRoomId?: string | null;
  avatarUrl?: string;
}

export enum RoomType {
  Passe = "Passe",
  Palestra = "Palestra",
  Aulinha = "Aulinha",
  Recepcao = "Recepção",
  Entrevista = "Entrevista",
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
  | 'SETTINGS'
  | 'ASSISTANCE'
  | 'PASSE_REGISTRATION'
  | 'PASSE_DISTRIBUTION';

export enum PasseType {
  A1 = "A1",
  A2 = "A2",
  Nenhum = "-"
}

export enum AttendancePhase {
  PrimeiraVez = "Primeira Vez",
  Retorno = "Retorno",
  Normal = "Normal"
}

export enum AttendanceStatus {
  Aguardando = "Aguardando",
  NaSala = "Na Sala",
  Atendido = "Atendido"
}

export interface PasseAttendance {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  assistidoName: string;
  assistidoId: string;
  passeType: PasseType;
  attendancePhase: AttendancePhase;
  status: AttendanceStatus;
  allocatedRoomId?: string | null;
}

export interface AppRule {
  id: string; // Ex: 'rule_coord_priority'
  type: 'ROOM_ASSEMBLY' | 'PASSE_DISTRIBUTION';
  label: string;
  description: string;
  isActive: boolean;
  order: number; // Order to be executed
  configurable?: boolean; // Se o usuário pode ligar/desligar
  isRestriction?: boolean; // Se for restrição, vai para um bloco de regras absolutas (ex: limite de pessoas)
}

