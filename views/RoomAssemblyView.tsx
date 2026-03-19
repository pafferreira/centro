import React, { useState, useEffect } from "react";
import { Worker, Room, RoomType, WorkerRole } from "../types";
import { Header } from "../components/shared/Header";
import { WorkerCard } from "../components/shared/WorkerCardFixed";
import { SparklesIcon, EraserIcon } from "../components/Icons";
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
    onEditWorker?: (worker: Worker) => void;
}

const SESSION_KEY = "centro_replica_assignments";

function loadReplicas(): Record<string, string> {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveReplicas(data: Record<string, string>) {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch {}
}

export const RoomAssemblyView: React.FC<RoomAssemblyViewProps> = ({ workers, rooms, setWorkers, onBack, onHome, onEditWorker }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    // Maps replicaId → non-Passe room ID (where the duplicate card should appear)
    const [replicaAssignments, setReplicaAssignments] = useState<Record<string, string>>(loadReplicas);
    const [draggedWorkerId, setDraggedWorkerId] = useState<string | null>(null);

    // Persist replica assignments across navigation
    useEffect(() => {
        saveReplicas(replicaAssignments);
    }, [replicaAssignments]);

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
            if (worker.roles.includes(roleOrder[i])) return i;
        }
        return roleOrder.length;
    };

    const sortWorkersByRole = (list: Worker[]): Worker[] =>
        [...list].sort((a, b) => getRolePriority(a) - getRolePriority(b));

    const findRoomById = (roomId?: string | null) => rooms.find(r => r.id === roomId);
    const isPasseRoom = (room?: Room | null) =>
        room ? (room.type === RoomType.Passe || room.name.toLowerCase().includes('passe')) : false;

    // Simple replica ID — one secondary per worker
    const getReplicaId = (workerId: string) => `replica:${workerId}`;
    const isReplicaId = (id: string) => id.startsWith('replica:');

    const activeWorkers = workers.filter(w => w.present !== false);

    // Replica workers appear in NON-Passe rooms (Palestra / Aulinha / etc.)
    const replicaWorkers: AssemblyWorker[] = activeWorkers
        .filter(w => getReplicaId(w.id) in replicaAssignments)
        .map(w => {
            const replicaId = getReplicaId(w.id);
            return {
                ...w,
                id: replicaId,
                assignedRoomId: replicaAssignments[replicaId],
                isReplica: true,
                originalId: w.id,
                originRoomName: findRoomById(w.assignedRoomId ?? null)?.name ?? undefined,
            };
        });

    const getRoomOccupants = (roomId: string): AssemblyWorker[] => {
        const room = findRoomById(roomId);
        const base = activeWorkers.filter(w => w.assignedRoomId === roomId) as AssemblyWorker[];
        // Replicas appear ONLY in non-Passe rooms
        const replicas = !isPasseRoom(room)
            ? replicaWorkers.filter(w => w.assignedRoomId === roomId)
            : [];
        return sortWorkersByRole([...base, ...replicas]) as AssemblyWorker[];
    };

    const openRooms = rooms.filter(r => (r.status ?? 'Aberto') === 'Aberto');
    const passeRooms = openRooms.filter(r => r.type === RoomType.Passe || r.name.toLowerCase().includes('passe'));
    const otherRooms = openRooms.filter(r => r.type !== RoomType.Passe && !r.name.toLowerCase().includes('passe'));

    // Unassigned: only real workers with no assignment (no phantom replicas here)
    const unassignedWorkers = sortWorkersByRole(
        activeWorkers.filter(w => !w.assignedRoomId)
    ) as AssemblyWorker[];

    const handleMoveWorker = (workerId: string, roomId: string) => {
        const targetRoom = roomId === 'unassigned' ? null : findRoomById(roomId);

        // ── Replica card being moved ──
        if (isReplicaId(workerId)) {
            if (roomId === 'unassigned') {
                setReplicaAssignments(prev => {
                    const next = { ...prev };
                    delete next[workerId];
                    return next;
                });
            } else {
                // Replicas can only go to non-Passe rooms
                if (isPasseRoom(targetRoom)) {
                    alert("Esta cópia só pode ser alocada em salas não-Passe (Palestra, Aulinha, etc.).");
                    return;
                }
                setReplicaAssignments(prev => ({ ...prev, [workerId]: roomId }));
            }
            return;
        }

        // ── Real worker being moved ──
        const worker = workers.find(w => w.id === workerId);
        const currentRoomId = worker?.assignedRoomId ?? null;
        const currentRoom = currentRoomId ? findRoomById(currentRoomId) : null;
        const replicaId = getReplicaId(workerId);

        if (roomId === 'unassigned') {
            // Remove worker from all rooms and clear any replica
            setWorkers((prev: Worker[]) =>
                prev.map(w => w.id === workerId ? { ...w, assignedRoomId: null } : w)
            );
            setReplicaAssignments(prev => {
                const next = { ...prev };
                delete next[replicaId];
                return next;
            });
            return;
        }

        // Worker in Passe → selects non-Passe: add secondary appearance (keep primary)
        if (targetRoom && !isPasseRoom(targetRoom) && isPasseRoom(currentRoom)) {
            setReplicaAssignments(prev => ({ ...prev, [replicaId]: roomId }));
            return;
        }

        // Worker in non-Passe → selects Passe: move primary to Passe, keep old non-Passe as secondary
        if (targetRoom && isPasseRoom(targetRoom) && currentRoom && !isPasseRoom(currentRoom)) {
            setWorkers((prev: Worker[]) =>
                prev.map(w => w.id === workerId ? { ...w, assignedRoomId: roomId } : w)
            );
            if (currentRoomId) {
                setReplicaAssignments(prev => ({ ...prev, [replicaId]: currentRoomId }));
            }
            return;
        }

        // Default: normal primary room change
        setWorkers((prev: Worker[]) =>
            prev.map(w => w.id === workerId ? { ...w, assignedRoomId: roomId } : w)
        );
    };

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        const start = Date.now();
        try {
            const passeRoomIds = new Set(passeRooms.map(r => r.id));

            // Workers currently in non-Passe rooms (Palestra / Aulinha / etc.)
            const nonPasseWorkers = activeWorkers.filter(w =>
                w.assignedRoomId && !passeRoomIds.has(w.assignedRoomId)
            );

            // Run algorithm with everyone, clean slate
            const workersForGeneration = workers.map(w => ({ ...w, assignedRoomId: null }));
            const assignments = generateAssembly(workersForGeneration, rooms);
            const assignmentMap = new Map(assignments.map(a => [a.workerId, a.roomId]));

            const newReplicas: Record<string, string> = {};

            const newWorkers = workers.map(w => {
                const choice = assignmentMap.get(w.id) ?? null;
                const nonPasseWorker = nonPasseWorkers.find(np => np.id === w.id);

                if (nonPasseWorker) {
                    // Was in non-Passe: move primary to Passe room, keep old non-Passe as secondary
                    const oldNonPasseRoomId = nonPasseWorker.assignedRoomId!;
                    if (choice && passeRoomIds.has(choice)) {
                        newReplicas[getReplicaId(w.id)] = oldNonPasseRoomId;
                        return { ...w, assignedRoomId: choice };
                    }
                    // Algorithm didn't send them to Passe — leave them where they were
                    return w;
                }

                return { ...w, assignedRoomId: choice };
            });

            setWorkers(newWorkers);
            setReplicaAssignments(newReplicas);
        } catch {
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

    const handleClearAll = () => {
        setWorkers((prev: Worker[]) => prev.map(w => ({ ...w, assignedRoomId: null })));
        setReplicaAssignments({});
    };

    // Drag and drop
    const onDropToRoom = (e: React.DragEvent, roomId: string | null) => {
        e.preventDefault();
        const workerId = e.dataTransfer.getData('text/plain') || draggedWorkerId;
        if (!workerId) return;
        handleMoveWorker(workerId, roomId ?? 'unassigned');
        setDraggedWorkerId(null);
    };
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const makeDragHandleProps = (id: string) => ({
        draggable: true as const,
        onDragStart: (e: React.DragEvent) => {
            e.dataTransfer.setData('text/plain', id);
            setDraggedWorkerId(id);
        },
        onDragEnd: () => setDraggedWorkerId(null),
    });

    const roomsWithUnassigned = [{ id: 'unassigned', name: '❌ Não Alocados' }, ...rooms];
    const nonPasseRoomsWithUnassigned = [
        { id: 'unassigned', name: '❌ Não Alocados' },
        ...otherRooms
    ];

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
                occupants.forEach(w =>
                    lines.push(w.name + (w.isReplica && w.originRoomName ? ` (extra ${w.originRoomName})` : ""))
                );
            }
            lines.push("");
        });
        if (unassignedWorkers.length) {
            lines.push("Não Alocados");
            unassignedWorkers.forEach(w => lines.push(w.name));
            lines.push("");
        }
        return lines.join("\n");
    };

    const handleShareText = () => {
        const message = buildAssemblyText()
            .split("\n")
            .map(line => encodeURIComponent(line))
            .join("%0A");
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };

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
                    {/* Salas de Passe */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-medium text-slate-500">Salas de Passe</h3>
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 shadow-sm transition-colors cursor-pointer"
                                title="Limpar todas as alocações"
                            >
                                <EraserIcon className="w-4 h-4" />
                                Limpar
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {passeRooms.map(room => {
                                const occupants = getRoomOccupants(room.id);
                                return (
                                    <div
                                        key={room.id}
                                        className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60"
                                        onDragOver={onDragOver}
                                        onDragEnter={onDragEnter}
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
                                            {occupants.map(w => (
                                                <WorkerCard
                                                    key={w.id}
                                                    worker={w}
                                                    roleLabel={w.isCoordinator ? 'Coordenador' : undefined}
                                                    rooms={roomsWithUnassigned}
                                                    onMove={handleMoveWorker}
                                                    dragHandleProps={makeDragHandleProps(w.id)}
                                                    onDoubleClick={onEditWorker ? () => onEditWorker(w) : undefined}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Outras Salas (Palestra, Aulinha, Recepção, Entrevista) */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-slate-500 px-1">Outras Salas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {otherRooms.map(room => {
                                const occupants = getRoomOccupants(room.id);
                                return (
                                    <div
                                        key={room.id}
                                        className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60"
                                        onDragOver={onDragOver}
                                        onDragEnter={onDragEnter}
                                        onDrop={(e) => onDropToRoom(e, room.id)}
                                    >
                                        <div className="flex justify-between items-center mb-3 px-1">
                                            <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                                            <span className="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-600">
                                                {occupants.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {occupants.length === 0 && (
                                                <p className="text-xs text-stone-300 italic px-1">Vazio</p>
                                            )}
                                            {occupants.map(w => (
                                                <WorkerCard
                                                    key={w.id}
                                                    worker={w}
                                                    rooms={w.isReplica ? nonPasseRoomsWithUnassigned : roomsWithUnassigned}
                                                    onMove={handleMoveWorker}
                                                    dragHandleProps={makeDragHandleProps(w.id)}
                                                    onDoubleClick={onEditWorker ? () => onEditWorker(w) : undefined}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Não Alocados */}
                    {unassignedWorkers.length > 0 && (
                        <div
                            className="bg-white rounded-2xl p-4 border border-card-border/60 shadow-soft"
                            onDragOver={onDragOver}
                            onDragEnter={onDragEnter}
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
                                    <WorkerCard
                                        key={w.id}
                                        worker={w}
                                        roleLabel={undefined}
                                        rooms={roomsWithUnassigned}
                                        onMove={handleMoveWorker}
                                        dragHandleProps={makeDragHandleProps(w.id)}
                                        onDoubleClick={onEditWorker ? () => onEditWorker(w) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};
