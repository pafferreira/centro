import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewState, PasseAttendance, AttendancePhase, PasseType, AttendanceStatus, Assistido, Room, Worker, FichaAssistencia } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { Tooltip, InfoIcon } from '../components/shared/Tooltip';
import { Accordion } from '../components/shared/Accordion';
import { TrashIcon, ListIcon, CardsIcon, RefreshIcon } from '../components/Icons';
import { distributeAttendances } from '../utils/distributionLogic';
import { Combobox } from '../components/shared/Combobox';

const NAME_PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

function formatAssistidoName(raw: string): string {
    return raw
        .split(' ')
        .filter(Boolean)
        .map((word, index) => {
            const lower = word.toLowerCase();
            if (index > 0 && NAME_PARTICLES.has(lower)) {
                return lower;
            }
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ');
}

function formatAssistidoNameInput(raw: string): string {
    const hasTrailingSpace = raw.endsWith(' ');
    const trimmed = raw.trim();

    if (!trimmed) {
        return hasTrailingSpace ? ' ' : '';
    }

    const base = formatAssistidoName(trimmed);
    return hasTrailingSpace ? base + ' ' : base;
}

interface PasseRegistrationViewProps {
    attendances: PasseAttendance[];
    assistidos: Assistido[];
    fichas: FichaAssistencia[];
    rooms: Room[];
    workers: Worker[];
    onAddAttendance: (att: PasseAttendance) => void;
    onUpdateAttendance: (att: PasseAttendance) => void;
    onDeleteAttendance: (id: string) => void;
    onAddAssistido: (ast: Assistido) => void;
    onBack?: () => void;
    onNavigate: (v: ViewState) => void;
    onRefresh?: (silent?: boolean) => void;
}

export const PasseRegistrationView: React.FC<PasseRegistrationViewProps> = ({ attendances, assistidos, fichas, rooms, workers, onAddAttendance, onUpdateAttendance, onDeleteAttendance, onAddAssistido, onBack, onNavigate, onRefresh }) => {
    // Auto-refresh a cada 10 segundos
    useEffect(() => {
        if (!onRefresh) return;
        const interval = setInterval(() => {
            onRefresh(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    const [date, setDate] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
    const [assistidoName, setAssistidoName] = useState('');
    const [passeType, setPasseType] = useState<PasseType>(PasseType.A1);
    const [attendancePhase, setAttendancePhase] = useState<AttendancePhase>(AttendancePhase.EmAtendimento);
    const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [sortMode, setSortMode] = useState<'CHEGADA' | 'TIPO'>('TIPO');
    // true quando o assistido tem ficha ativa → campos ficam somente leitura
    const [fichaAutoDetected, setFichaAutoDetected] = useState(false);

    const topRef = useRef<HTMLDivElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const todaysAttendances = attendances.filter(a => a.date === date);

    // Tipo de passe habilitado para todas as fases — PrimeiraVez e Retorno também recebem A1 ou A2
    const isPasseTypeEnabled = useMemo(() => {
        return (
            attendancePhase === AttendancePhase.EmAtendimento ||
            attendancePhase === AttendancePhase.PrimeiraVez ||
            attendancePhase === AttendancePhase.Retorno
        );
    }, [attendancePhase]);

    // Auto-detecta Fase e Tipo de Passe com base na ficha do assistido
    useEffect(() => {
        if (!editingAttendanceId && assistidoName.trim() !== '') {
            const normalizedInput = formatAssistidoName(assistidoName.trim()).toLowerCase();
            const ast = assistidos.find(a => a.nome.trim().toLowerCase() === normalizedInput);

            if (ast) {
                const activeFicha = fichas?.find(f => f.assistidoId === ast.id && f.statusFicha === 'Ativa');
                if (activeFicha) {
                    const realizadoA2 = activeFicha.realizadoA2 || 0;
                    const realizadoA1 = activeFicha.realizadoA1 || 0;
                    const totalCount = realizadoA2 + realizadoA1;
                    const totalSessions = activeFicha.qtdA2 + activeFicha.qtdA1;

                    if (totalCount === 0) {
                        setAttendancePhase(AttendancePhase.PrimeiraVez);
                        setPasseType(activeFicha.qtdA2 > 0 ? PasseType.A2 : PasseType.A1);
                    } else if (totalCount >= totalSessions - 1) {
                        setAttendancePhase(AttendancePhase.Retorno);
                        setPasseType(activeFicha.qtdA1 > 0 ? PasseType.A1 : PasseType.A2);
                    } else {
                        setAttendancePhase(AttendancePhase.EmAtendimento);
                        setPasseType(realizadoA2 < activeFicha.qtdA2 ? PasseType.A2 : PasseType.A1);
                    }
                    setFichaAutoDetected(true);
                    return;
                }
            }
            // Assistido não encontrado ou sem ficha ativa → campos editáveis
            setFichaAutoDetected(false);
        } else if (!editingAttendanceId) {
            setFichaAutoDetected(false);
        }
    }, [assistidoName, assistidos, fichas, attendances, editingAttendanceId]);

    const handlePhaseChange = (phase: AttendancePhase) => {
        setAttendancePhase(phase);
        if (passeType === PasseType.Nenhum) {
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
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleCancelEdit = () => {
        setEditingAttendanceId(null);
        setAssistidoName('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const rawName = assistidoName.trim();
        if (!rawName) return;

        const formattedName = formatAssistidoName(rawName);
        const normalizedName = formattedName.toLowerCase();

        const existingInQueue = todaysAttendances.find(a =>
            a.assistidoName.trim().toLowerCase() === normalizedName &&
            a.id !== editingAttendanceId
        );

        if (existingInQueue) {
            alert(`ATENÇÃO: Este assistido (${formattedName}) já está na fila de hoje!`);
            return;
        }

        let ast = assistidos.find(a => a.nome.trim().toLowerCase() === normalizedName);
        if (!ast) {
            ast = { id: crypto.randomUUID(), nome: formattedName };
            onAddAssistido(ast);
        }

        const activeFicha = fichas.find(f => f.assistidoId === ast.id && f.statusFicha === 'Ativa');

        if (editingAttendanceId) {
            const existing = attendances.find(a => a.id === editingAttendanceId);
            if (existing) {
                onUpdateAttendance({
                    ...existing,
                    date,
                    assistidoName: ast.nome,
                    assistidoId: ast.id,
                    passeType: isPasseTypeEnabled ? passeType : PasseType.Nenhum,
                    attendancePhase,
                    fichaAssistenciaId: activeFicha?.id,
                });
            }
            setEditingAttendanceId(null);
        } else {
            onAddAttendance({
                id: crypto.randomUUID(),
                date,
                assistidoName: ast.nome,
                assistidoId: ast.id,
                passeType: isPasseTypeEnabled ? passeType : PasseType.Nenhum,
                attendancePhase,
                status: AttendanceStatus.Aguardando,
                fichaAssistenciaId: activeFicha?.id,
            });
        }

        setAssistidoName('');
        setAttendancePhase(AttendancePhase.EmAtendimento);
        setPasseType(PasseType.A1);
    };

    // Simulação de distribuição para prévia de sala
    const simulatedDistribution = distributeAttendances(todaysAttendances.map(a => ({ ...a })), rooms, workers);
    const getPossibleRoomName = (attId: string) => {
        for (const rd of simulatedDistribution) {
            if (rd.attendances.some(a => a.id === attId)) return rd.room.name;
        }
        return null;
    };

    const attendancesWithIndex = todaysAttendances.map((att, idx) => ({ ...att, arrivalIndex: idx + 1 }));

    const groupedAttendances = {
        'Primeira Vez / Retorno': attendancesWithIndex.filter(a => a.attendancePhase === AttendancePhase.PrimeiraVez || a.attendancePhase === AttendancePhase.Retorno),
        'Passe A2': attendancesWithIndex.filter(a => a.attendancePhase === AttendancePhase.EmAtendimento && a.passeType === PasseType.A2),
        'Passe A1': attendancesWithIndex.filter(a => a.attendancePhase === AttendancePhase.EmAtendimento && a.passeType === PasseType.A1),
    };

    const getAttTag = (att: typeof attendancesWithIndex[0]) => {
        if (att.attendancePhase === AttendancePhase.PrimeiraVez) return { label: '1ª Vez', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        if (att.attendancePhase === AttendancePhase.Retorno) return { label: 'Retorno', cls: 'bg-slate-100 text-slate-600 border-slate-300' };
        if (att.passeType === PasseType.A2) return { label: 'A2', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
        if (att.passeType === PasseType.A1) return { label: 'A1', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
        return null;
    };

    const phaseDisplayStyle: Record<AttendancePhase, string> = {
        [AttendancePhase.PrimeiraVez]: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        [AttendancePhase.Retorno]: 'bg-slate-100 border-slate-300 text-slate-700',
        [AttendancePhase.EmAtendimento]: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const renderCard = (att: typeof attendancesWithIndex[0]) => {
        const tag = getAttTag(att);
        const roomName = getPossibleRoomName(att.id);
        let cardBgClass = "bg-white border-slate-100 hover:bg-slate-50 hover:border-blue-200";
        if (sortMode === 'TIPO' && att.attendancePhase === AttendancePhase.EmAtendimento) {
            if (att.passeType === PasseType.A1) cardBgClass = "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300";
            if (att.passeType === PasseType.A2) cardBgClass = "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300";
        }

        return (
            <div
                key={att.id}
                onClick={() => handleEditClick(att)}
                className={`pl-2 pr-3 py-4 rounded-xl border shadow-sm flex items-center gap-2 cursor-pointer transition-colors ${cardBgClass}`}
            >
                {/* Ordem */}
                <span className="text-xs font-black text-slate-400 w-6 text-center shrink-0">{att.arrivalIndex}º</span>

                {/* Nome */}
                <span className="font-semibold text-slate-800 flex-1 truncate text-sm">{att.assistidoName}</span>

                {/* Tag */}
                {tag && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${tag.cls}`}>
                        {tag.label}
                    </span>
                )}

                {/* Sala */}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${roomName ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {roomName ?? '—'}
                </span>

                {/* Excluir */}
                <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Deseja remover ${att.assistidoName} da fila?`)) onDeleteAttendance(att.id); }}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remover da fila"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <PageContainer>
            <div ref={topRef}>
                <Header
                    title="Cadastro Dia de Passe"
                    onBack={onBack}
                    onHome={() => onNavigate('DASHBOARD')}
                    action={onRefresh && (
                        <Tooltip text="Atualizar Dados" position="bottom">
                            <button
                                onClick={() => onRefresh(false)}
                                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                            >
                                <RefreshIcon className="w-5 h-5" />
                            </button>
                        </Tooltip>
                    )}
                />
            </div>

            <div className="mt-3 flex flex-col gap-4 px-1 pb-10">
                {/* Card de Data Separado */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Data do Passe</span>
                        <h2 className="text-lg font-bold text-slate-800 leading-none">
                            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                    <div className="relative">
                        <input
                            ref={dateInputRef}
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="absolute inset-0 opacity-0 -z-10"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (dateInputRef.current) {
                                    if ('showPicker' in HTMLInputElement.prototype) {
                                        (dateInputRef.current as any).showPicker();
                                    } else {
                                        dateInputRef.current.click();
                                    }
                                }
                            }}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer active:scale-95"
                        >
                            Alterar
                        </button>
                    </div>
                </div>

                <Accordion
                    title={editingAttendanceId ? "Editar Registro da Fila" : "Registrar Assistido na Fila"}
                    isOpen={isAccordionOpen}
                    onToggle={setIsAccordionOpen}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Nome do Assistido */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Nome do Assistido
                            </label>
                            <div className="relative">
                                <Combobox
                                    required
                                    value={assistidoName}
                                    onChange={val => setAssistidoName(formatAssistidoNameInput(val))}
                                    options={assistidos
                                        .filter(ast => !todaysAttendances.some(att => att.assistidoId === ast.id || att.assistidoName.toLowerCase() === ast.nome.toLowerCase()))
                                        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                                        .map(ast => ({ id: ast.id, value: ast.nome }))
                                    }
                                    placeholder="Ex: Maria"
                                    className="w-full"
                                    disabled={!!editingAttendanceId}
                                />
                                {assistidoName && !editingAttendanceId && (
                                    <button
                                        type="button"
                                        onClick={() => setAssistidoName('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-[10]"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Fase de Atendimento — editável se sem ficha, somente leitura se com ficha */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Fase de Atendimento
                            </label>
                            {fichaAutoDetected ? (
                                <div className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm ${phaseDisplayStyle[attendancePhase]}`}>
                                    {attendancePhase}
                                </div>
                            ) : (
                                <select
                                    value={attendancePhase}
                                    onChange={e => handlePhaseChange(e.target.value as AttendancePhase)}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30"
                                >
                                    <option value={AttendancePhase.PrimeiraVez}>Primeira Vez</option>
                                    <option value={AttendancePhase.Retorno}>Retorno</option>
                                    <option value={AttendancePhase.EmAtendimento}>Em Atendimento</option>
                                </select>
                            )}
                        </div>

                        {/* Tipo de Passe — editável se sem ficha, somente leitura se com ficha */}
                        <div className={`flex flex-col gap-1.5 transition-opacity duration-200 ${isPasseTypeEnabled ? '' : 'opacity-40 grayscale-[50%]'}`}>
                            <label className="text-sm font-semibold text-slate-700">
                                Tipo de Passe
                            </label>
                            <div className="flex gap-3">
                                {fichaAutoDetected && !isPasseTypeEnabled ? (
                                    <>
                                        <div className={`flex-1 py-3.5 rounded-xl font-bold border-2 text-center text-base select-none ${passeType === PasseType.A2 ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-sm' : 'bg-amber-50/50 border-amber-200 text-amber-300'}`}>A2</div>
                                        <div className={`flex-1 py-3.5 rounded-xl font-bold border-2 text-center text-base select-none ${passeType === PasseType.A1 ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm' : 'bg-blue-50/50 border-blue-200 text-blue-300'}`}>A1</div>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" disabled={!isPasseTypeEnabled} onClick={() => setPasseType(PasseType.A2)} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all disabled:cursor-not-allowed ${passeType === PasseType.A2 ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-sm scale-[1.02]' : 'bg-amber-50/50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300'}`}>A2</button>
                                        <button type="button" disabled={!isPasseTypeEnabled} onClick={() => setPasseType(PasseType.A1)} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all disabled:cursor-not-allowed ${passeType === PasseType.A1 ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm scale-[1.02]' : 'bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'}`}>A1</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 flex gap-3">
                            {editingAttendanceId && (
                                <button type="button" onClick={handleCancelEdit} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer">
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer w-full">
                                {editingAttendanceId ? "Salvar Alterações" : "Adicionar à Fila"}
                            </button>
                        </div>
                    </form>
                </Accordion>

                {/* Lista da fila */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-sm">Fila · {date.split('-').reverse().join('/')}</h3>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">{todaysAttendances.length} Atendidos</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                                <Tooltip text="Ordenar por Chegada" position="top">
                                    <button
                                        type="button"
                                        onClick={() => setSortMode('CHEGADA')}
                                        className={`px-2 py-1 rounded-md transition-colors flex items-center justify-center ${sortMode === 'CHEGADA' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip text="Agrupar por Tipo" position="top">
                                    <button
                                        type="button"
                                        onClick={() => setSortMode('TIPO')}
                                        className={`px-2 py-1 rounded-md transition-colors flex items-center justify-center ${sortMode === 'TIPO' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <CardsIcon className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {todaysAttendances.length === 0 ? (
                        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Ninguém registrado para esta data ainda.</p>
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
