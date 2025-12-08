import React from "react";
import { Worker } from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { PlusIcon, EditIcon, TrashIcon } from "../components/Icons";

interface WorkersListViewProps {
    workers: Worker[];
    onEdit: (worker: Worker) => void;
    onDelete: (workerId: string) => void;
    onAdd: () => void;
}

export const WorkersListView: React.FC<WorkersListViewProps> = ({ workers, onEdit, onDelete, onAdd }) => {
    const getAvatarUrl = (worker: Worker) => {
        return worker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            'Coordenador': 'bg-blue-100 text-blue-700',
            'Médium': 'bg-purple-100 text-purple-700',
            'Diálogo': 'bg-green-100 text-green-700',
            'Psicografa': 'bg-indigo-100 text-indigo-700',
            'Sustentação': 'bg-amber-100 text-amber-700',
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    // Sort workers alphabetically by name
    const sortedWorkers = [...workers].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <PageContainer>
            <Header title="Trabalhadores" />

            <div className="mt-6 space-y-3">
                {sortedWorkers.map((worker) => (
                    <div
                        key={worker.id}
                        className="bg-white p-4 rounded-2xl shadow-soft border border-card-border/60 flex items-center gap-4 group"
                    >
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-100 shadow-sm">
                            <img
                                src={getAvatarUrl(worker)}
                                alt={worker.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-base truncate">{worker.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {worker.roles.slice(0, 2).map((role, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getRoleBadgeColor(role)}`}
                                    >
                                        {role}
                                    </span>
                                ))}
                                {worker.roles.length > 2 && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600">
                                        +{worker.roles.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => onEdit(worker)}
                                className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onDelete(worker.id)}
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
                className="absolute bottom-24 right-6 w-16 h-16 bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-all hover:scale-105 z-40"
            >
                <PlusIcon className="w-8 h-8 stroke-[3]" />
            </button>
        </PageContainer>
    );
};
