import React, { useState, useEffect } from "react";
import { Room, RoomType } from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";

interface RoomFormViewProps {
    room?: Room | null;
    onSave: (room: Room) => void;
    onCancel: () => void;
}

export const RoomFormView: React.FC<RoomFormViewProps> = ({ room, onSave, onCancel }) => {
    const [name, setName] = useState(room?.name || "");
    const [capacity, setCapacity] = useState(room?.capacity?.toString() || "4");
    const [description, setDescription] = useState(room?.description || "");
    const [selectedAvatar, setSelectedAvatar] = useState(room?.avatarUrl || "");
    const [avatarLocked, setAvatarLocked] = useState(!!room?.avatarUrl);

    // Generate avatar suggestions with geometric shapes
    const avatarSuggestions = [
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'room1')}&backgroundColor=d1f4d1`,
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'room2')}&backgroundColor=c0f0c0`,
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'room3')}&backgroundColor=b8e6b8`,
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent((name || 'room4') + '1')}&backgroundColor=a8dda8`,
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent((name || 'room5') + '2')}&backgroundColor=98d498`,
    ];

    useEffect(() => {
        if (room) {
            setName(room.name);
            setCapacity(room.capacity.toString());
            setDescription(room.description || "");
            setSelectedAvatar(room.avatarUrl || "");
            setAvatarLocked(!!room.avatarUrl);
        }
    }, [room]);

    useEffect(() => {
        // Only update avatar automatically if user hasn't explicitly selected one
        if (!avatarLocked && name && !room) {
            setSelectedAvatar(avatarSuggestions[0]);
        }
    }, [name, avatarLocked]);

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarLocked(true);
    };

    const handleSave = () => {
        const newRoom: Room = {
            id: room?.id || `room-${Date.now()}`,
            name: name.trim(),
            type: RoomType.Passe,
            capacity: parseInt(capacity) || 4,
            description: description.trim(),
            avatarUrl: selectedAvatar,
        };

        onSave(newRoom);
    };

    return (
        <PageContainer>
            <Header title={room ? "Editar Sala" : "Nova Sala"} />

            <div className="space-y-4 mt-6">
                {/* Nome com Avatar ao lado */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Nome e Ícone</label>
                    <div className="flex gap-3 items-center">
                        {/* Avatar Preview */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-3 border-green-100 flex-shrink-0 bg-green-50">
                            <img
                                src={selectedAvatar || avatarSuggestions[0]}
                                alt="Ícone da sala"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Nome Input */}
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 h-12 px-4 bg-green-50/80 border-none rounded-xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-green-300 outline-none"
                            placeholder="Nome da sala"
                        />
                    </div>
                </div>

                {/* Avatar Suggestions */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Escolha um ícone</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {avatarSuggestions.map((avatarUrl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleAvatarSelect(avatarUrl)}
                                className={`w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-3 transition-all bg-green-50 ${selectedAvatar === avatarUrl
                                        ? 'border-green-500 ring-2 ring-green-300 scale-110'
                                        : 'border-green-100 hover:border-green-300'
                                    }`}
                            >
                                <img
                                    src={avatarUrl}
                                    alt={`Ícone ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Capacidade */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-1 ml-1">Capacidade</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full h-12 px-4 bg-green-50/80 border-none rounded-xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-green-300 outline-none"
                        placeholder="Número de trabalhadores"
                    />
                </div>

                {/* Descrição */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-1 ml-1">Descrição (opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-green-50/80 border-none rounded-xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-green-300 outline-none resize-none"
                        placeholder="Descrição da sala..."
                    />
                </div>

                {/* Botões */}
                <div className="grid grid-cols-2 gap-4 pt-6 pb-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-12 rounded-xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!name.trim() || !capacity}
                        className="h-12 rounded-xl bg-green-500 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};
