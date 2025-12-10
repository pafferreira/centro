import React from "react";
import { ViewState } from "../types";
import { Header } from "../components/shared/Header";
import { BottomNav } from "../components/shared/BottomNav";
import { LegoIcon, UsersIcon, DoorIcon, MapPinIcon } from "../components/Icons";
import { MainBackground } from "../components/shared/MainBackground";

interface DashboardViewProps {
    onNavigate: (v: ViewState) => void;
}

import { PageContainer } from "../components/shared/PageContainer";

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
    const menuItems = [
        { id: 'ROOM_ASSEMBLY', label: 'Montagem das Salas', icon: LegoIcon },
        { id: 'WORKERS', label: 'Cadastro de Trabalhadores', icon: UsersIcon },
        { id: 'LOCATIONS', label: 'Cadastro de Locais de Trabalho', icon: MapPinIcon },
    ];

    return (
        <div className="relative h-full">
            <MainBackground />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 via-white/15 to-white/5 z-[1]" />
            <PageContainer backgroundClassName="bg-transparent" className="relative z-10 text-slate-900">
                <Header title="Início" showSettings onSettingsClick={() => onNavigate('SETTINGS')} variant="glass" onHome={() => onNavigate('DASHBOARD')} />

                <div className="mt-6 mb-3 px-1">
                    <h2 className="text-2xl font-bold drop-shadow-md">Navegação</h2>
                </div>

                <div className="grid gap-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id as ViewState)}
                            className="group relative flex items-center p-4 rounded-2xl border border-white/35 bg-gradient-to-r from-white/18 via-white/12 to-[#f2c8ae]/18 backdrop-blur-lg shadow-[0_15px_45px_rgba(46,84,120,0.35)] active:scale-[0.98] text-left transition-all hover:border-white/50"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-white/30 bg-white/70 text-slate-800">
                                <item.icon className="w-8 h-8" />
                            </div>
                            <div className="ml-4 flex-1 relative z-10">
                                <h3 className="font-semibold text-lg text-slate-900 drop-shadow-sm">{item.label}</h3>
                            </div>
                        </button>
                    ))}
                </div>
            </PageContainer>
        </div>
    );
};
