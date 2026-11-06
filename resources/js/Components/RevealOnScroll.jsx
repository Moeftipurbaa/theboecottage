import { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({
    as: Element = 'div',
    children,
    className = '',
    direction = 'up',
    delay = 0,
    style = {},
}) {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return undefined;

        if (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
            || !('IntersectionObserver' in window)
        ) {
            setIsVisible(true);
            return undefined;
        }

        let observer;
        const reveal = () => {
            setIsVisible(true);
            observer?.disconnect();
            window.removeEventListener('scroll', checkVisibility);
            window.removeEventListener('resize', checkVisibility);
        };
        const checkVisibility = () => {
            const { top, bottom } = element.getBoundingClientRect();
            if (top < window.innerHeight * 1.05 && bottom > 0) {
                reveal();
            }
        };

        observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                reveal();
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

        observer.observe(element);
        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility);
        window.requestAnimationFrame(checkVisibility);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', checkVisibility);
            window.removeEventListener('resize', checkVisibility);
        };
    }, []);

    return (
        <Element
            ref={elementRef}
            className={`reveal-on-scroll reveal-${direction}${isVisible ? ' is-visible' : ''} ${className}`}
            style={{ ...style, '--reveal-delay': `${delay}ms` }}
        >
            {children}
        </Element>
    );
}
