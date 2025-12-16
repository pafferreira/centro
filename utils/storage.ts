import { Worker, Room } from "../types";
import { initialWorkers, initialRooms } from "../data/initialData";

const STORAGE_KEYS = {
    WORKERS: 'centro-workers',
    ROOMS: 'centro-rooms',
    LAST_MODIFIED: 'centro-last-modified',
} as const;

// Workers
export function saveWorkers(workers: Worker[]): void {
    try {
        localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
        localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, new Date().toISOString());
    } catch (error) {
        console.error('Erro ao salvar trabalhadores:', error);
    }
}

export function loadWorkers(): Worker[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.WORKERS);
        if (stored) {
            const parsed = JSON.parse(stored) as Worker[];

            // Deduplicate IDs to fix potential data corruption
            const seenIds = new Set<string>();

            return parsed.map(w => {
                let id = w.id;
                // If ID is duplicate or missing, generate a new one
                if (!id || seenIds.has(id)) {
                    id = `fixed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
                seenIds.add(id);

                return {
                    ...w,
                    id,
                    present: w.present !== false, // default to true when missing
                    assignedRoomId: w.present === false ? null : w.assignedRoomId ?? null,
                };
            });
        }
    } catch (error) {
        console.error('Erro ao carregar trabalhadores:', error);
    }
    return initialWorkers;
}

// Rooms
export function saveRooms(rooms: Room[]): void {
    try {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
        localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, new Date().toISOString());
    } catch (error) {
        console.error('Erro ao salvar salas:', error);
    }
}

export function loadRooms(): Room[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.ROOMS);
        if (stored) {
            return JSON.parse(stored) as Room[];
        }
    } catch (error) {
        console.error('Erro ao carregar salas:', error);
    }
    return initialRooms;
}

// Export/Import
export function exportData(): string {
    const data = {
        workers: loadWorkers(),
        rooms: loadRooms(),
        exportedAt: new Date().toISOString(),
        version: '1.0',
    };
    return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): { workers: Worker[]; rooms: Room[] } | null {
    try {
        const data = JSON.parse(jsonString);

        // Validação básica
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

export function clearAllData(): void {
    try {
        localStorage.removeItem(STORAGE_KEYS.WORKERS);
        localStorage.removeItem(STORAGE_KEYS.ROOMS);
        localStorage.removeItem(STORAGE_KEYS.LAST_MODIFIED);
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
    }
}

export function getLastModified(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.LAST_MODIFIED);
    } catch (error) {
        console.error('Erro ao obter data de modificação:', error);
        return null;
    }
}

export function getStorageSize(): string {
    try {
        const workers = localStorage.getItem(STORAGE_KEYS.WORKERS) || '';
        const rooms = localStorage.getItem(STORAGE_KEYS.ROOMS) || '';
        const totalBytes = workers.length + rooms.length;

        if (totalBytes < 1024) {
            return `${totalBytes} bytes`;
        } else if (totalBytes < 1024 * 1024) {
            return `${(totalBytes / 1024).toFixed(2)} KB`;
        } else {
            return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        }
    } catch (error) {
        console.error('Erro ao calcular tamanho:', error);
        return 'Desconhecido';
    }
}
