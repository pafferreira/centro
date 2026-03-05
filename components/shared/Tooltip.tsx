import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const show = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const gap = 8;

        let top = 0, left = 0;
        if (position === 'top') {
            top = rect.top - gap;
            left = rect.left + rect.width / 2;
        } else if (position === 'bottom') {
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2;
        } else if (position === 'left') {
            top = rect.top + rect.height / 2;
            left = rect.left - gap;
        } else {
            top = rect.top + rect.height / 2;
            left = rect.right + gap;
        }
        setCoords({ top, left });
        setVisible(true);
    };

    const hide = () => setVisible(false);

    // Close on scroll/resize
    useEffect(() => {
        if (visible) {
            window.addEventListener('scroll', hide, true);
            window.addEventListener('resize', hide);
            return () => {
                window.removeEventListener('scroll', hide, true);
                window.removeEventListener('resize', hide);
            };
        }
    }, [visible]);

    const positionStyle = (): React.CSSProperties => {
        if (position === 'top') return {
            top: coords.top,
            left: coords.left,
            transform: 'translate(-50%, -100%)',
        };
        if (position === 'bottom') return {
            top: coords.top,
            left: coords.left,
            transform: 'translate(-50%, 0)',
        };
        if (position === 'left') return {
            top: coords.top,
            left: coords.left,
            transform: 'translate(-100%, -50%)',
        };
        return {
            top: coords.top,
            left: coords.left,
            transform: 'translate(0, -50%)',
        };
    };

    return (
        <>
            <span
                ref={triggerRef}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                className="inline-flex cursor-help"
            >
                {children}
            </span>

            {visible && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    className="fixed z-[1000] px-3 py-2 text-xs font-medium text-slate-700 leading-snug
                     bg-white/70 backdrop-blur-xl border border-white/80 
                     rounded-2xl shadow-lg shadow-slate-200/60
                     max-w-[220px] pointer-events-none"
                    style={positionStyle()}
                >
                    {text}
                    {/* Arrow */}
                    {position === 'top' && (
                        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(255,255,255,0.7)' }} />
                    )}
                    {position === 'bottom' && (
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0"
                            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid rgba(255,255,255,0.7)' }} />
                    )}
                </div>
            )}
        </>
    );
};

/** Small info icon to use alongside a label */
export const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className ?? 'w-4 h-4'}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
);
