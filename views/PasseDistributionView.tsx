import React, { useState, useMemo, useCallback } from 'react';
import { ViewState, PasseAttendance, Room, Worker, AttendanceStatus, PasseType, AttendancePhase } from '../types';
import { Header } from '../components/shared/Header';
import { PageContainer } from '../components/shared/PageContainer';
import { distributeAttendances } from '../utils/distributionLogic';
import { saveAttendance, updateFichaRealizado } from '../utils/storage';
import { CheckCircleIcon, ArrowUpIcon, HourglassIcon } from '../components/Icons';

// ─── CSS animations injected once ────────────────────────────────────────────
const STYLES = `
@keyframes dist-slide-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(12px); }
}
@keyframes dist-slide-in {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dist-row-exit {
  animation: dist-slide-out 0.35s ease forwards;
  pointer-events: none;
}
.dist-row-enter {
  animation: dist-slide-in 0.35s ease forwards;
}
.dist-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background 150ms;
  -webkit-tap-highlight-color: transparent;
}
.dist-icon-btn:hover { background: rgba(0,0,0,0.05); }
.dist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.dist-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #7a8c90;
  background: rgba(255, 255, 255, 0.45);
  border-bottom: 1px solid rgba(13, 25, 27, 0.08);
}
.dist-table th:last-child,
.dist-table td:last-child {
  text-align: center;
}
.dist-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(13, 25, 27, 0.06);
  color: #0d191b;
  vertical-align: middle;
}
.dist-table tr:last-child td { border-bottom: none; }
.dist-table tr:hover td { background: rgba(68, 210, 240, 0.08); }
.dist-table-wrap {
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 14px 28px -20px rgba(13, 25, 27, 0.55);
}
.dist-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a8c90;
  margin-bottom: 8px;
}
.dist-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.dist-badge-a1 { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
.dist-badge-a2 { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.dist-badge-first { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.dist-badge-retorno { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
`;

interface PasseDistributionViewProps {
    attendances: PasseAttendance[];
    fichas?: any[];
    rooms: Room[];
    workers: Worker[];
    onUpdateAttendance: (att: PasseAttendance) => void;
    onBack?: () => void;
    onNavigate: (v: ViewState) => void;
}

type FlatAttendance = PasseAttendance & { assignedRoomName: string };

function getPriority(a: FlatAttendance): number {
    if (a.attendancePhase === AttendancePhase.PrimeiraVez || a.attendancePhase === AttendancePhase.Retorno) return 0;
    if (a.passeType === PasseType.A2) return 1;
    return 2;
}

function getTipoBadge(att: FlatAttendance): { label: string; className: string } {
    if (att.attendancePhase === AttendancePhase.PrimeiraVez) {
        return { label: '1a Vez', className: 'dist-badge-first' };
    }
    if (att.attendancePhase === AttendancePhase.Retorno) {
        return { label: 'Retorno', className: 'dist-badge-retorno' };
    }
    if (att.passeType === PasseType.A2) {
        return { label: 'A2', className: 'dist-badge-a2' };
    }
    return { label: 'A1', className: 'dist-badge-a1' };
}

function SituacaoIcon({ status, passeType }: { status: AttendanceStatus; passeType: PasseType }) {
    if (status === AttendanceStatus.Aguardando) {
        return <span style={{ color: '#9eb3b8', fontWeight: 700, fontSize: 18, letterSpacing: '-1px' }}>—</span>;
    }
    if (status === AttendanceStatus.NaSala) {
        return <ArrowUpIcon style={{ width: 22, height: 22, color: '#004e89' }} />;
    }
    if (status === AttendanceStatus.EmAtendimento) {
        return <HourglassIcon style={{ width: 20, height: 20, color: '#10b981' }} />;
    }
    // Atendido
    return <CheckCircleIcon style={{ width: 22, height: 22, color: '#10b981' }} />;
}

