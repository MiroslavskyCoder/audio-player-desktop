
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  onMouseUp: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, onChange, onMouseUp }) => {
  return (
    <div className="w-full flex items-center space-x-2">
      <span className="text-xs text-neutral-400 w-10 text-left">{formatTime(value)}</span>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onMouseUp}
        className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer range-sm accent-cyan-500"
      />
      <span className="text-xs text-neutral-400 w-10 text-right">{formatTime(max)}</span>
    </div>
  );
};

export default ProgressBar;
