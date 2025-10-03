import React, { useState, useRef, useEffect } from 'react';

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const EffectsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.62-3.385m-1.62 3.385a15.998 15.998 0 01-3.388-1.62m7.729 2.573a3.375 3.375 0 012.245 2.4 3 3 0 001.128 5.78 4.5 4.5 0 00-2.245-8.4c-.399 0-.78.078-1.128.22z" />
    </svg>
);


interface EffectsRackProps {
  effects: string[];
  activeEffect: string | null;
  onLoadVst: () => void;
  onToggleEffect: (effectName: string) => void;
}

const EffectsRack: React.FC<EffectsRackProps> = ({ effects, activeEffect, onLoadVst, onToggleEffect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasEffects = effects.length > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`text-neutral-400 hover:text-white transition-colors p-2 rounded-full ${isOpen ? 'bg-neutral-700/80' : ''}`}
                aria-label="Toggle effects panel"
            >
                <EffectsIcon className="w-6 h-6" />
            </button>
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-64 bg-neutral-800/95 backdrop-blur-lg border border-neutral-700 rounded-lg shadow-2xl p-4 z-30">
                    <h4 className="font-bold text-white mb-3 text-center">Effects Rack</h4>
                    <div className="space-y-2">
                        {hasEffects ? (
                            effects.map(effect => (
                                <button
                                    key={effect}
                                    onClick={() => onToggleEffect(effect)}
                                    className={`w-full text-left p-2 rounded-md text-sm transition-all duration-200 ${
                                        activeEffect === effect 
                                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner shadow-cyan-500/10'
                                        : 'bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300'
                                    }`}
                                >
                                    <span className={activeEffect === effect ? 'text-glow' : ''}>{effect}</span>
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-neutral-400 text-center py-2">No effects loaded.</p>
                        )}
                    </div>
                    <button
                        onClick={onLoadVst}
                        className="w-full mt-4 flex items-center justify-center space-x-2 p-2 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">Load VST Effect</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default EffectsRack;