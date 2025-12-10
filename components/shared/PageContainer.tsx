import React, { useRef } from "react";
import { useScrollDirection } from "../../hooks/useScrollDirection";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    backgroundClassName?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = "", backgroundClassName = "bg-[#fdfbf7]" }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useScrollDirection(scrollRef);

    return (
        <div
            ref={scrollRef}
            className={`h-full overflow-y-auto pt-20 px-4 pb-[140px] transition-all duration-300 ${backgroundClassName} ${className}`}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}
        >
            {children}
        </div>
    );
};
