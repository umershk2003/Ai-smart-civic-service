import { AuditEntry } from '../types';

export const initialAuditLogs: AuditEntry[] = [
  {
    id: 'aud-101',
    user: 'Supervisor Ahmed Khan',
    role: 'supervisor',
    action: 'Category Override',
    ticketId: 'CIV-2026-8091',
    oldValue: 'Drainage & Sewage',
    newValue: 'Water & Leakage',
    reason: 'Complaint concerns a ruptured clean drinking water main conduit, not a storm drain.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
    ipInfo: '192.168.1.45 (Municipal Dispatch)'
  },
  {
    id: 'aud-102',
    user: 'Supervisor Ahmed Khan',
    role: 'supervisor',
    action: 'Priority Change',
    ticketId: 'CIV-2026-8091',
    oldValue: 'High',
    newValue: 'Critical',
    reason: 'Water loss threatens main commercial grid and residential supply.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.4).toISOString(),
    ipInfo: '192.168.1.45 (Municipal Dispatch)'
  },
  {
    id: 'aud-103',
    user: 'Admin Director Usman Tariq',
    role: 'municipal_admin',
    action: 'Officer Assigned',
    ticketId: 'CIV-2026-8092',
    oldValue: 'Unassigned',
    newValue: 'Officer Sana Malik',
    reason: 'Dispatched closest available field crew in Ward 2.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    ipInfo: '10.0.4.12 (Admin Portal)'
  },
  {
    id: 'aud-104',
    user: 'Super Admin Hamza Sheikh',
    role: 'super_admin',
    action: 'SLA Rule Updated',
    oldValue: 'Critical: 12 Hours',
    newValue: 'Critical: 6 Hours',
    reason: 'Emergency response protocol update approved by council.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ipInfo: '10.0.0.1 (System Console)'
  }
];
