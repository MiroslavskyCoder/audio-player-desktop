
import React from 'react';

interface AlbumArtProps {
  coverArt: string;
}

const AlbumArt: React.FC<AlbumArtProps> = ({ coverArt }) => {
  return (
    <div className="w-48 h-48 md:w-64 md:h-64 mb-6 shadow-2xl shadow-cyan-500/10 rounded-lg overflow-hidden transition-all duration-500">
      <img
        src={coverArt}
        alt="Album Art"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AlbumArt;
