export type IncidentCategory = 
  | 'Sexual Assault'
  | 'Bomb Threat'
  | 'Fire / Explosion'
  | 'Accident'
  | 'Theft';

export type ResolutionTag = 'Resolved' | 'Unresolved';

export type PriorityTag = 'Critical' | 'High' | 'Medium' | 'Low';

export type VerificationState = 
  | 'Unverified'
  | 'Verified'
  | 'Flagged for Admin Review'
  | 'Not Verified';

export interface Incident {
  incident_id: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  location_label: string;
  reported_time: string;
  created_at: string;
  updated_at: string;
  resolution_tag: ResolutionTag;
  priority_tag: PriorityTag;
  priority_score: number;
  confidence_score: number;
  report_count: number;
  has_verified_report: boolean;
}

export interface Report {
  report_id: string;
  incident_id: string | null;
  category: IncidentCategory;
  description: string;
  reported_time: string;
  submission_timestamp: string;
  trust_score: number;
  similarity_score: number;
  verification_state: VerificationState;
  evidence_urls: string[];
}

export interface ReportSubmission {
  category: IncidentCategory;
  description?: string;
  latitude: number;
  longitude: number;
  location_label?: string;
  reported_time: string;
  evidence?: File;
}

export interface SimilarityCandidate {
  incident: Incident;
  similarity_score: number;
}

export type WebSocketEvent = 
  | 'INCIDENT_CREATED'
  | 'INCIDENT_UPDATED'
  | 'INCIDENT_RESOLVED'
  | 'REPORT_VERIFICATION_UPDATED';

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: Incident | Report;
}
