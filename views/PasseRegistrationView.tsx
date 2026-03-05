import React, { useState } from 'react';
import { ViewState, PasseAttendance, AttendancePhase, PasseType, AttendanceStatus, Assistido } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';

interface PasseRegistrationViewProps {
    attendances: PasseAttendance[];
    assistidos: Assistido[];
    onAddAttendance: (att: PasseAttendance) => void;
    onAddAssistido: (ast: Assistido) => void;
    onBack?: () => void;
    onNavigate: (v: ViewState) => void;
}

export const PasseRegistrationView: React.FC<PasseRegistrationViewProps> = ({ attendances, assistidos, onAddAttendance, onAddAssistido, onBack, onNavigate }) => {
    // Current date logic: We assume the user creates it for today
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [assistidoName, setAssistidoName] = useState('');
    const [passeType, setPasseType] = useState<PasseType>(PasseType.A2);
    const [attendancePhase, setAttendancePhase] = useState<AttendancePhase>(AttendancePhase.Normal);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const typedName = assistidoName.trim();
        let ast = assistidos.find(a => a.nome.toLowerCase() === typedName.toLowerCase());
        if (!ast) {
            ast = {
                id: crypto.randomUUID(),
                nome: typedName,
            };
            onAddAssistido(ast);
        }

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
        setAssistidoName('');
        // We keep date, passeType, and phase as they might be repeated
    };

    // Filter today's attendances
    const todaysAttendances = attendances.filter(a => a.date === date);

    return (
        <PageContainer>
            <Header title="Cadastro Dia de Passe" onBack={onBack} onHome={() => onNavigate('DASHBOARD')} />

            <div className="mt-3 flex flex-col gap-6 px-1 pb-10">
                <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100 flex flex-col gap-4">
                    <h3 className="font-bold text-slate-800 text-lg">Registrar Assistido na Fila</h3>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Data</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30 font-bold"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nome do Assistido</label>
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
                            {assistidos.map(ast => (
                                <option key={ast.id} value={ast.nome} />
                            ))}
                        </datalist>
                    </div>

                    {/* Fase de Atendimento PRIMEIRO */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Fase de Atendimento</label>
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
                        <label className="text-sm font-semibold text-slate-700">
                            Tipo de Passe
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={!isPasseTypeEnabled}
                                onClick={() => setPasseType(PasseType.A1)}
                                className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all cursor-pointer disabled:cursor-not-allowed ${passeType === PasseType.A1 ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm scale-[1.02]' : 'bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'
                                    }`}
                            >
                                A1 (Rápido)
                            </button>
                            <button
                                type="button"
                                disabled={!isPasseTypeEnabled}
                                onClick={() => setPasseType(PasseType.A2)}
                                className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all cursor-pointer disabled:cursor-not-allowed ${passeType === PasseType.A2 ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-sm scale-[1.02]' : 'bg-amber-50/50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300'
                                    }`}
                            >
                                A2 (Longo)
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer">
                        Adicionar à Fila
                    </button>
                </form>

                <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        Fila para {date}
                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">{todaysAttendances.length} pessoas</span>
                    </h3>

                    {todaysAttendances.length === 0 ? (
                        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Ninguém registrado para esta sala ainda.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {todaysAttendances.map(att => (
                                <div key={att.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{att.assistidoName}</span>
                                        <span className="text-xs text-slate-500">{att.attendancePhase}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {att.passeType !== PasseType.Nenhum && (
                                            <span className={`px-2 py-1 rounded text-[11px] font-bold ${att.passeType === 'A1' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                                                Passe {att.passeType}
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${att.status === 'Aguardando' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}`}>
                                            {att.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};
