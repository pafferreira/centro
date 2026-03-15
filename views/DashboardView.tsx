import React, { useState } from "react";
import { ViewState } from "../types";
import { Header } from "../components/shared/Header";
import { MontagemIcon, UsersIcon, DoorIcon, MapPinIcon, BookIcon } from "../components/Icons";
import { PageContainer } from "../components/shared/PageContainer";

interface DashboardViewProps {
    onNavigate: (v: ViewState) => void;
}

/* ── Ícones dos grupos ─────────────────────────────────── */

function ReceptionIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Clipboard / reception desk */}
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M9 2v2h6V2" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="9" y1="14" x2="13" y2="14" />
        </svg>
    );
}

function WorkIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Wrench + gear style */}
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    );
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/* ── Tipos ─────────────────────────────────────────────── */

interface MenuItem {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
}

interface MenuGroup {
    id: string;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    gradient: string;
    iconBg: string;
    items: MenuItem[];
}

/* ── Componente principal ──────────────────────────────── */

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const menuGroups: MenuGroup[] = [
        {
            id: 'recepcao',
            label: 'Recepção',
            description: 'Fichas, passes e chamada',
            icon: ReceptionIcon,
            gradient: 'from-sky-500/15 via-cyan-400/10 to-blue-500/15',
            iconBg: 'bg-sky-100 text-sky-700 border-sky-200/60',
            items: [
                { id: 'ASSISTANCE', label: 'Ficha de Assistência', icon: BookIcon },
                { id: 'PASSE_REGISTRATION', label: 'Cadastro Dia de Passe', icon: UsersIcon },
                { id: 'PASSE_DISTRIBUTION', label: 'Distribuição do Passe', icon: MapPinIcon },
            ],
        },
        {
            id: 'trabalhos',
            label: 'Trabalhos',
            description: 'Salas, trabalhadores e montagem',
            icon: WorkIcon,
            gradient: 'from-amber-500/15 via-orange-400/10 to-yellow-500/15',
            iconBg: 'bg-amber-100 text-amber-700 border-amber-200/60',
            items: [
                { id: 'ROOM_ASSEMBLY', label: 'Montagem das Salas', icon: MontagemIcon },
                { id: 'WORKERS', label: 'Cadastro Trabalhadores', icon: UsersIcon },
                { id: 'LOCATIONS', label: 'Cadastro Salas', icon: DoorIcon },
            ],
        },
    ];

    const handleToggleGroup = (groupId: string) => {
        setExpandedGroup(prev => prev === groupId ? null : groupId);
    };

    return (
        <PageContainer backgroundClassName="bg-transparent" className="text-slate-900">
            <Header title="Início" showSettings onSettingsClick={() => onNavigate('SETTINGS')} onHome={() => onNavigate('DASHBOARD')} />

            <div className="mt-1 mb-4 px-1">
                <p className="text-xs text-slate-500/80 font-medium">Versão: {__APP_VERSION__}</p>
            </div>

            <div className="grid gap-5">
                {menuGroups.map((group) => {
                    const isExpanded = expandedGroup === group.id;
                    return (
                        <div key={group.id} className="flex flex-col">
                            {/* ── Botão do grupo ── */}
                            <button
                                onClick={() => handleToggleGroup(group.id)}
                                className={`
                                    group relative flex items-center p-5 rounded-2xl border
                                    bg-gradient-to-r ${group.gradient}
                                    backdrop-blur-lg active:scale-[0.98] text-left transition-all duration-300
                                    ${isExpanded
                                        ? 'border-white/60 shadow-[0_15px_50px_rgba(46,84,120,0.4)] rounded-b-none'
                                        : 'border-white/35 shadow-[0_15px_45px_rgba(46,84,120,0.3)] hover:border-white/50'
                                    }
                                `}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border ${group.iconBg}`}>
                                    <group.icon className="w-7 h-7" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-semibold text-lg text-slate-900 drop-shadow-sm">{group.label}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDownIcon className="w-5 h-5 text-slate-500" />
                                </div>
                            </button>

                            {/* ── Sub-itens com animação ── */}
                            <div
                                className={`
                                    overflow-hidden transition-all duration-300 ease-in-out
                                    ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                <div className="bg-white/50 backdrop-blur-md rounded-b-2xl border border-t-0 border-white/35 shadow-[0_10px_30px_rgba(46,84,120,0.15)]">
                                    {group.items.map((item, idx) => (
                                        <button
                                            key={item.id}
                                            onClick={() => onNavigate(item.id as ViewState)}
                                            className={`
                                                w-full flex items-center gap-4 px-5 py-4 text-left
                                                transition-all duration-200 active:scale-[0.98] cursor-pointer
                                                hover:bg-white/60
                                                ${idx < group.items.length - 1 ? 'border-b border-white/30' : ''}
                                                ${idx === group.items.length - 1 ? 'rounded-b-2xl' : ''}
                                            `}
                                        >
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 border border-white/50 shadow-sm text-slate-700">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-[15px] text-slate-800">{item.label}</span>
                                            <svg className="w-4 h-4 ml-auto text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </PageContainer >
    );
};
