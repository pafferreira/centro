import {
  Worker,
  Room,
  PasseAttendance,
  RoomType,
  WorkerRole,
  Assistido,
  AppRule,
  FichaAssistencia,
} from "../types";
import { supabase } from "../services/supabaseClient";

// ============================================================================
// MAPEAMENTO: TypeScript (camelCase) <-> Supabase (snake_case PT-BR)
// ============================================================================

// --- ROOMS ---
function roomFromDb(row: any): Room {
  return {
    id: row.id,
    name: row.nome_sala,
    type: row.tipo_sala as RoomType,
    capacity: row.capacidade,
    description: row.descricao ?? undefined,
    avatarUrl: row.url_avatar ?? undefined,
    avatarIcon: row.icone_avatar ?? undefined,
    status: (row.status as 'Aberto' | 'Fechado') ?? 'Aberto',
  };
}

function roomToDb(room: Room): Record<string, any> {
  return {
    id: room.id,
    nome_sala: room.name,
    tipo_sala: room.type,
    capacidade: room.capacity,
    descricao: room.description ?? null,
    url_avatar: room.avatarUrl ?? null,
    icone_avatar: room.avatarIcon ?? null,
    status: room.status ?? 'Aberto',
  };
}

// --- WORKERS ---
function workerFromDb(row: any): Worker {
  return {
    id: row.id,
    name: row.nome_trabalhador,
    contact: row.contato ?? undefined,
    roles: (row.papeis ?? []) as WorkerRole[],
    isCoordinator: row.coordenador ?? false,
    present: row.presente ?? true,
    assignedRoomId: row.id_sala_alocada ?? null,
    avatarUrl: row.url_avatar ?? undefined,
  };
}

function workerToDb(worker: Worker): Record<string, any> {
  return {
    id: worker.id,
    nome_trabalhador: worker.name,
    contato: worker.contact ?? null,
    papeis: worker.roles,
    coordenador: worker.isCoordinator,
    presente: worker.present ?? true,
    id_sala_alocada: worker.assignedRoomId ?? null,
    url_avatar: worker.avatarUrl ?? null,
  };
}

// --- PASSE ATTENDANCES ---
function attendanceFromDb(row: any): PasseAttendance {
  return {
    id: row.id,
    date: row.data_atendimento,
    assistidoId: row.id_assistido,
    assistidoName:
      row.nome_assistido_cache ?? row.gfa_assistidos?.nome_assistido ?? "",
    passeType: row.tipo_passe,
    attendancePhase: row.fase_atendimento,
    status: row.status_atendimento,
    allocatedRoomId: row.id_sala_alocada ?? null,
    fichaAssistenciaId: row.id_ficha_assistencia ?? undefined,
    horaEntrada: row.hora_entrada ?? undefined,
    horaSaida: row.hora_saida ?? undefined,
  };
}

function attendanceToDb(att: PasseAttendance): Record<string, any> {
  return {
    id: att.id,
    data_atendimento: att.date,
    tipo_passe: att.passeType,
    fase_atendimento: att.attendancePhase,
    status_atendimento: att.status,
    id_assistido: att.assistidoId,
    id_sala_alocada: att.allocatedRoomId ?? null,
    id_ficha_assistencia: att.fichaAssistenciaId ?? null,
    hora_entrada: att.horaEntrada ?? null,
    hora_saida: att.horaSaida ?? null,
  };
}

// ============================================================================
// FUNÇÕES CRUD – ROOMS (gfa_salas)
// ============================================================================

