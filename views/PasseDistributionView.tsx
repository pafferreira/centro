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
    onNavigate: (v: ViewState) => void;
}

export const PasseDistributionView: React.FC<PasseDistributionViewProps> = ({ attendances, rooms, workers, onUpdateAttendance, onNavigate }) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Derived state for the distribution
    const todaysAttendances = attendances.filter(a => a.date === date);

    // Run distribution algorithm
    const distribution = useMemo(() => {
        return distributeAttendances(todaysAttendances, rooms, workers);
    }, [todaysAttendances, rooms, workers]);

    const handleToggleStatus = (att: PasseAttendance) => {
        const newStatus = att.status === AttendanceStatus.Aguardando ? AttendanceStatus.Atendido : AttendanceStatus.Aguardando;
        onUpdateAttendance({ ...att, status: newStatus });
    };

    return (
        <PageContainer>
            <Header title="Painel de Distribuição" onHome={() => onNavigate('DASHBOARD')} />

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
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 font-medium">
                        Não há salas de passe válidas (com médium alocado e presente). Verifique a Montagem das Salas.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {distribution.map(d => (
                            <div key={d.room.id} className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">{d.room.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-full text-xs">
                                        {d.attendances.length}
                                    </span>
                                </div>
                                <div className="p-4 flex flex-col gap-2">
                                    {d.attendances.length === 0 ? (
                                        <p className="text-slate-400 text-sm text-center">Fila vazia. O algoritmo direcionará assistidos para cá.</p>
                                    ) : (
                                        d.attendances.map((att, idx) => (
                                            <div key={att.id} className={`flex items-center gap-3 p-3 rounded-xl border ${att.status === 'Atendido' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-blue-100 shadow-sm'}`}>
                                                <div className="font-bold text-slate-400 w-5">{idx + 1}</div>
                                                <div className="flex flex-col flex-1">
                                                    <span className={`font-bold text-slate-800 ${att.status === 'Atendido' ? 'line-through decoration-slate-400' : ''}`}>{att.assistidoName}</span>
                                                    <span className="text-xs text-slate-500">{att.attendancePhase} - {att.passeType}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleStatus(att)}
                                                    className={`w-10 h-10 rounded-full flex justify-center items-center border transition-all ${att.status === 'Aguardando'
                                                            ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-300'
                                                            : 'border-green-500 bg-green-500 text-white'
                                                        }`}
                                                >
                                                    {att.status === 'Atendido' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                    ) : (
                                                        <span className="font-bold text-[10px] text-slate-400">Ver</span>
                                                    )}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
