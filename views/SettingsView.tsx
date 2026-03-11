import React, { useState, useEffect } from "react";
import { Header } from "../components/shared/Header";
import { PageContainer } from "../components/shared/PageContainer";
import { Accordion } from "../components/shared/Accordion";
import { DragIndicatorIcon } from "../components/Icons";
import { getAppRules, saveAppRules, getLastModified, getStorageSize } from "../utils/storage";
import { AppRule } from "../types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SettingsViewProps {
    onDataImported: (workers: any[], rooms: any[]) => void;
    totalAssistidos: number;
    totalFichas: number;
    totalAtendimentos: number;
    onBack?: () => void;
    onHome?: () => void;
}

function SortableRuleItem({ rule, index, onToggle }: { key?: string | number; rule: AppRule; index: number; onToggle: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-2 px-2 py-2 rounded-xl border-2 transition-colors ${isDragging ? 'bg-white opacity-90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-blue-200 z-50' : 'hover:bg-slate-50 border-transparent bg-white'}`}>
            <span className="text-sm font-black text-slate-600 select-none w-5 text-center flex-shrink-0">{index + 1}</span>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 rounded flex-shrink-0" title="Segure e arraste para reordenar">
                <DragIndicatorIcon className="w-5 h-5 focus:outline-none" />
            </div>
            <input
                type="checkbox"
                checked={rule.isActive}
                onChange={() => onToggle(rule.id)}
                disabled={!rule.configurable}
                className="flex-shrink-0 w-5 h-5 rounded border-2 border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-700 block truncate">{rule.label}</span>
                <span className="text-sm text-slate-500 leading-snug">{rule.description}</span>
            </div>
        </div>
    );
}

function StaticRuleItem({ rule, onToggle }: { key?: string | number; rule: AppRule; onToggle: (id: string) => void }) {
    return (
        <label className={`flex items-start gap-3 p-2.5 rounded-xl border-2 transition-colors cursor-pointer ${rule.isRestriction ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'hover:bg-slate-50 border-transparent bg-white'}`}>
            <input
                type="checkbox"
                checked={rule.isActive}
                onChange={() => onToggle(rule.id)}
                disabled={!rule.configurable}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 border-slate-300 cursor-pointer ${rule.isRestriction ? 'text-red-500 focus:ring-red-500' : 'text-blue-500 focus:ring-blue-500'}`}
            />
            <div>
                <span className="font-semibold text-slate-800 block">{rule.label}</span>
                <span className="text-xs text-slate-500">{rule.description}</span>
            </div>
        </label>
    );
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onHome, totalAssistidos, totalFichas, totalAtendimentos }) => {
    const lastModified = getLastModified();
    const [storageSize, setStorageSize] = useState<string>('Calculando...');
    const [rules, setRules] = useState<AppRule[]>([]);

    useEffect(() => {
        getStorageSize().then(size => setStorageSize(size));
        setRules(getAppRules());
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleToggleRule = (id: string) => {
        const newRules = rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
        setRules(newRules);
        saveAppRules(newRules);
    };

    const handleDragEnd = (event: DragEndEvent, type: 'ROOM_ASSEMBLY' | 'PASSE_DISTRIBUTION') => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setRules((currentRules) => {
                // Obter apenas as regras do tipo específico e que são ordenáveis
                const typeRules = currentRules.filter(r => r.type === type && !r.isRestriction).sort((a, b) => a.order - b.order);
                const oldIndex = typeRules.findIndex(i => i.id === active.id);
                const newIndex = typeRules.findIndex(i => i.id === over.id);

                const newTypeRulesArray = arrayMove(typeRules, oldIndex, newIndex) as AppRule[];

                // Recalcular ordens apenas para estas
                const orderedTypeRules = newTypeRulesArray.map((r, index) => ({ ...r, order: index }));

                // Mesclar com o resto
                const finalRules = currentRules.map(r => {
                    const updated = orderedTypeRules.find(tr => tr.id === r.id);
                    return updated ? updated : r;
                });

                saveAppRules(finalRules);
                return finalRules;
            });
        }
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return 'Nunca';
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const roomAssemblySortableRules = rules.filter(r => r.type === 'ROOM_ASSEMBLY' && !r.isRestriction).sort((a, b) => a.order - b.order);
    const roomAssemblyRestrictionRules = rules.filter(r => r.type === 'ROOM_ASSEMBLY' && r.isRestriction);

    const passeDistributionSortableRules = rules.filter(r => r.type === 'PASSE_DISTRIBUTION' && !r.isRestriction).sort((a, b) => a.order - b.order);
    const passeDistributionRestrictionRules = rules.filter(r => r.type === 'PASSE_DISTRIBUTION' && r.isRestriction);

    return (
        <PageContainer>
            <Header title="Configurações" onBack={onBack} onHome={onHome} />

            <div className="mt-6 space-y-4">
                {/* Info Card */}
                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
                    <h3 className="font-bold text-lg text-slate-800 mb-2">📊 Informações</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p><strong>Última modificação:</strong> {formatDate(lastModified)}</p>
                        <p><strong>Dados no banco:</strong> {storageSize}</p>
                        <p><strong>Total de Assistidos:</strong> {totalAssistidos}</p>
                        <p><strong>Total de Fichas:</strong> {totalFichas} e <strong>Total de Atendimentos:</strong> {totalAtendimentos} </p>
                    </div>
                </div>

                {/* Montagem de Salas Rules */}
                <Accordion title={<span className="flex items-center gap-2"><span>🧩</span> Regras de Montagem das Salas</span>} defaultOpen>
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 mb-2 block">Ordem de Prioridade</span>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'ROOM_ASSEMBLY')}>
                            <SortableContext items={roomAssemblySortableRules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                {roomAssemblySortableRules.map((r, i) => (
                                    <SortableRuleItem key={r.id} rule={r} index={i} onToggle={handleToggleRule} />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {roomAssemblyRestrictionRules.length > 0 && (
                            <div className="mt-6 space-y-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Restrições (Não ordenáveis)</span>
                                {roomAssemblyRestrictionRules.map(r => (
                                    <StaticRuleItem key={r.id} rule={r} onToggle={handleToggleRule} />
                                ))}
                            </div>
                        )}
                    </div>
                </Accordion>

                {/* Painel de Distribuição */}
                <Accordion title={<span className="flex items-center gap-2"><span>📋</span> Regras de Distribuição</span>} defaultOpen>
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 mb-2 block">Ordem de Prioridade</span>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'PASSE_DISTRIBUTION')}>
                            <SortableContext items={passeDistributionSortableRules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                {passeDistributionSortableRules.map((r, i) => (
                                    <SortableRuleItem key={r.id} rule={r} index={i} onToggle={handleToggleRule} />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {passeDistributionRestrictionRules.length > 0 && (
                            <div className="mt-6 space-y-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Restrições (Não ordenáveis)</span>
                                {passeDistributionRestrictionRules.map(r => (
                                    <StaticRuleItem key={r.id} rule={r} onToggle={handleToggleRule} />
                                ))}
                            </div>
                        )}
                    </div>
                </Accordion>
            </div>
        </PageContainer>
    );
};
