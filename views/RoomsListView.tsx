import React from "react";
import { Room } from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { PlusIcon, EditIcon, TrashIcon, DoorIcon } from "../components/Icons";
import { RoomType } from "../types";

interface RoomsListViewProps {
    rooms: Room[];
    onEdit: (room: Room) => void;
    onDelete: (roomId: string) => void;
    onAdd: () => void;
}

export const RoomsListView: React.FC<RoomsListViewProps> = ({ rooms, onEdit, onDelete, onAdd }) => {
    const getRoomAvatarUrl = (room: Room) => {
        // Prefer an explicitly set avatar, otherwise use the same DiceBear style used for workers
        return room.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(room.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    // Sort rooms alphabetically by name
    const sortedRooms = [...rooms].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <PageContainer>
            <Header title="Salas de Passe" />

            <div className="mt-6 space-y-3">
                {sortedRooms.map((room) => (
                    <div
                        key={room.id}
                        className="bg-white p-4 rounded-2xl shadow-soft border border-card-border/60 flex items-center gap-4 group"
                    >
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-green-100 shadow-sm bg-green-50 flex items-center justify-center">
                            {room.avatarIcon === 'DoorIcon' || (!room.avatarUrl && room.type === RoomType.Passe) ? (
                                <DoorIcon className="w-8 h-8 text-green-600" />
                            ) : (
                                <img
                                    src={getRoomAvatarUrl(room)}
                                    alt={room.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-base truncate">{room.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-100 text-green-700">
                                    Capacidade: {room.capacity}
                                </span>
                                {room.description && (
                                    <span className="text-xs text-slate-500 truncate">{room.description}</span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => onEdit(room)}
                                className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onDelete(room.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            <button
                onClick={onAdd}
                className="absolute bottom-24 right-6 w-16 h-16 bg-green-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-green-600 transition-all hover:scale-105 z-40"
            >
                <PlusIcon className="w-8 h-8 stroke-[3]" />
            </button>
        </PageContainer>
    );
};
