import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    barsVisible: boolean;
    setBarsVisible: (visible: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [barsVisible, setBarsVisible] = useState(true);

    return (
        <LayoutContext.Provider value={{ barsVisible, setBarsVisible }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
