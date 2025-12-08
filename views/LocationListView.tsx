import React from "react";
import { Header } from "../components/shared/Header";
import { UsersIcon, BookIcon, MicrophoneIcon, MoreDotsIcon, PlusIcon } from "../components/Icons";

interface LocationListViewProps {
    onBack: () => void;
}

import { PageContainer } from "../components/shared/PageContainer";

export const LocationListView: React.FC<LocationListViewProps> = ({ onBack }) => {
    const locations = [
        { name: "Recepção", desc: "Atendimento dos assistidos.", icon: <UsersIcon className="w-8 h-8 text-orange-400" />, type: "Recepção", color: "bg-orange-50 border-orange-100" },
        { name: "Sala de Aula", desc: "Acolhimento dos irmãos iniciantes.", icon: <BookIcon className="w-8 h-8 text-blue-400" />, type: "Aula", color: "bg-blue-50 border-blue-100" },
        { name: "Auditório", desc: "Palestra sobre o Evangelho Segundo o Espiritismo.", icon: <MicrophoneIcon className="w-8 h-8 text-purple-400" />, type: "Auditório", color: "bg-purple-50 border-purple-100" },
        { name: "Sala de Entrevista", desc: "Sala de entrevista para direcionamento.", icon: <UsersIcon className="w-8 h-8 text-green-400" />, type: "Entrevista", color: "bg-green-50 border-green-100" },
    ];

    return (
        <PageContainer>
            <Header title="Locais de Trabalho" />

            <div className="mt-6 space-y-4">
                {locations.map((loc, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-soft border border-card-border/60 flex items-center gap-4 relative overflow-hidden">
                        <div className={`w-14 h-14 rounded-2xl ${loc.color} overflow-hidden flex items-center justify-center text-3xl shadow-sm border`}>
                            {loc.icon}
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                            <h4 className="font-bold text-xl text-slate-800">{loc.name}</h4>
                            <p className="text-sm text-slate-500 leading-tight mt-1 truncate">{loc.desc}</p>
                        </div>
                        <div className="flex flex-col gap-2 z-10">
                            <button className="text-slate-300 hover:text-slate-500 p-1">
                                <MoreDotsIcon className="w-6 h-6 text-slate-300" />
                            </button>
                        </div>
                        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none"></div>
                    </div>
                ))}
            </div>

            <button className="absolute bottom-24 right-6 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#d4a45a] border border-[#f0e6d2] hover:scale-105 transition-transform z-40">
                <PlusIcon className="w-8 h-8 stroke-[3]" />
            </button>
        </PageContainer>
    );
};
