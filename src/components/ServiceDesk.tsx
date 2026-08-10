import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Building2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  SearchX
} from 'lucide-react';
import { Complaint } from '../types';
import { getDistrictName, getWardName } from '../data/locations';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { SkeletonTable } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { PriorityBadge, StatusBadge } from './ui/StatusBadge';

interface ServiceDeskProps {
  complaints: Complaint[];
  onUpdateComplaint: (id: string, updated: Partial<Complaint>) => void;
  /** Show skeleton rows while initial data loads */
  loading?: boolean;
}

export const ServiceDesk: React.FC<ServiceDeskProps> = ({
  complaints,
  onUpdateComplaint,
  loading = false
}) => {
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View Mode
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Selected Modal Complaint
  const [activeModalComplaint, setActiveModalComplaint] = useState<Complaint | null>(null);

  // Apply Filter Logic
  // District & ward option lists derived from the complaints themselves
  const districtOptions = Array.from(new Set(complaints.map((c) => getDistrictName(c.location.districtId)).filter(Boolean)));
  const wardOptions = Array.from(new Set(complaints.map((c) => getWardName(c.location.wardId) || c.location.ward).filter(Boolean)));

  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (selectedDepartment !== 'All' && c.assignedDepartment !== selectedDepartment) return false;
    if (selectedDistrict !== 'All' && getDistrictName(c.location.districtId) !== selectedDistrict) return false;
    if (selectedWard !== 'All' && (getWardName(c.location.wardId) || c.location.ward) !== selectedWard) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.trackingId.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Supervisor Service Desk</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold px-2.5 py-0.5 rounded-full">
              Supervisor Portal
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Department dispatch, priority triage, SLA tracking & field officer assignment.
          </p>
        </div>

        {/* View Mode Controls */}
        <div role="tablist" aria-label="Service Desk View Modes" className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'table'}
            aria-label="Switch to Table View"
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'cards'}
            aria-label="Switch to Grid Cards View"
            onClick={() => setViewMode('cards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Cards</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              aria-label="Search complaints by ID, keyword, address, or citizen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, address, citizen..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            aria-label="Filter complaints by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Roads & Potholes">Roads & Potholes</option>
            <option value="Water Supply & Leakage">Water Supply & Leakage</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Electricity & Streetlights">Electricity & Streetlights</option>
            <option value="Drainage & Sewage">Drainage & Sewage</option>
            <option value="Parks & Sanitation">Parks & Sanitation</option>
          </select>

          {/* Priority Filter */}
          <select
            aria-label="Filter complaints by priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter complaints by status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* District Filter */}
          <select
            aria-label="Filter complaints by district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Districts</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            aria-label="Filter complaints by ward"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Wards</option>
            {wardOptions.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

        </div>
      </div>

      {/* LOADING STATE */}
      {loading && <SkeletonTable rows={6} columns={6} />}

      {/* VIEW RENDERERS */}

      {/* 1. TABLE VIEW */}
      {!loading && viewMode === 'table' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tracking ID</th>
                  <th className="py-3.5 px-4">Problem Summary</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority / SLA</th>
                  <th className="py-3.5 px-4">Department & Officer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10">
                      <EmptyState
                        icon={SearchX}
                        title="No complaints found"
                        description="No tickets match the current filters. Try adjusting the search or filter criteria."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setActiveModalComplaint(c)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                        {c.trackingId}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{c.location.address} ({c.location.ward})</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {c.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={c.priority} />
                          <span className="text-[11px] text-amber-300/90 font-mono">
                            {c.estimatedSLAHours}h
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium truncate max-w-[180px]">{c.assignedDepartment}</div>
                        <div className="text-[10px] text-slate-400">{c.assignedOfficer || 'Unassigned'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          aria-label={`Manage complaint ${c.trackingId} - ${c.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalComplaint(c);
                          }}
                          className="px-2.5 py-1 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white font-medium text-[11px] rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. GRID CARDS VIEW */}
      {!loading && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={SearchX}
                title="No complaints match your filters"
                description="Try widening the category, priority, or status filters to see more tickets."
              />
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveModalComplaint(c)}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all shadow-lg flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <span className="font-mono text-xs font-bold text-blue-400">{c.trackingId}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                    {c.summary}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 mt-3">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{c.assignedDepartment}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{c.location.address} ({c.location.ward})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <StatusBadge status={c.status} />
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {c.estimatedSLAHours}h SLA
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {activeModalComplaint && (
        <ComplaintDetailModal
          complaint={activeModalComplaint}
          onClose={() => setActiveModalComplaint(null)}
          onUpdateComplaint={(updated) => {
            onUpdateComplaint(activeModalComplaint.id, updated);
          }}
        />
      )}

    </div>
  );
};
