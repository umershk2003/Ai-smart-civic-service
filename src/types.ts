export type CivicPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened'
  | 'Rejected';

export type ExtendedUserRole = 
  | 'citizen' 
  | 'field_officer' 
  | 'supervisor' 
  | 'municipal_admin' 
  | 'super_admin';

// Backward compatibility alias
export type UserRole = ExtendedUserRole;
export type CivicCategory = string;

export interface UserRoleInfo {
  role: ExtendedUserRole;
  title: string;
  badge: string;
  badgeColor?: string;
  description: string;
  avatarColor: string;
  officerName?: string;
  department?: string;
  permissions: string[];
}

export interface LocationData {
  /** Structured Pakistan administrative hierarchy (IDs referencing src/data/locations.ts) */
  provinceId?: string;
  divisionId?: string;
  districtId?: string;
  tehsilId?: string;
  municipalityId?: string;
  wardId?: string;
  area?: string;
  address: string;
  /** Legacy display name of the ward (kept populated for compatibility) */
  ward?: string;
  /** Optional nearby landmark for easier field dispatch */
  landmark?: string;
  /** Kept only for backward compatibility with older records — not used by the UI */
  latitude?: number;
  longitude?: number;
}

export interface CivicSubcategory {
  id: string;
  name: string;
  description?: string;
}

export interface CivicCategoryDef {
  id: string;
  name: string;
  description: string;
  department: string;
  defaultPriority: CivicPriority;
  defaultSLAHours: number;
  status: 'Active' | 'Inactive';
  subcategories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AIClassification {
  category: string;
  subcategory?: string;
  department: string;
  priority: CivicPriority;
  priorityScore: number;
  slaHours: number;
  confidence: number; // 0-100 percentage
  reason: string;
  needsHumanReview: boolean;
}

export interface CategoryOverride {
  originalCategory: string;
  originalSubcategory?: string;
  finalCategory: string;
  finalSubcategory?: string;
  overrideUser: string;
  overrideRole: ExtendedUserRole;
  overrideReason: string;
  overrideTimestamp: string;
}

export interface CitizenFeedback {
  rating: number; // 1-5
  comment?: string;
  submittedAt: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  role: ExtendedUserRole;
  action: string;
  ticketId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
  ipInfo?: string;
}

export interface AIAnalysisResult {
  category: string;
  subcategory?: string;
  assignedDepartment: string;
  priority: CivicPriority;
  priorityScore: number; // 1 to 100
  priorityReasoning: string;
  summary: string;
  recommendedActions: string[];
  estimatedSLAHours: number;
  imageAnalysis?: string;
  detectedKeywords: string[];
  confidence: number;
  needsHumanReview: boolean;
}

export interface CostBreakdown {
  materials: number;
  labor: number;
  equipment: number;
  contractor: number;
  total: number;
}

export interface Complaint {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  imageUrl?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  citizenName: string;
  citizenContact: string;
  location: LocationData;
  category: string; // Final category
  subcategory?: string; // Final subcategory
  assignedDepartment: string;
  assignedOfficer?: string;
  supervisorName?: string;
  priority: CivicPriority;
  priorityScore: number;
  priorityReasoning: string;
  status: ComplaintStatus;
  summary: string;
  recommendedActions: string[];
  estimatedSLAHours: number;
  imageAnalysis?: string;
  detectedKeywords: string[];
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  resolutionDate?: string;
  needsHumanReview?: boolean;
  citizenFeedback?: CitizenFeedback;
  aiClassification?: AIClassification;
  categoryOverride?: CategoryOverride;
  supervisorOverride?: any;
  auditHistory?: AuditEntry[];
  estimatedCost?: CostBreakdown;
  actualCost?: CostBreakdown;
  repairPlan?: string[];
  reworkReason?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: ExtendedUserRole;
  department?: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

export interface AnalyticsStats {
  totalComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  criticalComplaints: number;
  avgResolutionTimeHours: number;
  slaComplianceRate: number;
  categoryBreakdown: { name: string; count: number; critical: number }[];
  priorityBreakdown: { name: string; value: number; color: string }[];
  wardBreakdown: { ward: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  monthlyTrends: { month: string; submitted: number; resolved: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedComplaints?: Complaint[];
}
