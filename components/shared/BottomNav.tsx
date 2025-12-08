import React from "react";
import { ViewState } from "../../types";
import { HomeIcon, LegoIcon, UsersIcon, DoorIcon, MapPinIcon } from "../Icons";

interface BottomNavProps {
    active: ViewState;
    onChange: (v: ViewState) => void;
}

import { useLayout } from "../../context/LayoutContext";

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
    const { barsVisible } = useLayout();

    const items = [
        { id: 'DASHBOARD', label: 'Início', icon: HomeIcon, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'ROOM_ASSEMBLY', label: 'Montagem', icon: LegoIcon, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'WORKERS', label: 'Equipe', icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
        // Removed 'ROOMS' menu item per request; keep 'LOCATIONS' as the place for both rooms and other locations
        { id: 'LOCATIONS', label: 'Locais', icon: MapPinIcon, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <nav
            className={`absolute bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-white/60 pb-safe pt-2 px-2 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)] rounded-t-3xl transition-transform duration-300 ${barsVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            <div className="flex justify-around items-end">
                {items.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id as ViewState)}
                            className={`flex flex-col items-center gap-1 p-1 w-full transition-all duration-300 ${isActive ? item.color : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? `${item.bg} -translate-y-2 shadow-sm` : ''}`}>
                                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
                            </div>
                            <span className={`text-[10px] font-medium transition-all ${isActive ? 'opacity-100 font-bold translate-y-[-4px]' : 'opacity-80'}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
