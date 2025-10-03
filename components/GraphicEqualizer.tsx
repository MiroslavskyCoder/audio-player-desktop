import React from 'react';

interface GraphicEqualizerProps {
  bands: number[];
  presets: { [key: string]: number[] };
  activePreset: string;
  onBandChange: (bandIndex: number, value: number) => void;
  onPresetSelect: (presetName: string) => void;
}

const FREQUENCY_LABELS = ['60', '310', '1k', '3k', '6k', '12k'];

const GraphicEqualizer: React.FC<GraphicEqualizerProps> = ({ bands, presets, activePreset, onBandChange, onPresetSelect }) => {
    return (
        <div className="absolute bottom-full right-0 mb-3 w-80 bg-neutral-800/95 backdrop-blur-lg border border-neutral-700 rounded-lg shadow-2xl p-4 z-30">
            <h4 className="font-bold text-white mb-3 text-center">Graphic Equalizer</h4>
            
            {/* Sliders */}
            <div className="flex justify-around items-end h-40 mb-4 px-2">
                {bands.map((gain, index) => (
                    <div key={index} className="flex flex-col items-center w-1/6">
                        <span className="text-xs text-cyan-400/80 mb-1">{`${gain.toFixed(0)}`}</span>
                        <input
                            type="range"
                            min="-12"
                            max="12"
                            step="1"
                            value={gain}
                            onChange={(e) => onBandChange(index, Number(e.target.value))}
                            className="w-full h-24 appearance-none cursor-pointer range-sm accent-cyan-500"
                            // FIX: Replaced non-standard 'bt-lr' with 'vertical-lr' to fix type error, and added transform to keep bottom-to-top orientation.
                            style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                            aria-label={`Frequency band ${FREQUENCY_LABELS[index]} Hz`}
                        />
                        <span className="text-xs text-neutral-400 mt-2">{FREQUENCY_LABELS[index]}</span>
                    </div>
                ))}
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
                {Object.keys(presets).map(presetName => (
                    <button
                        key={presetName}
                        onClick={() => onPresetSelect(presetName)}
                        className={`p-2 rounded-md text-sm transition-all duration-200 ${
                            activePreset === presetName
                            ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner shadow-cyan-500/10'
                            : 'bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300'
                        }`}
                    >
                         <span className={activePreset === presetName ? 'text-glow' : ''}>{presetName}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GraphicEqualizer;
