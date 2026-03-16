import React, { useState } from 'react';
import { Assistido, FichaAssistencia } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { SearchIcon, PlusIcon, RefreshIcon } from '../components/Icons';
import { Tooltip } from '../components/shared/Tooltip';

interface AssistidosListViewProps {
    assistidos: Assistido[];
    fichas: FichaAssistencia[];
    onEdit: (assistido: Assistido) => void;
    onAdd: () => void;
    onBack?: () => void;
    onHome?: () => void;
}

export const AssistidosListView: React.FC<AssistidosListViewProps> = ({ assistidos, fichas, onEdit, onAdd, onBack, onHome }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAssistidos = assistidos.filter(a =>
        a.nome.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getNextPasseTag = (assistidoId: string) => {
        const ficha = fichas.find(f => f.assistidoId === assistidoId && f.statusFicha === 'Ativa');
        if (!ficha) return null;

        const rA2 = ficha.realizadoA2 || 0;
        const rA1 = ficha.realizadoA1 || 0;
        const total = rA2 + rA1;
        const max = ficha.qtdA2 + ficha.qtdA1;

        if (total >= max) return { label: 'Concluído', cls: 'bg-slate-100 text-slate-400 border-slate-200' };
        if (total === max - 1) return { label: 'Retorno', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };

        if (rA2 < ficha.qtdA2) return { label: 'A2', cls: 'bg-amber-50 text-amber-600 border-amber-100' };
        return { label: 'A1', cls: 'bg-blue-50 text-blue-600 border-blue-100' };
    };

    return (
        <PageContainer>
            <Header title="Assistidos" onBack={onBack} onHome={onHome} />

            <div className="mt-6 space-y-4">
                {/* Busca */}
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar assistido por nome..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                </div>

                <div className="flex justify-between items-center text-sm text-slate-600 px-1 pt-2">
                    <span>Total: {filteredAssistidos.length}</span>
                </div>

                {/* Lista */}
                <div className="space-y-3 pb-24">
                    {filteredAssistidos.map((assistido) => {
                        const nextTag = getNextPasseTag(assistido.id);
                        return (
                            <div
                                key={assistido.id}
                                onClick={() => onEdit(assistido)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{assistido.nome}</h3>
                                        {assistido.telefone && (
                                            <p className="text-sm text-slate-500 mt-0.5">{assistido.telefone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Próximo Passe */}
                                {nextTag && (
                                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Próximo</span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm ${nextTag.cls}`}>
                                            {nextTag.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {filteredAssistidos.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500 font-medium">Nenhum assistido encontrado</p>
                            <button
                                onClick={onAdd}
                                className="mt-4 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Adicionar {searchQuery ? 'Novo Assistido' : ''}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Fab button */}
            <div className="fixed bottom-24 right-6 z-40">
                <Tooltip text="Novo Assistido" position="left">
                    <button
                        onClick={onAdd}
                        className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all"
                    >
                        <PlusIcon className="w-8 h-8" />
                    </button>
                </Tooltip>
            </div>
        </PageContainer>
    );
};
