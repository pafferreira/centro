import React, { useState } from 'react';
import { Assistido, PasseAttendance, AttendancePhase, PasseType } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { ChevronDownIconInline, ChevronUpIconInline, ClipboardListIcon } from '../components/Icons';
import { Combobox } from '../components/shared/Combobox';

interface AssistidoFormViewProps {
    assistido?: Assistido | null;
    history?: PasseAttendance[]; // Histórico de atendimentos deste assistido
    existingAssistidos: Assistido[]; // Lista completa para sugerir nomes e evitar duplicados
    onSave: (assistido: Assistido) => void;
    onCancel: () => void;
    onHome?: () => void;
    onEditAssistance?: (assistido: Assistido) => void;
}

export const AssistidoFormView: React.FC<AssistidoFormViewProps> = ({ assistido, history = [], existingAssistidos, onSave, onCancel, onHome, onEditAssistance }) => {
    const [nome, setNome] = useState(assistido?.nome || '');
    const [telefone, setTelefone] = useState(assistido?.telefone || '');
    const [observacoes, setObservacoes] = useState(assistido?.observacoes || '');

    const [openAccordion, setOpenAccordion] = useState<number | null>(null); // 1 = Details, 2 = History

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = nome.trim();
        if (!trimmedName) return;

        const duplicate = existingAssistidos.find(a =>
            a.nome.trim().toLowerCase() === trimmedName.toLowerCase() &&
            a.id !== assistido?.id
        );

        if (duplicate) {
            alert(`Já existe um assistido cadastrado com o nome "${trimmedName}".\n\nAltere o nome ou edite o cadastro existente.`);
            return;
        }

        onSave({
            id: assistido?.id || crypto.randomUUID(),
            nome: trimmedName,
            telefone: telefone.trim() || undefined,
            observacoes: observacoes.trim() || undefined,
        });
    };

    const toggleAccordion = (id: number) => {
        setOpenAccordion(prev => prev === id ? null : id);
    };

    return (
        <PageContainer>
            <Header title={assistido ? "Ficha do Assistido" : "Novo Assistido"} onBack={onCancel} onHome={onHome} />

            <div className="mt-3 flex flex-col gap-5 px-1 pb-10">
                <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nome do Assistido *</label>
                        <Combobox
                            required
                            value={nome}
                            onChange={(val) => setNome(val)}
                            options={existingAssistidos
                                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                                .map((a) => ({ id: a.id, value: a.nome }))
                            }
                            placeholder="Nome completo"
                            className="w-full"
                        />
                    </div>

                    {/* Accordion Detalhes (Opcionais) */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden mt-2">
                        <button
                            type="button"
                            onClick={() => toggleAccordion(1)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                        >
                            <span className="font-semibold text-slate-700">Mais Detalhes (Opcional)</span>
                            {openAccordion === 1 ? <ChevronUpIconInline className="w-5 h-5 text-slate-500" /> : <ChevronDownIconInline className="w-5 h-5 text-slate-500" />}
                        </button>

                        {openAccordion === 1 && (
                            <div className="p-4 flex flex-col gap-4 border-t border-slate-200 bg-white">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Telefone</label>
                                    <input
                                        type="tel"
                                        value={telefone}
                                        onChange={(e) => setTelefone(e.target.value)}
                                        placeholder="(DD) 99999-9999"
                                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Observações Relatadas</label>
                                    <textarea
                                        rows={3}
                                        value={observacoes}
                                        onChange={(e) => setObservacoes(e.target.value)}
                                        placeholder="Observações adicionais..."
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30 resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]">
                        Salvar Assistido
                    </button>
                </form>

                {/* Ações Auxiliares */}
                {assistido && onEditAssistance && (
                    <button
                        type="button"
                        onClick={() => onEditAssistance(assistido)}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 py-4 px-5 rounded-2xl shadow-sm border border-indigo-200 flex items-center gap-4 transition-all active:scale-[0.98]"
                    >
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <ClipboardListIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-indigo-800 text-base leading-snug">Ficha de Assistência</span>
                            <span className="text-indigo-400 text-sm font-medium">(Entrevista)</span>
                        </div>
                    </button>
                )}

                {/* Histórico */}
                {assistido && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-soft mt-2">
                        <button
                            type="button"
                            onClick={() => toggleAccordion(2)}
                            className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <span className="font-bold text-slate-800 text-lg">Histórico de Atendimento</span>
                            {openAccordion === 2 ? <ChevronUpIconInline className="w-5 h-5 text-slate-500" /> : <ChevronDownIconInline className="w-5 h-5 text-slate-500" />}
                        </button>

                        {openAccordion === 2 && (
                            <div className="border-t border-slate-200 bg-slate-50/50 p-4">
                                {history.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">Nenhum atendimento registrado para este assistido.</p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {history.map((att, index) => (
                                            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 block">{att.date.split('-').reverse().join('/')}</span>
                                                        <span className="font-bold text-slate-800">{att.attendancePhase}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold`}>
                                                        {att.status}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${att.passeType === PasseType.A1 ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                        {att.passeType}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
