import { CivicCategoryDef, UserAccount } from '../types';

export const defaultCategories: CivicCategoryDef[] = [
  {
    id: 'cat-1',
    name: 'Water & Leakage',
    description: 'Freshwater supply pipes, main line bursts, pressure drops, and quality issues',
    department: 'Water & Sanitation Authority',
    defaultPriority: 'High',
    defaultSLAHours: 24,
    status: 'Active',
    subcategories: [
      'Pipe Burst',
      'Water Leakage',
      'No Water Supply',
      'Low Water Pressure',
      'Contaminated Water'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'cat-2',
    name: 'Roads & Potholes',
    description: 'Road surface damage, asphalt potholes, sidewalk hazards, and traffic signage',
    department: 'Department of Public Works',
    defaultPriority: 'Medium',
    defaultSLAHours: 48,
    status: 'Active',
    subcategories: [
      'Pothole',
      'Road Damage',
      'Broken Footpath',
      'Missing Road Sign'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'cat-3',
    name: 'Waste Management',
    description: 'Municipal trash bins, regular waste collection schedules, and illegal dump sites',
    department: 'Municipal Solid Waste Management',
    defaultPriority: 'Medium',
    defaultSLAHours: 48,
    status: 'Active',
    subcategories: [
      'Garbage Overflow',
      'Missed Collection',
      'Illegal Dumping',
      'Damaged Garbage Bin'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'cat-4',
    name: 'Electricity',
    description: 'Streetlight poles, high-voltage wires, transformer hazards, and local power grids',
    department: 'Electrical Engineering & Utilities',
    defaultPriority: 'High',
    defaultSLAHours: 24,
    status: 'Active',
    subcategories: [
      'Broken Streetlight',
      'Power Line Damage',
      'Electrical Hazard',
      'Faulty Streetlight'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'cat-5',
    name: 'Drainage',
    description: 'Storm drains, sewer line blockages, street flooding, and wastewater overflow',
    department: 'Urban Drainage Division',
    defaultPriority: 'High',
    defaultSLAHours: 24,
    status: 'Active',
    subcategories: [
      'Blocked Drain',
      'Drain Overflow',
      'Flooding',
      'Sewer Issue'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'cat-6',
    name: 'Parks & Greenery',
    description: 'Public gardens, fallen trees blocking pathways, playground maintenance',
    department: 'Parks & Horticulture Department',
    defaultPriority: 'Low',
    defaultSLAHours: 72,
    status: 'Active',
    subcategories: [
      'Damaged Park',
      'Fallen Tree',
      'Broken Park Equipment',
      'Illegal Cutting'
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  }
];

export const defaultUsers: UserAccount[] = [
  { id: 'usr-1', name: 'Zoya Khan', email: 'z.khan@citizen.gov', role: 'citizen', status: 'Active', lastActive: '10 mins ago' },
  { id: 'usr-2', name: 'Officer Imran Shahid', email: 'i.shahid@field.gov', role: 'field_officer', department: 'Department of Public Works', status: 'Active', lastActive: '5 mins ago' },
  { id: 'usr-3', name: 'Officer Sana Malik', email: 's.malik@field.gov', role: 'field_officer', department: 'Water & Sanitation Authority', status: 'Active', lastActive: '12 mins ago' },
  { id: 'usr-4', name: 'Officer Bilal Ahmed', email: 'b.ahmed@field.gov', role: 'field_officer', department: 'Electrical Engineering & Utilities', status: 'Active', lastActive: '1 hour ago' },
  { id: 'usr-5', name: 'Supervisor Ahmed Khan', email: 'a.khan@supervisor.gov', role: 'supervisor', department: 'Department of Public Works', status: 'Active', lastActive: 'Just now' },
  { id: 'usr-6', name: 'Supervisor Maryam Farooq', email: 'm.farooq@supervisor.gov', role: 'supervisor', department: 'Water & Sanitation Authority', status: 'Active', lastActive: '20 mins ago' },
  { id: 'usr-7', name: 'Admin Director Usman Tariq', email: 'u.tariq@muniadmin.gov', role: 'municipal_admin', status: 'Active', lastActive: 'Just now' },
  { id: 'usr-8', name: 'Super Admin Hamza Sheikh', email: 'h.sheikh@govtech.gov', role: 'super_admin', status: 'Active', lastActive: 'Just now' }
];
