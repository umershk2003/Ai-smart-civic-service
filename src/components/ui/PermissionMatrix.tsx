import React from 'react';
import { Check, X } from 'lucide-react';
import { ExtendedUserRole } from '../../types';
import { ROLES_CONFIG } from '../RoleSwitcher';
import { PERMISSION_GROUPS, roleHasGroup } from '../../auth/permissions';

const ROLE_ORDER: ExtendedUserRole[] = ['citizen', 'field_officer', 'supervisor', 'municipal_admin', 'super_admin'];

/**
 * Permission matrix: rows = permission groups, columns = roles.
 * Derived from ROLES_CONFIG — never hard-coded independently.
 */
export const PermissionMatrix: React.FC = () => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <table className="w-full min-w-[720px] text-left text-xs">
        <caption className="sr-only">Permission matrix per role</caption>
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
            <th scope="col" className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider">
              Permission
            </th>
            {ROLE_ORDER.map((role) => (
              <th
                key={role}
                scope="col"
                className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider"
              >
                <span className="sr-only">{ROLES_CONFIG[role].title}</span>
                <span
                  className={[
                    'inline-block rounded-md px-2 py-0.5 ring-1 ring-inset',
                    role === 'super_admin'
                      ? 'bg-rose-500/10 text-rose-400 ring-rose-500/30'
                      : 'bg-slate-800 text-slate-300 ring-slate-700',
                  ].join(' ')}
                >
                  {ROLES_CONFIG[role].badge}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {PERMISSION_GROUPS.map((group) => (
            <tr key={group.key} className="transition-colors hover:bg-slate-800/30">
              <th scope="row" className="px-5 py-3.5 font-semibold text-slate-200">
                {group.label}
              </th>
              {ROLE_ORDER.map((role) => {
                const allowed = roleHasGroup(role, group);
                return (
                  <td key={role} className="px-4 py-3.5 text-center">
                    {allowed ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Allowed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-600">
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Not allowed</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
