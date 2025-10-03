import React from 'react';

type RepeatMode = 'none' | 'one' | 'all';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPauseClick: (isPlaying: boolean) => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  repeatMode: RepeatMode;
  onRepeatToggle: () => void;
}

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const PrevIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const NextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const RepeatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"></polyline>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
      <polyline points="7 23 3 19 7 15"></polyline>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);

const RepeatOneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2l4 4-4 4"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="M7 22l-4-4 4-4"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        <path d="M11 10h1v4"/>
    </svg>
);


const Controls: React.FC<ControlsProps> = ({ isPlaying, onPlayPauseClick, onPrevClick, onNextClick, repeatMode, onRepeatToggle }) => {
  return (
    <div className="flex w-full items-center justify-center space-x-2 md:space-x-4">
      <div className="w-6 h-6 flex-shrink-0 md:w-10"></div>
      <button onClick={onPrevClick} className="text-neutral-400 hover:text-white transition-colors duration-200">
        <PrevIcon className="w-6 h-6" />
      </button>

      <button
        onClick={() => onPlayPauseClick(!isPlaying)}
        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all duration-200 scale-100 hover:scale-105 shadow-lg shadow-cyan-500/30"
      >
        {isPlaying ? <PauseIcon className="w-6 h-6 md:w-7 md:h-7" /> : <PlayIcon className="w-6 h-6 md:w-7 md:h-7 ml-1" />}
      </button>

      <button onClick={onNextClick} className="text-neutral-400 hover:text-white transition-colors duration-200">
        <NextIcon className="w-6 h-6" />
      </button>

      <button onClick={onRepeatToggle} className="text-neutral-400 hover:text-white transition-colors duration-200 w-6 h-6 flex-shrink-0 md:w-10 flex items-center justify-center">
        {repeatMode === 'one' ? (
          <RepeatOneIcon className="w-5 h-5 text-cyan-400" strokeWidth="2.5"/>
        ) : (
          <RepeatIcon className={`w-5 h-5 ${repeatMode === 'all' ? 'text-cyan-400' : 'text-neutral-500'}`} />
        )}
      </button>
    </div>
  );
};

export default Controls;