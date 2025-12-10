import React from "react";
import { ChevronLeftIcon, SettingsIcon } from "../Icons";

interface HeaderProps {
    title: string;
    onBack?: () => void;
    showSettings?: boolean;
    onSettingsClick?: () => void;
    action?: React.ReactNode;
    variant?: 'default' | 'glass';
    onHome?: () => void;
    hideBack?: boolean;
}

import { useLayout } from "../../context/LayoutContext";

export const Header: React.FC<HeaderProps> = ({ title, onBack, showSettings, onSettingsClick, action, variant = 'default', onHome, hideBack = false }) => {
    const { barsVisible } = useLayout();
    const isGlass = variant === 'glass';

    const baseClasses = isGlass
        ? 'bg-white/12 backdrop-blur-xl border-white/20 text-white shadow-md'
        : 'bg-white/80 backdrop-blur-md border-white/20 text-text-main shadow-sm';

    const titleClasses = isGlass ? 'text-white' : 'text-text-main';
    const iconButtonClasses = isGlass
        ? 'text-white/80 hover:text-white'
        : 'text-slate-400 hover:text-slate-600';
    const backButtonClasses = isGlass
        ? 'text-white hover:bg-white/10'
        : 'text-text-main hover:bg-black/5';

    const handleHomeClick = () => {
        if (onHome) {
            onHome();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <header
            className={`absolute top-0 left-0 right-0 z-30 px-4 h-16 flex items-center justify-between border-b transition-transform duration-300 ${baseClasses} ${barsVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="flex items-center gap-3">
                {onBack && !hideBack && (
                    <button onClick={onBack} className={`p-2 -ml-2 rounded-full transition-colors ${backButtonClasses}`}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={handleHomeClick} className="p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30">
                        <img src="/logo.png" alt="GFA Logo" className="w-8 h-8 object-contain" />
                    </button>
                    <h1 className={`text-xl font-bold tracking-tight ${titleClasses}`}>{title}</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {action}
                {showSettings && (
                    <button onClick={onSettingsClick} className={`p-2 transition-colors ${iconButtonClasses}`}>
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </header>
    );
};
