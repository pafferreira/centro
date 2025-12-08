import React from "react";
import { ChevronLeftIcon, SettingsIcon } from "../Icons";

interface HeaderProps {
    title: string;
    onBack?: () => void;
    showSettings?: boolean;
    onSettingsClick?: () => void;
    action?: React.ReactNode;
}

import { useLayout } from "../../context/LayoutContext";

export const Header: React.FC<HeaderProps> = ({ title, onBack, showSettings, onSettingsClick, action }) => {
    const { barsVisible } = useLayout();

    return (
        <header
            className={`absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-white/20 shadow-sm transition-transform duration-300 ${barsVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="p-2 -ml-2 text-text-main hover:bg-black/5 rounded-full transition-colors">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    {/* Small Logo in Header */}
                    {!onBack && <img src="/logo.png" alt="GFA Logo" className="w-8 h-8 object-contain" />}
                    <h1 className="text-xl font-bold text-text-main tracking-tight">{title}</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {action}
                {showSettings && (
                    <button onClick={onSettingsClick} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </header>
    );
};
