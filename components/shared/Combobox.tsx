import React, { useState, useRef, useEffect } from 'react';

interface ComboboxOption {
    id: string;
    value: string;
}

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder,
    required = false,
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<ComboboxOption[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value.trim() === '') {
            setFilteredOptions(options.slice(0, 10)); // Show first 10 when empty
        } else {
            const lowValue = value.toLowerCase();
            const filtered = options.filter(opt =>
                opt.value.toLowerCase().includes(lowValue)
            ).slice(0, 15); // Limit suggestions
            setFilteredOptions(filtered);
        }
    }, [value, options]);

    const handleFocus = () => {
        if (!disabled) setIsOpen(true);
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <input
                type="text"
                required={required}
                disabled={disabled}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={handleFocus}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/30 font-bold transition-all"
            />

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <ul className="py-1">
                        {filteredOptions.map((option) => (
                            <li
                                key={option.id}
                                onClick={() => handleSelect(option.value)}
                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-800 font-semibold border-b border-slate-50 last:border-0 active:bg-blue-50"
                            >
                                {option.value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
