import React, { useState } from 'react';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';

const UserIconSolidOutline = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const ChevronUpIconInline = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);

const ChevronDownIconInline = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

interface SetupForm {
    nome: string;
    dataEntrevista: string;
    entrevistador: string;
    qtdA2: number;
    qtdA1: number;
}

import { Worker, WorkerRole } from '../types';

interface AssistanceViewProps {
    workers: Worker[];
}

export const AssistanceView: React.FC<AssistanceViewProps> = ({ workers }) => {
    const [setupMode, setSetupMode] = useState<'INITIAL' | 'FOLLOWUP' | null>('INITIAL');
    const [formInput, setFormInput] = useState<SetupForm>({
        nome: '',
        dataEntrevista: '',
        entrevistador: '',
        qtdA2: 0,
        qtdA1: 0
    });

    const [initialForm, setInitialForm] = useState<SetupForm | null>(null);
    const [followupForm, setFollowupForm] = useState<SetupForm | null>(null);

    const [initialDates, setInitialDates] = useState<string[]>(Array(8).fill(''));
    const [followupDates, setFollowupDates] = useState<string[]>(Array(8).fill(''));

    const [openAccordion, setOpenAccordion] = useState<number | null>(1);

    const handleSetupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (setupMode === 'INITIAL') {
            setInitialForm(formInput);
            setSetupMode(null);
            setOpenAccordion(1);
        } else if (setupMode === 'FOLLOWUP') {
            setFollowupForm({ ...formInput, nome: initialForm?.nome || '' });
            setSetupMode(null);
            setOpenAccordion(2);
        }
    };

    if (setupMode) {
        return (
            <PageContainer>
                <Header title={setupMode === 'INITIAL' ? "Registro do Assistido" : "Entrevista de Acompanhamento"} hideBack />
                <form onSubmit={handleSetupSubmit} className="mt-4 flex flex-col gap-5 px-1 pb-10">
                    <p className="text-sm text-slate-600 mb-2">
                        {setupMode === 'INITIAL'
                            ? "Preencha os dados iniciais para montar a ficha do assistido."
                            : "A fase inicial foi concluída. Preencha os dados para a nova fase de acompanhamento."}
                    </p>

                    {setupMode === 'INITIAL' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Nome do Assistido</label>
                            <input
                                type="text"
                                required
                                value={formInput.nome}
                                onChange={e => setFormInput({ ...formInput, nome: e.target.value })}
                                className="w-full px-4 py-3 bg-white rounded-xl shadow-soft border border-card-border/60 focus:ring-2 focus:ring-blue-500/30"
                                placeholder="Ex: Maria da Silva"
                            />
                        </div>
                    )}
                    {setupMode === 'FOLLOWUP' && initialForm && (
                        <div className="flex flex-col gap-1.5 opacity-70">
                            <label className="text-sm font-semibold text-slate-700">Nome do Assistido</label>
                            <input
                                type="text"
                                disabled
                                value={initialForm.nome}
                                className="w-full px-4 py-3 bg-slate-100 rounded-xl shadow-soft border border-slate-200 text-slate-600 font-bold"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Data da Entrevista</label>
                        <input
                            type="date"
                            required
                            value={formInput.dataEntrevista}
                            // Limit to on or after the last session date if followup
                            min={setupMode === 'FOLLOWUP' && initialDates[7] ? initialDates[7] : undefined}
                            onChange={e => setFormInput({ ...formInput, dataEntrevista: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl shadow-soft border border-card-border/60 focus:ring-2 focus:ring-blue-500/30 text-slate-800 appearance-none min-h-[50px] date-input-full-picker"
                            onClick={(e) => {
                                // @ts-ignore
                                if (e.target.showPicker) e.target.showPicker();
                            }}
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
                            <label className="text-sm font-semibold text-slate-700">Qtd A2</label>
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
                                className="w-full px-4 py-3 bg-amber-50 rounded-xl shadow-soft border border-amber-200 focus:ring-2 focus:ring-amber-500/30 text-center text-lg font-bold text-amber-700"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-sm font-semibold text-slate-700">Qtd A1</label>
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
                                className="w-full px-4 py-3 bg-blue-50 rounded-xl shadow-soft border border-blue-200 focus:ring-2 focus:ring-blue-500/30 text-center text-lg font-bold text-blue-700"
                            />
                        </div>
                    </div>

                    <button type="submit" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 rounded-2xl shadow-md transition-all active:scale-[0.98]">
                        Continuar
                    </button>
                </form>
            </PageContainer>
        );
    }

    if (!initialForm) return null;

    const isEighthInitialFilled = initialDates[7] && initialDates[7].trim() !== '';

    const handleInitialDateChange = (index: number, value: string) => {
        const newDates = [...initialDates];
        newDates[index] = value;
        setInitialDates(newDates);

        // Auto-trigger setup followup when 8th session is filled and has no followup yet
        if (index === 7 && value.trim() !== '' && !followupForm) {
            setFormInput({
                nome: initialForm.nome,
                dataEntrevista: '',
                entrevistador: '',
                qtdA2: 0,
                qtdA1: 0
            });
            setSetupMode('FOLLOWUP');
        }
    };

    const handleFollowupDateChange = (index: number, value: string) => {
        const newDates = [...followupDates];
        newDates[index] = value;
        setFollowupDates(newDates);
    };

    const getSessionTag = (index: number, formBase: SetupForm) => {
        if (index < formBase.qtdA2) {
            return { type: 'A2', bg: 'bg-amber-100 text-amber-800 border-amber-200 shadow-amber-100' };
        }
        return { type: 'A1', bg: 'bg-sky-100 text-sky-800 border-sky-200 shadow-sky-100' };
    };

    const getNextDayDate = (dateStr: string) => {
        if (!dateStr) return undefined;
        // Parse date string (YYYY-MM-DD), add 1 day, and format back
        const date = new Date(dateStr + 'T12:00:00Z');
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (dateStr: string) => {
        return dateStr ? new Date(dateStr + 'T12:00:00Z').toLocaleDateString('pt-BR') : '-';
    };

    const renderAccordionContent = (
        formBase: SetupForm,
        dates: string[],
        handleDateChange: (i: number, val: string) => void,
        minDateForFirst?: string
    ) => {
        const displayDate = formatDisplayDate(formBase.dataEntrevista);

        return (
            <div className="px-5 pb-5 flex flex-col gap-4 border-t border-slate-100 pt-4">
                {/* Interviewer and Data on same line */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 pl-1">
                        Entrevista
                    </h3>
                    <div className="flex flex-row gap-0 bg-slate-50/80 rounded-[14px] shadow-inner border border-slate-100 divide-x divide-slate-200/60 overflow-hidden">
                        <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <UserIconSolidOutline className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Entrevistador</span>
                                <span className="text-slate-800 font-bold truncate text-[14px]">{formBase.entrevistador}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 px-3 py-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Data</span>
                                <span className="text-slate-800 font-bold text-[14px]">{displayDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sessions */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 pl-1">
                        Datas de Atendimento
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        {Array.from({ length: 8 }).map((_, index) => {
                            const tagInfo = getSessionTag(index, formBase);
                            const isEnabled = index === 0 || (dates[index - 1] && dates[index - 1].trim() !== '');
                            let minDate: string | undefined = undefined;

                            if (index > 0 && dates[index - 1]) {
                                minDate = getNextDayDate(dates[index - 1]);
                            } else if (index === 0 && minDateForFirst) {
                                minDate = getNextDayDate(minDateForFirst);
                            } else {
                                minDate = getNextDayDate(formBase.dataEntrevista);
                            }

                            return (
                                <div key={index} className={`flex items-center justify-between py-1.5 px-3 bg-white rounded-[14px] shadow-sm border ${isEnabled ? 'border-slate-200/70 hover:border-blue-300' : 'border-slate-100 opacity-60 bg-slate-50'} transition-colors gap-2`}>
                                    <div className="flex flex-col justify-center flex-1 min-w-0 relative">
                                        <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Sessão {index + 1}</span>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dates[index]}
                                                min={minDate}
                                                onChange={(e) => handleDateChange(index, e.target.value)}
                                                disabled={!isEnabled}
                                                className={`bg-transparent text-[15px] font-bold outline-none appearance-none date-input-full-picker w-full ${!isEnabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800'}`}
                                                onClick={(e) => {
                                                    // @ts-ignore
                                                    if (isEnabled && e.target.showPicker) e.target.showPicker();
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center pl-2 border-l border-slate-100 h-full">
                                        <div className={`px-2.5 py-1 text-sm font-bold rounded-lg border shadow-sm ${tagInfo.bg} min-w-[50px] text-center`}>
                                            {tagInfo.type}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageContainer>
            <Header title="Ficha de Assistência" hideBack />

            <div className="mt-4 flex flex-col gap-4 sm:gap-5 px-1 pb-10">
                {/* Assistido Info */}
                <h2 className="text-[22px] font-medium text-slate-800 px-1">
                    Assistido: <span className="font-bold text-blue-900">{initialForm.nome}</span>
                </h2>

                {/* Accordion 1: Sessão Inicial */}
                <div className="bg-white/90 backdrop-blur rounded-[20px] shadow-soft border border-card-border/60 overflow-hidden flex flex-col">
                    <button
                        className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none hover:bg-slate-50 transition-colors"
                        onClick={() => setOpenAccordion(openAccordion === 1 ? null : 1)}
                    >
                        <span className="font-bold text-slate-800 text-[15px]">Sessão de Assistência: Inicial</span>
                        {openAccordion === 1 ? (
                            <ChevronUpIconInline className="w-6 h-6 text-slate-400" />
                        ) : (
                            <ChevronDownIconInline className="w-6 h-6 text-slate-400" />
                        )}
                    </button>

                    {openAccordion === 1 && renderAccordionContent(initialForm, initialDates, handleInitialDateChange)}
                </div>

                {/* Accordion 2: Acompanhamento */}
                <div className={`bg-white/90 backdrop-blur rounded-[20px] overflow-hidden flex flex-col transition-all duration-300 ${isEighthInitialFilled ? 'shadow-soft border border-card-border/60' : 'opacity-70 grayscale-[30%] border border-slate-200'}`}>
                    <button
                        className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none hover:bg-slate-50 transition-colors"
                        onClick={() => {
                            if (isEighthInitialFilled) {
                                if (!followupForm) {
                                    setFormInput({
                                        nome: initialForm.nome,
                                        dataEntrevista: '',
                                        entrevistador: '',
                                        qtdA2: 0,
                                        qtdA1: 0
                                    });
                                    setSetupMode('FOLLOWUP');
                                } else {
                                    setOpenAccordion(openAccordion === 2 ? null : 2);
                                }
                            }
                        }}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-[15px]">Sessão de Assistência: Acompanhamento</span>
                            {!isEighthInitialFilled && (
                                <span className="text-xs text-slate-500 font-medium">* Preencha as 8 sessões para liberar</span>
                            )}
                            {isEighthInitialFilled && !followupForm && (
                                <span className="text-xs text-blue-500 font-medium">* Toque para iniciar o cadastro</span>
                            )}
                        </div>
                        {isEighthInitialFilled && followupForm && (
                            openAccordion === 2 ? (
                                <ChevronUpIconInline className="w-6 h-6 text-slate-400 shrink-0" />
                            ) : (
                                <ChevronDownIconInline className="w-6 h-6 text-slate-400 shrink-0" />
                            )
                        )}
                    </button>
                    {openAccordion === 2 && followupForm && renderAccordionContent(followupForm, followupDates, handleFollowupDateChange, initialDates[7])}
                </div>

                {/* Save Button */}
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                    Salvar Ficha Completa
                </button>
            </div>

            <style>{`
                /* Hide default calendar icon in some browsers to make the text the clickable area */
                .date-input-full-picker::-webkit-calendar-picker-indicator {
                    background: transparent;
                    bottom: 0;
                    color: transparent;
                    cursor: pointer;
                    height: auto;
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: auto;
                }
            `}</style>
        </PageContainer>
    );
};
