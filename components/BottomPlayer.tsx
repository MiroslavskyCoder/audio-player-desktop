import React from 'react';
import { Track } from '../types';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import AudioVisualizer from './AudioVisualizer';
import VolumeControl from './VolumeControl';
import EffectsRack from './EffectsRack';

type RepeatMode = 'none' | 'one' | 'all';

interface BottomPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPauseClick: (isPlaying: boolean) => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  trackProgress: number;
  duration: number;
  onScrub: (value: number) => void;
  onScrubEnd: () => void;
  repeatMode: RepeatMode;
  onRepeatToggle: () => void;
  vibe: string;
  isVibeLoading: boolean;
  analyserNode: AnalyserNode | null;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  effects: string[];
  activeEffect: string | null;
  onLoadVst: () => void;
  onToggleEffect: (effectName: string) => void;
}

const BottomPlayer: React.FC<BottomPlayerProps> = ({
  track,
  isPlaying,
  onPlayPauseClick,
  onPrevClick,
  onNextClick,
  trackProgress,
  duration,
  onScrub,
  onScrubEnd,
  repeatMode,
  onRepeatToggle,
  vibe,
  isVibeLoading,
  analyserNode,
  volume,
  onVolumeChange,
  onToggleMute,
  effects,
  activeEffect,
  onLoadVst,
  onToggleEffect,
}) => {
  return (
    <footer className="h-[110px] bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800/80 px-2 md:px-4 flex items-center justify-between text-white z-20 flex-shrink-0">
      {/* Left side: Track Info */}
      <div className="flex items-center space-x-3 w-1/3 md:w-1/4">
        <img src={track.coverArt} className="w-12 h-12 md:w-14 md:h-14 rounded-md" alt={track.title} />
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate text-sm md:text-base">{track.title}</p>
          <p className="text-sm text-neutral-400 truncate hidden sm:block">{track.artist}</p>
        </div>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex-grow flex flex-col items-center justify-center w-full md:max-w-2xl px-2 md:px-4 space-y-1">
        <Controls
            isPlaying={isPlaying}
            onPlayPauseClick={onPlayPauseClick}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            repeatMode={repeatMode}
            onRepeatToggle={onRepeatToggle}
        />
        <ProgressBar
            value={trackProgress}
            max={duration || 0}
            onChange={onScrub}
            onMouseUp={onScrubEnd}
        />
        <div className="h-8 w-full flex items-center justify-center text-center text-xs text-neutral-400 italic relative">
          {isVibeLoading ? (
            <div className="h-2 w-48 bg-neutral-700/50 rounded-full animate-pulse"></div>
          ) : (
            <>
              <AudioVisualizer analyserNode={analyserNode} isPlaying={isPlaying}/>
              <span className="text-glow text-cyan-500/80 truncate z-10 relative px-4">{vibe}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: Volume, etc. */}
      <div className="hidden md:flex items-center justify-end w-1/4 space-x-4">
        <EffectsRack
            effects={effects}
            activeEffect={activeEffect}
            onLoadVst={onLoadVst}
            onToggleEffect={onToggleEffect}
        />
        <VolumeControl
          volume={volume}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      </div>
    </footer>
  );
};

export default BottomPlayer;