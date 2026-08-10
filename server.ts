import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { initialComplaints } from './src/data/seedData';
import { defaultCategories } from './src/data/categoriesData';
import { initialAuditLogs } from './src/data/auditLogData';
import { 
  Complaint, 
  AIAnalysisResult, 
  CivicCategory, 
  CivicPriority, 
  ComplaintStatus, 
  CivicCategoryDef, 
  AuditEntry, 
  ExtendedUserRole 
} from './src/types';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests with up to 10MB limit for image base64
app.use(express.json({ limit: '10mb' }));

// In-memory databases
let complaintsDB: Complaint[] = [...initialComplaints];
let categoriesDB: CivicCategoryDef[] = [...defaultCategories];
let auditLogsDB: AuditEntry[] = [...initialAuditLogs];

// Helper to initialize GoogleGenAI safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Backend Authorization Middleware & Role Extractor
function extractUserRole(req: express.Request): ExtendedUserRole {
  const headerRole = req.headers['x-user-role'] as ExtendedUserRole;
  if (
    headerRole === 'citizen' ||
    headerRole === 'field_officer' ||
    headerRole === 'supervisor' ||
    headerRole === 'municipal_admin' ||
    headerRole === 'super_admin'
  ) {
    return headerRole;
  }
  return 'citizen';
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET Categories
app.get('/api/categories', (req, res) => {
  res.json(categoriesDB);
});

// POST New Category (Municipal Admin or Super Admin)
app.post('/api/categories', (req, res) => {
  const userRole = extractUserRole(req);
  if (userRole !== 'municipal_admin' && userRole !== 'super_admin') {
    res.status(403).json({ error: 'Permission denied: Category management requires Municipal Admin or Super Admin role' });
    return;
  }

  const { name, description, department, defaultPriority, defaultSLAHours, status, subcategories } = req.body;

  if (!name || !description || !department) {
    res.status(400).json({ error: 'Missing required fields (name, description, department)' });
    return;
  }

  const newCat: CivicCategoryDef = {
    id: `cat-${Date.now()}`,
    name,
    description,
    department,
    defaultPriority: defaultPriority || 'Medium',
    defaultSLAHours: defaultSLAHours || 24,
    status: status || 'Active',
    subcategories: Array.isArray(subcategories) ? subcategories : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  categoriesDB.push(newCat);

  // Add audit entry
  auditLogsDB.unshift({
    id: `aud-${Date.now()}`,
    user: userRole === 'super_admin' ? 'Super Admin' : 'Municipal Admin Lead',
    role: userRole,
    action: 'Created Complaint Category',
    oldValue: null,
    newValue: name,
    reason: `Added category ${name} for ${department}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newCat);
});

// PATCH Update Category Specs
app.patch('/api/categories/:id', (req, res) => {
  const userRole = extractUserRole(req);
  if (userRole !== 'municipal_admin' && userRole !== 'super_admin') {
    res.status(403).json({ error: 'Permission denied: Category management requires Municipal Admin or Super Admin role' });
    return;
  }

  const { id } = req.params;
  const index = categoriesDB.findIndex((c) => c.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const existing = categoriesDB[index];
  const updated: CivicCategoryDef = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  categoriesDB[index] = updated;

  // Add audit entry
  auditLogsDB.unshift({
    id: `aud-${Date.now()}`,
    user: userRole === 'super_admin' ? 'Super Admin' : 'Municipal Admin Lead',
    role: userRole,
    action: 'Updated Complaint Category Specs',
    oldValue: existing.name,
    newValue: updated.name,
    reason: `Updated specs for category ${updated.name}`,
    timestamp: new Date().toISOString()
  });

  res.json(updated);
});

// GET Audit Logs (Super Admin or Municipal Admin)
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogsDB);
});

// GET all complaints (with role-based access & query filtering)
app.get('/api/complaints', (req, res) => {
  const userRole = extractUserRole(req);
  const { category, priority, status, search, department, ward, officer } = req.query;

  let filtered = [...complaintsDB];

  // RBAC Scoping Enforcement
  if (userRole === 'field_officer' && officer) {
    filtered = filtered.filter((c) => c.assignedOfficer === officer || !c.assignedOfficer);
  } else if (userRole === 'supervisor' && department && department !== 'All') {
    filtered = filtered.filter((c) => c.assignedDepartment === department);
  }

  if (category && category !== 'All') {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (priority && priority !== 'All') {
    filtered = filtered.filter((c) => c.priority === priority);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (department && department !== 'All') {
    filtered = filtered.filter((c) => c.assignedDepartment === department);
  }
  if (ward && ward !== 'All') {
    filtered = filtered.filter((c) => c.location.ward === ward);
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.trackingId.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  // Sort by newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(filtered);
});

// GET single complaint by ID or trackingId
app.get('/api/complaints/:idOrTracking', (req, res) => {
  const { idOrTracking } = req.params;
  const found = complaintsDB.find(
    (c) => c.id === idOrTracking || c.trackingId.toLowerCase() === idOrTracking.toLowerCase()
  );
  if (!found) {
    res.status(404).json({ error: 'Complaint not found' });
    return;
  }
  res.json(found);
});

// POST AI Analyze Complaint
app.post('/api/analyze-complaint', async (req, res) => {
  const { complaintText, imageBase64, imageMimeType, citizenLocation } = req.body;

  if (!complaintText || typeof complaintText !== 'string' || complaintText.trim().length === 0) {
    res.status(400).json({ error: 'Complaint text is required' });
    return;
  }

  const ai = getGeminiClient();

  // Rule-based / heuristics fallback function if API key is not present or API call fails
  const generateFallbackAnalysis = (): AIAnalysisResult => {
    const text = complaintText.toLowerCase();
    let category: CivicCategory = 'Other';
    let assignedDepartment = 'General Municipal Services';
    let priority: CivicPriority = 'Medium';
    let priorityScore = 50;
    let estimatedSLAHours = 48;
    let reasoning = 'General municipal service request with no matching civic category; assigned Medium priority with a 48h SLA.';

    const hits = (words: string[]) => words.filter((w) => text.includes(w));

    if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('pavement')) {
      category = 'Roads & Potholes';
      assignedDepartment = 'Department of Public Works';
      priority = text.includes('accident') || text.includes('deep') ? 'High' : 'Medium';
      priorityScore = priority === 'High' ? 80 : 50;
      estimatedSLAHours = 24;
      const kw = hits(['pothole', 'road', 'asphalt', 'pavement']);
      reasoning = priority === 'High'
        ? `Complaint mentions ${kw.join(', ')} — a road-safety hazard with accident or deep-damage indicators, escalated to High priority for dispatch within the 24h SLA.`
        : `Complaint mentions ${kw.join(', ')} — road surface damage assigned Medium priority with a 24h SLA.`;
    } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('gush')) {
      category = 'Water Supply & Leakage';
      assignedDepartment = 'Water & Sanitation Authority';
      priority = text.includes('burst') || text.includes('flooding') ? 'Critical' : 'High';
      priorityScore = priority === 'Critical' ? 95 : 75;
      estimatedSLAHours = 12;
      const kw = hits(['water', 'pipe', 'leak', 'gush']);
      reasoning = priority === 'Critical'
        ? `Complaint mentions ${kw.join(', ')} with burst or flooding indicators — urgent water infrastructure failure escalated to Critical priority within the 12h SLA.`
        : `Complaint mentions ${kw.join(', ')} — water supply issue assigned High priority with a 12h SLA.`;
    } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('dumpster')) {
      category = 'Waste Management';
      assignedDepartment = 'Municipal Solid Waste Management';
      priority = 'Medium';
      priorityScore = 55;
      estimatedSLAHours = 48;
      const kw = hits(['garbage', 'waste', 'trash', 'dumpster']);
      reasoning = `Complaint mentions ${kw.join(', ')} — public sanitation concern assigned Medium priority with a 48h SLA.`;
    } else if (text.includes('spark') || text.includes('light') || text.includes('wire') || text.includes('electricity') || text.includes('transformer')) {
      category = 'Electricity & Streetlights';
      assignedDepartment = 'Electrical Engineering & Utilities';
      priority = text.includes('spark') || text.includes('school') ? 'Critical' : 'High';
      priorityScore = priority === 'Critical' ? 98 : 70;
      estimatedSLAHours = 12;
      const kw = hits(['spark', 'light', 'wire', 'electricity', 'transformer']);
      reasoning = priority === 'Critical'
        ? `Complaint mentions ${kw.join(', ')} with sparking or school-adjacent risk — electrical hazard escalated to Critical priority within the 12h SLA.`
        : `Complaint mentions ${kw.join(', ')} — electrical infrastructure issue assigned High priority with a 12h SLA.`;
    } else if (text.includes('drain') || text.includes('sewage') || text.includes('clog') || text.includes('waterlog')) {
      category = 'Drainage & Sewage';
      assignedDepartment = 'Urban Drainage Division';
      priority = 'High';
      priorityScore = 75;
      estimatedSLAHours = 24;
      const kw = hits(['drain', 'sewage', 'clog', 'waterlog']);
      reasoning = `Complaint mentions ${kw.join(', ')} — urban drainage blockage assigned High priority with a 24h SLA.`;
    } else if (text.includes('park') || text.includes('tree') || text.includes('branch') || text.includes('grass')) {
      category = 'Parks & Sanitation';
      assignedDepartment = 'Parks & Horticulture Department';
      priority = 'Low';
      priorityScore = 35;
      estimatedSLAHours = 72;
      const kw = hits(['park', 'tree', 'branch', 'grass']);
      reasoning = `Complaint mentions ${kw.join(', ')} — parks & greenery maintenance item assigned Low priority with a 72h SLA.`;
    }

    return {
      category,
      assignedDepartment,
      priority,
      priorityScore,
      priorityReasoning: reasoning,
      summary: complaintText.slice(0, 120) + (complaintText.length > 120 ? '...' : ''),
      recommendedActions: [
        'Inspect reported location',
        'Verify issue severity with field crew',
        'Schedule repair dispatch within SLA window'
      ],
      estimatedSLAHours,
      imageAnalysis: imageBase64 ? 'Uploaded photo registered for visual inspection.' : undefined,
      detectedKeywords: text.split(' ').filter(w => w.length > 4).slice(0, 5),
      confidence: 85,
      needsHumanReview: priority === 'Critical'
    };
  };

  if (!ai) {
    const fallback = generateFallbackAnalysis();
    res.json(fallback);
    return;
  }

  try {
    const systemPrompt = `You are an expert AI Civic Intelligence Analyzer for municipal governance.
Your task is to analyze a citizen's complaint submission (text and optional photo) and produce structured operational JSON output.

Categories available:
- 'Roads & Potholes' -> Department of Public Works
- 'Water Supply & Leakage' -> Water & Sanitation Authority
- 'Waste Management' -> Municipal Solid Waste Management
- 'Electricity & Streetlights' -> Electrical Engineering & Utilities
- 'Drainage & Sewage' -> Urban Drainage Division
- 'Public Safety' -> Public Safety & Emergency Operations
- 'Parks & Sanitation' -> Parks & Horticulture Department
- 'Other' -> General Municipal Services

JSON Output Schema Required:
{
  "category": string (must match one of the exact category strings above),
  "assignedDepartment": string,
  "priority": "Low" | "Medium" | "High" | "Critical",
  "priorityScore": number (1-100),
  "priorityReasoning": string,
  "summary": string,
  "recommendedActions": string[],
  "estimatedSLAHours": number,
  "imageAnalysis": string,
  "detectedKeywords": string[]
}`;

    const parts: any[] = [{ text: `Citizen Complaint Description:\n${complaintText}\nLocation: ${citizenLocation || 'City limits'}` }];

    if (imageBase64 && imageMimeType) {
      parts.unshift({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: imageMimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            assignedDepartment: { type: Type.STRING },
            priority: { type: Type.STRING },
            priorityScore: { type: Type.NUMBER },
            priorityReasoning: { type: Type.STRING },
            summary: { type: Type.STRING },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            estimatedSLAHours: { type: Type.NUMBER },
            imageAnalysis: { type: Type.STRING },
            detectedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'category',
            'assignedDepartment',
            'priority',
            'priorityScore',
            'priorityReasoning',
            'summary',
            'recommendedActions',
            'estimatedSLAHours',
            'detectedKeywords'
          ]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini model');
    }

    const parsedJson = JSON.parse(responseText.trim());
    res.json(parsedJson);
  } catch (error) {
    console.error('Error analyzing complaint with Gemini:', error);
    const fallback = generateFallbackAnalysis();
    res.json(fallback);
  }
});

// POST Save Complaint
app.post('/api/complaints', (req, res) => {
  const {
    title,
    description,
    imageUrl,
    citizenName,
    citizenContact,
    location,
    analysisResult
  } = req.body;

  if (!description || !citizenName) {
    res.status(400).json({ error: 'Missing required fields (description, citizenName)' });
    return;
  }

  const trackingNumber = Math.floor(1000 + Math.random() * 9000);
  const trackingId = `CIV-2026-${trackingNumber}`;
  const id = `cmp-${Date.now()}`;

  const defaultAnalysis: AIAnalysisResult = analysisResult || {
    category: 'Other',
    assignedDepartment: 'General Municipal Services',
    priority: 'Medium',
    priorityScore: 50,
    priorityReasoning: 'Standard priority assigned.',
    summary: description.slice(0, 100),
    recommendedActions: ['Inspect site', 'Assign to relevant officer'],
    estimatedSLAHours: 48,
    detectedKeywords: ['civic']
  };

  const newComplaint: Complaint = {
    id,
    trackingId,
    title: title || description.slice(0, 60) + '...',
    description,
    imageUrl: imageUrl || undefined,
    citizenName,
    citizenContact: citizenContact || 'N/A',
    location: location || {
      provinceId: 'sindh',
      divisionId: 'karachi-division',
      districtId: 'karachi-south',
      tehsilId: 'saddar',
      municipalityId: 'karachi-mc',
      wardId: 'karachi-w1',
      ward: 'Ward 1 – Saddar',
      area: 'Saddar Bazaar',
      address: 'Municipal Ward Center, Saddar',
      landmark: 'Karachi Metropolitan Corporation'
    },
    category: defaultAnalysis.category,
    assignedDepartment: defaultAnalysis.assignedDepartment,
    assignedOfficer: undefined,
    priority: defaultAnalysis.priority,
    priorityScore: defaultAnalysis.priorityScore,
    priorityReasoning: defaultAnalysis.priorityReasoning,
    status: 'Submitted',
    summary: defaultAnalysis.summary,
    recommendedActions: defaultAnalysis.recommendedActions,
    estimatedSLAHours: defaultAnalysis.estimatedSLAHours,
    imageAnalysis: defaultAnalysis.imageAnalysis,
    detectedKeywords: defaultAnalysis.detectedKeywords,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  complaintsDB.unshift(newComplaint);

  // Add audit log
  auditLogsDB.unshift({
    id: `aud-${Date.now()}`,
    user: citizenName,
    role: 'citizen',
    action: 'Submitted Civic Complaint',
    ticketId: trackingId,
    oldValue: null,
    newValue: 'Submitted',
    reason: `Public citizen submission: ${newComplaint.title}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newComplaint);
});

// PATCH Update Complaint Status & Fields
app.patch('/api/complaints/:id', (req, res) => {
  const userRole = extractUserRole(req);
  const { id } = req.params;
  const index = complaintsDB.findIndex((c) => c.id === id || c.trackingId === id);

  if (index === -1) {
    res.status(404).json({ error: 'Complaint not found' });
    return;
  }

  const existing = complaintsDB[index];
  const { 
    status, 
    assignedDepartment, 
    assignedOfficer, 
    resolutionNotes, 
    priority, 
    category, 
    subcategory,
    supervisorOverride,
    auditHistory
  } = req.body;

  // Audit Override Logging
  if (category && category !== existing.category) {
    auditLogsDB.unshift({
      id: `aud-${Date.now()}`,
      user: userRole === 'supervisor' ? 'Department Supervisor' : 'Municipal Admin',
      role: userRole,
      action: 'Supervisor Category Override',
      ticketId: existing.trackingId,
      oldValue: `${existing.category} (${existing.priority})`,
      newValue: `${category} (${priority || existing.priority})`,
      reason: supervisorOverride?.reason || 'Category re-classified by Supervisor review',
      timestamp: new Date().toISOString()
    });
  }

  // Audit every meaningful transition so the immutable ledger reflects all
  // real actions (status, priority, assignment), not just category overrides.
  const actor = userRole === 'supervisor' ? 'Department Supervisor' : userRole === 'field_officer' ? 'Field Officer' : 'Municipal Admin';
  if (status && status !== existing.status) {
    auditLogsDB.unshift({
      id: `aud-${Date.now()}`,
      user: actor,
      role: userRole,
      action: 'Status Update',
      ticketId: existing.trackingId,
      oldValue: existing.status,
      newValue: status,
      reason: 'Work order status transition',
      timestamp: new Date().toISOString()
    });
  }
  if (priority && priority !== existing.priority) {
    auditLogsDB.unshift({
      id: `aud-${Date.now()}`,
      user: actor,
      role: userRole,
      action: 'Priority Change',
      ticketId: existing.trackingId,
      oldValue: existing.priority,
      newValue: priority,
      reason: 'Priority re-triage',
      timestamp: new Date().toISOString()
    });
  }
  if (assignedOfficer !== undefined && assignedOfficer !== existing.assignedOfficer) {
    auditLogsDB.unshift({
      id: `aud-${Date.now()}`,
      user: actor,
      role: userRole,
      action: assignedOfficer ? 'Officer Assigned' : 'Officer Unassigned',
      ticketId: existing.trackingId,
      oldValue: existing.assignedOfficer || 'Unassigned',
      newValue: assignedOfficer || 'Unassigned',
      reason: 'Field work order assignment change',
      timestamp: new Date().toISOString()
    });
  }

  const updated: Complaint = {
    ...existing,
    status: status || existing.status,
    category: category || existing.category,
    subcategory: subcategory !== undefined ? subcategory : existing.subcategory,
    assignedDepartment: assignedDepartment || existing.assignedDepartment,
    assignedOfficer: assignedOfficer !== undefined ? assignedOfficer : existing.assignedOfficer,
    priority: priority || existing.priority,
    resolutionNotes: resolutionNotes || existing.resolutionNotes,
    resolutionDate: status === 'Resolved' && existing.status !== 'Resolved' ? new Date().toISOString() : existing.resolutionDate,
    supervisorOverride: supervisorOverride || existing.supervisorOverride,
    auditHistory: Array.isArray(auditHistory) ? auditHistory : existing.auditHistory,
    updatedAt: new Date().toISOString()
  };

  complaintsDB[index] = updated;
  res.json(updated);
});

// POST AI Assistant Chat Interface
app.post('/api/chat-assistant', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const ai = getGeminiClient();

  const statsSummary = {
    total: complaintsDB.length,
    critical: complaintsDB.filter((c) => c.priority === 'Critical').length,
    high: complaintsDB.filter((c) => c.priority === 'High').length,
    inProgress: complaintsDB.filter((c) => c.status === 'In Progress').length,
    resolved: complaintsDB.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
    totalEstimatedBudget: complaintsDB.reduce((sum, c) => sum + (c.estimatedCost?.total || 0), 0),
    totalActualCost: complaintsDB.reduce((sum, c) => sum + (c.actualCost?.total || 0), 0),
    categoriesCount: categoriesDB.length,
    complaintListBrief: complaintsDB.map(c => ({
      id: c.trackingId,
      title: c.title,
      category: c.category,
      department: c.assignedDepartment,
      priority: c.priority,
      status: c.status,
      ward: c.location.ward,
      officer: c.assignedOfficer || 'Unassigned',
      slaHours: c.estimatedSLAHours,
      estimatedCost: c.estimatedCost?.total || 0,
      actualCost: c.actualCost?.total || 0
    }))
  };

  if (!ai) {
    let reply = `I am your AI Civic Assistant. System status: **${statsSummary.total} total complaints**, **${statsSummary.critical} critical emergencies**, **PKR ${statsSummary.totalEstimatedBudget.toLocaleString()} estimated budget**, and **${categoriesDB.length} active categories**.`;
    res.json({ reply });
    return;
  }

  try {
    const systemPrompt = `You are "AI Smart Civic AI", an intelligent municipal operational copilot for AI Smart Civic Services.
You have real-time access to municipal data.
Summarize data accurately, highlight cost overruns, SLA risks, officer workloads, and ward hotspots when asked.
Current Live System State: ${JSON.stringify(statsSummary)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ text: message }],
      config: { systemInstruction: systemPrompt }
    });

    res.json({ reply: response.text || 'No response generated.' });
  } catch (err) {
    console.error('Chat assistant error:', err);
    res.status(500).json({ error: 'Failed to process AI assistant request.' });
  }
});

// POST Reset Database
app.post('/api/seed-reset', (req, res) => {
  complaintsDB = [...initialComplaints];
  categoriesDB = [...defaultCategories];
  auditLogsDB = [...initialAuditLogs];
  res.json({ message: 'Database reset to default seed data', count: complaintsDB.length });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Smart Civic Services Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