export async function loadRooms(): Promise<Room[]> {
  try {
    const { data, error } = await supabase
      .from("gfa_salas")
      .select("*")
      .order("criado_em", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(roomFromDb);
  } catch (error) {
    console.error("Erro ao carregar salas do Supabase:", error);
    return [];
  }
}

export async function saveRooms(rooms: Room[]): Promise<void> {
  try {
    const rows = rooms.map(roomToDb);
    const { error } = await supabase
      .from("gfa_salas")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar salas no Supabase:", error);
  }
}

export async function saveRoom(room: Room): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_salas")
      .upsert(roomToDb(room), { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar sala no Supabase:", error);
  }
}

export async function deleteRoom(roomId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_salas")
      .delete()
      .eq("id", roomId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar sala no Supabase:", error);
  }
}

// ============================================================================
// FUNÇÕES CRUD – ASSISTIDOS (gfa_assistidos)
// ============================================================================

export async function loadAssistidos(): Promise<Assistido[]> {
  try {
    const { data, error } = await supabase
      .from("gfa_assistidos")
      .select("*")
      .order("nome_assistido", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      nome: row.nome_assistido,
      telefone: row.telefone ?? undefined,
      observacoes: row.observacoes ?? undefined,
    }));
  } catch (error) {
    console.error("Erro ao carregar assistidos do Supabase:", error);
    return [];
  }
}

export async function saveAssistido(assistido: Assistido): Promise<void> {
  try {
    const row = {
      id: assistido.id,
      nome_assistido: assistido.nome,
      telefone: assistido.telefone ?? null,
      observacoes: assistido.observacoes ?? null,
    };

    const { error } = await supabase
      .from("gfa_assistidos")
      .upsert(row, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar assistido no Supabase:", error);
  }
}

export async function deleteAssistido(assistidoId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_assistidos")
      .delete()
      .eq("id", assistidoId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar assistido no Supabase:", error);
  }
}

// ============================================================================
// FUNÇÕES CRUD – FICHAS (gfa_fichas_assistencia)
// ============================================================================

export async function loadFichasAssistencia(): Promise<FichaAssistencia[]> {
  try {
    const { data, error } = await supabase
      .from("gfa_fichas_assistencia")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      assistidoId: row.id_assistido,
      entrevistadorId: row.id_entrevistador ?? undefined,
      dataEntrevista: row.data_entrevista,
      qtdA2: row.qtd_a2,
      qtdA1: row.qtd_a1,
      tipoFicha: row.tipo_ficha,
      statusFicha: row.status_ficha,
      realizadoA2: row.realizado_a2 ?? 0,
      realizadoA1: row.realizado_a1 ?? 0,
    }));
  } catch (error) {
    console.error("Erro ao carregar fichas de assistência do Supabase:", error);
    return [];
  }
}

