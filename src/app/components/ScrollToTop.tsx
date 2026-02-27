'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`
        fixed bottom-6 right-6 z-50
        p-3 rounded-full
        bg-[#b27d29] text-white
        shadow-lg hover:shadow-2xl
        transition-all duration-500 ease-out
        hover:scale-110 hover:-translate-y-1
        active:scale-95
        ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6 pointer-events-none'
                }
      `}
            aria-label="Scroll to top"
        >
            <ChevronUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
    );
}