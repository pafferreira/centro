import React, { useState, useRef } from 'react';
import { ViewState, PasseAttendance, AttendancePhase, PasseType, AttendanceStatus, Assistido, Room, Worker } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { Tooltip, InfoIcon } from '../components/shared/Tooltip';
import { Accordion } from '../components/shared/Accordion';
import { TrashIcon, ListIcon, CardsIcon } from '../components/Icons';
import { distributeAttendances } from '../utils/distributionLogic';

interface PasseRegistrationViewProps {
    attendances: PasseAttendance[];
    assistidos: Assistido[];
    rooms: Room[];
    workers: Worker[];
    onAddAttendance: (att: PasseAttendance) => void;
    onUpdateAttendance: (att: PasseAttendance) => void;
    onDeleteAttendance: (id: string) => void;
    onAddAssistido: (ast: Assistido) => void;
    onBack?: () => void;
    onNavigate: (v: ViewState) => void;
}

export const PasseRegistrationView: React.FC<PasseRegistrationViewProps> = ({ attendances, assistidos, rooms, workers, onAddAttendance, onUpdateAttendance, onDeleteAttendance, onAddAssistido, onBack, onNavigate }) => {
    // Current date logic: We assume the user creates it for today
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [assistidoName, setAssistidoName] = useState('');
    const [passeType, setPasseType] = useState<PasseType>(PasseType.A1);
    const [attendancePhase, setAttendancePhase] = useState<AttendancePhase>(AttendancePhase.Normal);
    const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
    const [isAccordionOpen, setIsAccordionOpen] = useState(true);
    const [sortMode, setSortMode] = useState<'CHEGADA' | 'TIPO'>('CHEGADA');

    const topRef = useRef<HTMLDivElement>(null);

    const todaysAttendances = attendances.filter(a => a.date === date);

    const isPasseTypeEnabled = attendancePhase === AttendancePhase.Normal;

    const handlePhaseChange = (phase: AttendancePhase) => {
        setAttendancePhase(phase);
        // Quando não for Normal, trava o Tipo de Passe para Nenhum
        if (phase !== AttendancePhase.Normal) {
            setPasseType(PasseType.Nenhum);
        } else if (passeType === PasseType.Nenhum) {
            // Se voltar para Normal, sugere A2
            setPasseType(PasseType.A2);
        }
    };

    const handleEditClick = (att: PasseAttendance) => {
        setDate(att.date);
        setAssistidoName(att.assistidoName);
        setAttendancePhase(att.attendancePhase);
        setPasseType(att.passeType);
        setEditingAttendanceId(att.id);
        setIsAccordionOpen(true);
        // Scroll to top using the ref because our PageContainer is a scrolling div, not the body
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleCancelEdit = () => {
        setEditingAttendanceId(null);
        setAssistidoName('');
        // Resets
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const typedName = assistidoName.trim();
        const existingInQueue = todaysAttendances.find(a => a.assistidoName.toLowerCase() === typedName.toLowerCase() && a.id !== editingAttendanceId);

        if (existingInQueue) {
            alert(`ATENÇÃO: Este assistido (${typedName}) já está na fila de hoje!`);
            return;
        }

        let ast = assistidos.find(a => a.nome.toLowerCase() === typedName.toLowerCase());
        if (!ast) {
            ast = {
                id: crypto.randomUUID(),
                nome: typedName,
            };
            onAddAssistido(ast);
        }

        if (editingAttendanceId) {
            // Update mode
            const existing = attendances.find(a => a.id === editingAttendanceId);
            if (existing) {
                const updatedAttendance: PasseAttendance = {
                    ...existing,
                    date,
                    assistidoName: ast.nome,
                    assistidoId: ast.id,
                    passeType: isPasseTypeEnabled ? passeType : PasseType.Nenhum,
                    attendancePhase,
                };
                onUpdateAttendance(updatedAttendance);
            }
            setEditingAttendanceId(null);
        } else {
            // Create mode
            const newAttendance: PasseAttendance = {
                id: crypto.randomUUID(),
                date,
                assistidoName: ast.nome,
                assistidoId: ast.id,
                passeType: isPasseTypeEnabled ? passeType : PasseType.Nenhum,
                attendancePhase,
                status: AttendanceStatus.Aguardando
            };
            onAddAttendance(newAttendance);
        }

        setAssistidoName('');
        // We keep date, passeType, and phase as they might be repeated
    };

    // Simulated distribution to get possible room
    const simulatedAttendances = todaysAttendances.map(a => ({ ...a }));
    const simulatedDistribution = distributeAttendances(simulatedAttendances, rooms, workers);
    const getPossibleRoomName = (attId: string) => {
        for (const rd of simulatedDistribution) {
            if (rd.attendances.some(a => a.id === attId)) return rd.room.name;
        }
        return "-";
    };

    const attendancesWithIndex = todaysAttendances.map((att, idx) => ({ ...att, arrivalIndex: idx + 1 }));

    const groupedAttendances = {
        'Primeira Vez / Retorno': attendancesWithIndex.filter(a => a.attendancePhase === AttendancePhase.PrimeiraVez || a.attendancePhase === AttendancePhase.Retorno),
        'Passe A2': attendancesWithIndex.filter(a => a.attendancePhase === AttendancePhase.Normal && a.passeType === PasseType.A2),
        'Passe A1': attendancesWithIndex.filter(a => a.attendancePhase === AttendancePhase.Normal && a.passeType === PasseType.A1),
    };

    const renderCard = (att: typeof attendancesWithIndex[0]) => {
        let cardBgClass = "bg-white border-slate-100 hover:bg-slate-50 hover:border-blue-300";
        if (sortMode === 'TIPO' && att.attendancePhase === AttendancePhase.Normal) {
            if (att.passeType === PasseType.A1) cardBgClass = "bg-blue-100 border-blue-200 hover:bg-blue-200 hover:border-blue-400";
            if (att.passeType === PasseType.A2) cardBgClass = "bg-amber-100 border-amber-200 hover:bg-amber-200 hover:border-amber-400";
        }

        return (
            <div
                key={att.id}
                onClick={() => handleEditClick(att)}
                className={`p-3 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-colors relative ${cardBgClass}`}
            >
                <div className="flex items-center gap-4 flex-1 pointer-events-none">
                    <div className="flex flex-col items-center justify-center bg-slate-100 w-8 h-8 rounded-lg shrink-0">
                        <span className="text-sm font-black text-slate-500">{att.arrivalIndex}º</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{att.assistidoName}</span>
                        <span className="text-xs text-slate-500">{att.attendancePhase}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 pointer-events-none">
                        {att.passeType !== PasseType.Nenhum && att.attendancePhase === AttendancePhase.Normal && (
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${att.passeType === PasseType.A1 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {att.passeType}
                            </span>
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${getPossibleRoomName(att.id) !== '-' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-400 border border-slate-100'}`}>
                            {getPossibleRoomName(att.id)}
                        </span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); if (confirm(`Deseja remover ${att.assistidoName} da fila?`)) onDeleteAttendance(att.id); }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover da fila"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <PageContainer>
            <div ref={topRef}>
                <Header title="Cadastro Dia de Passe" onBack={onBack} onHome={() => onNavigate('DASHBOARD')} />
            </div>

            <div className="mt-3 flex flex-col gap-6 px-1 pb-10">
                <Accordion
                    title={editingAttendanceId ? "Editar Registro da Fila" : "Registrar Assistido na Fila"}
                    isOpen={isAccordionOpen}
                    onToggle={setIsAccordionOpen}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                Data
                                <Tooltip text="Data do atendimento. Normalmente é a data de hoje." position="top">
                                    <InfoIcon className="w-3.5 h-3.5 text-slate-400" />
                                </Tooltip>
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30 font-bold"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                Nome do Assistido
                                <Tooltip text="Digite ou escolha um nome já cadastrado. Se for novo, a ficha será criada automaticamente." position="top">
                                    <InfoIcon className="w-3.5 h-3.5 text-slate-400" />
                                </Tooltip>
                            </label>
                            <input
                                type="text"
                                required
                                list="assistidos-list"
                                value={assistidoName}
                                onChange={e => setAssistidoName(e.target.value)}
                                placeholder="Ex: Maria"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30 font-bold"
                            />
                            <datalist id="assistidos-list">
                                {assistidos
                                    .filter(ast => !todaysAttendances.some(att => att.assistidoId === ast.id || att.assistidoName.toLowerCase() === ast.nome.toLowerCase()))
                                    .map(ast => (
                                        <option key={ast.id} value={ast.nome} />
                                    ))}
                            </datalist>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                Fase de Atendimento
                                <Tooltip text="Primeira Vez: chegou hoje pela 1ª vez. Retorno: está voltando para coletar resultado. Normal: atendimento de rotina com passe." position="top">
                                    <InfoIcon className="w-3.5 h-3.5 text-slate-400" />
                                </Tooltip>
                            </label>
                            <select
                                value={attendancePhase}
                                onChange={e => handlePhaseChange(e.target.value as AttendancePhase)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30"
                            >
                                <option value={AttendancePhase.PrimeiraVez}>Primeira Vez</option>
                                <option value={AttendancePhase.Retorno}>Retorno</option>
                                <option value={AttendancePhase.Normal}>Normal</option>
                            </select>
                        </div>

                        {/* Tipo de Passe - só habilitado quando Normal */}
                        <div className={`flex flex-col gap-1.5 transition-opacity duration-200 ${isPasseTypeEnabled ? '' : 'opacity-40 grayscale-[50%]'}`}>
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                Tipo de Passe
                                <Tooltip text="A1: passe rápido (~15min). A2: passe longo (~30min). Só disponível na fase Normal." position="top">
                                    <InfoIcon className="w-3.5 h-3.5 text-slate-400" />
                                </Tooltip>
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={!isPasseTypeEnabled}
                                    onClick={() => setPasseType(PasseType.A1)}
                                    className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all cursor-pointer disabled:cursor-not-allowed ${passeType === PasseType.A1 ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm scale-[1.02]' : 'bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'
                                        }`}
                                >
                                    A1
                                </button>
                                <button
                                    type="button"
                                    disabled={!isPasseTypeEnabled}
                                    onClick={() => setPasseType(PasseType.A2)}
                                    className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all cursor-pointer disabled:cursor-not-allowed ${passeType === PasseType.A2 ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-sm scale-[1.02]' : 'bg-amber-50/50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300'
                                        }`}
                                >
                                    A2
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 flex gap-3">
                            {editingAttendanceId && (
                                <button type="button" onClick={handleCancelEdit} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer">
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" className={`flex-2 flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer w-full`}>
                                {editingAttendanceId ? "Salvar Alterações" : "Adicionar à Fila"}
                            </button>
                        </div>
                    </form>
                </Accordion>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            Fila para {date.split('-').reverse().join('/')}
                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">{todaysAttendances.length} Pessoas</span>
                        </h3>
                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                            <Tooltip text="Ordenar por Chegada" position="top">
                                <button
                                    onClick={() => setSortMode('CHEGADA')}
                                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center justify-center ${sortMode === 'CHEGADA' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                            </Tooltip>
                            <Tooltip text="Agrupar por Tipo" position="top">
                                <button
                                    onClick={() => setSortMode('TIPO')}
                                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center justify-center ${sortMode === 'TIPO' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <CardsIcon className="w-5 h-5" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {todaysAttendances.length === 0 ? (
                        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Ninguém registrado para esta sala ainda.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {sortMode === 'CHEGADA' ? (
                                attendancesWithIndex.map(att => renderCard(att))
                            ) : (
                                <>
                                    {Object.entries(groupedAttendances).map(([title, atts]) => (
                                        atts.length > 0 && (
                                            <Accordion key={title} title={<span className="text-sm font-bold text-slate-700">{title} ({atts.length})</span>} defaultOpen>
                                                <div className="flex flex-col gap-2">
                                                    {atts.map(att => renderCard(att))}
                                                </div>
                                            </Accordion>
                                        )
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};
