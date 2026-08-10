import React, { useState } from 'react';
import { 
  Send, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Building2, 
  FileSearch,
  Check,
  RefreshCw,
  Camera,
  Layers,
  ArrowRight,
  RotateCcw,
  Star,
  MessageSquare
} from 'lucide-react';
import { Complaint, AIAnalysisResult, CivicPriority, CivicCategoryDef } from '../types';
import { LocationSelect } from './ui/LocationSelect';
import { DEFAULT_LOCATION, LocationSelection, buildLocation, locationSummary } from '../data/locations';

interface CitizenPortalProps {
  categories?: CivicCategoryDef[];
  onComplaintSubmitted: (complaint: Complaint) => void;
  onTrackLookup: (trackingId: string) => Promise<Complaint | null>;
  onUpdateComplaint?: (complaint: Complaint) => void;
}

// Quick presets for instant testing and demonstration
const PRESETS = [
  {
    title: 'Water Pipe Burst',
    category: 'Water & Leakage',
    subcategory: 'Pipe Burst',
    icon: '💧',
    desc: 'High pressure drinking water pipe burst flooding the main intersection. Clean water flowing into shops.',
    location: { ...DEFAULT_LOCATION, districtId: 'karachi-east', tehsilId: 'gulshan', municipalityId: 'karachi-mc-gulshan', wardId: 'karachi-w6', area: 'Gulshan-e-Iqbal Block 6' },
    address: 'Main University Road, near Civic Center',
    landmark: 'Near Civic Center',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Deep Road Pothole',
    category: 'Roads & Potholes',
    subcategory: 'Pothole',
    icon: '🕳️',
    desc: 'Deep 2-foot wide pothole on fast vehicle lane causing rim damage to passing cars and safety hazard.',
    location: { ...DEFAULT_LOCATION, districtId: 'karachi-east', tehsilId: 'gulberg', municipalityId: 'karachi-mc-gulberg', wardId: 'karachi-w8', area: 'Gulberg Chowrangi' },
    address: 'Shahrah-e-Faisal Service Road',
    landmark: 'Near Gulberg Chowrangi',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Overflowing Garbage Bin',
    category: 'Waste Management',
    subcategory: 'Garbage Overflow',
    icon: '🗑️',
    desc: 'Community garbage dumpster overflowing onto pedestrian sidewalk for past 3 days. Foul smell and strays.',
    location: { ...DEFAULT_LOCATION, districtId: 'karachi-central', tehsilId: 'north-nazimabad', municipalityId: 'karachi-mc-nn', wardId: 'karachi-w10', area: 'North Nazimabad Block B' },
    address: 'Behind Green Park Society, Block B',
    landmark: 'Opposite Firdous Bakery',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Sparking Transformer',
    category: 'Electricity',
    subcategory: 'Electrical Hazard',
    icon: '⚡',
    desc: 'Electrical transformer pole buzzing loudly and throwing sparks near residential apartments and dry trees.',
    location: { ...DEFAULT_LOCATION, districtId: 'karachi-south', tehsilId: 'saddar', municipalityId: 'karachi-mc', wardId: 'karachi-w1', area: 'Saddar Bazaar' },
    address: 'Shahrah-e-Liaquat, Saddar',
    landmark: 'Opposite St. Jude Primary School',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Clogged Storm Drain',
    category: 'Drainage',
    subcategory: 'Blocked Drain',
    icon: '🌊',
    desc: 'Heavy silt and plastic debris blocking stormwater drain grating. Rainwater standing 10 inches deep.',
    location: { ...DEFAULT_LOCATION, districtId: 'karachi-central', tehsilId: 'liaquatabad', municipalityId: 'karachi-mc-liaquatabad', wardId: 'karachi-w9', area: 'Liaquatabad No. 10' },
    address: 'Liaquatabad No. 10 main crossing',
    landmark: 'Near Nipa Chowrangi',
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800'
  }
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  categories,
  onComplaintSubmitted,
  onTrackLookup,
  onUpdateComplaint
}) => {
  const [subTab, setSubTab] = useState<'submit' | 'track'>('submit');

  // Form State
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('Zoya Khan');
  const [citizenContact, setCitizenContact] = useState('+92 300 3498201');
  const [location, setLocation] = useState<LocationSelection>({ ...DEFAULT_LOCATION });
  const [address, setAddress] = useState('Main University Road, near Civic Center');
  const [landmark, setLandmark] = useState('Near Civic Center');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  // Tracking State
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Citizen Feedback State
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  // Handle Preset Selection
  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDescription(preset.desc);
    setLocation({ ...preset.location });
    setAddress(preset.address);
    setLandmark(preset.landmark || '');
    setImagePreview(preset.image);
    setImageMime('image/jpeg');
    setAnalysisResult(null);
    setCreatedComplaint(null);
  };

  // Image File Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit and Analyze Complaint
  const handleAnalyzeAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCreatedComplaint(null);

    try {
      setAnalysisStep('Preprocessing description & location metadata...');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStep('Calling Gemini AI for Taxonomy, Priority & Vision Scan...');

      const locData = buildLocation(location, { address, landmark });

      const response = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintText: description,
          imageBase64: imagePreview,
          imageMimeType: imageMime || 'image/jpeg',
          citizenLocation: `${address}, ${locationSummary(locData)}`
        })
      });

      const aiData: AIAnalysisResult = await response.json();

      setAnalysisStep('Calculating SLA priority score & department routing...');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisResult(aiData);

      setAnalysisStep('Saving complaint record to Municipal Database...');

      const saveRes = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiData.summary || description.slice(0, 60),
          description,
          imageUrl: imagePreview || undefined,
          citizenName,
          citizenContact,
          location: locData,
          analysisResult: aiData
        })
      });

      const newCmp: Complaint = await saveRes.json();
      setCreatedComplaint(newCmp);
      onComplaintSubmitted(newCmp);
    } catch (err) {
      console.error('Error during analysis & submit:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Handle Track Search
  const handleSearchTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackedComplaint(null);

    const found = await onTrackLookup(searchTrackingId.trim());
    setIsTracking(false);

    if (found) {
      setTrackedComplaint(found);
    } else {
      setTrackError(`No complaint found matching tracking ID or phone "${searchTrackingId}". Please verify and try again.`);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = () => {
    if (!trackedComplaint || !onUpdateComplaint) return;

    const updated: Complaint = {
      ...trackedComplaint,
      citizenFeedback: {
        rating: feedbackRating,
        comment: feedbackComment || undefined,
        submittedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaint(updated);
    setTrackedComplaint(updated);
  };

  // Reopen Complaint
  const handleReopenComplaint = () => {
    if (!trackedComplaint || !onUpdateComplaint || !reopenReason.trim()) return;

    const auditEntry = {
      id: `aud-${Date.now()}`,
      user: trackedComplaint.citizenName,
      role: 'citizen' as const,
      action: 'Reopened Complaint',
      ticketId: trackedComplaint.trackingId,
      oldValue: trackedComplaint.status,
      newValue: 'Reopened',
      reason: reopenReason,
      timestamp: new Date().toISOString()
    };

    const updated: Complaint = {
      ...trackedComplaint,
      status: 'Reopened',
      auditHistory: [auditEntry, ...(trackedComplaint.auditHistory || [])],
      updatedAt: new Date().toISOString()
    };

    onUpdateComplaint(updated);
    setTrackedComplaint(updated);
    setShowReopenModal(false);
    setReopenReason('');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Sub Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Citizen Public Portal</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full">
              AI Powered
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Submit local infrastructure complaints, track ticket status, give feedback, or reopen unresolved issues.
          </p>
        </div>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Citizen Portal Actions" className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'submit'}
            aria-label="Report a Civic Issue"
            onClick={() => setSubTab('submit')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              subTab === 'submit'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Report an Issue</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'track'}
            aria-label="Track My Ticket Status"
            onClick={() => setSubTab('track')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              subTab === 'track'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Track My Ticket</span>
          </button>
        </div>
      </div>

      {/* SUBMIT COMPLAINT FORM */}
      {subTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Submission Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Presets Carousel / Bar */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Quick Sample Civic Issues (Click to populate)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Apply sample issue preset: ${p.title} (${p.category})`}
                    onClick={() => applyPreset(p)}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{p.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Complaint Form */}
            <form onSubmit={handleAnalyzeAndSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Submit Complaint</span>
              </h2>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Problem Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue clearly (e.g. Water pipe burst near Gate 3, deep road pothole on 4th st, overflowing garbage dumpster)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Tip: Our Gemini AI engine parses your text to detect category, department, priority, and generate an operational summary.
                </p>
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Photo / Image Proof (Optional)</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-normal">
                    <Camera className="w-3 h-3" /> AI Vision Enabled
                  </span>
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group h-44">
                    <img
                      src={imagePreview}
                      alt="Complaint Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageMime(null);
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow hover:bg-red-500 cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950 hover:bg-slate-900/50 rounded-xl cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs text-slate-300 font-medium">Click or Drag photo here</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Structured Location (Pakistan administrative hierarchy — no maps) */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Location <span className="text-[10px] font-normal normal-case text-slate-500">Province → Ward</span>
                </label>
                <LocationSelect value={location} onChange={setLocation} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 102 Main University Road"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Landmark (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near Civic Center"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Phone / Contact
                  </label>
                  <input
                    type="text"
                    value={citizenContact}
                    onChange={(e) => setCitizenContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing || !description.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Submit & Process with AI Engine</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: AI Realtime Pipeline & Output Preview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AI Loading State Panel */}
            {isAnalyzing && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/40 shadow-xl space-y-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Classification Active</h3>
                    <p className="text-xs text-emerald-400">Gemini 3.6 Flash Engine</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>{analysisStep}</span>
                </div>
              </div>
            )}

            {/* AI Result Card */}
            {analysisResult && createdComplaint && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-6 transition-all animate-fadeIn">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                        Ticket Registered
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {createdComplaint.trackingId}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg">
                    {createdComplaint.status}
                  </span>
                </div>

                {/* AI Key Insights Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Category & Subcategory</span>
                    <div className="text-xs font-semibold text-emerald-300 truncate">
                      {analysisResult.category} {analysisResult.subcategory ? `• ${analysisResult.subcategory}` : ''}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">AI Priority & Confidence</span>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md ${getPriorityBadgeClass(analysisResult.priority)}`}>
                        {analysisResult.priority}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{analysisResult.confidence}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Automated Dept Routing</span>
                    <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{analysisResult.assignedDepartment}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target SLA Commitment</span>
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{analysisResult.estimatedSLAHours} Hours SLA Window</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-orange-400" />
                    AI Reasoning
                  </span>
                  <p className="text-xs text-slate-300 italic">{analysisResult.priorityReasoning}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTrackingId(createdComplaint.trackingId);
                    setTrackedComplaint(createdComplaint);
                    setSubTab('track');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Track Live Ticket Status</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            )}

            {!isAnalyzing && !analysisResult && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Citizen Self-Service & Rights</span>
                </h3>
                <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <p>
                    <strong className="text-slate-200">1. Instant AI Classification:</strong> Your complaint is scanned using Gemini AI for category, priority, and department assignment.
                  </p>
                  <p>
                    <strong className="text-slate-200">2. Guaranteed SLA:</strong> Each issue is bound to an SLA target countdown.
                  </p>
                  <p>
                    <strong className="text-slate-200">3. Reopen Capability:</strong> If an issue is marked resolved but work is unsatisfactory, you can reopen the ticket with notes.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TRACK COMPLAINT TAB */}
      {subTab === 'track' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-emerald-400" />
              <span>Track Ticket Status by Tracking ID</span>
            </h2>
            <form onSubmit={handleSearchTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTrackingId}
                  onChange={(e) => setSearchTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. CIV-2026-8091)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isTracking}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Track</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-slate-400">
              <span>Try sample IDs:</span>
              <button
                type="button"
                onClick={() => setSearchTrackingId('CIV-2026-8091')}
                className="text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
              >
                CIV-2026-8091
              </button>
              <button
                type="button"
                onClick={() => setSearchTrackingId('CIV-2026-8095')}
                className="text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
              >
                CIV-2026-8095 (Resolved)
              </button>
            </div>
          </div>

          {trackError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{trackError}</span>
            </div>
          )}

          {/* Tracked Complaint Card */}
          {trackedComplaint && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {trackedComplaint.trackingId}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md ${getPriorityBadgeClass(trackedComplaint.priority)}`}>
                      {trackedComplaint.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{trackedComplaint.title}</h3>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold self-start sm:self-auto">
                  Status: {trackedComplaint.status}
                </div>
              </div>

              {/* Status Timeline Workflow */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Service Progress Timeline
                </span>
                <div className="grid grid-cols-5 gap-1 pt-2">
                  {[
                    'Submitted',
                    'Under Review',
                    'Assigned',
                    'In Progress',
                    'Resolved'
                  ].map((st, idx) => {
                    const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
                    const currentIdx = statuses.indexOf(trackedComplaint.status === 'Closed' || trackedComplaint.status === 'Reopened' ? 'Resolved' : trackedComplaint.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={st} className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] font-medium leading-tight ${isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category & Subcategory</span>
                  <span className="text-slate-200 font-medium">{trackedComplaint.category} {trackedComplaint.subcategory ? `(${trackedComplaint.subcategory})` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Department</span>
                  <span className="text-slate-200 font-medium">{trackedComplaint.assignedDepartment}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Field Officer</span>
                  <span className="text-slate-200 font-medium">{trackedComplaint.assignedOfficer || 'Pending Officer Assignment'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                  <span className="text-slate-200 font-medium">
                    {trackedComplaint.location.address}
                    {trackedComplaint.location.landmark ? ` · ${trackedComplaint.location.landmark}` : ''}
                    <span className="block text-[11px] text-slate-400">{locationSummary(trackedComplaint.location)}</span>
                  </span>
                </div>
              </div>

              {/* Citizen Feedback Section if Resolved / Closed */}
              {(trackedComplaint.status === 'Resolved' || trackedComplaint.status === 'Closed') && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Citizen Feedback & Quality Verification</span>
                  </h4>

                  {trackedComplaint.citizenFeedback ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        {Array.from({ length: trackedComplaint.citizenFeedback.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                        ))}
                        <span className="text-slate-200 ml-2">({trackedComplaint.citizenFeedback.rating} / 5 Stars)</span>
                      </div>
                      {trackedComplaint.citizenFeedback.comment && (
                        <p className="text-slate-300 italic">"{trackedComplaint.citizenFeedback.comment}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="text-xs text-slate-300 block">Rate the resolution quality:</span>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 text-slate-400 hover:text-yellow-400 cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add optional comment regarding resolution..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleSubmitFeedback}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}

                  {/* Reopen Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Is the issue still unresolved on ground?</span>
                    <button
                      type="button"
                      onClick={() => setShowReopenModal(true)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Complaint</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Reopen Complaint Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              <span>Reopen Complaint Ticket</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please state why the reported issue remains unresolved. This will alert the Supervisor and re-queue the work order.
            </p>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Water is still leaking from main pipe connection..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenComplaint}
                disabled={!reopenReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Confirm Reopen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
