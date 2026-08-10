import React from 'react';
import { Building2, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface FooterProps {
  user?: {
    name: string;
    role: UserRole;
    email: string;
  } | null;
  categoriesCount?: number;
  totalComplaintsCount?: number;
  onLogout?: () => void;
  isLanding?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  user,
  categoriesCount = 12,
  totalComplaintsCount = 24,
  onLogout,
  isLanding = false,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400 mt-auto transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Platform Info */}
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                AI Smart Civic Services
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
              Intelligent municipal operations, citizen grievance routing, and field officer management platform.
            </p>
          </div>

          {/* User Session & Quick Actions (or Simple Footer for Landing) */}
          <div className="flex flex-col items-center md:items-end justify-center space-y-2 text-center md:text-right">
            {!isLanding && user ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-end space-x-2 text-[11px]">
                  <span className="text-slate-400">Signed in:</span>
                  <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    {user.name}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px]">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-end gap-2.5 pt-1">
                  {onLogout && (
                    <button
                      type="button"
                      aria-label="Sign Out"
                      onClick={onLogout}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                Connected Municipal Infrastructure Platform
              </div>
            )}
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © {currentYear} <strong className="text-slate-300">AI Smart Civic Services</strong>. All municipal data encrypted & logged.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 transition-colors cursor-default">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors cursor-default">SLA Terms</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors cursor-default">Emergency Operations</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
