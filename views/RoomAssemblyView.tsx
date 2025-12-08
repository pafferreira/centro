import React, { useState } from "react";
import { Worker, Room, RoomType } from "../types";
import { Header } from "../components/shared/Header";
import { WorkerCard } from "../components/shared/WorkerCard";
import { SparklesIcon, CheckCircleIcon } from "../components/Icons";
import { autoAssignWorkers } from "../services/geminiService";

interface RoomAssemblyViewProps {
    workers: Worker[];
    rooms: Room[];
    setWorkers: any;
    onBack: () => void;
}

import { PageContainer } from "../components/shared/PageContainer";

export const RoomAssemblyView: React.FC<RoomAssemblyViewProps> = ({ workers, rooms, setWorkers, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        try {
            const assignments = await autoAssignWorkers(workers, rooms);

            const newWorkers = workers.map(w => {
                const assignment = assignments.find(a => a.workerId === w.id);
                return assignment ? { ...w, assignedRoomId: assignment.roomId } : { ...w, assignedRoomId: null };
            });

            setWorkers(newWorkers);
        } catch (e) {
            alert("Falha ao gerar automaticamente. Verifique a API Key.");
        } finally {
            setIsGenerating(false);
        }
    };

    const passeRooms = rooms.filter(r => r.type === RoomType.Passe);
    const otherRooms = rooms.filter(r => r.type === RoomType.Outros);
    const unassignedWorkers = workers.filter(w => !w.assignedRoomId);

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
                            const isFull = occupants.length >= room.capacity;

                            return (
                                <div key={room.id} className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${isFull ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {occupants.length}/{room.capacity}
                                            {isFull ? <CheckCircleIcon className="w-3 h-3" /> : "!"}
                                        </span>
                                    </div>
                                    <div className="space-y-2 min-h-[60px]">
                                        {occupants.length === 0 && (
                                            <div className="h-20 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
                                                Arraste aqui
                                            </div>
                                        )}
                                        {occupants.map(w => (
                                            <WorkerCard key={w.id} worker={w} roleLabel={w.isCoordinator ? 'Coordenador' : undefined} />
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
                            return (
                                <div key={room.id} className="bg-white rounded-2xl p-3 shadow-soft border border-card-border/60">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <h4 className="font-bold text-text-main text-base">{room.name}</h4>
                                        <span className="text-slate-400 font-bold text-sm">{occupants.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {occupants.length === 0 && <p className="text-xs text-stone-300 italic px-1">Vazio</p>}
                                        {occupants.map(w => (
                                            <WorkerCard key={w.id} worker={w} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {unassignedWorkers.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border border-card-border/60 shadow-soft">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-text-main font-bold text-base">Não Alocados</h3>
                            <span className="text-slate-400 text-sm font-bold">{unassignedWorkers.length}</span>
                        </div>
                        <div className="space-y-2">
                            {unassignedWorkers.map(w => (
                                <WorkerCard key={w.id} worker={w} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
