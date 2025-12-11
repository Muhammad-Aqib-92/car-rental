import React from 'react';
import { useApp } from '../AppContext';
import { Car, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useApp();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">DriveEasy</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">{user.role}</span>
              </div>
              <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <UserIcon className="h-5 w-5 text-slate-500" />
              </div>
              <button 
                onClick={logout}
                className="ml-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};