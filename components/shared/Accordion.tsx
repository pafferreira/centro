import React, { useState } from 'react';
import { ChevronDownIconInline, ChevronUpIconInline } from '../Icons';

interface AccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false, isOpen: controlledIsOpen, onToggle }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const handleToggle = () => {
        if (controlledIsOpen === undefined) {
            setInternalIsOpen(!isOpen);
        }
        if (onToggle) {
            onToggle(!isOpen);
        }
    };

    return (
        <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden mb-4">
            <button
                type="button"
                onClick={handleToggle}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
            >
                <div className="flex-1 font-bold text-lg text-slate-800">
                    {title}
                </div>
                <div className="text-slate-400 ml-4 flex-shrink-0">
                    {isOpen ? (
                        <ChevronUpIconInline className="w-5 h-5" />
                    ) : (
                        <ChevronDownIconInline className="w-5 h-5" />
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="p-4 border-t-2 border-slate-100 bg-slate-50/50">
                    {children}
                </div>
            )}
        </div>
    );
};
