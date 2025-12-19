import React, { useState } from "react";
import { Worker, Room, RoomType, WorkerRole } from "../types";
import { Header } from "../components/shared/Header";
import { WorkerCard } from "../components/shared/WorkerCardFixed";
import { SparklesIcon } from "../components/Icons";
import { generateAssembly } from "../services/assemblyService";
import { PageContainer } from "../components/shared/PageContainer";

type AssemblyWorker = Worker & {
    isReplica?: boolean;
    originalId?: string;
    originRoomName?: string;
};

interface RoomAssemblyViewProps {
    workers: Worker[];
    rooms: Room[];
    setWorkers: any;
    onBack: () => void;
    onHome?: () => void;
}

export const RoomAssemblyView: React.FC<RoomAssemblyViewProps> = ({ workers, rooms, setWorkers, onBack, onHome }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [replicaAssignments, setReplicaAssignments] = useState<Record<string, string | null>>({});

    // Helper to get role priority for sorting (lower = higher priority)
    const getRolePriority = (worker: Worker): number => {
        if (worker.isCoordinator) return 0;

        const roleOrder = [
            WorkerRole.Coordenador,
            WorkerRole.Medium,
            WorkerRole.Dialogo,
            WorkerRole.Psicografa,
            WorkerRole.Sustentacao,
            WorkerRole.Recepção,
            WorkerRole.Entrevista
        ];

        for (let i = 0; i < roleOrder.length; i++) {
            if (worker.roles.includes(roleOrder[i])) {
                return i;
            }
        }
        return roleOrder.length;
    };

    const findRoomById = (roomId?: string | null) => rooms.find(r => r.id === roomId);
    const isPasseRoom = (room?: Room) => room ? (room.type === RoomType.Passe || room.name.toLowerCase().includes('passe')) : false;
    const isReplicableRoom = (room?: Room) => {
        if (!room) return false;
        const name = room.name.toLowerCase();
        return name.includes('palestra') || name.includes('aulinha');
    };
    const getReplicaId = (worker: Worker) => `replica:${worker.id}:${worker.assignedRoomId ?? 'none'}`;
    const isReplicaId = (workerId: string) => workerId.startsWith('replica:');

    // Helper to sort workers by role priority
    const sortWorkersByRole = (workersList: Worker[]): Worker[] => {
        return [...workersList].sort((a, b) => getRolePriority(a) - getRolePriority(b));
    };

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        const start = Date.now();
        try {
            // First, clear all room assignments
            const clearedWorkers = workers.map(w => ({ ...w, assignedRoomId: null }));

            // Then use deterministic generator
            const assignments = generateAssembly(clearedWorkers, rooms);
            const newWorkers = clearedWorkers.map(w => {
                const assignment = assignments.find(a => a.workerId === w.id);
                return assignment ? { ...w, assignedRoomId: assignment.roomId } : { ...w, assignedRoomId: null };
            });

            setWorkers(newWorkers);
            setReplicaAssignments({});
        } catch (e) {
            alert("Falha ao gerar automaticamente.");
        } finally {
            const elapsed = Date.now() - start;
            const minDuration = 2000;
            if (elapsed < minDuration) {
                await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
            }
            setIsGenerating(false);
        }
    };

    // Move worker to a specific room or unassign
    const handleMoveWorker = (workerId: string, roomId: string) => {
        if (isReplicaId(workerId)) {
            const targetRoom = roomId === 'unassigned' ? null : findRoomById(roomId);
            if (roomId !== 'unassigned' && !isPasseRoom(targetRoom)) {
                alert("Trabalhadores replicados de Palestra/Aulinha só podem ser usados nas Salas de Passe.");
                return;
            }

            setReplicaAssignments(prev => ({
                ...prev,
                [workerId]: roomId === 'unassigned' ? null : roomId
            }));
            return;
        }

        setWorkers((prev: Worker[]) =>
            prev.map(w => w.id === workerId ? { ...w, assignedRoomId: roomId === 'unassigned' ? null : roomId } : w)
        );
    };

    // Drag and drop handlers
    const onDropToRoom = (e: React.DragEvent, roomId: string | null) => {
        e.preventDefault();
        const workerId = e.dataTransfer.getData('text/plain');
        if (!workerId) return;
        const target = roomId ?? 'unassigned';
        handleMoveWorker(workerId, target);
    };
    const onDragOver = (e: React.DragEvent) => e.preventDefault();

    const activeWorkers = workers.filter(w => w.present !== false);

    const replicableWorkers = activeWorkers.filter(w => isReplicableRoom(findRoomById(w.assignedRoomId ?? null)));
    const replicaWorkers: AssemblyWorker[] = replicableWorkers.map(w => {
        const replicaId = getReplicaId(w);
        return {
            ...w,
            id: replicaId,
            assignedRoomId: replicaAssignments[replicaId] ?? null,
            isReplica: true,
            originalId: w.id,
            originRoomName: findRoomById(w.assignedRoomId ?? null)?.name,
        };
    });

    const passeRooms = rooms.filter(r =>
        r.type === RoomType.Passe ||
        r.name.toLowerCase().includes('passe')
    );
    const otherRooms = rooms.filter(r =>
        r.type !== RoomType.Passe &&
        !r.name.toLowerCase().includes('passe')
    );
    const unassignedWorkers = sortWorkersByRole([
        ...activeWorkers.filter(w => !w.assignedRoomId),
        ...replicaWorkers.filter(w => !w.assignedRoomId),
    ]);

    const getRoomOccupants = (roomId: string): AssemblyWorker[] => {
        const room = findRoomById(roomId);
        const baseOccupants = activeWorkers.filter(w => w.assignedRoomId === roomId);
        const replicaOccupants = isPasseRoom(room)
            ? replicaWorkers.filter(w => w.assignedRoomId === roomId)
            : [];
        return sortWorkersByRole([...(baseOccupants as AssemblyWorker[]), ...replicaOccupants]);
    };

    const buildAssemblyText = () => {
        const dateStr = new Date().toLocaleDateString("pt-BR");
        const lines: string[] = [`Dia: ${dateStr}`, ""];

        const sortedRooms = [...rooms].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        sortedRooms.forEach(room => {
            const occupants = getRoomOccupants(room.id);

            lines.push(room.name);
            if (occupants.length === 0) {
                lines.push("—");
            } else {
                occupants.forEach(w => lines.push(w.name + (w.isReplica && w.originRoomName ? " (extra " + w.originRoomName + ")" : "")));
            }
            lines.push("");
        });

        if (unassignedWorkers.length) {
            lines.push("Não Alocados");
            unassignedWorkers.forEach(w => lines.push(w.name + (w.isReplica && w.originRoomName ? " (extra " + w.originRoomName + ")" : "")));
            lines.push("");
        }

        return lines.join("\n");
    };

    const handleShareText = () => {
        const message = buildAssemblyText()
            .split("\n")
            .map(line => encodeURIComponent(line))
            .join("%0A"); // força quebra de linha estilo Ctrl+Enter
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    // Create rooms list with "Não Alocados" option
    const roomsWithUnassigned = [
        { id: 'unassigned', name: '❌ Não Alocados' },
        ...rooms
    ];
    const passeRoomsWithUnassigned = [
        { id: 'unassigned', name: '❌ Não Alocados' },
        ...passeRooms
    ];

    return (
        <PageContainer>
            {isGenerating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-6">
                    <div className="relative bg-white/95 rounded-2xl shadow-2xl border border-white/70 px-6 py-5 w-full max-w-sm overflow-hidden">
                        <div className="absolute -left-6 -top-6 w-24 h-24 bg-cyan-100 rounded-full blur-3xl opacity-60" />
                        <div className="absolute -right-4 -bottom-6 w-28 h-28 bg-amber-100 rounded-full blur-3xl opacity-60" />
                        <div className="relative flex items-center gap-3">
                            <SparklesIcon className="w-8 h-8 text-amber-500 animate-spin" />
                            <div>
                                <p className="text-base font-bold text-slate-800">Montando salas...</p>
                                <p className="text-sm text-slate-500">Aguarde, distribuindo trabalhadores.</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-amber-50 border border-white shadow-inner flex items-center justify-center animate-bounce" style={{ animationDelay: `${i * 120}ms` }}>
                                    <SparklesIcon className="w-6 h-6 text-amber-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            <div>
                <Header
                    title="Montagem das Salas"
                    onHome={onHome}
                    action={
                        <button
                            onClick={handleShareText}
                            className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-sm"
                        >
                            Enviar ZAP
                        </button>
                    }
                />

                <div className="mt-4 mb-6">
                    <button
                        onClick={handleAutoGenerate}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-cyan-300 to-cyan-200 text-slate-800 font-bold py-3.5 rounded-full shadow-lg shadow-cyan-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 border border-white/50"
                    >
                        {isGenerating ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></span>
                        ) : (
                            <SparklesIcon className="w-5 h-5 text-slate-700" />
                        )}
                        {isGenerating ? "Gerando..." : "Montar Salas Automaticamente"}
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-slate-500 px-1">Salas de Passe</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {passeRooms.map(room => {
                            const occupants = getRoomOccupants(room.id);

                            return (
                                <div
                                    key={room.id}
                                    className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60"
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDropToRoom(e, room.id)}
                                >
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-600">
                                            {occupants.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2 min-h-[60px]">
                                        {occupants.length === 0 && (
                                            <div className="h-20 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
                                                Arraste aqui
                                            </div>
                                        )}
                                        {occupants.map(w => {
                                            const roomOptions = w.isReplica ? passeRoomsWithUnassigned : roomsWithUnassigned;
                                            return (
                                            <div key={w.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}>
                                                <WorkerCard
                                                    worker={w}
                                                    roleLabel={w.isCoordinator ? 'Coordenador' : undefined}
                                                    rooms={roomOptions}
                                                    onMove={handleMoveWorker}
                                                />
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-medium text-slate-500 px-1">Outros Locais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherRooms.map(room => {
                            const occupants = getRoomOccupants(room.id);

                            return (
                                <div
                                    key={room.id}
                                    className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60"
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDropToRoom(e, room.id)}
                                >
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-600">
                                            {occupants.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {occupants.length === 0 && <p className="text-xs text-stone-300 italic px-1">Vazio</p>}
                                        {occupants.map(w => (
                                            <div key={w.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}>
                                                <WorkerCard
                                                    worker={w}
                                                    rooms={roomsWithUnassigned}
                                                    onMove={handleMoveWorker}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {unassignedWorkers.length > 0 && (
                    <div
                        className="bg-white rounded-2xl p-4 border border-card-border/60 shadow-soft"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDropToRoom(e, null)}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-text-main font-bold text-base">Não Alocados</h3>
                            <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-600">
                                {unassignedWorkers.length}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {unassignedWorkers.map(w => (
                                <div key={w.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}>
                                    <WorkerCard
                                        worker={w}
                                        roleLabel={w.isReplica && w.originRoomName ? `Extra ${w.originRoomName}` : undefined}
                                        rooms={w.isReplica ? passeRoomsWithUnassigned : roomsWithUnassigned}
                                        onMove={handleMoveWorker}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </PageContainer>
    );
};
