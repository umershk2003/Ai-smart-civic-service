import React, { useState } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  History, 
  Search, 
  Cpu, 
  Lock, 
  Terminal, 
  Settings, 
  FileText,
  UserCheck,
  Building,
  AlertOctagon,
  RefreshCw,
  Info,
  Grid3X3
} from 'lucide-react';
import { AuditEntry, ExtendedUserRole, UserAccount } from '../types';
import { ROLES_CONFIG } from './RoleSwitcher';
import { PermissionMatrix } from './ui/PermissionMatrix';

interface RoleManagementProps {
  users: UserAccount[];
  auditLogs: AuditEntry[];
  onUpdateUserRole: (userId: string, newRole: ExtendedUserRole) => void;
  onAddAuditLog: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  users,
  auditLogs,
  onUpdateUserRole,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'roles' | 'users' | 'audit' | 'ai_config'>('matrix');
  const [auditSearch, setAuditSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // AI Config state
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState<number>(80);
  const [autoRouteEnabled, setAutoRouteEnabled] = useState<boolean>(true);
  const [strictRbacEnforced, setStrictRbacEnforced] = useState<boolean>(true);

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = auditSearch.toLowerCase();
    return (
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.ticketId && log.ticketId.toLowerCase().includes(q)) ||
      (log.reason && log.reason.toLowerCase().includes(q))
    );
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sub Header & Section Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Super Admin Portal</span>
            <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold px-2.5 py-0.5 rounded-full">
              Super Admin
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide access matrix control, RBAC enforcement rules, user identity management, and immutable audit logging.
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div role="tablist" aria-label="RBAC Section Tabs" className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'matrix'}
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Permission Matrix</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'roles'}
            onClick={() => setActiveTab('roles')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'roles'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Role Matrix</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts ({users.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ai_config'}
            onClick={() => setActiveTab('ai_config')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_config'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Rules</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Permission Matrix (✓/✕ grid) */}
      {activeTab === 'matrix' && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Grid3X3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-white text-base">Role Permission Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Generated from <span className="font-mono text-slate-300">ROLES_CONFIG</span> — the single source of truth.
                Rows are permission groups; columns are the five platform roles. "Manage roles" and "System configuration"
                are reserved for Super Admin only.
              </p>
            </div>
          </div>
          <PermissionMatrix />
        </div>
      )}

      {/* Tab 1: Role Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(ROLES_CONFIG) as ExtendedUserRole[]).map((roleKey) => {
              const cfg = ROLES_CONFIG[roleKey];
              const roleUserCount = users.filter((u) => u.role === roleKey).length;

              return (
                <div
                  key={roleKey}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl ${cfg.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{cfg.title}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{cfg.badge}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700">
                      {roleUserCount} Users
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cfg.description}
                  </p>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Enforced Capabilities ({cfg.permissions.length}):
                    </span>
                    <div className="space-y-1.5">
                      {cfg.permissions.map((perm) => (
                        <div key={perm} className="flex items-center space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                            {perm}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name, email, department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Total Managed Accounts: <strong className="text-white">{filteredUsers.length}</strong>
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Assigned Department</th>
                    <th className="px-6 py-4">Active RBAC Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Quick Role Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => {
                    const cfg = ROLES_CONFIG[u.role];

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full ${cfg?.avatarColor || 'bg-slate-700'} flex items-center justify-center text-white text-xs font-bold`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{u.name}</div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {u.department || 'City Wide / General'}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                            u.role === 'super_admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            u.role === 'municipal_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                            u.role === 'supervisor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            u.role === 'field_officer' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            <span>{cfg?.title || u.role}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Active</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => {
                              const newRole = e.target.value as ExtendedUserRole;
                              onUpdateUserRole(u.id, newRole);
                              onAddAuditLog({
                                user: 'Super Admin Hamza Sheikh',
                                role: 'super_admin',
                                action: 'User Role Changed',
                                oldValue: u.role,
                                newValue: newRole,
                                reason: `User ${u.name} re-assigned to ${newRole} by Super Admin.`,
                                ipInfo: '10.0.0.1 (System Console)'
                              });
                            }}
                            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                          >
                            <option value="citizen">Citizen</option>
                            <option value="field_officer">Field Officer</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="municipal_admin">Municipal Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by user, ticket ID, action..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>Immutable Ledger • Tamper-Evident</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Actor & Role</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Ticket Reference</th>
                    <th className="px-6 py-4">Delta / Transition</th>
                    <th className="px-6 py-4">Audit Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 font-medium text-white">
                        <div className="font-bold text-white text-xs">{log.user}</div>
                        <span className="text-[10px] text-rose-400 uppercase font-mono">{log.role}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg text-[10px] font-mono font-bold border border-slate-700">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-blue-400">
                        {log.ticketId || 'System Level'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          {log.oldValue && (
                            <div className="text-red-400 line-through">Old: {log.oldValue}</div>
                          )}
                          {log.newValue && (
                            <div className="text-emerald-400 font-semibold">New: {log.newValue}</div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400 italic max-w-xs leading-relaxed">
                        {log.reason || 'Standard operational transition logged'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Engine & System Configuration */}
      {activeTab === 'ai_config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Gemini AI Auto-Classification Rules</h3>
                <p className="text-xs text-slate-400">Set confidence bounds for human review routing</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Minimum Auto-Dispatch Confidence Score</span>
                  <span className="text-rose-400 font-mono">{aiConfidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={aiConfidenceThreshold}
                  onChange={(e) => setAiConfidenceThreshold(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Complaints analyzed by Gemini with confidence below <strong>{aiConfidenceThreshold}%</strong> will be flagged as <span className="text-amber-400 font-mono">Needs Human Review</span> and queued for Supervisors.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <div>
                  <div className="text-xs font-bold text-white">Auto-Route High Confidence Tickets</div>
                  <div className="text-[11px] text-slate-400">Directly assign department based on AI taxonomy score</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRouteEnabled}
                  onChange={(e) => setAutoRouteEnabled(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <div>
                  <div className="text-xs font-bold text-white">Strict RBAC Authorization Filter</div>
                  <div className="text-[11px] text-slate-400">Filter AI Copilot context by role before passing data to model</div>
                </div>
                <input
                  type="checkbox"
                  checked={strictRbacEnforced}
                  onChange={(e) => setStrictRbacEnforced(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Security & SLA Override Enforcement</h3>
                <p className="text-xs text-slate-400">Hard constraints for ticket state transitions</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Audit Trail Requirement</span>
                  <p className="text-slate-400 leading-relaxed">
                    All category overrides, priority escalations, officer re-assignments, and SLA adjustments create an irreversible entry in the security audit ledger.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2 border-t border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Role Separation Matrix Active</span>
                  <p className="text-slate-400 leading-relaxed">
                    Field officers are restricted to assigned work orders; Supervisors manage department workloads; Municipal & Super Admins oversee city-wide infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
