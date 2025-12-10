import React from "react";
import { MainBackground } from "../components/shared/MainBackground";
import { UsersIcon, DoorIcon } from "../components/Icons";

interface LoginViewProps {
    onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-6 overflow-hidden text-white">
            <MainBackground />

            <div className="relative w-full flex flex-col items-center mb-6 z-10">
                <div className="mb-4 drop-shadow-2xl">
                    <img src="/logo.png" alt="GFA Logo" className="w-32 h-32 object-contain drop-shadow-[0_10px_30px_rgba(255,255,255,0.35)] filter brightness-0 invert" />
                </div>
                <h1 className="text-white text-3xl font-bold tracking-tight drop-shadow-md text-center">GFA - Grupo Fraterno de Assistência</h1>
            </div>

            <h2 className="relative text-white text-[24px] font-semibold mb-10 text-center leading-tight z-10 drop-shadow-sm">Ben-vindo de volta</h2>

            <div className="relative w-full max-w-sm z-10 space-y-6">
                <button onClick={onLogin} className="w-full bg-gradient-to-r from-[#7fb7e6] via-[#9fc5e8] to-[#f2c6a8] text-white font-bold text-lg py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_15px_35px_rgba(46,84,120,0.45)] hover:brightness-105">
                    Entrar
                </button>
            </div>
        </div>
    );
};
