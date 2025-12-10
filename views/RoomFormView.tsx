import React, { useState, useEffect } from "react";
import { Room, RoomType } from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { DoorIcon, MicrophoneIcon, UsersIcon, BookIcon, MapPinIcon, LegoIcon, PuzzleOverlapIcon, PuzzlePieceIcon, PuzzleClusterIcon, PuzzleGridIcon } from "../components/Icons";

interface RoomFormViewProps {
    room?: Room | null;
    onSave: (room: Room) => void;
    onCancel: () => void;
    /**
     * Default type to use when creating a new room from this form.
     * If not provided, falls back to RoomType.Passe for backward compatibility.
     */
    defaultType?: RoomType;
    onHome?: () => void;
}

export const RoomFormView: React.FC<RoomFormViewProps> = ({ room, onSave, onCancel, defaultType, onHome }) => {
    const [name, setName] = useState(room?.name || "");
    const [capacity, setCapacity] = useState(room?.capacity?.toString() || "4");
    const [description, setDescription] = useState(room?.description || "");
    const [selectedAvatar, setSelectedAvatar] = useState(room?.avatarUrl || "");
    const [selectedIcon, setSelectedIcon] = useState<string | null>(room?.avatarIcon || null);
    const [avatarLocked, setAvatarLocked] = useState(!!room?.avatarUrl || !!room?.avatarIcon);

    // Generate avatar suggestions using DiceBear 'avataaars' to match worker avatars style
    // This makes room avatars visually consistent with other lists.
    const avatarSuggestions = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Sala 1')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((name || 'Sala 2') + 'a')}&backgroundColor=d1f4d1,c0f0c0,b8e6b8`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((name || 'Sala 3') + 'b')}&backgroundColor=a8dda8,98d498,8fd0a8`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((name || 'Sala 4') + 'c')}&backgroundColor=fde68a,fcc58b,ffd6a5`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((name || 'Sala 5') + 'd')}&backgroundColor=e4c1f9,d1d4f9,c0e8f2`,
    ];

    useEffect(() => {
        if (room) {
            setName(room.name);
            setCapacity(room.capacity.toString());
            setDescription(room.description || "");
            setSelectedAvatar(room.avatarUrl || "");
            setSelectedIcon(room.avatarIcon || null);
            setAvatarLocked(!!room.avatarUrl || !!room.avatarIcon);
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
        setSelectedIcon(null);
        setAvatarLocked(true);
    };

    const handleIconSelect = (iconKey: string) => {
        setSelectedIcon(iconKey);
        setSelectedAvatar("");
        setAvatarLocked(true);
    };

    const handleSave = () => {
        const newRoom: Room = {
            id: room?.id || `room-${Date.now()}`,
            name: name.trim(),
            // preserve existing type when editing, otherwise use provided defaultType or fallback to Passe
            type: room?.type || defaultType || RoomType.Passe,
            capacity: parseInt(capacity) || 4,
            description: description.trim(),
            avatarUrl: selectedAvatar || undefined,
            avatarIcon: selectedIcon || undefined,
        };

        onSave(newRoom);
    };

    // Close form on Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onCancel();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);

    return (
        <PageContainer>
            <Header title={room ? "Editar Sala" : "Nova Sala"} onHome={onHome} />

            <div className="space-y-4 mt-6">
                {/* Nome com Avatar ao lado */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Nome e Ícone</label>
                    <div className="flex gap-3 items-center">
                        {/* Avatar Preview */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-3 border-green-100 flex-shrink-0 bg-green-50 flex items-center justify-center">
                            {selectedIcon === 'DoorIcon' ? (
                                <DoorIcon className="w-8 h-8 text-green-600" />
                            ) : selectedIcon === 'MicrophoneIcon' ? (
                                <MicrophoneIcon className="w-8 h-8 text-purple-600" />
                            ) : selectedIcon === 'UsersIcon' ? (
                                <UsersIcon className="w-8 h-8 text-orange-400" />
                            ) : selectedIcon === 'BookIcon' ? (
                                <BookIcon className="w-8 h-8 text-blue-400" />
                            ) : selectedIcon === 'PuzzleOverlapIcon' ? (
                                <PuzzleOverlapIcon className="w-8 h-8 text-green-600" />
                            ) : selectedIcon === 'PuzzlePieceIcon' ? (
                                <PuzzlePieceIcon className="w-8 h-8 text-green-600" />
                            ) : selectedIcon === 'PuzzleClusterIcon' ? (
                                <PuzzleClusterIcon className="w-8 h-8 text-green-600" />
                            ) : selectedIcon === 'PuzzleGridIcon' ? (
                                <PuzzleGridIcon className="w-8 h-8 text-green-600" />
                            ) : selectedIcon === 'MapPinIcon' ? (
                                <MapPinIcon className="w-8 h-8 text-slate-500" />
                            ) : (
                                <img
                                    src={selectedAvatar || avatarSuggestions[0]}
                                    alt="Ícone da sala"
                                    className="w-full h-full object-cover"
                                />
                            )}
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

                {/* Avatar / Icon Suggestions */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Escolha um ícone</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 items-center">
                        {/* Icon options (inline SVGs) */}
                        <button type="button" onClick={() => handleIconSelect('DoorIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'DoorIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <DoorIcon className="w-8 h-8 text-green-600" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('MicrophoneIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'MicrophoneIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <MicrophoneIcon className="w-8 h-8 text-purple-600" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('UsersIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'UsersIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <UsersIcon className="w-8 h-8 text-orange-400" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('BookIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'BookIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <BookIcon className="w-8 h-8 text-blue-400" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('PuzzleOverlapIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'PuzzleOverlapIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <PuzzleOverlapIcon className="w-8 h-8 text-green-600" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('PuzzlePieceIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'PuzzlePieceIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <PuzzlePieceIcon className="w-8 h-8 text-green-600" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('PuzzleClusterIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'PuzzleClusterIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <PuzzleClusterIcon className="w-8 h-8 text-green-600" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('PuzzleGridIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'PuzzleGridIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <PuzzleGridIcon className="w-8 h-8 text-green-600" />
                        </button>

                        <button type="button" onClick={() => handleIconSelect('LegoIcon')} className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-3 transition-all bg-green-50 ${selectedIcon === 'LegoIcon' ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-green-100 hover:border-green-300'}`}>
                            <LegoIcon className="w-8 h-8 text-yellow-600" />
                        </button>

                        {/* Divider between inline icons and image suggestions */}
                        <div className="w-px bg-slate-100 mx-2" />

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
