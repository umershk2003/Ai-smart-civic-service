import { ExtendedUserRole, UserRoleInfo } from '../types';

export const ROLES_CONFIG: Record<ExtendedUserRole, UserRoleInfo> = {
  citizen: {
    role: 'citizen',
    title: 'Citizen / Resident',
    badge: 'Public Portal',
    description: 'Submit complaints, track ticket status, give feedback, reopen unresolved tickets',
    avatarColor: 'bg-emerald-500',
    permissions: ['submit_complaint', 'view_own', 'track_status', 'feedback', 'reopen_ticket']
  },
  field_officer: {
    role: 'field_officer',
    title: 'Field Officer',
    badge: 'On-Ground Tech',
    description: 'View assigned tickets, accept work orders, update status, add field notes & photos',
    avatarColor: 'bg-amber-500',
    officerName: 'Officer Imran Shahid',
    permissions: ['view_assigned', 'update_status', 'upload_evidence', 'accept_work']
  },
  supervisor: {
    role: 'supervisor',
    title: 'Supervisor',
    badge: 'Dept Manager',
    description: 'Assign officers, reassign, override priority/category, review evidence, approve resolutions',
    avatarColor: 'bg-blue-600',
    department: 'Department of Public Works',
    permissions: ['view_department', 'assign_officer', 'override_category', 'override_priority', 'approve_resolution', 'handle_sla']
  },
  municipal_admin: {
    role: 'municipal_admin',
    title: 'Municipal Admin',
    badge: 'City Admin',
    description: 'Manage complaint categories & subcategories, departments, municipalities, wards, SLA rules & view analytics',
    avatarColor: 'bg-purple-600',
    permissions: ['view_all', 'manage_users', 'manage_categories', 'manage_departments', 'manage_wards', 'view_analytics']
  },
  super_admin: {
    role: 'super_admin',
    title: 'Super Admin',
    badge: 'System Owner',
    description: 'Full system access, manage roles & permissions, AI config, audit logs, security settings',
    avatarColor: 'bg-rose-600',
    permissions: ['full_access', 'manage_roles', 'manage_permissions', 'system_config', 'ai_config', 'audit_logs']
  }
};

export const FIELD_OFFICERS_LIST = [
  'Officer Imran Shahid',
  'Officer Sana Malik',
  'Officer Bilal Ahmed',
  'Lineman Techn. Adnan Yousaf',
  'Lead Tech Farhan Iqbal',
  'Arborist Inspector Waseem Akhtar'
];

export const DEPARTMENTS_LIST = [
  'Department of Public Works',
  'Water & Sanitation Authority',
  'Municipal Solid Waste Management',
  'Electrical Engineering & Utilities',
  'Urban Drainage Division',
  'Parks & Horticulture Department'
];

export const SUPERVISOR_DEPARTMENTS_LIST = DEPARTMENTS_LIST;
