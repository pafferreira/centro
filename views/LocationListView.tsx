import React, { useState } from "react";
import { Header } from "../components/shared/Header";
import { UsersIcon, BookIcon, MicrophoneIcon, PlusIcon, DoorIcon, MapPinIcon, TrashIcon } from "../components/Icons";
import { PageContainer } from "../components/shared/PageContainer";
import { Room, RoomType } from "../types";

interface LocationListViewProps {
    onBack?: () => void;
    rooms: Room[];
    onEdit: (room: Room) => void;
    onDelete: (roomId: string) => void;
    onAdd: () => void;
    onHome?: () => void;
}

export const LocationListView: React.FC<LocationListViewProps> = ({ onBack, rooms, onEdit, onDelete, onAdd, onHome }) => {
    const [locationToDelete, setLocationToDelete] = useState<Room | null>(null);

    // Show all rooms but keep the "Locais de Trabalho" visual
    const sorted = [...rooms].sort((a, b) => a.name.localeCompare(b.name));

    const getIconFor = (room: Room) => {
        // Prefer explicit avatarIcon when present
        if (room.avatarIcon === 'DoorIcon') return <DoorIcon className="w-8 h-8 text-green-500" />;
        if (room.avatarIcon === 'MicrophoneIcon') return <MicrophoneIcon className="w-8 h-8 text-purple-400" />;
        if (room.avatarIcon === 'UsersIcon') return <UsersIcon className="w-8 h-8 text-orange-400" />;
        if (room.avatarIcon === 'BookIcon') return <BookIcon className="w-8 h-8 text-blue-400" />;

        // Fallback heuristics by name to map to desired icons:
        const n = room.name.toLowerCase();
        if (n.includes('palestr') || n.includes('palestra') || n.includes('audit')) return <MicrophoneIcon className="w-8 h-8 text-purple-400" />; // Palestra
        if (n.includes('recep') || n.includes('recepção') || n.includes('entrada')) return <UsersIcon className="w-8 h-8 text-orange-400" />; // Recepção
        if (n.includes('sala de passe') || n.includes('sala de passe') || n.includes('passe')) return <DoorIcon className="w-8 h-8 text-green-500" />; // Sala de Passe
        if (n.includes('aula') || n.includes('sala de aula') || n.includes('quadro') || n.includes('livro')) return <BookIcon className="w-8 h-8 text-blue-400" />; // Sala de Aula

        return <MapPinIcon className="w-8 h-8 text-slate-400" />;
    };

    const getColorFor = (room: Room) => {
        return room.type === RoomType.Passe ? 'bg-green-50 border-green-100' : 'bg-white border-card-border/60';
    };

    return (
        <PageContainer>
            <Header title="Locais de Trabalho" onBack={onBack} onHome={onHome} hideBack />

            <div className="mt-6 space-y-4">
                {sorted.map((loc) => (
                    <div
                        key={loc.id}
                        onClick={() => onEdit(loc)}
                        className="bg-white p-4 rounded-2xl shadow-soft border border-card-border/60 flex items-center gap-4 relative overflow-hidden cursor-pointer hover:border-blue-200 transition"
                    >
                        <div className={`w-16 h-16 rounded-2xl ${loc.type === RoomType.Passe ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'} overflow-hidden flex items-center justify-center text-3xl shadow-sm border`}> 
                            {loc.avatarUrl ? (
                                <img src={loc.avatarUrl} alt={loc.name} className="w-full h-full object-cover" />
                            ) : (
                                getIconFor(loc)
                            )}
                        </div>

                        {/* Only icon/avatar visual + name (clean view) */}
                        <div className="flex-1 min-w-0 z-10">
                            <h4 className="font-bold text-lg text-slate-800 truncate">{loc.name}</h4>
                        </div>

                        {/* Keep actions available for CRUD but keep them small */}
                        <div className="flex gap-1 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLocationToDelete(loc);
                                }}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onAdd} className="absolute bottom-24 right-6 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#d4a45a] border border-[#f0e6d2] hover:scale-105 transition-transform z-40">
                <PlusIcon className="w-8 h-8 stroke-[3]" />
            </button>

            {locationToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-6">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                <TrashIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800">Confirmar exclusão</h3>
                                <p className="text-sm text-slate-600">
                                    Deseja remover <span className="font-semibold text-slate-800">{locationToDelete.name}</span> da lista?
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setLocationToDelete(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(locationToDelete.id);
                                    setLocationToDelete(null);
                                }}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};
