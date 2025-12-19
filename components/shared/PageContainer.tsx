import React, { useRef } from "react";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { MainBackground } from "./MainBackground";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    backgroundClassName?: string;
    withMainBackground?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className = "",
    backgroundClassName = "bg-transparent",
    withMainBackground = true
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useScrollDirection(scrollRef);

    return (
        <div className="relative h-full">
            {withMainBackground && (
                <>
                    <MainBackground />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 via-white/15 to-white/5 z-[1]" />
                </>
            )}
            <div
                ref={scrollRef}
                className={`relative z-10 h-full overflow-y-auto pt-20 px-4 pb-[140px] transition-all duration-300 ${backgroundClassName} ${className}`}
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}
            >
                {children}
            </div>
        </div>
    );
};
