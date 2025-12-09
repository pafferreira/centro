import React, { useState } from "react";
export {};

                  const avatarUrl = worker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

                  const handleMove = (roomId: string) => {
                    setShowMove(false);
                    if (onMove) onMove(worker.id, roomId);
                  };

                  return (
                    <div className="flex items-center p-2.5 bg-[#fdfbf7] rounded-xl border border-[#e8e4db] shadow-sm mb-2 relative group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                        <img src={avatarUrl} alt={worker.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <p className="font-semibold text-text-main text-sm truncate">{worker.name}</p>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {(roleLabel ? [roleLabel] : worker.roles).map((r, idx) => {
                            const classes = (Object.values(WorkerRole).includes(r as WorkerRole))
                              ? roleStylesMap[r as WorkerRole]
                              : "bg-gray-100 text-gray-700";
                            return (
                              <div key={idx} className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${classes}`}>
                                {r}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onMove && rooms && (
                          <div className="relative">
                            <button onClick={() => setShowMove(!showMove)} className="p-1 rounded hover:bg-slate-100">
                              <MoreDotsIcon className="w-5 h-5 text-slate-400" />
                            import React, { useState } from "react";
                            import { Worker, WorkerRole } from "../../types";
                            import { MoreDotsIcon } from "../Icons";

                            interface WorkerCardProps {
                              worker: Worker;
                              roleLabel?: string;
                              rooms?: { id: string; name: string }[];
                              onMove?: (workerId: string, roomId: string) => void;
                            }

                            export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, roleLabel, rooms, onMove }) => {
                              const [showMove, setShowMove] = useState(false);

                              const roleStylesMap: Record<WorkerRole, string> = {
                                [WorkerRole.Coordenador]: "bg-blue-200 text-blue-800",
                                [WorkerRole.Medium]: "bg-purple-200 text-purple-800",
                                [WorkerRole.Dialogo]: "bg-green-200 text-green-800",
                                [WorkerRole.Entrevista]: "bg-emerald-200 text-emerald-800",
                                [WorkerRole.Recepção]: "bg-orange-200 text-orange-800",
                                [WorkerRole.Psicografa]: "bg-indigo-200 text-indigo-800",
                                [WorkerRole.Sustentacao]: "bg-[#e0dcd5] text-[#5c554a]",
                              };

                              const avatarUrl = worker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

                              const handleMove = (roomId: string) => {
                                setShowMove(false);
                                if (onMove) onMove(worker.id, roomId);
                              };

                              return (
                                <div className="flex items-center p-2.5 bg-[#fdfbf7] rounded-xl border border-[#e8e4db] shadow-sm mb-2 relative group">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                    <img src={avatarUrl} alt={worker.name} className="w-full h-full object-cover" />
                                  </div>

                                  <div className="ml-3 flex-1 min-w-0">
                                    <p className="font-semibold text-text-main text-sm truncate">{worker.name}</p>
                                    <div className="flex gap-1 mt-0.5 flex-wrap">
                                      {(roleLabel ? [roleLabel] : worker.roles).map((r, idx) => {
                                        const classes = (Object.values(WorkerRole).includes(r as WorkerRole))
                                          ? roleStylesMap[r as WorkerRole]
                                          : "bg-gray-100 text-gray-700";
                                        return (
                                          <div key={idx} className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${classes}`}>
                                            {r}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {onMove && rooms && (
                                      <div className="relative">
                                        <button onClick={() => setShowMove(!showMove)} className="p-1 rounded hover:bg-slate-100">
                                          <MoreDotsIcon className="w-5 h-5 text-slate-400" />
                                        </button>
                                        {showMove && (
                                          <div className="absolute right-0 mt-2 bg-white border rounded shadow p-2 z-20">
                                            <select onChange={(e) => handleMove(e.target.value)} defaultValue="">
                                              <option value="" disabled>Escolha uma sala</option>
                                              {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            };
