import { useState, useEffect, RefObject } from 'react';
import { useLayout } from '../context/LayoutContext';

export const useScrollDirection = (ref: RefObject<HTMLElement>) => {
    const { setBarsVisible } = useLayout();
    const [lastScrollTop, setLastScrollTop] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const scrollTop = element.scrollTop;

            // Threshold to avoid jitter
            if (Math.abs(scrollTop - lastScrollTop) < 10) return;

            if (scrollTop > lastScrollTop && scrollTop > 50) {
                // Scrolling Down
                setBarsVisible(false);
            } else {
                // Scrolling Up
                setBarsVisible(true);
            }
            setLastScrollTop(scrollTop);
        };

        element.addEventListener('scroll', handleScroll);
        return () => element.removeEventListener('scroll', handleScroll);
    }, [ref, lastScrollTop, setBarsVisible]);
};
