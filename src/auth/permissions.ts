import { ROLES_CONFIG } from '../components/RoleSwitcher';
import { ExtendedUserRole, UserRoleInfo } from '../types';

/**
 * Centralized RBAC module.
 *
 * The single source of truth for the frontend experience:
 *  - `ROLES_CONFIG` (src/components/RoleSwitcher.tsx) defines each role's permissions.
 *  - `ALLOWED_TABS_PER_ROLE` (below) defines which navigation tabs each role may open.
 *  - The backend (server.ts) remains authoritative — hiding a button here is NEVER
 *    treated as security. These helpers only shape the UI.
 */

export type NavTab =
  | 'citizen'
  | 'desk'
  | 'field'
  | 'categories'
  | 'roles'
  | 'analytics'
  | 'assistant';

export interface TabMeta {
  id: NavTab;
  label: string;
  shortLabel: string;
  description: string;
}

export const TAB_META: Record<NavTab, TabMeta> = {
  citizen: {
    id: 'citizen',
    label: 'Citizen Portal',
    shortLabel: 'Citizen',
    description: 'Report and track civic issues',
  },
  desk: {
    id: 'desk',
    label: 'Service Desk',
    shortLabel: 'Desk',
    description: 'Department dispatch & triage',
  },
  field: {
    id: 'field',
    label: 'Field Portal',
    shortLabel: 'Field',
    description: 'On-ground work orders',
  },
  categories: {
    id: 'categories',
    label: 'Categories',
    shortLabel: 'Categories',
    description: 'Service categories & SLAs',
  },
  roles: {
    id: 'roles',
    label: 'Role Management',
    shortLabel: 'Roles',
    description: 'RBAC, users & audit trail',
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    shortLabel: 'Analytics',
    description: 'City-wide insights',
  },
  assistant: {
    id: 'assistant',
    label: 'AI Assistant',
    shortLabel: 'AI',
    description: 'Civic AI copilot',
  },
};

/** Which tabs each role is allowed to open. */
export const ALLOWED_TABS_PER_ROLE: Record<ExtendedUserRole, NavTab[]> = {
  citizen: ['citizen', 'analytics', 'assistant'],
  field_officer: ['citizen', 'desk', 'field', 'analytics', 'assistant'],
  supervisor: ['citizen', 'desk', 'field', 'analytics', 'assistant'],
  municipal_admin: ['citizen', 'desk', 'field', 'categories', 'analytics', 'assistant'],
  super_admin: ['citizen', 'desk', 'field', 'categories', 'roles', 'analytics', 'assistant'],
};

/** Ordered list of tabs for sidebar rendering. */
export const TAB_ORDER: NavTab[] = [
  'citizen',
  'desk',
  'field',
  'categories',
  'roles',
  'analytics',
  'assistant',
];

/* ------------------------------------------------------------------ */
/* Role / permission helpers                                           */
/* ------------------------------------------------------------------ */

export type RoleLike = ExtendedUserRole | { role: ExtendedUserRole } | undefined | null;

function toRole(role: RoleLike): ExtendedUserRole | null {
  if (!role) return null;
  if (typeof role === 'string') return role as ExtendedUserRole;
  return role.role ?? null;
}

export function hasRole(role: RoleLike, expected: ExtendedUserRole): boolean {
  return toRole(role) === expected;
}

export function isOneOf(role: RoleLike, roles: ExtendedUserRole[]): boolean {
  const r = toRole(role);
  return r !== null && roles.includes(r);
}

/** Permission names the role holds (from ROLES_CONFIG). */
export function rolePermissions(role: RoleLike): string[] {
  const r = toRole(role);
  if (!r) return [];
  const cfg: UserRoleInfo | undefined = ROLES_CONFIG[r];
  return cfg?.permissions ?? [];
}