export async function saveFichaAssistencia(
  ficha: FichaAssistencia,
): Promise<void> {
  try {
    const row = {
      id: ficha.id,
      id_assistido: ficha.assistidoId,
      id_entrevistador: ficha.entrevistadorId ?? null,
      data_entrevista: ficha.dataEntrevista,
      qtd_a2: ficha.qtdA2,
      qtd_a1: ficha.qtdA1,
      tipo_ficha: ficha.tipoFicha,
      status_ficha: ficha.statusFicha,
      realizado_a2: ficha.realizadoA2 ?? 0,
      realizado_a1: ficha.realizadoA1 ?? 0,
    };

    const { error } = await supabase
      .from("gfa_fichas_assistencia")
      .upsert(row, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar ficha_assistencia no Supabase:", error);
  }
}

export async function updateFichaRealizado(
  fichaId: string,
  type: "A1" | "A2",
): Promise<void> {
  try {
    const { data, error: fetchError } = await supabase
      .from("gfa_fichas_assistencia")
      .select("realizado_a1, realizado_a2")
      .eq("id", fichaId)
      .single();

    if (fetchError) throw fetchError;

    const update =
      type === "A2"
        ? { realizado_a2: (data.realizado_a2 ?? 0) + 1 }
        : { realizado_a1: (data.realizado_a1 ?? 0) + 1 };

    const { error } = await supabase
      .from("gfa_fichas_assistencia")
      .update(update)
      .eq("id", fichaId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao atualizar realizado na ficha:", error);
  }
}

// ============================================================================
// FUNÇÕES CRUD – WORKERS (gfa_trabalhadores)
// ============================================================================

export async function loadWorkers(): Promise<Worker[]> {
  try {
    const { data, error } = await supabase
      .from("gfa_trabalhadores")
      .select("*")
      .order("criado_em", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(workerFromDb);
  } catch (error) {
    console.error("Erro ao carregar trabalhadores do Supabase:", error);
    return [];
  }
}

export async function saveWorkers(workers: Worker[]): Promise<void> {
  try {
    const rows = workers.map(workerToDb);
    const { error } = await supabase
      .from("gfa_trabalhadores")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar trabalhadores no Supabase:", error);
  }
}

export async function saveWorker(worker: Worker): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_trabalhadores")
      .upsert(workerToDb(worker), { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar trabalhador no Supabase:", error);
  }
}

export async function deleteWorker(workerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_trabalhadores")
      .delete()
      .eq("id", workerId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar trabalhador no Supabase:", error);
  }
}

// ============================================================================
// FUNÇÕES CRUD – ATTENDANCES (gfa_atendimentos_passe)
// ============================================================================

export async function loadAttendances(): Promise<PasseAttendance[]> {
  try {
    // Join with gfa_assistidos to get the name
    const { data, error } = await supabase
      .from("gfa_atendimentos_passe")
      .select("*, gfa_assistidos(nome_assistido)")
      .order("criado_em", { ascending: true });

    if (error) throw error;

    return (data ?? []).map(attendanceFromDb);
  } catch (error) {
    console.error("Erro ao carregar atendimentos do Supabase:", error);
    return [];
  }
}

export async function saveAttendances(
  attendances: PasseAttendance[],
): Promise<void> {
  try {
    const rows = attendances.map(attendanceToDb);
    const { error } = await supabase
      .from("gfa_atendimentos_passe")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao salvar atendimentos no Supabase:", error);
  }
}

export async function linkFichaAssistenciaToAttendances(
  assistidoId: string,
  fichaId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_atendimentos_passe")
      .update({ id_ficha_assistencia: fichaId })
      .eq("id_assistido", assistidoId)
      .is("id_ficha_assistencia", null);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao vincular ficha nos atendimentos:", error);
  }
}

export async function saveAttendance(att: PasseAttendance): Promise<void> {
  try {
    const row = attendanceToDb(att);
    const { error } = await supabase
      .from("gfa_atendimentos_passe")
      .upsert(row, { onConflict: "id" });

    if (error) throw error;
  } catch (error: any) {
    console.error("Erro ao salvar atendimento no Supabase:", error);
  }
}

export async function deleteAttendance(attendanceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("gfa_atendimentos_passe")
      .delete()
      .eq("id", attendanceId);

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao deletar atendimento no Supabase:", error);
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS (Export / Import / Clear)
// ============================================================================

export async function exportData(): Promise<string> {
  const workers = await loadWorkers();
  const rooms = await loadRooms();
  const data = {
    workers,
    rooms,
    exportedAt: new Date().toISOString(),
    version: "2.0-supabase",
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(
  jsonString: string,
): Promise<{ workers: Worker[]; rooms: Room[] } | null> {
  try {
    const data = JSON.parse(jsonString);

    if (!data.workers || !Array.isArray(data.workers)) {
      throw new Error("Dados de trabalhadores inválidos");
    }
    if (!data.rooms || !Array.isArray(data.rooms)) {
      throw new Error("Dados de salas inválidos");
    }

    return {
      workers: data.workers as Worker[],
      rooms: data.rooms as Room[],
    };
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return null;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await supabase
      .from("gfa_atendimentos_passe")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("gfa_fichas_assistencia")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("gfa_assistidos")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("gfa_trabalhadores")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("gfa_salas")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
  }
}

export function getLastModified(): string | null {
  // Não é mais necessário com Supabase (ele gerencia timestamps com criado_em)
  return new Date().toISOString();
}

export async function getStorageSize(): Promise<string> {
  // No Supabase, não temos um conceito simples de "tamanho do storage local"
  // Retornamos uma estimativa baseada na contagem de registros
  try {
    const { count: wCount } = await supabase
      .from("gfa_trabalhadores")
      .select("*", { count: "exact", head: true });
    const { count: rCount } = await supabase
      .from("gfa_salas")
      .select("*", { count: "exact", head: true })
      .eq("tipo_sala", "Passe");
    return `${wCount ?? 0} trabalhadores, ${rCount ?? 0} salas de passes`;

  } catch (error) {
    console.error("Erro ao calcular tamanho:", error);
    return "Desconhecido";
  }
}

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO (AppRules) - Armazenamento Local Inicial
// ============================================================================

export const DEFAULT_RULES: AppRule[] = [
  {
    id: "rule_coord_priority",
    type: "ROOM_ASSEMBLY",
    label: "Coordenadores",
    description:
      "Garantir que cada sala tenha exatamente 1 Coordenador habilitado.",
    isActive: true,
    order: 1,
    configurable: true,
  },
  {
    id: "rule_medium_dist",
    type: "ROOM_ASSEMBLY",
    label: "Distribuição de Médiuns",
    description:
      "Médiuns devem ser distribuídos de forma equalitária entre as salas.",
    isActive: true,
    order: 2,
    configurable: true,
  },
  {
    id: "rule_sust_fill",
    type: "ROOM_ASSEMBLY",
    label: "Sustentação",
    description:
      "Completar os assentos restantes com trabalhadores de Sustentação.",
    isActive: true,
    order: 3,
    configurable: true,
  },
  {
    id: "rule_capacity_limit",
    type: "ROOM_ASSEMBLY",
    label: "Restrição: Capacidade Máxima",
    description:
      "Não permitir que o número de trabalhadores alocados ultrapasse a capacidade total da sala.",
    isActive: true,
    order: 0,
    configurable: true,
    isRestriction: true,
  },
  {
    id: "rule_dist_first_time",
    type: "PASSE_DISTRIBUTION",
    label: "1ª Vez (Sala c/ Médium)",
    description:
      'Prioriza assistidos em fase de "Primeira Vez". Requer sala com Médium.',
    isActive: true,
    order: 1,
    configurable: true,
  },
  {
    id: "rule_dist_retorno",
    type: "PASSE_DISTRIBUTION",
    label: "Retorno (Sala c/ Médium)",
    description:
      'Prioriza assistidos em fase de "Retorno". Requer sala com Médium.',
    isActive: true,
    order: 2,
    configurable: true,
  },
  {
    id: "rule_dist_a2",
    type: "PASSE_DISTRIBUTION",
    label: "Passe A2 (Sala c/ Médium + Diálogo)",
    description:
      'Prioriza assistidos classificados como "A2". Requer sala com Médium e Diálogo.',
    isActive: true,
    order: 3,
    configurable: true,
  },
  {
    id: "rule_dist_a1",
    type: "PASSE_DISTRIBUTION",
    label: "Passe A1 (Qualquer Sala)",
    description:
      'Prioriza assistidos classificados como "A1". Aceita qualquer sala de passe.',
    isActive: true,
    order: 4,
    configurable: true,
  },
  {
    id: "rule_dist_balance",
    type: "PASSE_DISTRIBUTION",
    label: "Restrição: Balanceamento Equalitário",
    description:
      "Se existirem múltiplas salas válidas para o assistido, encaminhar sempre para a que tiver a menor fila.",
    isActive: true,
    order: 0,
    configurable: true,
    isRestriction: true,
  },
];

export function getAppRules(): AppRule[] {
  const data = localStorage.getItem("@centro:AppRules");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // Migration: if they don't have the a2 rule, reset to defaults
      if (!parsed.some((r: AppRule) => r.id === "rule_dist_a2")) {
        saveAppRules(DEFAULT_RULES);
        return DEFAULT_RULES;
      }
      // Migration: sync labels from DEFAULT_RULES by id (keeps label text always fresh)
      const synced = parsed.map((r: AppRule) => {
        const def = DEFAULT_RULES.find((d) => d.id === r.id);
        return def ? { ...r, label: def.label } : r;
      });
      return synced;
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_RULES;
}

export function saveAppRules(rules: AppRule[]): void {
  localStorage.setItem("@centro:AppRules", JSON.stringify(rules));
}
