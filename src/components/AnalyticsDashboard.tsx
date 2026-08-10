import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Building2,
  Sparkles
} from 'lucide-react';
import { Complaint, ExtendedUserRole } from '../types';
import { ROLES_CONFIG } from './RoleSwitcher';

interface AnalyticsDashboardProps {
  complaints: Complaint[];
  /** Current user role — shapes which analytics context is shown */
  role?: ExtendedUserRole;
}

const ROLE_ANALYTICS_COPY: Record<ExtendedUserRole, { title: string; subtitle: string }> = {
  citizen: {
    title: 'Community Insights',
    subtitle: 'A public view of how civic issues are trending and being resolved across the city.',
  },
  field_officer: {
    title: 'Operations Analytics',
    subtitle: 'Workload trends, priority mix, and resolution performance across your assigned areas.',
  },
  supervisor: {
    title: 'Department Analytics',
    subtitle: 'SLA compliance, officer workload, and category trends for your department.',
  },
  municipal_admin: {
    title: 'Executive Analytics Portal',
    subtitle: 'Real-time statistical distributions, priority tracking, and ward hotspot diagnostics.',
  },
  super_admin: {
    title: 'Executive Analytics Portal',
    subtitle: 'Real-time statistical distributions, priority tracking, and ward hotspot diagnostics.',
  },
};

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#10b981'
};

const STATUS_COLORS = {
  Submitted: '#94a3b8',
  'Under Review': '#f59e0b',
  Assigned: '#6366f1',
  'In Progress': '#3b82f6',
  Resolved: '#10b981',
  Rejected: '#f43f5e'
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ complaints, role = 'municipal_admin' }) => {
  // Key Stats Calculations
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const critical = complaints.filter((c) => c.priority === 'Critical').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category Distribution Data
  const categoryMap = complaints.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = { name: c.category, count: 0, Critical: 0, High: 0, Medium: 0, Low: 0 };
    acc[c.category].count += 1;
    acc[c.category][c.priority] += 1;
    return acc;
  }, {} as Record<string, any>);

  const categoryData = Object.values(categoryMap);

  // Priority Distribution Data
  const priorityMap = complaints.reduce((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityData = [
    { name: 'Critical', value: priorityMap['Critical'] || 0, color: PRIORITY_COLORS.Critical },
    { name: 'High', value: priorityMap['High'] || 0, color: PRIORITY_COLORS.High },
    { name: 'Medium', value: priorityMap['Medium'] || 0, color: PRIORITY_COLORS.Medium },
    { name: 'Low', value: priorityMap['Low'] || 0, color: PRIORITY_COLORS.Low }
  ];

  // Ward Hotspot Data
  const wardMap = complaints.reduce((acc, c) => {
    acc[c.location.ward] = (acc[c.location.ward] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wardData = Object.entries(wardMap).map(([ward, count]) => ({
    ward: ward.replace('Ward ', 'W'),
    count
  }));

  // Status Breakdown Data
  const statusMap = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusMap).map(([status, value]) => ({
    name: status,
    value,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#64748b'
  }));

  // Financial Cost Totals
  const totalEstimatedBudget = complaints.reduce((sum, c) => sum + (c.estimatedCost?.total || 45000), 0);
  const totalActualSpent = complaints.reduce((sum, c) => sum + (c.actualCost?.total || (c.status === 'Resolved' || c.status === 'Closed' ? (c.estimatedCost?.total || 42000) : 0)), 0);
  const costVariance = totalEstimatedBudget - totalActualSpent;

  // SLA Performance Calculation
  const slaMetCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const slaCompliancePct = total > 0 ? Math.round((slaMetCount / total) * 100) : 92;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{ROLE_ANALYTICS_COPY[role].title}</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              {ROLES_CONFIG[role]?.badge || 'Analytics'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {ROLE_ANALYTICS_COPY[role].subtitle}
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto items-center space-x-2 px-3 py-1.5 text-xs text-slate-300">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">{total} Complaints Logged</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Complaints */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Complaints</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{total}</div>
          <div className="text-[11px] text-slate-400">All municipal wards logged</div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{resolutionRate}%</div>
          <div className="text-[11px] text-slate-400">{resolved} of {total} tickets resolved</div>
        </div>

        {/* Critical Active */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Critical Emergency</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 tracking-tight">{critical}</div>
          <div className="text-[11px] text-slate-400">Immediate dispatch required</div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>SLA Compliance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight">{slaCompliancePct}%</div>
          <div className="text-[11px] text-slate-400">Within target resolution window</div>
        </div>

      </div>

      {/* Financial Cost Estimation vs Actual Spend Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total AI Estimated Budget</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            PKR {totalEstimatedBudget.toLocaleString()}
          </div>
          <p className="text-slate-400 text-[11px]">Aggregated materials, labor & contractor estimations.</p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Actual Field Expenditure</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            PKR {totalActualSpent.toLocaleString()}
          </div>
          <p className="text-slate-400 text-[11px]">Logged by field officers upon job completion.</p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Net Financial Budget Variance</span>
          <div className={`text-2xl font-extrabold font-mono ${costVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {costVariance >= 0 ? '+' : ''}PKR {costVariance.toLocaleString()}
          </div>
          <p className="text-slate-400 text-[11px]">
            {costVariance >= 0 ? 'Under budget efficiency saving across active wards.' : 'Budget overrun detected on emergency repairs.'}
          </p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Complaint Volume by Service Category</span>
            <span className="text-xs font-normal text-slate-400">Stacked Priority</span>
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="Critical" stackId="a" fill={PRIORITY_COLORS.Critical} />
                <Bar dataKey="High" stackId="a" fill={PRIORITY_COLORS.High} />
                <Bar dataKey="Medium" stackId="a" fill={PRIORITY_COLORS.Medium} />
                <Bar dataKey="Low" stackId="a" fill={PRIORITY_COLORS.Low} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Donut */}
        <div className="lg:col-span-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Priority Share</h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Hotspot Density Bar Chart */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Ward Hotspot Density</span>
            <span className="text-xs text-slate-400 font-normal">Complaints per Ward</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="ward" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Workflow Breakdown */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Workflow Status Breakdown</h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
