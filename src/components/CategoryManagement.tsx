import React, { useState } from 'react';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Tag, 
  Layers, 
  Building, 
  Clock, 
  AlertTriangle,
  Info,
  Save,
  X
} from 'lucide-react';
import { CivicCategoryDef, CivicPriority } from '../types';

interface CategoryManagementProps {
  categories: CivicCategoryDef[];
  onAddCategory: (category: Omit<CivicCategoryDef, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCategory: (category: CivicCategoryDef) => void;
  onToggleStatus: (categoryId: string) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onToggleStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CivicCategoryDef | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDepartment, setFormDepartment] = useState('Department of Public Works');
  const [formPriority, setFormPriority] = useState<CivicPriority>('Medium');
  const [formSLAHours, setFormSLAHours] = useState<number>(24);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');

  // Unique departments list for filtering
  const departmentsList = Array.from(new Set(categories.map((c) => c.department)));

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormDepartment('Department of Public Works');
    setFormPriority('Medium');
    setFormSLAHours(24);
    setFormStatus('Active');
    setFormSubcategories([]);
    setNewSubcategoryInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CivicCategoryDef) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormDepartment(cat.department);
    setFormPriority(cat.defaultPriority);
    setFormSLAHours(cat.defaultSLAHours);
    setFormStatus(cat.status);
    setFormSubcategories([...cat.subcategories]);
    setNewSubcategoryInput('');
    setIsModalOpen(true);
  };

  const handleAddSubcategory = () => {
    if (newSubcategoryInput.trim() && !formSubcategories.includes(newSubcategoryInput.trim())) {
      setFormSubcategories([...formSubcategories, newSubcategoryInput.trim()]);
      setNewSubcategoryInput('');
    }
  };

  const handleRemoveSubcategory = (sub: string) => {
    setFormSubcategories(formSubcategories.filter((s) => s !== sub));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) return;

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: formName,
        description: formDescription,
        department: formDepartment,
        defaultPriority: formPriority,
        defaultSLAHours: formSLAHours,
        status: formStatus,
        subcategories: formSubcategories,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddCategory({
        name: formName,
        description: formDescription,
        department: formDepartment,
        defaultPriority: formPriority,
        defaultSLAHours: formSLAHours,
        status: formStatus,
        subcategories: formSubcategories
      });
    }

    setIsModalOpen(false);
  };

  // Filtering categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subcategories.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDeptFilter === 'All' || c.department === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'All' || c.status === selectedStatusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Management Sub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Municipal Admin Portal</span>
            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold px-2.5 py-0.5 rounded-full">
              Municipal Admin
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure city complaint categories, assign default SLA windows, map responsible departments, and manage subcategories.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            aria-label="Create new category"
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-all shadow-md cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            aria-label="Search category, subcategory..."
            placeholder="Search category, subcategory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Filter by department"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Filter by status"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-slate-900 border rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between ${
              cat.status === 'Active' ? 'border-slate-800 hover:border-slate-700' : 'border-red-900/40 bg-slate-900/50'
            }`}
          >
            <div className="space-y-4">
              {/* Category Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2.5 rounded-xl border ${
                    cat.status === 'Active' 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{cat.name}</h3>
                    <span className="text-[11px] text-purple-400 font-medium">{cat.department}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 ${
                  cat.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {cat.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              {/* Specs Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Default Priority</span>
                  <span className={`font-bold ${
                    cat.defaultPriority === 'Critical' ? 'text-red-400' :
                    cat.defaultPriority === 'High' ? 'text-amber-400' :
                    cat.defaultPriority === 'Medium' ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    {cat.defaultPriority}
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Target SLA</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    {cat.defaultSLAHours} Hours
                  </span>
                </div>
              </div>

              {/* Subcategories list */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-400" />
                  Subcategories ({cat.subcategories.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 rounded-lg text-[11px]"
                    >
                      {sub}
                    </span>
                  ))}
                  {cat.subcategories.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No subcategories defined</span>
                  )}
                </div>
              </div>
            </div>

            {/* Category Card Footer Actions */}
            <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                aria-label={`Edit specifications for ${cat.name}`}
                onClick={() => handleOpenEditModal(cat)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Edit Specs</span>
              </button>

              <button
                type="button"
                aria-label={`${cat.status === 'Active' ? 'Deactivate' : 'Activate'} category ${cat.name}`}
                onClick={() => onToggleStatus(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  cat.status === 'Active'
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
                title="Historical ticket integrity preserved via soft status toggle"
              >
                {cat.status === 'Active' ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Info className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No categories found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No categories match your search terms or filter constraints. Try clearing filters or adding a new category.
          </p>
        </div>
      )}

      {/* Modal Dialog for Category Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingCategory ? 'Edit Category' : 'Create New Complaint Category'}
                  </h2>
                  <p className="text-xs text-slate-400">Configure category mappings, department assignments & SLA</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water & Leakage"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide scope details for citizen and AI guidance..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Responsible Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Water & Sanitation Authority">Water & Sanitation Authority</option>
                    <option value="Department of Public Works">Department of Public Works</option>
                    <option value="Municipal Solid Waste Management">Municipal Solid Waste Management</option>
                    <option value="Electrical Engineering & Utilities">Electrical Engineering & Utilities</option>
                    <option value="Urban Drainage Division">Urban Drainage Division</option>
                    <option value="Parks & Horticulture Department">Parks & Horticulture Department</option>
                    <option value="Public Safety & Emergency Operations">Public Safety & Emergency Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Priority & SLA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Default Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as CivicPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Default SLA (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={formSLAHours}
                    onChange={(e) => setFormSLAHours(parseInt(e.target.value) || 24)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Subcategories Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Subcategories Management
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Pipe Burst, No Water Supply..."
                    value={newSubcategoryInput}
                    onChange={(e) => setNewSubcategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formSubcategories.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-xs"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(sub)}
                        className="text-purple-400 hover:text-red-400 cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formSubcategories.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No subcategories added yet</span>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
