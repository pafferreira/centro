import { useEffect, useRef, RefObject } from 'react';
import { useLayout } from '../context/LayoutContext';

export const useScrollDirection = (ref: RefObject<HTMLElement>) => {
    const { setBarsVisible } = useLayout();
    const lastScrollTop = useRef(0);
    const accumulatedScrollDown = useRef(0);

    useEffect(() => {
        // Always restore the header when a new page/container mounts
        setBarsVisible(true);
    }, [setBarsVisible]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        lastScrollTop.current = element.scrollTop;

        const handleScroll = () => {
            const scrollTop = element.scrollTop;
            const delta = scrollTop - lastScrollTop.current;

            if (delta > 0) {
                // Scrolling down
                accumulatedScrollDown.current += delta;
                if (accumulatedScrollDown.current > 40 && scrollTop > 50) {
                    setBarsVisible(false);
                    accumulatedScrollDown.current = 0;
                }
            } else if (delta < 0) {
                // Scrolling up
                accumulatedScrollDown.current = 0; // Reset
                if (delta < -3) { // minimum movement
                    setBarsVisible(true);
                }
            }

            lastScrollTop.current = scrollTop;
        };

        element.addEventListener('scroll', handleScroll);
        return () => element.removeEventListener('scroll', handleScroll);
    }, [ref, setBarsVisible]);
};
