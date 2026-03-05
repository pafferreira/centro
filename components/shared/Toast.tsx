import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const icons = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
    ),
};

const styles = {
    success: 'bg-emerald-500 text-white shadow-emerald-200',
    error: 'bg-red-500 text-white shadow-red-200',
    info: 'bg-blue-500 text-white shadow-blue-200',
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Slide in
        requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss after 3s
        const dismissTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 350);
        }, 3000);

        return () => clearTimeout(dismissTimer);
    }, []);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg min-w-[200px] max-w-[340px] transition-all duration-350
        ${styles[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ transition: 'opacity 300ms, transform 300ms' }}
        >
            <span className="flex-shrink-0">{icons[toast.type]}</span>
            <span className="text-sm font-semibold leading-snug">{toast.message}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 350); }}
                className="ml-auto flex-shrink-0 opacity-70 hover:opacity-100"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 left-0 right-0 z-[999] flex flex-col items-center gap-2 pointer-events-none px-4"
            style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        >
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto w-full flex justify-center">
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
};
