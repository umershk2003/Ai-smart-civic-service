import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, LayoutDashboard } from 'lucide-react';
import { ExtendedUserRole } from '../types';

interface AccessDeniedProps {
  userRole?: ExtendedUserRole;
  attemptedTab?: string;
  onGoToDashboard: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  userRole = 'citizen',
  attemptedTab = 'restricted area',
  onGoToDashboard
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Accent Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono uppercase font-bold rounded-full">
            <Lock className="w-3 h-3" />
            <span>403 Restricted Access</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Access Denied
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You don't have permission to access the <strong className="text-slate-200 capitalize">{attemptedTab}</strong> view as a <strong className="text-blue-400 capitalize">{userRole.replace('_', ' ')}</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
          <span className="font-bold text-slate-300 block uppercase text-[10px] tracking-wider">
            Role Authorization Scope:
          </span>
          <p>
            Your account role (<span className="text-purple-400 font-bold">{userRole}</span>) is restricted to your designated operational dashboard.
          </p>
        </div>

        <button
          onClick={onGoToDashboard}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Go to My Dashboard</span>
        </button>
      </div>
    </div>
  );
};
