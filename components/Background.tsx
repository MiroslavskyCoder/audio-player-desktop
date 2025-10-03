
import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-black bg-grid-white/[0.05] opacity-50"></div>
      
      {/* Neon Glows */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/20 dark:bg-cyan-500/30 rounded-full filter blur-[150px] animate-pulse-slow -z-10"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 dark:bg-purple-600/30 rounded-full filter blur-[150px] animate-pulse-slow animation-delay-4000 -z-10"></div>
    </div>
  );
};

export default Background;
