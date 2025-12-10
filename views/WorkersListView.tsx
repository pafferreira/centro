import React, { useState, useMemo, useEffect, useRef } from "react";
import { Worker } from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from "../components/Icons";

interface WorkersListViewProps {
    workers: Worker[];
    onEdit: (worker: Worker) => void;
    onDelete: (workerId: string) => void;
    onAdd: () => void;
    onTogglePresence: (workerId: string, present: boolean) => void;
    onHome?: () => void;
}

export const WorkersListView: React.FC<WorkersListViewProps> = ({ workers, onEdit, onDelete, onAdd, onTogglePresence, onHome }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [presenceFilter, setPresenceFilter] = useState<"all" | "present" | "absent">("all");
    const [showPresenceOptions, setShowPresenceOptions] = useState(false);
    const presenceRef = useRef<HTMLDivElement>(null);

    // Close presence dropdown on outside click
    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (presenceRef.current && !presenceRef.current.contains(event.target as Node)) {
                setShowPresenceOptions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

    // Filter and sort workers
    const filteredAndSortedWorkers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        const matchesPresence = (worker: Worker) =>
            presenceFilter === "all" ||
            (presenceFilter === "present" && worker.present !== false) ||
            (presenceFilter === "absent" && worker.present === false);

        const base = workers.filter(matchesPresence);

        const filtered = query
            ? base.filter((worker) => {
                const nameMatch = worker.name.toLowerCase().includes(query);
                const rolesMatch = worker.roles.some(role =>
                    role.toLowerCase().includes(query)
                );
                const emailMatch = worker.contact?.toLowerCase().includes(query) || false;
                return nameMatch || rolesMatch || emailMatch;
            })
            : base;

        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [workers, searchQuery, presenceFilter]);

    return (
        <PageContainer>
            <Header title="Trabalhadores" onHome={onHome} hideBack />
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600 px-1">
                <span>Total: <strong className="text-slate-800">{workers.length}</strong></span>
                <span>Filtrados: <strong className="text-slate-800">{filteredAndSortedWorkers.length}</strong></span>
            </div>

            {/* Search Bar + Presence Filter */}
            <div className="mt-6 flex flex-row flex-nowrap items-end gap-2">
                <label className="relative flex-1 min-w-0 text-xs font-semibold text-slate-600 flex flex-col gap-1">
                    <span>Busca</span>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nome, habilidade ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-soft border border-card-border/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all sm:text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                </label>

                <div ref={presenceRef} className="flex flex-col gap-1 text-xs font-semibold text-slate-600 w-28 shrink-0 sm:w-32 relative">
                    <span>Presente/Ausente</span>
                    <button
                        type="button"
                        onClick={() => setShowPresenceOptions(prev => !prev)}
                        className="w-full px-3 py-3 bg-white rounded-xl border border-card-border/60 text-slate-800 shadow-soft flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                    >
                        {presenceFilter === "all" && "Todos"}
                        {presenceFilter === "present" && "Presentes"}
                        {presenceFilter === "absent" && "Ausentes"}
                        <span className="text-slate-400">▾</span>
                    </button>
                    {showPresenceOptions && (
                        <div className="absolute top-full mt-2 right-0 w-full bg-white rounded-xl border border-card-border/60 shadow-lg overflow-hidden z-20">
                            {[
                                { value: "all", label: "Todos" },
                                { value: "present", label: "Presentes" },
                                { value: "absent", label: "Ausentes" },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setPresenceFilter(opt.value as "all" | "present" | "absent");
                                        setShowPresenceOptions(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                                        presenceFilter === opt.value ? "font-semibold text-blue-600" : "text-slate-700"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Workers List */}
            <div className="mt-4 space-y-3">
                {filteredAndSortedWorkers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 text-sm">
                            {searchQuery
                                ? "Nenhum trabalhador encontrado com esses critérios."
                                : "Nenhum trabalhador cadastrado."}
                        </p>
                    </div>
                ) : (
                    filteredAndSortedWorkers.map((worker) => (
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
                                {worker.contact && (
                                    <p className="text-xs text-slate-500 truncate">{worker.contact}</p>
                                )}
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

                            {/* Presence + Actions */}
                            <div className="flex flex-col items-end gap-2 ml-auto">
                                <label className="flex items-center gap-2 text-xs text-slate-600 select-none cursor-pointer">
                                    <span className="font-medium">Presente</span>
                                    <input
                                        type="checkbox"
                                        checked={worker.present !== false}
                                        onChange={(e) => onTogglePresence(worker.id, e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-300 cursor-pointer"
                                    />
                                </label>
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
                        </div>
                    ))
                )}
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
