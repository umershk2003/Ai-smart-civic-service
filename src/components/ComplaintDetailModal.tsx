import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Camera, 
  Check, 
  Edit3,
  UserCheck,
  AlertTriangle,
  History,
  Layers,
  FileText
} from 'lucide-react';
import { Complaint, ComplaintStatus, CivicPriority, ExtendedUserRole } from '../types';
import { LocationCard } from './ui/LocationCard';
import { defaultCategories } from '../data/categoriesData';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  onClose: () => void;
  onUpdateComplaint: (updated: Partial<Complaint>) => void;
  userRole?: ExtendedUserRole;
}

const DEPARTMENTS = [
  'Department of Public Works',
  'Water & Sanitation Authority',
  'Municipal Solid Waste Management',
  'Electrical Engineering & Utilities',
  'Urban Drainage Division',
  'Public Safety & Emergency Operations',
  'Parks & Horticulture Department',
  'General Municipal Services'
];

const OFFICERS = [
  'Eng. Bilal Ahmed',
  'Officer Sana Malik',
  'Supv. Khalid Mehmood',
  'Lineman Techn. Adnan Yousaf',
  'Lead Tech Farhan Iqbal',
  'Arborist Inspector Waseem Akhtar',
  'Inspector Rabia Tariq',
  'Field Officer Usman Raza'
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateComplaint,
  userRole = 'supervisor'
}) => {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [department, setDepartment] = useState<string>(complaint.assignedDepartment);
  const [officer, setOfficer] = useState<string>(complaint.assignedOfficer || OFFICERS[0]);
  const [priority, setPriority] = useState<CivicPriority>(complaint.priority);
  const [category, setCategory] = useState<string>(complaint.category);
  const [subcategory, setSubcategory] = useState<string>(complaint.subcategory || '');
  const [resolutionNotes, setResolutionNotes] = useState<string>(complaint.resolutionNotes || '');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [reworkReason, setReworkReason] = useState<string>('');
  const [showReworkInput, setShowReworkInput] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  // Costs State
  const [estMaterials, setEstMaterials] = useState<number>(complaint.estimatedCost?.materials || 25000);
  const [estLabor, setEstLabor] = useState<number>(complaint.estimatedCost?.labor || 15000);
  const [estEquipment, setEstEquipment] = useState<number>(complaint.estimatedCost?.equipment || 8000);
  const [estContractor, setEstContractor] = useState<number>(complaint.estimatedCost?.contractor || 12000);

  const [actMaterials, setActMaterials] = useState<number>(complaint.actualCost?.materials || 0);
  const [actLabor, setActLabor] = useState<number>(complaint.actualCost?.labor || 0);
  const [actEquipment, setActEquipment] = useState<number>(complaint.actualCost?.equipment || 0);
  const [actContractor, setActContractor] = useState<number>(complaint.actualCost?.contractor || 0);

  const totalEstimatedCost = estMaterials + estLabor + estEquipment + estContractor;
  const totalActualCost = actMaterials + actLabor + actEquipment + actContractor;
  const costDifference = totalEstimatedCost - totalActualCost;

  // Recommended Officer Logic based on Category / Ward
  const getRecommendedOfficer = () => {
    if (category.toLowerCase().includes('water') || category.toLowerCase().includes('leak')) {
      return {
        name: 'Officer Sana Malik',
        reason: 'Water infrastructure specialist • Near ' + complaint.location.ward + ' • 98% SLA compliance'
      };
    }
    if (category.toLowerCase().includes('road') || category.toLowerCase().includes('pothole')) {
      return {
        name: 'Officer Imran Shahid',
        reason: 'Public Works paving lead • Assigned to ' + complaint.location.ward + ' • Available'
      };
    }
    if (category.toLowerCase().includes('electric') || category.toLowerCase().includes('power')) {
      return {
        name: 'Lineman Techn. Adnan Yousaf',
        reason: 'Certified high-voltage grid technician • Emergency response ready'
      };
    }
    return {
      name: 'Eng. Bilal Ahmed',
      reason: 'Senior municipal inspector • High SLA completion record • On standby'
    };
  };

  const recommendedOfficerInfo = getRecommendedOfficer();

  // Available subcategories based on selected category
  const selectedCategoryDef = defaultCategories.find((c) => c.name === category);
  const availableSubcategories = selectedCategoryDef ? selectedCategoryDef.subcategories : [];

  // Calculate SLA countdown
  const createdTime = new Date(complaint.createdAt).getTime();
  const slaDurationMs = (complaint.estimatedSLAHours || 24) * 3600 * 1000;
  const deadlineTime = createdTime + slaDurationMs;
  const now = Date.now();
  const remainingHours = Math.round((deadlineTime - now) / (3600 * 1000));
  const isSlaBreached = remainingHours < 0;

  const handleApproveResolution = async () => {
    setIsSaving(true);
    try {
      const auditEntry = {
        id: `aud-${Date.now()}`,
        user: userRole === 'supervisor' ? 'Supervisor Lead' : 'Municipal Admin',
        role: userRole,
        action: 'Supervisor Approved Resolution',
        ticketId: complaint.trackingId,
        oldValue: 'Resolved',
        newValue: 'Closed',
        reason: 'Resolution verified on-site / photo proof confirmed.',
        timestamp: new Date().toISOString()
      };

      const updatedPayload: Partial<Complaint> = {
        status: 'Closed',
        resolutionDate: complaint.resolutionDate || new Date().toISOString(),
        auditHistory: [auditEntry, ...(complaint.auditHistory || [])]
      };

      await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      onUpdateComplaint(updatedPayload);
      onClose();
    } catch (err) {
      console.error('Failed to approve resolution:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestRework = async () => {
    if (!reworkReason.trim()) return;
    setIsSaving(true);
    try {
      const auditEntry = {
        id: `aud-${Date.now()}`,
        user: userRole === 'supervisor' ? 'Supervisor Lead' : 'Municipal Admin',
        role: userRole,
        action: 'Supervisor Requested Rework',
        ticketId: complaint.trackingId,
        oldValue: 'Resolved',
        newValue: 'In Progress',
        reason: reworkReason,
        timestamp: new Date().toISOString()
      };

      const updatedPayload: Partial<Complaint> = {
        status: 'In Progress',
        reworkReason,
        auditHistory: [auditEntry, ...(complaint.auditHistory || [])]
      };

      await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      onUpdateComplaint(updatedPayload);
      onClose();
    } catch (err) {
      console.error('Failed to request rework:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isCategoryOverridden = category !== complaint.category || subcategory !== (complaint.subcategory || '');
      const isPriorityOverridden = priority !== complaint.priority;

      const newAuditEntries = [];

      if (isCategoryOverridden || isPriorityOverridden) {
        newAuditEntries.push({
          id: `aud-${Date.now()}`,
          user: userRole === 'supervisor' ? 'Supervisor Lead' : 'Municipal Admin',
          role: userRole,
          action: isCategoryOverridden ? 'Supervisor Category Override' : 'Priority Escalation',
          ticketId: complaint.trackingId,
          oldValue: `${complaint.category} (${complaint.priority})`,
          newValue: `${category} (${priority})`,
          reason: overrideReason || 'Manual operational review adjustment',
          timestamp: new Date().toISOString()
        });
      }

      const estimatedCostObj = {
        materials: estMaterials,
        labor: estLabor,
        equipment: estEquipment,
        contractor: estContractor,
        total: totalEstimatedCost
      };

      const actualCostObj = totalActualCost > 0 ? {
        materials: actMaterials,
        labor: actLabor,
        equipment: actEquipment,
        contractor: actContractor,
        total: totalActualCost
      } : complaint.actualCost;

      const updatedPayload: Partial<Complaint> = {
        status,
        assignedDepartment: department,
        assignedOfficer: officer,
        priority,
        category,
        subcategory,
        resolutionNotes,
        estimatedCost: estimatedCostObj,
        actualCost: actualCostObj,
        resolutionDate: status === 'Resolved' || status === 'Closed' ? new Date().toISOString() : complaint.resolutionDate,
        supervisorOverride: isCategoryOverridden ? {
          originalCategory: complaint.category,
          newCategory: category,
          overriddenBy: userRole,
          reason: overrideReason || 'Operational supervisor realignment',
          timestamp: new Date().toISOString()
        } : complaint.supervisorOverride,
        auditHistory: [...(newAuditEntries.length > 0 ? newAuditEntries : []), ...(complaint.auditHistory || [])]
      };

      await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      onUpdateComplaint(updatedPayload);
      onClose();
    } catch (err) {
      console.error('Failed to update complaint:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityBadgeClass = (p: CivicPriority) => {
    switch (p) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 z-20 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold rounded-lg">
              {complaint.trackingId}
            </span>
            <span className={`px-2.5 py-1 text-xs font-bold border rounded-lg ${getPriorityBadgeClass(priority)}`}>
              {priority} Priority
            </span>
            
            {/* Visual SLA Badge */}
            {isSlaBreached ? (
              <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SLA BREACHED ({Math.abs(remainingHours)}h over)</span>
              </span>
            ) : remainingHours <= 6 ? (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>SLA WARNING ({remainingHours}h remaining)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>SLA ON TRACK ({remainingHours}h remaining)</span>
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Title & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{complaint.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {complaint.description}
              </p>

              {/* Citizen Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-300">
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Submitted By</span>
                    <span className="font-semibold">{complaint.citizenName}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Contact Number</span>
                    <span className="font-semibold">{complaint.citizenContact}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-slate-500 block font-bold mb-1.5">Location</span>
                  <LocationCard location={complaint.location} />
                </div>
              </div>
            </div>

            {/* Photo / Vision Preview */}
            <div className="md:col-span-5 space-y-3">
              {complaint.imageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-48 relative">
                  <img
                    src={complaint.imageUrl}
                    alt={complaint.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 border border-slate-700 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Photo Evidence Attached</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 rounded-xl border border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <span>No Photo Attached</span>
                </div>
              )}

              {complaint.imageAnalysis && (
                <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/50 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    AI Vision Analysis
                  </span>
                  <p className="text-slate-300 text-[11px]">{complaint.imageAnalysis}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights & Recommended Actions */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                AI Analysis & Recommended Repair Plan
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">Confidence: {complaint.priorityScore}/100</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">AI Reasoning</span>
                <p className="text-slate-300 italic leading-relaxed">{complaint.priorityReasoning}</p>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-cyan-300 block">AI Step-by-Step Repair Plan</span>
                <ul className="space-y-1 text-slate-300 font-sans">
                  {(complaint.repairPlan || complaint.recommendedActions || [
                    '1. Inspect site damage & isolate hazards.',
                    '2. Deploy repair materials & field crew.',
                    '3. Conduct post-repair inspection and upload completion evidence.'
                  ]).map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Recommended Officer Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">AI Recommended Field Officer</span>
                <span className="text-sm font-bold text-white">{recommendedOfficerInfo.name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{recommendedOfficerInfo.reason}</p>
              </div>
            </div>

            <button
              type="button"
              aria-label={`Assign recommended officer ${recommendedOfficerInfo.name}`}
              onClick={() => setOfficer(recommendedOfficerInfo.name)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer shrink-0"
            >
              Assign Recommended
            </button>
          </div>

          {/* Supervisor / Admin Category & Subcategory Override */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Supervisor Category & Subcategory Override</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Requires Audit Reason</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    const catDef = defaultCategories.find((c) => c.name === newCat);
                    if (catDef) {
                      setDepartment(catDef.department);
                      setPriority(catDef.defaultPriority);
                      if (catDef.subcategories.length > 0) {
                        setSubcategory(catDef.subcategories[0]);
                      }
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {defaultCategories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="">None / General</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Override Justification (Logged to Immutable Audit Trail)
              </label>
              <input
                type="text"
                placeholder="e.g. Reclassified from Water Leakage to Urban Drainage based on field officer report..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Repair Cost Estimation & Actual Cost Tracking */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Repair Cost Estimation & Variance Analysis (PKR)</span>
              </h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                AI Budget Estimator
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Estimated Costs */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase text-amber-300 block">AI Estimated Costs</span>
                
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Materials</label>
                    <input
                      type="number"
                      value={estMaterials}
                      onChange={(e) => setEstMaterials(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Labor</label>
                    <input
                      type="number"
                      value={estLabor}
                      onChange={(e) => setEstLabor(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Equipment</label>
                    <input
                      type="number"
                      value={estEquipment}
                      onChange={(e) => setEstEquipment(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Contractor</label>
                    <input
                      type="number"
                      value={estContractor}
                      onChange={(e) => setEstContractor(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white">
                  <span>Total Estimated:</span>
                  <span className="text-amber-400 font-mono">PKR {totalEstimatedCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Actual Costs */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase text-emerald-300 block">Actual Field Costs</span>
                
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Actual Materials</label>
                    <input
                      type="number"
                      value={actMaterials}
                      onChange={(e) => setActMaterials(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Actual Labor</label>
                    <input
                      type="number"
                      value={actLabor}
                      onChange={(e) => setActLabor(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Actual Equipment</label>
                    <input
                      type="number"
                      value={actEquipment}
                      onChange={(e) => setActEquipment(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Actual Contractor</label>
                    <input
                      type="number"
                      value={actContractor}
                      onChange={(e) => setActContractor(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white">
                  <span>Total Actual:</span>
                  <span className="text-emerald-400 font-mono">PKR {totalActualCost.toLocaleString()}</span>
                </div>

                {totalActualCost > 0 && (
                  <div className={`p-2 rounded-lg text-xs flex items-center justify-between font-semibold ${
                    costDifference >= 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                  }`}>
                    <span>{costDifference >= 0 ? 'Savings:' : 'Overrun:'}</span>
                    <span className="font-mono font-bold">PKR {Math.abs(costDifference).toLocaleString()}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Supervisor Verification Section (Approve / Request Rework) */}
          {(complaint.status === 'Resolved' || complaint.status === 'Closed' || userRole === 'supervisor' || userRole === 'municipal_admin') && (
            <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 rounded-2xl border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span>Supervisor Quality Verification Desk</span>
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                  {complaint.status === 'Closed' ? 'VERIFIED CLOSED' : 'PENDING SUPERVISOR REVIEW'}
                </span>
              </div>

              {complaint.reworkReason && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-300 block">Previous Rework Request Note:</span>
                  <p className="text-slate-300">{complaint.reworkReason}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Verify completed work order & close ticket or demand rework.</p>
                  <p className="text-slate-400 text-[11px]">Approved tickets shift from Resolved → Closed. Rework requests revert ticket → In Progress.</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowReworkInput(!showReworkInput)}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Request Rework
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveResolution}
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Resolution & Close</span>
                  </button>
                </div>
              </div>

              {showReworkInput && (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <label className="font-bold text-amber-300 block">Reason for Rework Request (Required)</label>
                  <input
                    type="text"
                    value={reworkReason}
                    onChange={(e) => setReworkReason(e.target.value)}
                    placeholder="e.g. Surface seal not level, residual debris on street needs cleanup..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRequestRework}
                      disabled={isSaving || !reworkReason.trim()}
                      className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                    >
                      Confirm Rework Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Desk Dispatch Controls */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>Status & Officer Dispatch Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CivicPriority)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Field Officer</label>
                <select
                  value={officer}
                  onChange={(e) => setOfficer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {OFFICERS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Official Resolution Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={2}
                placeholder="Field resolution log..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Audit Trail Timeline */}
          {complaint.auditHistory && complaint.auditHistory.length > 0 && (
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                <span>Ticket Change Audit Ledger ({complaint.auditHistory.length})</span>
              </h3>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {complaint.auditHistory.map((audit) => (
                  <div key={audit.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{audit.user}</span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-purple-300 rounded text-[10px] uppercase font-mono">{audit.role}</span>
                        <span className="text-slate-400">• {audit.action}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{audit.reason}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(audit.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/95 sticky bottom-0 flex items-center justify-between">
          <button
            type="button"
            aria-label="Cancel changes and close modal"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            aria-label="Save and dispatch updates"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Dispatch Updates'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
