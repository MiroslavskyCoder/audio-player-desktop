import React from 'react';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h18v-3.75m-18 0V5.625c0-1.036.84-1.875 1.875-1.875h14.25c1.035 0 1.875.84 1.875 1.875v11.625" />
    </svg>
);


interface ContentAudioCardFilesProps {
  onLoadFiles: () => void;
}

const ContentAudioCardFiles: React.FC<ContentAudioCardFilesProps> = ({ onLoadFiles }) => {

  return (
    <div className="w-full max-w-2xl bg-black/20 border border-dashed border-neutral-700/80 rounded-2xl flex flex-col items-center justify-center text-center p-12 space-y-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
            <UploadIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Your playlist is empty</h2>
            <p className="text-neutral-400 max-w-md">
                Upload your favorite audio files to create a new playlist and start listening.
            </p>
        </div>
      <button
        onClick={onLoadFiles}
        className="px-6 py-3 text-md font-semibold bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-all duration-200 scale-100 hover:scale-105 shadow-lg shadow-cyan-500/30"
      >
        Upload Files
      </button>
    </div>
  );
};

export default ContentAudioCardFiles;