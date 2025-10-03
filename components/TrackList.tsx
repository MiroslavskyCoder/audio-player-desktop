import React from 'react';
import { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
  onLoadFiles: () => void;
  likedTracks: Set<number>;
  onToggleLike: (trackId: number) => void;
}

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }> = ({ filled, ...props }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const TrackList: React.FC<TrackListProps> = ({ tracks, currentTrackIndex, onTrackSelect, onLoadFiles, likedTracks, onToggleLike }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Playlist</h2>
        <button
          onClick={onLoadFiles}
          className="px-4 py-2 text-sm font-semibold bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors"
        >
          Load Local Files
        </button>
      </div>
      <div>
        {tracks.length > 0 ? (
          <ul>
            {tracks.map((track, index) => {
              const isActive = index === currentTrackIndex;
              const isLiked = likedTracks.has(track.id);
              return (
                <li
                  key={track.id}
                  onClick={() => onTrackSelect(index)}
                  className={`group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[24px_auto_1fr_auto] items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10'
                      : 'hover:bg-neutral-800/60'
                  }`}
                >
                  <div className={`hidden sm:block text-center transition-colors ${isActive ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-white'}`}>{index + 1}</div>
                  <div>
                      <img src={track.coverArt} alt={track.title} className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className={`font-semibold truncate transition-colors ${isActive ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-neutral-400 truncate transition-colors group-hover:text-neutral-300">{track.artist}</p>
                  </div>
                  <div className="pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="group"
                      aria-label={isLiked ? "Unlike song" : "Like song"}
                    >
                      <HeartIcon
                        filled={isLiked}
                        className={`w-6 h-6 transition-colors duration-200 ${
                          isLiked
                            ? 'text-cyan-400'
                            : 'text-neutral-500 group-hover:text-white'
                        }`}
                      />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-10 text-neutral-400">
            You haven't liked any songs yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackList;