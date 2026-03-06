import React, { useState, useMemo } from 'react';
import { ViewState, PasseAttendance, Room, Worker, AttendanceStatus } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { distributeAttendances } from '../utils/distributionLogic';

interface PasseDistributionViewProps {
    attendances: PasseAttendance[];
    rooms: Room[];
    workers: Worker[];
    onUpdateAttendance: (att: PasseAttendance) => void;
    onBack?: () => void;
    onNavigate: (v: ViewState) => void;
}

export const PasseDistributionView: React.FC<PasseDistributionViewProps> = ({ attendances, rooms, workers, onUpdateAttendance, onBack, onNavigate }) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Derived state for the distribution
    const todaysAttendances = attendances.filter(a => a.date === date);

    // Run distribution algorithm
    const distribution = useMemo(() => {
        return distributeAttendances(todaysAttendances, rooms, workers);
    }, [todaysAttendances, rooms, workers]);

    const flatAttendances = useMemo(() => {
        const flat: (PasseAttendance & { assignedRoomName: string })[] = [];
        distribution.forEach(d => {
            d.attendances.forEach(a => {
                flat.push({ ...a, assignedRoomName: d.room.name });
            });
        });
        return flat;
    }, [distribution]);

    const aguardando = flatAttendances.filter(a => a.status === AttendanceStatus.Aguardando);
    const naSala = flatAttendances.filter(a => a.status === AttendanceStatus.NaSala);
    const atendidos = flatAttendances.filter(a => a.status === AttendanceStatus.Atendido);

    const updateStatus = (att: PasseAttendance, newStatus: AttendanceStatus) => {
        // Find original attendance without 'assignedRoomName'
        const originalArray = attendances.find(a => a.id === att.id);
        if (originalArray) {
            onUpdateAttendance({ ...originalArray, status: newStatus });
        }
    };

    const renderCard = (att: PasseAttendance & { assignedRoomName: string }, index: number) => (
        <div key={att.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 relative">
            <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800 leading-tight pr-6">{att.assistidoName}</span>
                <span className="text-xs font-bold text-slate-400 absolute right-3 top-3">#{index + 1}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold border border-slate-200 uppercase tracking-widest">
                    {att.attendancePhase}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border uppercase tracking-widest ${att.passeType === 'A1' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {att.passeType}
                </span>
            </div>
            <div className="text-xs font-medium text-slate-500 bg-slate-50 rounded-lg p-2 mt-1 border border-slate-100 flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Sala sugerida: <strong className="text-slate-700">{att.assignedRoomName}</strong>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-2 pt-2 border-t border-slate-50 gap-2">
                {att.status === AttendanceStatus.Aguardando && (
                    <button onClick={() => updateStatus(att, AttendanceStatus.NaSala)} className="text-xs w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-xl font-bold transition-colors">
                        Chamar Sala
                    </button>
                )}
                {att.status === AttendanceStatus.NaSala && (
                    <>
                        <button onClick={() => updateStatus(att, AttendanceStatus.Aguardando)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-2 rounded-xl font-bold transition-colors shrink-0">
                            Voltar
                        </button>
                        <button onClick={() => updateStatus(att, AttendanceStatus.Atendido)} className="flex-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl font-bold border border-emerald-200 transition-colors shrink-0">
                            Finalizar Passe
                        </button>
                    </>
                )}
                {att.status === AttendanceStatus.Atendido && (
                    <button onClick={() => updateStatus(att, AttendanceStatus.Aguardando)} className="text-xs w-full text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl font-bold outline outline-1 outline-slate-200 transition-colors">
                        Desfazer Finalização
                    </button>
                )}
            </div>
        </div>
    );

    const KanbanColumn = ({ title, items, colorClass }: { title: string, items: any[], colorClass: string }) => (
        <div className={`flex flex-col gap-3 min-w-[300px] w-full md:w-1/3 bg-slate-50 border border-slate-200 rounded-3xl p-3 shrink-0`}>
            <div className={`font-bold text-[11px] uppercase tracking-widest pl-2 mb-1 opacity-80 ${colorClass}`}>
                {title} ({items.length})
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-280px)] px-1 pb-4">
                {items.map((item, idx) => renderCard(item, idx))}
                {items.length === 0 && <div className="text-center text-slate-400 text-sm py-10 font-medium border-2 border-dashed border-slate-200 rounded-2xl mx-1">Vazio</div>}
            </div>
        </div>
    );

    return (
        <PageContainer>
            <Header title="Painel de Distribuição" onBack={onBack} onHome={() => onNavigate('DASHBOARD')} />

            <div className="mt-6 flex flex-col gap-6 px-1 pb-10">
                <div className="flex flex-col gap-1.5 px-1">
                    <label className="text-sm font-semibold text-slate-700">Data do Passe</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white rounded-xl shadow-soft border border-slate-200 focus:ring-2 focus:ring-blue-500/30 font-bold"
                    />
                </div>

                {distribution.length === 0 ? (
                    <div className="bg-yellow-50 text-yellow-800 p-5 rounded-2xl border border-yellow-200 font-medium mx-1">
                        Não há salas de passe válidas (com médium alocado e presente). Verifique a Montagem das Salas.
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto snap-x snap-mandatory px-1 pb-4 min-h-[400px]">
                        <div className="snap-start shrink-0 w-full md:w-auto md:flex-1">
                            <KanbanColumn title="Aguardando" items={aguardando} colorClass="text-slate-500" />
                        </div>
                        <div className="snap-start shrink-0 w-full md:w-auto md:flex-1">
                            <KanbanColumn title="Na Sala" items={naSala} colorClass="text-indigo-600" />
                        </div>
                        <div className="snap-start shrink-0 w-full md:w-auto md:flex-1">
                            <KanbanColumn title="Atendido" items={atendidos} colorClass="text-emerald-600" />
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
