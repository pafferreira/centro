import React from "react";
import { Worker, WorkerRole } from "../../types";
import { DragIndicatorIcon } from "../Icons";

interface WorkerCardProps {
    worker: Worker;
    roleLabel?: string;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, roleLabel }) => {
    const roleStyles = {
        [WorkerRole.Coordenador]: "bg-blue-200 text-blue-800",
        [WorkerRole.Medium]: "bg-purple-200 text-purple-800",
        [WorkerRole.Dialogo]: "bg-green-200 text-green-800",
        [WorkerRole.Psicografa]: "bg-indigo-200 text-indigo-800",
        [WorkerRole.Sustentacao]: "bg-[#e0dcd5] text-[#5c554a]",
    }[worker.roles[0]] || "bg-gray-100 text-gray-700";

    const avatarUrl = worker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    return (
        <div className="flex items-center p-2.5 bg-[#fdfbf7] rounded-xl border border-[#e8e4db] shadow-sm mb-2 relative group">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                <img
                    src={avatarUrl}
                    alt={worker.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <p className="font-semibold text-text-main text-sm truncate">{worker.name}</p>
                <div className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${roleStyles}`}>
                    {roleLabel || worker.roles[0]}
                </div>
            </div>
            <button className="text-[#d0cdc5] hover:text-[#999]">
                <DragIndicatorIcon className="w-5 h-5" />
            </button>
        </div>
    );
};
