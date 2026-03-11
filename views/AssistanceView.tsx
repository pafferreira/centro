import React, { useState } from 'react';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { Worker, Assistido, FichaAssistencia, WorkerRole } from '../types';

interface SetupForm {
    nome: string;
    dataEntrevista: string;
    entrevistador: string;
    qtdA2: number;
    qtdA1: number;
    realizadoA2: number;
    realizadoA1: number;
}

interface AssistanceViewProps {
    workers: Worker[];
    assistido: Assistido;
    existingFicha?: FichaAssistencia;
    onSaveFicha: (ficha: FichaAssistencia) => void;
    onBack?: () => void;
    onHome?: () => void;
}

export const AssistanceView: React.FC<AssistanceViewProps> = ({ workers, assistido, existingFicha, onSaveFicha, onBack, onHome }) => {
    const existingEntrevistador = existingFicha?.entrevistadorId
        ? workers.find(w => w.id === existingFicha.entrevistadorId)?.name || ''
        : '';

    const [formInput, setFormInput] = useState<SetupForm>({
        nome: assistido.nome,
        dataEntrevista: existingFicha?.dataEntrevista || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
        entrevistador: existingEntrevistador,
        qtdA2: existingFicha ? existingFicha.qtdA2 : 0,
        qtdA1: existingFicha ? existingFicha.qtdA1 : 0,
        realizadoA2: existingFicha?.realizadoA2 || 0,
        realizadoA1: existingFicha?.realizadoA1 || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const ent = workers.find(w => w.name === formInput.entrevistador);
        const fichaId = existingFicha ? existingFicha.id : crypto.randomUUID();

        const ficha: FichaAssistencia = {
            id: fichaId,
            assistidoId: assistido.id,
            entrevistadorId: ent ? ent.id : null,
            dataEntrevista: formInput.dataEntrevista,
            qtdA2: formInput.qtdA2,
            qtdA1: formInput.qtdA1,
            tipoFicha: existingFicha ? existingFicha.tipoFicha : 'Inicial',
            statusFicha: existingFicha ? existingFicha.statusFicha : 'Ativa',
            realizadoA2: formInput.realizadoA2,
            realizadoA1: formInput.realizadoA1,
        };

        onSaveFicha(ficha);
    };

    return (
        <PageContainer>
            <Header title="Registro do Assistido" onBack={onBack} onHome={onHome} />
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5 px-1 pb-10">
                <p className="text-sm text-slate-600 mb-2">
                    Dados da triagem para montar a ficha do assistido.
                </p>

                <div className={`flex flex-col gap-1.5 opacity-70`}>
                    <label className="text-sm font-semibold text-slate-700">Nome do Assistido</label>
                    <input
                        type="text"
                        required
                        disabled={true}
                        value={formInput.nome}
                        onChange={e => setFormInput({ ...formInput, nome: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl shadow-soft border bg-slate-100 border-slate-200 text-slate-600 font-bold`}
                        placeholder="Ex: Maria da Silva"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Data da Entrevista</label>
                    <input
                        type="date"
                        required
                        value={formInput.dataEntrevista}
                        onChange={e => setFormInput({ ...formInput, dataEntrevista: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl shadow-soft border border-card-border/60 focus:ring-2 focus:ring-blue-500/30 text-slate-800 appearance-none min-h-[50px] date-input-full-picker"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Entrevistador</label>
                    <select
                        required
                        value={formInput.entrevistador}
                        onChange={e => setFormInput({ ...formInput, entrevistador: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl shadow-soft border border-card-border/60 focus:ring-2 focus:ring-blue-500/30 text-slate-800"
                    >
                        <option value="" disabled>Selecione um entrevistador</option>
                        {workers.filter(w => w.roles.includes(WorkerRole.Entrevista)).map(w => (
                            <option key={w.id} value={w.name}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-sm font-bold text-amber-700">Qtd A2</label>
                        <input
                            type="number"
                            required
                            min="0"
                            max="8"
                            value={formInput.qtdA2 === 0 && formInput.qtdA1 === 0 ? '' : formInput.qtdA2}
                            onChange={e => {
                                const val = Math.min(8, Math.max(0, parseInt(e.target.value) || 0));
                                setFormInput({ ...formInput, qtdA2: val, qtdA1: 8 - val });
                            }}
                            placeholder="0"
                            className="w-full px-4 py-4 bg-amber-100 rounded-xl border-2 border-amber-400 focus:ring-2 focus:ring-amber-500/40 text-center text-2xl font-black text-amber-800 shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-sm font-bold text-blue-700">Qtd A1</label>
                        <input
                            type="number"
                            required
                            min="0"
                            max="8"
                            value={formInput.qtdA1 === 0 && formInput.qtdA2 === 0 ? '' : formInput.qtdA1}
                            onChange={e => {
                                const val = Math.min(8, Math.max(0, parseInt(e.target.value) || 0));
                                setFormInput({ ...formInput, qtdA1: val, qtdA2: 8 - val });
                            }}
                            placeholder="0"
                            className="w-full px-4 py-4 bg-blue-100 rounded-xl border-2 border-blue-400 focus:ring-2 focus:ring-blue-500/40 text-center text-2xl font-black text-blue-800 shadow-sm"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200/60 mt-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Passes Já Realizados</h3>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-sm font-bold text-amber-700">A2 Realizados</label>
                            <input
                                type="number"
                                min="0"
                                max={formInput.qtdA2}
                                value={formInput.realizadoA2 === 0 ? '' : formInput.realizadoA2}
                                onChange={e => {
                                    const val = Math.min(formInput.qtdA2, Math.max(0, parseInt(e.target.value) || 0));
                                    setFormInput({ ...formInput, realizadoA2: val, realizadoA1: val < formInput.qtdA2 ? 0 : formInput.realizadoA1 });
                                }}
                                placeholder="0"
                                className="w-full px-4 py-4 bg-amber-100 rounded-xl border-2 border-amber-400 focus:ring-2 focus:ring-amber-500/40 text-center text-2xl font-black text-amber-800 shadow-sm"
                            />
                        </div>
                        <div className={`flex flex-col gap-1.5 flex-1 transition-opacity duration-200 ${formInput.realizadoA2 < formInput.qtdA2 ? 'opacity-40 pointer-events-none' : ''}`}>
                            <label className="text-sm font-bold text-blue-700">A1 Realizados</label>
                            <input
                                type="number"
                                min="0"
                                max={formInput.qtdA1}
                                disabled={formInput.realizadoA2 < formInput.qtdA2}
                                value={formInput.realizadoA1 === 0 ? '' : formInput.realizadoA1}
                                onChange={e => {
                                    const val = Math.min(formInput.qtdA1, Math.max(0, parseInt(e.target.value) || 0));
                                    setFormInput({ ...formInput, realizadoA1: val });
                                }}
                                placeholder="0"
                                className="w-full px-4 py-4 bg-blue-100 rounded-xl border-2 border-blue-400 focus:ring-2 focus:ring-blue-500/40 text-center text-2xl font-black text-blue-800 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                    Salvar Ficha de Assistência
                </button>
            </form>
        </PageContainer >
    );
};
