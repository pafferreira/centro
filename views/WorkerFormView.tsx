import React, { useState, useEffect } from "react";
import { Worker, WorkerRole } from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";

interface WorkerFormViewProps {
    worker?: Worker | null;
    onSave: (worker: Worker) => void;
    onCancel: () => void;
}

export const WorkerFormView: React.FC<WorkerFormViewProps> = ({ worker, onSave, onCancel }) => {
    const [name, setName] = useState(worker?.name || "");
    const [contact, setContact] = useState(worker?.contact || "");
    const [selectedAvatar, setSelectedAvatar] = useState(worker?.avatarUrl || "");
    const [avatarLocked, setAvatarLocked] = useState(!!worker?.avatarUrl); // Lock if editing existing worker
    const [skills, setSkills] = useState({
        medium: worker?.roles.includes(WorkerRole.Medium) || false,
        dialogue: worker?.roles.includes(WorkerRole.Dialogo) || false,
        psychography: worker?.roles.includes(WorkerRole.Psicografa) || false,
        support: worker?.roles.includes(WorkerRole.Sustentacao) || false,
    });
    const [isCoordinator, setIsCoordinator] = useState(worker?.isCoordinator || false);

    // Generate avatar suggestions
    const avatarSuggestions = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'avatar1')}&backgroundColor=b6e3f4`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'avatar2')}&backgroundColor=c0aede`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'avatar3')}&backgroundColor=d1d4f9`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((name || 'avatar4') + '1')}&backgroundColor=b6e3f4`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent((name || 'avatar5') + '2')}&backgroundColor=c0aede`,
    ];

    useEffect(() => {
        if (worker) {
            setName(worker.name);
            setContact(worker.contact || "");
            setSelectedAvatar(worker.avatarUrl || "");
            setAvatarLocked(!!worker.avatarUrl);
            setSkills({
                medium: worker.roles.includes(WorkerRole.Medium),
                dialogue: worker.roles.includes(WorkerRole.Dialogo),
                psychography: worker.roles.includes(WorkerRole.Psicografa),
                support: worker.roles.includes(WorkerRole.Sustentacao),
            });
            setIsCoordinator(worker.isCoordinator);
        }
    }, [worker]);

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

    useEffect(() => {
        // Only update avatar automatically if user hasn't explicitly selected one
        if (!avatarLocked && name && !worker) {
            setSelectedAvatar(avatarSuggestions[0]);
        }
    }, [name, avatarLocked]);

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarLocked(true); // Lock avatar once user selects one
    };

    const toggleSkill = (skill: keyof typeof skills) => {
        setSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
    };

    const handleSave = () => {
        const roles: WorkerRole[] = [];
        if (isCoordinator) roles.push(WorkerRole.Coordenador);
        if (skills.medium) roles.push(WorkerRole.Medium);
        if (skills.dialogue) roles.push(WorkerRole.Dialogo);
        if (skills.psychography) roles.push(WorkerRole.Psicografa);
        if (skills.support) roles.push(WorkerRole.Sustentacao);

        const newWorker: Worker = {
            id: worker?.id || `worker-${Date.now()}`,
            name: name.trim(),
            contact: contact.trim(),
            roles,
            isCoordinator,
            avatarUrl: selectedAvatar,
            assignedRoomId: worker?.assignedRoomId || null,
        };

        onSave(newWorker);
    };

    return (
        <PageContainer>
            <Header title={worker ? "Editar Trabalhador" : "Novo Trabalhador"} />

            <div className="space-y-4 mt-6">
                {/* Nome com Avatar ao lado */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Nome e Avatar</label>
                    <div className="flex gap-3 items-center">
                        {/* Avatar Preview */}
                        <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-3 border-blue-100 flex-shrink-0">
                            <img
                                src={selectedAvatar || avatarSuggestions[0]}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Nome Input */}
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 h-12 px-4 bg-blue-50/80 border-none rounded-xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300 outline-none"
                            placeholder="Nome completo"
                        />
                    </div>
                </div>

                {/* Avatar Suggestions */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Escolha um avatar</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {avatarSuggestions.map((avatarUrl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleAvatarSelect(avatarUrl)}
                                className={`w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-3 transition-all ${selectedAvatar === avatarUrl
                                        ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                                        : 'border-blue-100 hover:border-blue-300'
                                    }`}
                            >
                                <img
                                    src={avatarUrl}
                                    alt={`Avatar ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contato */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-1 ml-1">Contato</label>
                    <input
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full h-12 px-4 bg-blue-50/80 border-none rounded-xl text-text-main placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300 outline-none"
                        placeholder="Telefone ou email"
                    />
                </div>

                {/* Habilidades */}
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 ml-1">Habilidades</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={skills.medium}
                                onChange={() => toggleSkill('medium')}
                                className="w-5 h-5 rounded border-2 border-blue-300 text-blue-500 focus:ring-2 focus:ring-blue-300 cursor-pointer"
                            />
                            <span className="font-medium text-text-main">Médium</span>
                        </label>

                        <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={skills.dialogue}
                                onChange={() => toggleSkill('dialogue')}
                                className="w-5 h-5 rounded border-2 border-blue-300 text-blue-500 focus:ring-2 focus:ring-blue-300 cursor-pointer"
                            />
                            <span className="font-medium text-text-main">Diálogo</span>
                        </label>

                        <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={skills.psychography}
                                onChange={() => toggleSkill('psychography')}
                                className="w-5 h-5 rounded border-2 border-blue-300 text-blue-500 focus:ring-2 focus:ring-blue-300 cursor-pointer"
                            />
                            <span className="font-medium text-text-main">Psicografa</span>
                        </label>

                        <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={skills.support}
                                onChange={() => toggleSkill('support')}
                                className="w-5 h-5 rounded border-2 border-blue-300 text-blue-500 focus:ring-2 focus:ring-blue-300 cursor-pointer"
                            />
                            <span className="font-medium text-text-main">Sustentação</span>
                        </label>
                    </div>
                </div>

                {/* Coordenador de Sala */}
                <div className="flex items-center justify-between p-2.5 mt-2">
                    <span className="text-text-main font-medium">Coordenador de Sala</span>
                    <button
                        type="button"
                        onClick={() => setIsCoordinator(!isCoordinator)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${isCoordinator ? 'bg-blue-500' : 'bg-slate-200'}`}
                    >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isCoordinator ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
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
                        disabled={!name.trim()}
                        className="h-12 rounded-xl bg-blue-500 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};
