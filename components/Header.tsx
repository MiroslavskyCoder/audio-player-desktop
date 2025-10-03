import React, { useState, useRef, useEffect } from 'react';
// FIX: Import User type from the local firebase service to ensure consistency with the v8 API.
import type { User } from '../services/firebase';

interface HeaderProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.226,44,30.338,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-end p-4 h-20 flex-shrink-0">
            <div>
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0D8ABC&color=fff`}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full"
                            />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-20">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onLogout();
                                        setDropdownOpen(false);
                                    }}
                                    className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                                >
                                    Logout
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onLogin}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span>Login with Google</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
