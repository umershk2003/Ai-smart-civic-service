import React, { useState } from 'react';
import { 
  HardHat, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Send, 
  Check, 
  Navigation, 
  Building2, 
  FileText,
  UserCheck,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { resolveLocation } from '../data/locations';
import { useToast } from './ui/Toast';
import { PriorityBadge, StatusBadge } from './ui/StatusBadge';

interface FieldOfficerPortalProps {
  officerName: string;
  complaints: Complaint[];
  onUpdateComplaint: (id: string, updated: Partial<Complaint>) => void;
}

export const FieldOfficerPortal: React.FC<FieldOfficerPortalProps> = ({
  officerName,
  complaints,
  onUpdateComplaint
}) => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('Active');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [resolutionStatus, setResolutionStatus] = useState<ComplaintStatus>('In Progress');
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Field Actual Costs
  const [actMaterials, setActMaterials] = useState<number>(0);
  const [actLabor, setActLabor] = useState<number>(0);
  const [actEquipment, setActEquipment] = useState<number>(0);
  const [actContractor, setActContractor] = useState<number>(0);

  // Filter complaints assigned to this officer or department
  const officerComplaints = complaints.filter(
    (c) => c.assignedOfficer === officerName || (!c.assignedOfficer && c.status === 'Assigned')
  );

  const activeWorkOrders = officerComplaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Rejected'
  );

  const displayedComplaints = officerComplaints.filter((c) => {
    if (filterStatus === 'Active' && (c.status === 'Resolved' || c.status === 'Closed' || c.status === 'Rejected')) return false;
    if (filterStatus === 'Resolved' && c.status !== 'Resolved' && c.status !== 'Closed') return false;
    if (filterPriority !== 'All' && c.priority !== filterPriority) return false;
    return true;
  });

  // SLA countdown helper: remaining hours vs. overdue, based on createdAt + estimatedSLAHours
  const getSlaInfo = (c: Complaint) => {
    const deadline = new Date(new Date(c.createdAt).getTime() + c.estimatedSLAHours * 3600_000).getTime();
    const remainingMs = deadline - Date.now();
    const hours = Math.max(1, Math.round(Math.abs(remainingMs) / 3600_000));
    return { hours, overdue: remainingMs < 0 };
  };

  const handleQuickStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedOfficer: officerName,
          resolutionDate: newStatus === 'Resolved' ? new Date().toISOString() : undefined
        })
      });

      onUpdateComplaint(complaintId, {
        status: newStatus,
        assignedOfficer: officerName,
        resolutionDate: newStatus === 'Resolved' ? new Date().toISOString() : undefined
      });
      const target = complaints.find((c) => c.id === complaintId);
      toast({
        title: newStatus === 'Resolved' ? 'Work order completed' : 'Status updated',
        description: `${target?.trackingId ?? complaintId} is now ${newStatus}.`,
        variant: newStatus === 'Resolved' ? 'success' : 'info',
      });
    } catch (err) {
      console.error('Field status update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveFieldLog = async () => {
    if (!activeComplaint) return;
    setIsUpdating(true);
    try {
      const totalAct = actMaterials + actLabor + actEquipment + actContractor;
      const actualCostObj = totalAct > 0 ? {
        materials: actMaterials,
        labor: actLabor,
        equipment: actEquipment,
        contractor: actContractor,
        total: totalAct
      } : activeComplaint.actualCost;

      const updatedPayload: Partial<Complaint> = {
        status: resolutionStatus,
        resolutionNotes: fieldNotes,
        assignedOfficer: officerName,
        actualCost: actualCostObj,
        resolutionDate: resolutionStatus === 'Resolved' ? new Date().toISOString() : activeComplaint.resolutionDate
      };

      await fetch(`/api/complaints/${activeComplaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      onUpdateComplaint(activeComplaint.id, updatedPayload);

      toast({
        title: 'Field log saved',
        description: `${activeComplaint.trackingId} — evidence and costs recorded.`,
        variant: 'success',
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setActiveComplaint(null);
      }, 1200);
    } catch (err) {
      console.error('Field log save failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Sub Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Field Officer Portal</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold px-2.5 py-0.5 rounded-full">
              {officerName}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Active assigned maintenance tasks, field inspection logs & mobile dispatch updates.
          </p>
        </div>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Field Work Order Filters" className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'Active'}
            aria-label={`Active Work Orders (${activeWorkOrders.length})`}
            onClick={() => setFilterStatus('Active')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterStatus === 'Active'
                ? 'bg-amber-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Active Tasks ({activeWorkOrders.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'Resolved'}
            aria-label="Completed Jobs"
            onClick={() => setFilterStatus('Resolved')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterStatus === 'Resolved'
                ? 'bg-emerald-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'All'}
            aria-label="All History"
            onClick={() => setFilterStatus('All')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterStatus === 'All'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All History</span>
          </button>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedComplaints.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No work orders assigned matching the active filter.
          </div>
        ) : (
          displayedComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-amber-400">{c.trackingId}</span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                {/* SLA countdown */}
                {(() => {
                  const sla = getSlaInfo(c);
                  return (
                    <span
                      className={[
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset',
                        sla.overdue
                          ? 'bg-red-500/15 text-red-400 ring-red-500/30'
                          : sla.hours <= 12
                            ? 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
                            : 'bg-slate-800 text-slate-300 ring-slate-700',
                      ].join(' ')}
                    >
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {sla.overdue ? `SLA overdue by ${sla.hours}h` : `SLA ${sla.hours}h left`}
                    </span>
                  );
                })()}

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                    {c.description}
                  </p>
                </div>

                {/* Structured Location (Pakistan hierarchy — mobile friendly) */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {(() => {
                    const r = resolveLocation(c.location);
                    return (
                      <>
                        <div className="flex items-start space-x-2 text-slate-300">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Address</span>
                            <span className="font-medium text-slate-200">{c.location.address}</span>
                            {c.location.landmark && (
                              <span className="block text-[11px] text-slate-400">Landmark: {c.location.landmark}</span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[11px]">
                          <div><span className="text-slate-500">Ward:</span> <span className="text-slate-200">{r.wardName || c.location.ward || '—'}</span></div>
                          <div><span className="text-slate-500">Area:</span> <span className="text-slate-200">{r.area || '—'}</span></div>
                          <div><span className="text-slate-500">District:</span> <span className="text-slate-200">{r.districtName || '—'}</span></div>
                          <div><span className="text-slate-500">Municipality:</span> <span className="text-slate-200">{r.municipalityName || '—'}</span></div>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px] pt-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Dept: {c.assignedDepartment}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* AI Recommended Procedure */}
                {c.recommendedActions && c.recommendedActions.length > 0 && (
                  <div className="p-2.5 bg-indigo-950/30 rounded-xl border border-indigo-800/40 text-[11px] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      AI Repair Checklist:
                    </span>
                    <p className="text-slate-300 text-[11px]">{c.recommendedActions[0]}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Field Officer */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {c.status !== 'In Progress' && c.status !== 'Resolved' && (
                    <button
                      type="button"
                      aria-label={`Start work on ticket ${c.trackingId}`}
                      onClick={() => handleQuickStatusChange(c.id, 'In Progress')}
                      disabled={isUpdating}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {c.status === 'In Progress' && (
                    <button
                      type="button"
                      aria-label={`Mark ticket ${c.trackingId} as resolved`}
                      onClick={() => handleQuickStatusChange(c.id, 'Resolved')}
                      disabled={isUpdating}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={`Log work details and enter actual costs for ticket ${c.trackingId}`}
                    onClick={() => {
                      setActiveComplaint(c);
                      setFieldNotes(c.resolutionNotes || '');
                      setResolutionStatus(c.status);
                      setActMaterials(c.actualCost?.materials || c.estimatedCost?.materials || 18000);
                      setActLabor(c.actualCost?.labor || c.estimatedCost?.labor || 12000);
                      setActEquipment(c.actualCost?.equipment || c.estimatedCost?.equipment || 5000);
                      setActContractor(c.actualCost?.contractor || c.estimatedCost?.contractor || 10000);
                    }}
                    className="col-span-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl transition-colors border border-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Log Work & Enter Actual Costs</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Field Officer Log Modal Drawer */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">{activeComplaint.trackingId}</span>
                <h2 className="text-base font-bold text-white">Field Service Log — {activeComplaint.title}</h2>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setActiveComplaint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Status Update */}
            <div className="space-y-1.5">
              <label htmlFor="field-status-update" className="text-[10px] font-bold uppercase text-slate-400">Update Job Status</label>
              <select
                id="field-status-update"
                aria-label="Update Job Status"
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as ComplaintStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved & Completed</option>
              </select>
            </div>

            {/* Field Notes Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="field-notes-textarea" className="text-[10px] font-bold uppercase text-slate-400">On-Ground Maintenance Log & Repair Details</label>
              <textarea
                id="field-notes-textarea"
                aria-label="On-Ground Maintenance Log & Repair Details"
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                rows={3}
                placeholder="Describe field inspection results, materials used, crew members on site, and final work performed..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Actual Cost Input Grid */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">Record Actual Field Repair Costs (PKR)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label htmlFor="act-materials" className="text-[10px] text-slate-400 block">Materials</label>
                  <input
                    id="act-materials"
                    type="number"
                    aria-label="Actual materials cost"
                    value={actMaterials}
                    onChange={(e) => setActMaterials(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label htmlFor="act-labor" className="text-[10px] text-slate-400 block">Labor</label>
                  <input
                    id="act-labor"
                    type="number"
                    aria-label="Actual labor cost"
                    value={actLabor}
                    onChange={(e) => setActLabor(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label htmlFor="act-equipment" className="text-[10px] text-slate-400 block">Equipment</label>
                  <input
                    id="act-equipment"
                    type="number"
                    aria-label="Actual equipment cost"
                    value={actEquipment}
                    onChange={(e) => setActEquipment(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label htmlFor="act-contractor" className="text-[10px] text-slate-400 block">Contractor</label>
                  <input
                    id="act-contractor"
                    type="number"
                    aria-label="Actual contractor cost"
                    value={actContractor}
                    onChange={(e) => setActContractor(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="text-right text-xs font-bold text-amber-300 pt-1 font-mono">
                Total Actual Cost: PKR {(actMaterials + actLabor + actEquipment + actContractor).toLocaleString()}
              </div>
            </div>

            {/* Simulated Photo Proof Attachment */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Attach Completion Photo Evidence</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Camera Ready
              </span>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveComplaint(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFieldLog}
                disabled={isUpdating}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 cursor-pointer"
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Save Field Log</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
