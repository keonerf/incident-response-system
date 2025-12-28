import { Incident, Report, ReportSubmission, IncidentCategory, ResolutionTag, PriorityTag, VerificationState } from '@/types/incident';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Backend response types (what we receive from the API)
interface BackendIncident {
  id: number;
  category: string;
  latitude: number;
  longitude: number;
  location_label: string | null;
  resolution_status: string;
  priority_label: string;
  priority_score: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  reports?: BackendReport[];
}

interface BackendReport {
  id: number;
  incident_id: number | null;
  category: string;
  description: string;
  reported_time: string;
  submission_time: string;
  reported_lat: number;
  reported_lng: number;
  device_lat: number | null;
  device_lng: number | null;
  evidence_path: string | null;
  trust_score: number;
  verification_state: string;
  created_at: string;
}

// Transform backend incident to frontend format
function transformIncident(backendIncident: BackendIncident): Incident {
  const reports = backendIncident.reports || [];
  const verifiedReports = reports.filter(r => r.verification_state === 'Verified');
  
  return {
    incident_id: `INC-${String(backendIncident.id).padStart(5, '0')}`,
    category: backendIncident.category as IncidentCategory,
    latitude: backendIncident.latitude,
    longitude: backendIncident.longitude,
    location_label: backendIncident.location_label || 'Unknown Location',
    reported_time: backendIncident.created_at, // Use created_at as reported_time
    created_at: backendIncident.created_at,
    updated_at: backendIncident.updated_at,
    resolution_tag: (backendIncident.resolution_status === 'Resolved' ? 'Resolved' : 'Unresolved') as ResolutionTag,
    priority_tag: backendIncident.priority_label as PriorityTag,
    priority_score: backendIncident.priority_score,
    confidence_score: backendIncident.confidence_score,
    report_count: reports.length,
    has_verified_report: verifiedReports.length > 0,
  };
}

// Transform backend report to frontend format
function transformReport(backendReport: BackendReport): Report {
  return {
    report_id: `RPT-${String(backendReport.id).padStart(5, '0')}`,
    incident_id: backendReport.incident_id ? `INC-${String(backendReport.incident_id).padStart(5, '0')}` : null,
    category: backendReport.category as IncidentCategory,
    description: backendReport.description,
    reported_time: backendReport.reported_time,
    submission_timestamp: backendReport.submission_time,
    trust_score: backendReport.trust_score,
    similarity_score: undefined, // Backend doesn't provide this in the model
    verification_state: backendReport.verification_state as VerificationState,
    evidence_urls: backendReport.evidence_path ? [backendReport.evidence_path] : [],
  };
}

// API Client Functions
export const api = {
  // Public endpoints
  async submitReport(submission: ReportSubmission): Promise<{ report_id: string; trust_score: number; verification_state: VerificationState; incident_id: string | null }> {
    const response = await fetch(`${API_BASE_URL}/api/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: submission.category,
        description: submission.description || '',
        reported_lat: submission.latitude,
        reported_lng: submission.longitude,
        device_lat: submission.latitude, // Use same as reported for now
        device_lng: submission.longitude,
        location_label: submission.location_label,
        reported_time: submission.reported_time,
        evidence_path: null, // File upload not implemented yet
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to submit report' }));
      throw new Error(error.error || 'Failed to submit report');
    }

    const data = await response.json();
    // Backend returns integer IDs, transform to string format
    const reportIdNum = typeof data.report_id === 'number' ? data.report_id : parseInt(data.report_id);
    const incidentIdNum = data.incident_id ? (typeof data.incident_id === 'number' ? data.incident_id : parseInt(data.incident_id)) : null;
    
    return {
      report_id: `RPT-${String(reportIdNum).padStart(5, '0')}`,
      trust_score: data.trust_score,
      verification_state: data.verification_state as VerificationState,
      incident_id: incidentIdNum ? `INC-${String(incidentIdNum).padStart(5, '0')}` : null,
    };
  },

  async getReportStatus(reportId: string): Promise<Report> {
    // Extract numeric ID from format like "RPT-00001"
    const numericId = parseInt(reportId.replace(/^RPT-/, ''));
    
    const response = await fetch(`${API_BASE_URL}/api/report/status/${numericId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch report status');
    }

    const data: BackendReport = await response.json();
    return transformReport(data);
  },

  async getPublicIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/api/incidents/public`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public incidents');
    }

    const data: { incidents: BackendIncident[] } = await response.json();
    return data.incidents.map(transformIncident);
  },

  // Admin endpoints
  async adminLogin(username: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || 'Login failed');
    }

    return await response.json();
  },

  async getAdminIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/incidents`, {
      method: 'GET',
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch incidents');
    }

    const data: { incidents: BackendIncident[] } = await response.json();
    return data.incidents.map(transformIncident);
  },

  async getFlaggedReports(): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/reports/flagged`, {
      method: 'GET',
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch flagged reports');
    }

    const data: { reports: BackendReport[] } = await response.json();
    return data.reports.map(transformReport);
  },

  async approveReport(reportId: string): Promise<Report> {
    const numericId = parseInt(reportId.replace(/^RPT-/, ''));
    
    const response = await fetch(`${API_BASE_URL}/api/admin/report/${numericId}/approve`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to approve report');
    }

    const data: { report: BackendReport } = await response.json();
    return transformReport(data.report);
  },

  async rejectReport(reportId: string): Promise<Report> {
    const numericId = parseInt(reportId.replace(/^RPT-/, ''));
    
    const response = await fetch(`${API_BASE_URL}/api/admin/report/${numericId}/reject`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to reject report');
    }

    const data: { report: BackendReport } = await response.json();
    return transformReport(data.report);
  },

  async resolveIncident(incidentId: string, resolutionStatus: ResolutionTag): Promise<Incident> {
    const numericId = parseInt(incidentId.replace(/^INC-/, ''));
    
    const response = await fetch(`${API_BASE_URL}/api/admin/incident/${numericId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        resolution_status: resolutionStatus === 'Resolved' ? 'Resolved' : 'Unresolved',
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to resolve incident');
    }

    const data: { incident: BackendIncident } = await response.json();
    return transformIncident(data.incident);
  },
};

// Helper to transform WebSocket event data
export function transformWebSocketIncident(data: BackendIncident): Incident {
  return transformIncident(data);
}

export function transformWebSocketReport(data: BackendReport | any): Report {
  // Handle case where WebSocket might send different format
  if (data.id && typeof data.id === 'number') {
    return transformReport(data as BackendReport);
  }
  // If already transformed or different format, try to handle it
  return data as Report;
}

