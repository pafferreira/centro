import React from "react";
import { ViewState } from "../../types";
import { HomeIcon, MontagemIcon, UsersIcon, DoorIcon, MapPinIcon } from "../Icons";
// import { useLayout } from "../../context/LayoutContext"; // deixar comentado para referência

interface BottomNavProps {
    active: ViewState;
    onChange: (v: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
    // const { barsVisible } = useLayout(); // deixado comentado para manter o footer fixo
    const items = [
        { id: 'DASHBOARD', label: 'Início', icon: HomeIcon, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        { id: 'ROOM_ASSEMBLY', label: 'Montagem', icon: MontagemIcon, color: 'text-green-600', bg: 'bg-green-50' },
        // Leva direto para o fluxo de Cadastro Dia de Passe (fila de assistidos)
        { id: 'PASSE_REGISTRATION', label: 'Recepção', icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
        // Leva direto para o painel de Distribuição do Passe
        { id: 'PASSE_DISTRIBUTION', label: 'Passes', icon: MapPinIcon, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-30 bg-white/92 backdrop-blur-2xl border-t border-white/70 pt-1.5 px-2 shadow-[0_-8px_30px_rgba(34,70,120,0.16)] rounded-t-[30px]"
            //className={`absolute bottom-0 left-0 right-0 z-30 bg-white/92 backdrop-blur-2xl border-t border-white/70 pt-1.5 px-2 shadow-[0_-8px_30px_rgba(34,70,120,0.16)] rounded-t-[30px] transition-transform duration-300 translate-y-0`}
            style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
                bottom: 0,
            }}
        >
            <div className="flex justify-around items-end gap-1">
                {items.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id as ViewState)}
                            className={`flex flex-col items-center gap-1 p-1.5 w-full rounded-2xl transition-all duration-300 ${isActive ? item.color : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? `${item.bg} shadow-[0_10px_25px_rgba(34,70,120,0.15)]` : 'bg-white/40 border border-white/40'}`}>
                                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
                            </div>
                            <span className={`text-[11px] font-semibold transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-85'}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
