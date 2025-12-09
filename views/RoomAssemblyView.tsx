import React, { useState } from "react";
import { Worker, Room, RoomType, WorkerRole } from "../types";
import { Header } from "../components/shared/Header";
import { WorkerCard } from "../components/shared/WorkerCardFixed";
import { SparklesIcon } from "../components/Icons";
import { generateAssembly } from "../services/assemblyService";
import { PageContainer } from "../components/shared/PageContainer";

interface RoomAssemblyViewProps {
    workers: Worker[];
    rooms: Room[];
    setWorkers: any;
    onBack: () => void;
}

export const RoomAssemblyView: React.FC<RoomAssemblyViewProps> = ({ workers, rooms, setWorkers, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);

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

    // Helper to sort workers by role priority
    const sortWorkersByRole = (workersList: Worker[]): Worker[] => {
        return [...workersList].sort((a, b) => getRolePriority(a) - getRolePriority(b));
    };

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
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
        } catch (e) {
            alert("Falha ao gerar automaticamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Move worker to a specific room or unassign
    const handleMoveWorker = (workerId: string, roomId: string) => {
        setWorkers((prev: Worker[]) =>
            prev.map(w => w.id === workerId ? { ...w, assignedRoomId: roomId === 'unassigned' ? null : roomId } : w)
        );
    };

    // Drag and drop handlers
    const onDropToRoom = (e: React.DragEvent, roomId: string | null) => {
        e.preventDefault();
        const workerId = e.dataTransfer.getData('text/plain');
        if (!workerId) return;
        setWorkers((prev: Worker[]) => prev.map(w => w.id === workerId ? { ...w, assignedRoomId: roomId } : w));
    };
    const onDragOver = (e: React.DragEvent) => e.preventDefault();

    const passeRooms = rooms.filter(r =>
        r.type === RoomType.Passe ||
        r.name.toLowerCase().includes('passe')
    );
    const otherRooms = rooms.filter(r =>
        r.type !== RoomType.Passe &&
        !r.name.toLowerCase().includes('passe')
    );
    const unassignedWorkers = workers.filter(w => !w.assignedRoomId);

    // Create rooms list with "Não Alocados" option
    const roomsWithUnassigned = [
        { id: 'unassigned', name: '❌ Não Alocados' },
        ...rooms
    ];

    return (
        <PageContainer>
            <Header
                title="Montagem das Salas"
                action={<button className="px-3 py-1 bg-blue-400 text-white text-sm font-bold rounded-lg shadow-sm">Salvar</button>}
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
                    {isGenerating ? "Gerando..." : "Gerar Automaticamente"}
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <h3 className="text-lg font-medium text-slate-500 px-1">Salas de Passe</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {passeRooms.map(room => {
                            const occupants = workers.filter(w => w.assignedRoomId === room.id);
                            const sortedOccupants = sortWorkersByRole(occupants);

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
                                        {sortedOccupants.map(w => (
                                            <div key={w.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}>
                                                <WorkerCard
                                                    worker={w}
                                                    roleLabel={w.isCoordinator ? 'Coordenador' : undefined}
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

                <div className="space-y-3">
                    <h3 className="text-lg font-medium text-slate-500 px-1">Outros Locais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherRooms.map(room => {
                            const occupants = workers.filter(w => w.assignedRoomId === room.id);
                            const sortedOccupants = sortWorkersByRole(occupants);

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
                                        {sortedOccupants.map(w => (
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
                                        rooms={roomsWithUnassigned}
                                        onMove={handleMoveWorker}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
