import React from "react";
import { ViewState } from "../types";
import { Header } from "../components/shared/Header";
import { BottomNav } from "../components/shared/BottomNav";
import { LegoIcon, UsersIcon, DoorIcon, MapPinIcon } from "../components/Icons";

interface DashboardViewProps {
    onNavigate: (v: ViewState) => void;
}

import { PageContainer } from "../components/shared/PageContainer";

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
    const menuItems = [
        { id: 'ROOM_ASSEMBLY', label: 'Montagem das Salas', icon: LegoIcon, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { id: 'WORKERS', label: 'Cadastro de Trabalhadores', icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
        { id: 'ROOMS', label: 'Cadastro de Salas de Passe', icon: DoorIcon, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
        { id: 'LOCATIONS', label: 'Cadastro de Locais de Trabalho', icon: MapPinIcon, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    ];

    return (
        <PageContainer>
            <Header title="Início" showSettings onSettingsClick={() => onNavigate('SETTINGS')} />

            <div className="mt-4 grid gap-4">
                {menuItems.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as ViewState)}
                        className={`group relative flex items-center p-4 rounded-2xl shadow-soft border border-card-border/60 bg-white transition-all active:scale-[0.98] text-left hover:border-primary/30`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${item.bg} ${item.border} ${item.color}`}>
                            <item.icon className="w-8 h-8" />
                        </div>
                        <div className="ml-4 flex-1 relative z-10">
                            <h3 className="font-medium text-slate-700 text-lg">{item.label}</h3>
                        </div>
                    </button>
                ))}
            </div>
        </PageContainer>
    );
};
