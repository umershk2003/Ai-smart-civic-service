import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLES_CONFIG } from './RoleSwitcher';

interface UserProfileMenuProps {
  onLogout: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const activeRoleConfig = ROLES_CONFIG[user.role] || ROLES_CONFIG['citizen'];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User profile menu for ${user.name}, role ${activeRoleConfig.title}`}
        className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-xl transition-all cursor-pointer text-left shadow-sm group"
      >
        <div className={`w-8 h-8 rounded-lg ${activeRoleConfig.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="hidden sm:block text-left min-w-0">
          <div className="text-xs font-bold text-white truncate max-w-[130px] leading-tight group-hover:text-blue-300">
            {user.name}
          </div>
          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <span>{activeRoleConfig.title}</span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* User Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-3 backdrop-blur-xl">

          {/* User Details Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl ${activeRoleConfig.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Active Role:</span>
              <span className={`px-2 py-0.5 font-bold rounded-lg border uppercase tracking-wider ${activeRoleConfig.badgeColor || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                {activeRoleConfig.title}
              </span>
            </div>

            {user.department && (
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[150px]">
                  {user.department}
                </span>
              </div>
            )}
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              aria-label="Log Out of System"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out of System</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
