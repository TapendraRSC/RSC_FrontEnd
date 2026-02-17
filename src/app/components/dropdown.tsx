'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const Dropdown = (props: any, forwardedRef: any) => {
    const [visibility, setVisibility] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDocumentClick = (event: any) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setVisibility(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []);

    useImperativeHandle(forwardedRef, () => ({
        close() {
            setVisibility(false);
        },
    }));

    const placementClasses: Record<string, string> = {
        'bottom-end': 'top-full right-0 mt-1',
        'bottom-start': 'top-full left-0 mt-1',
        'top-end': 'bottom-full right-0 mb-1',
        'top-start': 'bottom-full left-0 mb-1',
        'left': 'right-full top-0 mr-1',
        'right': 'left-full top-0 ml-1',
    };

    const placement = props.placement || 'bottom-end';
    const positionClass = placementClasses[placement] || placementClasses['bottom-end'];

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <button type="button" className={props.btnClassName} onClick={() => setVisibility(!visibility)}>
                {props.button}
            </button>

            {visibility && (
                <div
                    className={`absolute z-50 ${positionClass}`}
                    onClick={() => setVisibility(!visibility)}
                >
                    {props.children}
                </div>
            )}
        </div>
    );
};

export default forwardRef(Dropdown);