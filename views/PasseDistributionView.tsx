import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ViewState,
  PasseAttendance,
  Room,
  Worker,
  AttendanceStatus,
  PasseType,
  AttendancePhase,
  WorkerRole,
} from "../types";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { distributeAttendances } from "../utils/distributionLogic";
import { saveAttendance, updateFichaRealizado } from "../utils/storage";
import {
  CheckCircleIcon,
  ArrowUpIcon,
  TimerStopwatchIcon,
  ClockSolidIcon,
  HourglassFilledIcon,
  MoveIcon,
  HourglassSpinIcon,
  HourglassPourIcon,
  ClockSpinIcon,
  HourglassFlipIcon,
  StopwatchProgressIcon,
  HourglassWindowsIcon,
  RefreshIcon,
} from "../components/Icons";

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
  animation: dist-slide-out 0.55s ease forwards;
  pointer-events: none;
}
.dist-row-enter {
  animation: dist-slide-in 0.55s ease forwards;
}
.dist-row-na-sala td {
  background: rgba(219, 234, 254, 0.55);
  border-bottom-color: rgba(59, 130, 246, 0.25);
}
.dist-row-a2-live td {
  background: rgba(220, 252, 231, 0.45);
  border-bottom-color: rgba(22, 163, 74, 0.2);
}
.dist-separator td {
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #334155;
  background: rgba(15, 23, 42, 0.06);
  border-top: 1px dashed rgba(71, 85, 105, 0.35);
  border-bottom: 1px dashed rgba(71, 85, 105, 0.35);
}
.dist-separator-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.dist-shuffle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  background: rgba(255, 255, 255, 0.86);
  color: #0f172a;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}
