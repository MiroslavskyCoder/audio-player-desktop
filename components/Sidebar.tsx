
import React from 'react';
import { PlaylistView } from '../App';

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const ListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface NavLinkProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ children, isActive, onClick }) => (
    <li>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onClick?.(); }} 
          className={`flex items-center space-x-4 p-2 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
          }`}
        >
            {children}
        </a>
    </li>
);

interface SidebarProps {
    playlistView: PlaylistView;
    setPlaylistView: (view: PlaylistView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ playlistView, setPlaylistView }) => {
    return (
        <aside className="w-64 bg-black/50 p-6 flex-shrink-0 flex-col border-r border-neutral-800/80 z-20 hidden md:flex">
            <h1 className="text-2xl font-bold text-white mb-10">AI Audio Player</h1>
            <nav>
                <ul className="space-y-2">
                    <NavLink isActive={playlistView === 'liked'} onClick={() => setPlaylistView('liked')}>
                        <HeartIcon className="w-6 h-6" />
                        <span className="font-semibold">Liked Songs</span>
                    </NavLink>
                    <NavLink isActive={playlistView === 'all'} onClick={() => setPlaylistView('all')}>
                        <ListIcon className="w-6 h-6" />
                        <span className="font-semibold">All Tracks</span>
                    </NavLink>
                    <NavLink>
                        <ClockIcon className="w-6 h-6" />
                        <span className="font-semibold">Recents</span>
                    </NavLink>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
