import React from "react";
import { MainBackground } from "../components/shared/MainBackground";
import { UsersIcon, DoorIcon } from "../components/Icons";

interface LoginViewProps {
    onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-6 overflow-hidden">
            <MainBackground />

            <div className="relative w-full flex flex-col items-center mb-10 z-10">
                <div className="mb-6 drop-shadow-2xl">
                    <img src="/logo.png" alt="GFA Logo" className="w-32 h-32 object-contain" />
                </div>
                <h1 className="text-text-main text-4xl font-bold tracking-tight">GFA</h1>
            </div>

            <h2 className="relative text-text-main text-[28px] font-bold mb-8 text-center leading-tight z-10">Bem-vindo(a) de volta</h2>

            <div className="relative w-full max-w-sm space-y-5 z-10">
                <div>
                    <label className="block text-text-main/80 text-base font-medium mb-2 pl-1">Email ou usuário</label>
                    <div className="relative">
                        <input type="text" placeholder="Digite seu email ou usuário" className="w-full pl-5 pr-12 py-4 rounded-2xl border border-blue-100/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-light/50 text-base shadow-sm" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark/50">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-text-main/80 text-base font-medium mb-2 pl-1">Senha</label>
                    <div className="relative">
                        <input type="password" placeholder="Digite sua senha" className="w-full pl-5 pr-12 py-4 rounded-2xl border border-blue-100/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-main placeholder:text-text-light/50 text-base shadow-sm" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark/50">
                            <DoorIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="text-right pt-1">
                    <a href="#" className="text-primary-dark text-sm font-semibold hover:underline">Esqueceu a senha?</a>
                </div>

                <button onClick={onLogin} className="w-full bg-primary-dark hover:bg-cyan-500 text-text-main font-bold text-lg py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-cyan-200/50 mt-4">
                    Entrar
                </button>
            </div>

            <div className="relative mt-12 text-center z-10">
                <p className="text-sm text-text-light">Não tem uma conta?</p>
                <a href="#" className="text-primary-dark font-bold text-base hover:underline mt-1 inline-block">Criar conta</a>
            </div>
        </div>
    );
};