export const PasseDistributionView: React.FC<PasseDistributionViewProps> = ({
    attendances, rooms, workers, onUpdateAttendance, onBack, onNavigate
}) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [exitingId, setExitingId] = useState<string | null>(null);
    const [recentlyLiberadoIds, setRecentlyLiberadoIds] = useState<Set<string>>(new Set());

    const todaysAttendances = useMemo(
        () => attendances.filter(a => a.date === date),
        [attendances, date]
    );

    const distribution = useMemo(
        () => distributeAttendances(todaysAttendances, rooms, workers),
        [todaysAttendances, rooms, workers]
    );

    const flatAttendances = useMemo<FlatAttendance[]>(() => {
        const flat: FlatAttendance[] = [];
        distribution.forEach(d => {
            d.attendances.forEach(a => flat.push({ ...a, assignedRoomName: d.room.name }));
        });
        return flat;
    }, [distribution]);

    const activeRows = useMemo(
        () => flatAttendances
            .filter(a => a.status !== AttendanceStatus.Atendido)
            .sort((a, b) => getPriority(a) - getPriority(b)),
        [flatAttendances]
    );

    const liberadoRows = useMemo(
        () => flatAttendances.filter(a => a.status === AttendanceStatus.Atendido),
        [flatAttendances]
    );

    const handleIconClick = useCallback((att: FlatAttendance) => {
        if (att.status === AttendanceStatus.Atendido) return;

        const now = new Date().toISOString();
        let updated: PasseAttendance = { ...att };

        if (att.status === AttendanceStatus.Aguardando) {
            updated = { ...att, status: AttendanceStatus.NaSala, horaEntrada: now };
            onUpdateAttendance(updated);
            saveAttendance(updated);
        } else if (att.status === AttendanceStatus.NaSala) {
            if (att.passeType === PasseType.A2) {
                updated = { ...att, status: AttendanceStatus.EmAtendimento };
                onUpdateAttendance(updated);
                saveAttendance(updated);
            } else {
                // A1 / PrimeiraVez / Retorno → Liberado
                liberarAssistido(att, now);
            }
        } else if (att.status === AttendanceStatus.EmAtendimento) {
            liberarAssistido(att, now);
        }
    }, [onUpdateAttendance]);

    const liberarAssistido = (att: FlatAttendance, now: string) => {
        setExitingId(att.id);
        setRecentlyLiberadoIds(prev => new Set(prev).add(att.id));

        setTimeout(() => {
            const updated: PasseAttendance = { ...att, status: AttendanceStatus.Atendido, horaSaida: now };
            onUpdateAttendance(updated);
            saveAttendance(updated);
            setExitingId(null);

            // Increment realizado on the ficha
            if (att.fichaAssistenciaId) {
                const type = att.passeType === PasseType.A2 ? 'A2' : 'A1';
                updateFichaRealizado(att.fichaAssistenciaId, type);
            }
        }, 380);
    };

    const noValidRooms = distribution.length === 0;

    return (
        <PageContainer>
            <style>{STYLES}</style>
            <Header title="Painel de Distribuição" onBack={onBack} onHome={() => onNavigate('DASHBOARD')} />

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
                {/* Date filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Data do Passe</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            border: '1px solid #e2e8f0',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 600,
                            background: '#fff',
                            color: '#0d191b',
                            outline: 'none',
                        }}
                    />
                </div>

                {noValidRooms ? (
                    <div style={{
                        background: '#fefce8',
                        border: '1px solid #fde68a',
                        borderRadius: 12,
                        padding: '16px 20px',
                        color: '#92400e',
                        fontWeight: 500,
                        fontSize: 14,
                    }}>
                        Não há salas de passe válidas (com médium alocado e presente). Verifique a Montagem das Salas.
                    </div>
                ) : (
                    <>
                        {/* ── Tabela principal ── */}
                        <div>
                            <div className="dist-section-title">
                                Em Atendimento <span style={{ fontWeight: 400, color: '#b0bec5', marginLeft: 4 }}>({activeRows.length})</span>
                            </div>
                            <div className="dist-table-wrap">
                                <table className="dist-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th style={{ width: 84 }}>Tipo</th>
                                            <th style={{ width: 98 }}>Sala</th>
                                            <th style={{ width: 64 }}>Situação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center', padding: '28px 12px', color: '#b0bec5', fontStyle: 'italic', fontSize: 13 }}>
                                                    Nenhum assistido aguardando
                                                </td>
                                            </tr>
                                        ) : activeRows.map((att, idx) => {
                                            const tipoBadge = getTipoBadge(att);
                                            return (
                                                <tr
                                                    key={att.id}
                                                    className={exitingId === att.id ? 'dist-row-exit' : undefined}
                                                >
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                                            <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: 12, minWidth: 20 }}>{idx + 1}.</span>
                                                            <span style={{ fontWeight: 600, color: '#0d191b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {att.assistidoName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`dist-badge ${tipoBadge.className}`}>
                                                            {tipoBadge.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: '#475569', fontSize: 12, fontWeight: 600 }}>{att.assignedRoomName}</td>
                                                    <td>
                                                        <button
                                                            className="dist-icon-btn"
                                                            onClick={() => handleIconClick(att)}
                                                            title={att.status}
                                                            aria-label={`Avançar situação de ${att.assistidoName}`}
                                                        >
                                                            <SituacaoIcon status={att.status} passeType={att.passeType} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Tabela de Liberados ── */}
                        {liberadoRows.length > 0 && (
                            <div>
                                <div className="dist-section-title">
                                    Atendidos <span style={{ fontWeight: 400, color: '#b0bec5', marginLeft: 4 }}>({liberadoRows.length})</span>
                                </div>
                                <div className="dist-table-wrap">
                                    <table className="dist-table">
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th style={{ width: 84 }}>Tipo</th>
                                                <th style={{ width: 98 }}>Sala</th>
                                                <th style={{ width: 64 }}>Situação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {liberadoRows.map(att => {
                                                const tipoBadge = getTipoBadge(att);
                                                return (
                                                    <tr
                                                        key={att.id}
                                                        className={recentlyLiberadoIds.has(att.id) ? 'dist-row-enter' : undefined}
                                                    >
                                                        <td>
                                                            <div style={{ fontWeight: 600, color: '#0d191b' }}>{att.assistidoName}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`dist-badge ${tipoBadge.className}`}>
                                                                {tipoBadge.label}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: '#475569', fontSize: 12, fontWeight: 600 }}>{att.assignedRoomName}</td>
                                                        <td>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
                                                                <CheckCircleIcon style={{ width: 22, height: 22, color: '#10b981' }} />
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
};