.dist-shuffle-btn:hover {
  background: rgba(255, 255, 255, 1);
}
.dist-shuffle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dist-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
  padding: 0;
  background: transparent;
  transition: background 150ms;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.dist-icon-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
}
.dist-icon-btn:hover { background: rgba(0,0,0,0.05); }
.dist-icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.dist-icon-btn:disabled:hover { background: transparent; }
.dist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.dist-table th {
  text-align: left;
  padding: 8px 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7a8c90;
  background: rgba(255, 255, 255, 0.45);
  border-bottom: 1px solid rgba(13, 25, 27, 0.08);
}
.dist-table th:first-child {
  padding-left: 8px;
}
.dist-table th:last-child {
  text-align: center;
  padding-right: 2px;
}
.dist-table td:last-child {
  text-align: center;
  padding: 0;
  border-left: 0;
}
.dist-table td {
  padding: 10px 4px;
  overflow: visible;
  border-bottom: 1px solid rgba(13, 15, 15, 0.06);
  color: #0d191b;
  vertical-align: middle;
}
.dist-table td:first-child {
  padding-left: 8px;
}
.dist-table tr:last-child td { border-bottom: none; }
.dist-table tr:hover td { background: rgba(68, 210, 240, 0.08); }
.dist-hover-aguardando:hover td { background: rgba(134, 239, 172, 0.15) !important; }
.dist-hover-aguardando:active td { background: rgba(134, 239, 172, 0.25) !important; }
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
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #334155;
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
.dist-room-select {
  width: auto;
  max-width: 78px;
  border: 1px solid rgba(13, 25, 27, 0.12);
  background: rgba(255, 255, 255, 0.82);
  border-radius: 8px;
  padding: 4px 2px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-right: 2px;
}
.dist-room-select:focus-visible {
  outline: 2px solid rgba(68, 210, 240, 0.6);
  outline-offset: 1px;
}
.dist-room-empty {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}
`;

interface PasseDistributionViewProps {
  attendances: PasseAttendance[];
  fichas?: any[];
  rooms: Room[];
  workers: Worker[];
  onUpdateAttendance: (att: PasseAttendance) => void;
  onBack?: () => void;
  onNavigate: (v: ViewState) => void;
  onRefresh?: (silent?: boolean) => void;
}

type FlatAttendance = PasseAttendance & { assignedRoomName: string };

type RoomOption = {
  id: string;
  name: string;
  hasDialogo: boolean;
};

function getTipoPriority(att: PasseAttendance): number {
  if (
    att.attendancePhase === AttendancePhase.PrimeiraVez ||
    att.attendancePhase === AttendancePhase.Retorno
  )
    return 0;
  if (
    att.attendancePhase === AttendancePhase.EmAtendimento &&
    att.passeType === PasseType.A2
  )
    return 1;
  if (
    att.attendancePhase === AttendancePhase.EmAtendimento &&
    att.passeType === PasseType.A1
  )
    return 2;
  return 3;
}

function getTopGroup(att: PasseAttendance): number {
  if (att.status === AttendanceStatus.NaSala) return 0;
  if (
    att.status === AttendanceStatus.EmAtendimento &&
    att.passeType === PasseType.A2
  )
    return 1;
  return 2;
}

function toMillis(isoDate?: string): number {
  if (!isoDate) return 0;
  const value = Date.parse(isoDate);
  return Number.isNaN(value) ? 0 : value;
}

function getTipoBadge(att: FlatAttendance): {
  label: string;
  className: string;
} {
  if (att.attendancePhase === AttendancePhase.PrimeiraVez) {
    return { label: "1a Vez", className: "dist-badge-first" };
  }
  if (att.attendancePhase === AttendancePhase.Retorno) {
    return { label: "Retorno", className: "dist-badge-retorno" };
  }
  if (att.passeType === PasseType.A2) {
    return { label: "A2", className: "dist-badge-a2" };
  }
  return { label: "A1", className: "dist-badge-a1" };
}

function SituacaoIcon({ status }: { status: AttendanceStatus }) {
  if (status === AttendanceStatus.Aguardando) {
    return null; // Sem ícone para aguardando
  }
  if (status === AttendanceStatus.NaSala) {
    return <ArrowUpIcon style={{ width: 18, height: 18, color: "#004e89" }} />;
  }
  if (status === AttendanceStatus.EmAtendimento) {
    return (
      <HourglassSpinIcon
        style={{ width: 18, height: 18, color: "#0b5fff" }}
      />
    );
  }
  return (
    <CheckCircleIcon style={{ width: 19, height: 19, color: "#10b981" }} />
  );
}

export const PasseDistributionView: React.FC<PasseDistributionViewProps> = ({
  attendances,
  rooms,
  workers,
  onUpdateAttendance,
  onBack,
  onNavigate,
  onRefresh,
}) => {
  const [date, setDate] = useState(
    () =>
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0],
  );

  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    if (!onRefresh) return;
    const interval = setInterval(() => {
      onRefresh(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [onRefresh]);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [recentlyLiberadoIds, setRecentlyLiberadoIds] = useState<Set<string>>(
    new Set(),
  );
  const [remainingOrderById, setRemainingOrderById] = useState<
    Map<string, number>
  >(new Map());

  const todaysAttendances = useMemo(
    () => attendances.filter((a) => a.date === date),
    [attendances, date],
  );

  useEffect(() => {
    setRemainingOrderById(new Map());
  }, [date]);

  const arrivalIndexById = useMemo(
    () => new Map(todaysAttendances.map((att, idx) => [att.id, idx])),
    [todaysAttendances],
  );

  const roomNameById = useMemo(
    () => new Map(rooms.map((room) => [room.id, room.name])),
    [rooms],
  );

  const roomOptions = useMemo<RoomOption[]>(() => {
    return rooms
      .filter((r) => r.type === "Passe")
      .map((room) => {
        const workersInRoom = workers.filter(
          (w) => w.assignedRoomId === room.id && w.present,
        );
        const hasMedium = workersInRoom.some((w) =>
          w.roles.includes(WorkerRole.Medium),
        );
        const hasDialogo = workersInRoom.some((w) =>
          w.roles.includes(WorkerRole.Dialogo),
        );
        return {
          id: room.id,
          name: room.name,
          hasDialogo,
          hasMedium,
        };
      })
      .filter((r) => r.hasMedium)
      .map(({ hasMedium, ...rest }) => rest);
  }, [rooms, workers]);

  const distribution = useMemo(
    () => distributeAttendances(todaysAttendances, rooms, workers),
    [todaysAttendances, rooms, workers],
  );

  const flatAttendances = useMemo<FlatAttendance[]>(() => {
    const distributedById = new Map<string, FlatAttendance>();

    distribution.forEach((d) => {
      d.attendances.forEach((attendance) => {
        distributedById.set(attendance.id, {
          ...attendance,
          assignedRoomName: d.room.name,
        });
      });
    });

    return todaysAttendances.map((attendance) => {
      const distributed = distributedById.get(attendance.id);
      if (distributed) {
        return distributed;
      }

      const fallbackName = attendance.allocatedRoomId
        ? (roomNameById.get(attendance.allocatedRoomId) ?? "Sem sala")
        : "Sem sala";
      return {
        ...attendance,
        assignedRoomName: fallbackName,
      };
    });
  }, [distribution, roomNameById, todaysAttendances]);

  const roomInUseOccupantByRoom = useMemo(() => {
    const map = new Map<string, string>();
    flatAttendances.forEach((attendance) => {
      const roomInUse =
        attendance.status === AttendanceStatus.NaSala ||
        attendance.status === AttendanceStatus.EmAtendimento;
      if (
        attendance.allocatedRoomId &&
        roomInUse &&
        !map.has(attendance.allocatedRoomId)
      ) {
        map.set(attendance.allocatedRoomId, attendance.id);
      }
    });
    return map;
  }, [flatAttendances]);

  const isStatusLocked = useCallback(
    (att: FlatAttendance) => {
      if (!att.allocatedRoomId) {
        return false;
      }
      const occupantId = roomInUseOccupantByRoom.get(att.allocatedRoomId);
      return !!occupantId && occupantId !== att.id;
    },
    [roomInUseOccupantByRoom],
  );

  const activeRows = useMemo(
    () =>
      flatAttendances
        .filter((attendance) => attendance.status !== AttendanceStatus.Atendido)
        .sort((a, b) => {
          const aGroup = getTopGroup(a);
          const bGroup = getTopGroup(b);

          if (aGroup !== bGroup) {
            return aGroup - bGroup;
          }

          if (aGroup === 0 || aGroup === 1) {
            const byEntrada = toMillis(b.horaEntrada) - toMillis(a.horaEntrada);
            if (byEntrada !== 0) {
              return byEntrada;
            }
          }

          const typeDiff = getTipoPriority(a) - getTipoPriority(b);
          if (typeDiff !== 0) {
            return typeDiff;
          }

          const aCustom = remainingOrderById.get(a.id);
          const bCustom = remainingOrderById.get(b.id);
          if (aCustom !== undefined || bCustom !== undefined) {
            return (
              (aCustom ?? Number.MAX_SAFE_INTEGER) -
              (bCustom ?? Number.MAX_SAFE_INTEGER)
            );
          }

          return (
            (arrivalIndexById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
            (arrivalIndexById.get(b.id) ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [arrivalIndexById, flatAttendances, remainingOrderById],
  );

  const naSalaRows = useMemo(
    () =>
      activeRows.filter(
        (attendance) => attendance.status === AttendanceStatus.NaSala,
      ),
    [activeRows],
  );

  const a2LiveRows = useMemo(
    () =>
      activeRows.filter(
        (attendance) =>
          attendance.status === AttendanceStatus.EmAtendimento &&
          attendance.passeType === PasseType.A2,
      ),
    [activeRows],
  );

  const remainingRows = useMemo(
    () => activeRows.filter((attendance) => getTopGroup(attendance) === 2),
    [activeRows],
  );

  const liberadoRows = useMemo(
    () =>
      flatAttendances
        .filter((attendance) => attendance.status === AttendanceStatus.Atendido)
        .sort((a, b) => {
          const byExitTime = toMillis(b.horaSaida) - toMillis(a.horaSaida);
          if (byExitTime !== 0) {
            return byExitTime;
          }

          return (
            (arrivalIndexById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
            (arrivalIndexById.get(b.id) ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [arrivalIndexById, flatAttendances],
  );

  const getValidRoomOptions = useCallback(
    (att: FlatAttendance): RoomOption[] => {
      if (
        att.attendancePhase === AttendancePhase.EmAtendimento &&
        att.passeType === PasseType.A2
      ) {
        return roomOptions.filter((room) => room.hasDialogo);
      }
      return roomOptions;
    },
    [roomOptions],
  );

  const applyRecalculatedRooms = useCallback(
    (baseRows: PasseAttendance[]) => {
      const recalculated = distributeAttendances(
        baseRows.map((row) => ({ ...row })),
        rooms,
        workers,
      );

      const recalculatedRoomById = new Map<string, string | null>();
      recalculated.forEach((item) => {
        item.attendances.forEach((att) => {
          recalculatedRoomById.set(att.id, att.allocatedRoomId ?? null);
        });
      });

      baseRows.forEach((att) => {
        if (att.status === AttendanceStatus.Atendido) {
          return;
        }

        const nextRoomId = recalculatedRoomById.get(att.id);
        if (nextRoomId === undefined) {
          return;
        }

        const currentRoomId = att.allocatedRoomId ?? null;
        if (nextRoomId !== currentRoomId) {
          const updated: PasseAttendance = {
            ...att,
            allocatedRoomId: nextRoomId,
          };
          onUpdateAttendance(updated);
          saveAttendance(updated);
        }
      });
    },
    [onUpdateAttendance, rooms, workers],
  );

  const handleShuffleRemaining = useCallback(() => {
    if (remainingRows.length <= 1) return;

    const shuffled = [...remainingRows];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }

    const orderMap = new Map<string, number>();
    shuffled.forEach((att, idx) => orderMap.set(att.id, idx));
    setRemainingOrderById(orderMap);

    const byId = new Map(todaysAttendances.map((att) => [att.id, att]));
    const shuffledIds = shuffled.map((att) => att.id);
    let cursor = 0;

    const rebuilt = todaysAttendances.map((att) => {
      if (!orderMap.has(att.id)) {
        return att;
      }
      const replacementId = shuffledIds[cursor++];
      return byId.get(replacementId) ?? att;
    });

    applyRecalculatedRooms(rebuilt);
  }, [applyRecalculatedRooms, remainingRows, todaysAttendances]);

  const handleRoomChange = useCallback(
    (att: FlatAttendance, roomId: string) => {
      const updated: PasseAttendance = {
        ...att,
        allocatedRoomId: roomId || null,
      };

      onUpdateAttendance(updated);
      saveAttendance(updated);

      const nextTodays = todaysAttendances.map((item) =>
        item.id === att.id ? updated : item,
      );
      applyRecalculatedRooms(nextTodays);
    },
    [applyRecalculatedRooms, onUpdateAttendance, todaysAttendances],
  );

  const handleIconClick = useCallback(
    (att: FlatAttendance) => {
      if (att.status === AttendanceStatus.Atendido) return;

      if (isStatusLocked(att)) {
        alert(
          `A sala ${att.assignedRoomName} já tem um assistido em "Na Sala" ou "Em Atendimento". Finalize esse atendimento antes de avançar outro nome.`,
        );
        return;
      }

      const nowTz = new Date().getTimezoneOffset();
      const nowStr = new Date(Date.now() - nowTz * 60000)
        .toISOString()
        .slice(0, -1);
      const sign = nowTz > 0 ? "-" : "+";
      const hours = String(Math.floor(Math.abs(nowTz) / 60)).padStart(2, "0");
      const minutes = String(Math.abs(nowTz) % 60).padStart(2, "0");
      const now = `${nowStr}${sign}${hours}:${minutes}`;
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
          liberarAssistido(att, now);
        }
      } else if (att.status === AttendanceStatus.EmAtendimento) {
        liberarAssistido(att, now);
      }
    },
    [isStatusLocked, onUpdateAttendance],
  );

  const liberarAssistido = (att: FlatAttendance, now: string) => {
    setExitingId(att.id);
    setRecentlyLiberadoIds((prev) => new Set(prev).add(att.id));

    setTimeout(() => {
      const updated: PasseAttendance = {
        ...att,
        status: AttendanceStatus.Atendido,
        horaSaida: now,
      };
      onUpdateAttendance(updated);
      saveAttendance(updated);
      setExitingId(null);

      const nextTodays = todaysAttendances.map((item) =>
        item.id === att.id ? updated : item,
      );
      applyRecalculatedRooms(nextTodays);

      if (att.fichaAssistenciaId) {
        if (
          att.attendancePhase !== AttendancePhase.PrimeiraVez &&
          att.attendancePhase !== AttendancePhase.Retorno
        ) {
          const type = att.passeType === PasseType.A2 ? "A2" : "A1";
          updateFichaRealizado(att.fichaAssistenciaId, type);
        }
      }
    }, 380);
  };

  const noValidRooms = distribution.length === 0;

  const renderActiveRow = (att: FlatAttendance, order: number) => {
    const tipoBadge = getTipoBadge(att);
    const availableRooms = getValidRoomOptions(att);
    const roomSelectOptions =
      att.allocatedRoomId &&
        !availableRooms.some((room) => room.id === att.allocatedRoomId)
        ? [
          {
            id: att.allocatedRoomId,
            name: att.assignedRoomName,
            hasDialogo: false,
          },
          ...availableRooms,
        ]
        : availableRooms;
    const isAguardando = att.status === AttendanceStatus.Aguardando;
    const statusLocked = isStatusLocked(att);
    const rowClass =
      att.status === AttendanceStatus.NaSala
        ? "dist-row-na-sala"
        : att.status === AttendanceStatus.EmAtendimento &&
          att.passeType === PasseType.A2
          ? "dist-row-a2-live"
          : "";

    return (
      <tr
        key={att.id}
        className={
          `${rowClass} ${exitingId === att.id ? "dist-row-exit" : ""} ${isAguardando ? "dist-hover-aguardando" : ""}`.trim() ||
          undefined
        }
        style={undefined}
      >
        <td
          style={{ maxWidth: 0, width: "100%" }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", minWidth: 0 }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "#0d191b",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
              title={att.assistidoName}
            >
              {att.assistidoName}
            </span>
          </div>
        </td>
        <td style={{ whiteSpace: "nowrap", paddingRight: 4 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span
              className={`dist-badge ${tipoBadge.className}`}
              style={{ whiteSpace: "nowrap" }}
            >
              {tipoBadge.label}
            </span>
          </div>
        </td>
        <td>
          {availableRooms.length === 0 ? (
            <span className="dist-room-empty" style={{ whiteSpace: "nowrap" }}>
              Sem sala
            </span>
          ) : (
            <select
              className="dist-room-select"
              value={att.allocatedRoomId ?? ""}
              onChange={(e) => handleRoomChange(att, e.target.value)}
              onClick={(e) => isAguardando && e.stopPropagation()}
              aria-label={`Alterar sala de ${att.assistidoName}`}
            >
              <option value="">Sel. sala</option>
              {roomSelectOptions.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          )}
        </td>
        <td
          style={{ padding: 0, textAlign: "center", verticalAlign: "middle" }}
        >
          {isAguardando ? (
            <button
              type="button"
              className="dist-icon-btn"
              onClick={() => handleIconClick(att)}
              disabled={statusLocked}
              title="Colocar assistido Na Sala"
              aria-label={`Colocar ${att.assistidoName} na sala`}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                }}
              >
                OK
              </span>
            </button>
          ) : (
            <button
              className="dist-icon-btn"
              onClick={() => handleIconClick(att)}
              disabled={statusLocked}
              title={
                statusLocked
                  ? `Sala ${att.assignedRoomName} com atendimento em Na Sala/Em Atendimento`
                  : att.status
              }
              aria-label={`Avançar situação de ${att.assistidoName}`}
            >
              <SituacaoIcon status={att.status} />
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <PageContainer>
      <style>{STYLES}</style>
      <Header
        title="Painel de Distribuição"
        onBack={onBack}
        onHome={() => onNavigate("DASHBOARD")}
      />

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxWidth: 220,
            }}
          >
            <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
              Data do Passe
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "10px 14px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(10px)",
                color: "#0d191b",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ClockSpinIcon
              style={{ width: 18, height: 18, color: "#0b5fff" }}
            />
            <HourglassFlipIcon
              style={{ width: 18, height: 18, color: "#0b5fff" }}
            />
            <StopwatchProgressIcon
              style={{ width: 18, height: 18, color: "#0b5fff" }}
            />
            <HourglassSpinIcon
              style={{ width: 18, height: 18, color: "#0b5fff" }}
            />
            {onRefresh && (
              <button
                onClick={() => onRefresh(false)}
                className="dist-icon-btn"
                title="Atualizar dados do banco"
                style={{
                  marginLeft: 8,
                  background: "rgba(11, 95, 255, 0.1)",
                  width: 32,
                  height: 32,
                  transition: "transform 0.2s"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <RefreshIcon style={{ width: 18, height: 18, color: "#0b5fff" }} />
              </button>
            )}
          </div>
        </div>

        {noValidRooms && (
          <div
            style={{
              background: "#fefce8",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "16px 20px",
              color: "#92400e",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Não há salas de passe válidas (com médium alocado e presente).
            Verifique a Montagem das Salas.
          </div>
        )}

        <div>
          <div className="dist-section-title">
            Em Atendimento - Total: {activeRows.length}
          </div>
          <div className="dist-table-wrap">
            <table className="dist-table">
              <thead>
                <tr>
                  <th style={{ width: "100%" }}>Nome</th>
                  <th
                    style={{
                      whiteSpace: "nowrap",
                      textAlign: "right",
                      paddingRight: 4,
                    }}
                  >
                    Tipo
                  </th>
                  <th style={{ width: 70, textAlign: "center", }}>Sala</th>
                  <th style={{ width: 24, textAlign: "center", padding: 0 }}>
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "28px 12px",
                        color: "#b0bec5",
                        fontStyle: "italic",
                        fontSize: 13,
                      }}
                    >
                      Nenhum assistido aguardando
                    </td>
                  </tr>
                ) : (
                  <>
                    {naSalaRows.map((att, idx) =>
                      renderActiveRow(att, idx + 1),
                    )}
                    {a2LiveRows.map((att, idx) =>
                      renderActiveRow(att, naSalaRows.length + idx + 1),
                    )}
                    {remainingRows.length > 0 && (
                      <tr className="dist-separator">
                        <td colSpan={4}>
                          <div
                            className="dist-separator-inner"
                            style={{ padding: "16px 0" }}
                          >
                            <span>Aguardando</span>
                            <button
                              type="button"
                              className="dist-shuffle-btn"
                              onClick={handleShuffleRemaining}
                              disabled={remainingRows.length <= 1}
                              aria-label="Redistribuir ordem dos nomes restantes"
                              title="Reaplica a distribuição para os nomes restantes"
                            >
                              <MoveIcon className="w-3.5 h-3.5" />
                              ReDistribuir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {remainingRows.map((att, idx) =>
                      renderActiveRow(
                        att,
                        naSalaRows.length + a2LiveRows.length + idx + 1,
                      ),
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="dist-section-title">
            Atendidos - Total: {liberadoRows.length}
          </div>
          <div className="dist-table-wrap">
            <table className="dist-table">
              <thead>
                <tr>
                  <th style={{ width: "100%" }}>Nome</th>
                  <th
                    style={{
                      whiteSpace: "nowrap",
                      textAlign: "right",
                      paddingRight: 4,
                    }}
                  >
                    Tipo
                  </th>
                  <th style={{ width: 70 }}>Sala</th>
                </tr>
              </thead>
              <tbody>
                {liberadoRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "24px 12px",
                        color: "#9ca3af",
                        fontStyle: "italic",
                        fontSize: 13,
                      }}
                    >
                      Nenhum assistido atendido nesta data
                    </td>
                  </tr>
                ) : (
                  liberadoRows.map((att) => {
                    const tipoBadge = getTipoBadge(att);
                    return (
                      <tr
                        key={att.id}
                        className={
                          recentlyLiberadoIds.has(att.id)
                            ? "dist-row-enter"
                            : undefined
                        }
                      >
                        <td style={{ maxWidth: 0, width: "100%" }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#0d191b",
                              overflow: "visible",
                              textOverflow: "clip",
                              whiteSpace: "nowrap",
                              margin: 0,
                              border: 0,
                            }}
                            title={att.assistidoName}
                          >
                            {att.assistidoName}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap", paddingRight: 4 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <span
                              className={`dist-badge ${tipoBadge.className}`}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {tipoBadge.label}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            paddingRight: 8,
                          }}
                        >
                          {att.assignedRoomName}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PasseDistributionView;