/** `full_access` (super_admin) implicitly grants every permission. */
export function hasPermission(role: RoleLike, permission: string): boolean {
  const perms = rolePermissions(role);
  return perms.includes('full_access') || perms.includes(permission);
}

/** Whether the role may open a given navigation tab. */
export function canAccessTab(role: RoleLike, tab: NavTab): boolean {
  const r = toRole(role);
  if (!r) return false;
  return (ALLOWED_TABS_PER_ROLE[r] ?? []).includes(tab);
}

/**
 * Map a business action to the permission(s) required.
 * Extend this map as new actions are added.
 */
const ACTION_REQUIREMENTS: Record<string, string[]> = {
  submit_complaint: ['submit_complaint'],
  track_ticket: ['track_status'],
  accept_work_order: ['accept_work'],
  update_status: ['update_status'],
  upload_evidence: ['upload_evidence'],
  assign_officer: ['assign_officer'],
  override_category: ['override_category'],
  override_priority: ['override_priority'],
  approve_resolution: ['approve_resolution'],
  manage_categories: ['manage_categories'],
  manage_users: ['manage_users'],
  manage_roles: ['manage_roles'],
  view_audit_logs: ['audit_logs'],
  ai_config: ['ai_config'],
  system_config: ['system_config'],
};

export function canPerformAction(role: RoleLike, action: string): boolean {
  const required = ACTION_REQUIREMENTS[action];
  if (!required) return false;
  const perms = rolePermissions(role);
  if (perms.includes('full_access')) return true;
  return required.some((p) => perms.includes(p));
}

/** Default landing tab for each role (kept in sync with App's expectations). */
export function defaultTabForRole(role: ExtendedUserRole): NavTab {
  switch (role) {
    case 'field_officer':
      return 'field';
    case 'supervisor':
      return 'desk';
    case 'municipal_admin':
      return 'desk';
    case 'super_admin':
      return 'roles';
    default:
      return 'citizen';
  }
}

/* ------------------------------------------------------------------ */
/* Permission groups for the matrix view                               */
/* ------------------------------------------------------------------ */

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: string[];
}

/** Permission groups rendered as rows in the Super Admin permission matrix. */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  { key: 'view', label: 'View complaints', permissions: ['view_own', 'view_assigned', 'view_department', 'view_all'] },
  { key: 'create', label: 'Create complaints', permissions: ['submit_complaint'] },
  { key: 'track', label: 'Track ticket status', permissions: ['track_status'] },
  { key: 'accept', label: 'Accept work orders', permissions: ['accept_work'] },
  { key: 'update', label: 'Update ticket status', permissions: ['update_status'] },
  { key: 'evidence', label: 'Upload field evidence', permissions: ['upload_evidence'] },
  { key: 'assign', label: 'Assign officers', permissions: ['assign_officer'] },
  { key: 'override-cat', label: 'Override category', permissions: ['override_category'] },
  { key: 'override-pri', label: 'Override priority', permissions: ['override_priority'] },
  { key: 'approve', label: 'Approve resolutions', permissions: ['approve_resolution'] },
  { key: 'categories', label: 'Manage categories', permissions: ['manage_categories'] },
  { key: 'users', label: 'Manage users', permissions: ['manage_users'] },
  { key: 'locations', label: 'Manage municipalities & wards', permissions: ['manage_wards'] },
  { key: 'roles', label: 'Manage roles', permissions: ['manage_roles'] },
  { key: 'ai', label: 'AI configuration', permissions: ['ai_config'] },
  { key: 'audit', label: 'View audit logs', permissions: ['audit_logs'] },
  { key: 'system', label: 'System configuration', permissions: ['system_config'] },
];

/** A role satisfies a permission group if it holds any listed permission (or full_access). */
export function roleHasGroup(role: ExtendedUserRole, group: PermissionGroup): boolean {
  const perms = rolePermissions(role);
  if (perms.includes('full_access')) return true;
  return group.permissions.some((p) => perms.includes(p));
}
