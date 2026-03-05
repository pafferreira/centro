import React, { useState, useRef, useEffect } from "react";
import { Worker, WorkerRole } from "../../types";
import { MoveIcon } from "../Icons";

interface WorkerCardProps {
  worker: Worker;
  roleLabel?: string;
  rooms?: { id: string; name: string }[];
  onMove?: (workerId: string, roomId: string) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, roleLabel, rooms, onMove }) => {
  const [showMove, setShowMove] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleMove = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setShowMove(false);
    if (onMove) onMove(worker.id, roomId);
  };

  const toggleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMove && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setShowMove(!showMove);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // allow some delay to process taps before closing
      setTimeout(() => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowMove(false);
        }
      }, 50);
    };

    if (showMove) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMove]);

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
              <div key={idx} title={r} className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold truncate max-w-full ${classes}`}>
                {r}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onMove && rooms && (
          <div className="relative" ref={dropdownRef}>
            <button
              ref={buttonRef}
              onClick={toggleMove}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-2 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              title="Mover para outra sala"
            >
              <MoveIcon className="w-5 h-5 text-slate-400 hover:text-blue-500 cursor-pointer" />
            </button>
            {showMove && (
              <div className={`absolute right-0 ${openUpwards ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-1 origin-top-right"} bg-white border border-slate-200 rounded-xl shadow-lg z-[100] min-w-[200px] max-h-[300px] overflow-y-auto`}>
                <div className="p-2">
                  <p className="text-xs font-semibold text-slate-500 px-2 py-1">Mover para:</p>
                  {rooms.map(r => (
                    <button
                      key={r.id}
                      onClick={(e) => handleMove(e, r.id)}
                      className="w-full text-left px-3 py-3 text-sm hover:bg-blue-50 rounded-lg transition-colors text-slate-700 hover:text-blue-600 active:bg-blue-100"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerCard;
