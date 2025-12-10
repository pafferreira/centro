import React from "react";
import { Header } from "../components/shared/Header";
import { DoorIcon, EditIcon, TrashIcon } from "../components/Icons";

interface RoomListViewProps {
    onBack: () => void;
    onHome?: () => void;
}

import { PageContainer } from "../components/shared/PageContainer";

export const RoomListView: React.FC<RoomListViewProps> = ({ onBack, onHome }) => {
    return (
        <PageContainer>
            <Header title="Salas de Passe" onBack={onBack} onHome={onHome} />

            <div className="mt-6 mb-8">
                <div className="bg-white p-1 rounded-2xl border border-card-border/60 shadow-soft flex items-center mb-4">
                    <input className="flex-1 h-14 px-4 outline-none bg-transparent placeholder:text-slate-400 text-slate-700 text-lg" placeholder="Nome da Sala" />
                </div>
                <button className="w-full h-14 bg-[#7faec1] text-white font-bold rounded-full shadow-lg hover:bg-[#6a9bb0] transition-colors text-lg">
                    Adicionar Sala
                </button>
            </div>

            <h3 className="mb-4 text-lg font-medium text-slate-500 px-1">Salas Cadastradas</h3>

            <div className="space-y-4">
                {['Sala 1', 'Sala 2', 'Sala 3'].map((room, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl shadow-soft border border-card-border/60 flex items-center justify-between group h-24">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden relative shadow-sm border border-green-100 bg-green-50 flex items-center justify-center">
                                <DoorIcon className="w-8 h-8 text-green-500" />
                            </div>
                            <span className="font-medium text-xl text-slate-700">{room}</span>
                        </div>
                        <div className="flex gap-1 pr-2">
                            <button className="p-2 text-slate-400 hover:text-blue-500"><EditIcon className="w-6 h-6" /></button>
                            <button className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-6 h-6" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
};
