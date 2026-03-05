import { Worker, Room, PasseAttendance, RoomType, WorkerRole, Assistido } from "../types";
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
        assistidoName: row.nome_assistido_cache ?? '',
        passeType: row.tipo_passe,
        attendancePhase: row.fase_atendimento,
        status: row.status_atendimento,
        allocatedRoomId: row.id_sala_alocada ?? null,
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
    };
}

// ============================================================================
// FUNÇÕES CRUD – ROOMS (gfa_salas)
// ============================================================================

export async function loadRooms(): Promise<Room[]> {
    try {
        const { data, error } = await supabase
            .from('gfa_salas')
            .select('*')
            .order('criado_em', { ascending: true });

        if (error) throw error;
        return (data ?? []).map(roomFromDb);
    } catch (error) {
        console.error('Erro ao carregar salas do Supabase:', error);
        return [];
    }
}

export async function saveRooms(rooms: Room[]): Promise<void> {
    try {
        const rows = rooms.map(roomToDb);
        const { error } = await supabase
            .from('gfa_salas')
            .upsert(rows, { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar salas no Supabase:', error);
    }
}

export async function saveRoom(room: Room): Promise<void> {
    try {
        const { error } = await supabase
            .from('gfa_salas')
            .upsert(roomToDb(room), { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar sala no Supabase:', error);
    }
}

export async function deleteRoom(roomId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('gfa_salas')
            .delete()
            .eq('id', roomId);

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao deletar sala no Supabase:', error);
    }
}

// ============================================================================
// FUNÇÕES CRUD – ASSISTIDOS (gfa_assistidos)
// ============================================================================

export async function loadAssistidos(): Promise<Assistido[]> {
    try {
        const { data, error } = await supabase
            .from('gfa_assistidos')
            .select('*')
            .order('nome_assistido', { ascending: true });

        if (error) throw error;
        return (data ?? []).map((row: any) => ({
            id: row.id,
            nome: row.nome_assistido,
            telefone: row.telefone ?? undefined,
            dataNascimento: row.data_nascimento ?? undefined,
            observacoes: row.observacoes ?? undefined,
        }));
    } catch (error) {
        console.error('Erro ao carregar assistidos do Supabase:', error);
        return [];
    }
}

export async function saveAssistido(assistido: Assistido): Promise<void> {
    try {
        const row = {
            id: assistido.id,
            nome_assistido: assistido.nome,
            telefone: assistido.telefone ?? null,
            data_nascimento: assistido.dataNascimento ?? null,
            observacoes: assistido.observacoes ?? null,
        };

        const { error } = await supabase
            .from('gfa_assistidos')
            .upsert(row, { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar assistido no Supabase:', error);
    }
}

export async function deleteAssistido(assistidoId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('gfa_assistidos')
            .delete()
            .eq('id', assistidoId);

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao deletar assistido no Supabase:', error);
    }
}

// ============================================================================
// FUNÇÕES CRUD – WORKERS (gfa_trabalhadores)
// ============================================================================

export async function loadWorkers(): Promise<Worker[]> {
    try {
        const { data, error } = await supabase
            .from('gfa_trabalhadores')
            .select('*')
            .order('criado_em', { ascending: true });

        if (error) throw error;
        return (data ?? []).map(workerFromDb);
    } catch (error) {
        console.error('Erro ao carregar trabalhadores do Supabase:', error);
        return [];
    }
}

export async function saveWorkers(workers: Worker[]): Promise<void> {
    try {
        const rows = workers.map(workerToDb);
        const { error } = await supabase
            .from('gfa_trabalhadores')
            .upsert(rows, { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar trabalhadores no Supabase:', error);
    }
}

export async function saveWorker(worker: Worker): Promise<void> {
    try {
        const { error } = await supabase
            .from('gfa_trabalhadores')
            .upsert(workerToDb(worker), { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar trabalhador no Supabase:', error);
    }
}

export async function deleteWorker(workerId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('gfa_trabalhadores')
            .delete()
            .eq('id', workerId);

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao deletar trabalhador no Supabase:', error);
    }
}

// ============================================================================
// FUNÇÕES CRUD – ATTENDANCES (gfa_atendimentos_passe)
// ============================================================================

export async function loadAttendances(): Promise<PasseAttendance[]> {
    try {
        // Join with gfa_assistidos to get the name
        const { data, error } = await supabase
            .from('gfa_atendimentos_passe')
            .select('*, gfa_assistidos(nome_assistido)')
            .order('criado_em', { ascending: true });

        if (error) throw error;

        return (data ?? []).map((row: any) => ({
            id: row.id,
            date: row.data_atendimento,
            assistidoId: row.id_assistido,
            assistidoName: row.gfa_assistidos?.nome_assistido ?? '',
            passeType: row.tipo_passe,
            attendancePhase: row.fase_atendimento,
            status: row.status_atendimento,
            allocatedRoomId: row.id_sala_alocada ?? null,
        }));
    } catch (error) {
        console.error('Erro ao carregar atendimentos do Supabase:', error);
        return [];
    }
}

export async function saveAttendances(attendances: PasseAttendance[]): Promise<void> {
    try {
        const rows = attendances.map(attendanceToDb);
        const { error } = await supabase
            .from('gfa_atendimentos_passe')
            .upsert(rows, { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar atendimentos no Supabase:', error);
    }
}

export async function saveAttendance(att: PasseAttendance): Promise<void> {
    try {
        const { error } = await supabase
            .from('gfa_atendimentos_passe')
            .upsert(attendanceToDb(att), { onConflict: 'id' });

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar atendimento no Supabase:', error);
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
        version: '2.0-supabase',
    };
    return JSON.stringify(data, null, 2);
}

export async function importData(jsonString: string): Promise<{ workers: Worker[]; rooms: Room[] } | null> {
    try {
        const data = JSON.parse(jsonString);

        if (!data.workers || !Array.isArray(data.workers)) {
            throw new Error('Dados de trabalhadores inválidos');
        }
        if (!data.rooms || !Array.isArray(data.rooms)) {
            throw new Error('Dados de salas inválidos');
        }

        return {
            workers: data.workers as Worker[],
            rooms: data.rooms as Room[],
        };
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        return null;
    }
}

export async function clearAllData(): Promise<void> {
    try {
        await supabase.from('gfa_atendimentos_passe').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('gfa_fichas_assistencia').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('gfa_assistidos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('gfa_trabalhadores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('gfa_salas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
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
        const { count: wCount } = await supabase.from('gfa_trabalhadores').select('*', { count: 'exact', head: true });
        const { count: rCount } = await supabase.from('gfa_salas').select('*', { count: 'exact', head: true });
        const { count: aCount } = await supabase.from('gfa_atendimentos_passe').select('*', { count: 'exact', head: true });

        return `${(wCount ?? 0)} trabalhadores, ${(rCount ?? 0)} salas, ${(aCount ?? 0)} atendimentos`;
    } catch (error) {
        console.error('Erro ao calcular tamanho:', error);
        return 'Desconhecido';
    }
}
