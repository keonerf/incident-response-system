export const USE_MOCK_DATA = true;

import { Incident, Report, IncidentCategory, VerificationState, ResolutionTag, PriorityTag } from '@/types/incident';

const indianCities = [
  { lat: 28.6139, lng: 77.2090, label: 'Connaught Place, New Delhi' },
  { lat: 19.0760, lng: 72.8777, label: 'Bandra, Mumbai' },
  { lat: 12.9716, lng: 77.5946, label: 'MG Road, Bangalore' },
  { lat: 13.0827, lng: 80.2707, label: 'Marina Beach, Chennai' },
  { lat: 22.5726, lng: 88.3639, label: 'Park Street, Kolkata' },
  { lat: 17.3850, lng: 78.4867, label: 'Hitech City, Hyderabad' },
  { lat: 23.0225, lng: 72.5714, label: 'SG Highway, Ahmedabad' },
  { lat: 18.5204, lng: 73.8567, label: 'Koregaon Park, Pune' },
  { lat: 26.9124, lng: 75.7873, label: 'MI Road, Jaipur' },
  { lat: 26.8467, lng: 80.9462, label: 'Hazratganj, Lucknow' },
  { lat: 21.1702, lng: 72.8311, label: 'Dumas Road, Surat' },
  { lat: 23.2599, lng: 77.4126, label: 'New Market, Bhopal' },
  { lat: 22.7196, lng: 75.8577, label: 'Palasia, Indore' },
  { lat: 30.7333, lng: 76.7794, label: 'Sector 17, Chandigarh' },
  { lat: 25.3176, lng: 82.9739, label: 'Assi Ghat, Varanasi' },
  { lat: 9.9312, lng: 76.2673, label: 'Marine Drive, Kochi' },
  { lat: 15.2993, lng: 74.1240, label: 'Panjim, Goa' },
  { lat: 11.0168, lng: 76.9558, label: 'RS Puram, Coimbatore' },
  { lat: 17.6868, lng: 83.2185, label: 'RK Beach, Visakhapatnam' },
  { lat: 31.6340, lng: 74.8723, label: 'Mall Road, Amritsar' },
];

const categories: IncidentCategory[] = [
  'Sexual Assault',
  'Bomb Threat',
  'Fire / Explosion',
  'Accident',
  'Theft',
];

const priorityTags: PriorityTag[] = ['Critical', 'High', 'Medium', 'Low'];
const verificationStates: VerificationState[] = ['Verified', 'Flagged for Admin Review', 'Unverified', 'Not Verified'];

function generateIncidentId(index: number): string {
  return `INC-${String(index).padStart(5, '0')}`;
}

function generateReportId(index: number): string {
  return `RPT-${String(index).padStart(5, '0')}`;
}

function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

function getPriorityScore(priority: PriorityTag): number {
  switch (priority) {
    case 'Critical': return 90 + Math.random() * 10;
    case 'High': return 70 + Math.random() * 20;
    case 'Medium': return 40 + Math.random() * 30;
    case 'Low': return 10 + Math.random() * 30;
  }
}

function getDescriptionForCategory(category: IncidentCategory): string {
  const descriptions: Record<IncidentCategory, string[]> = {
    'Sexual Assault': [
      'Harassment incident reported in the area. Victim has provided detailed account.',
      'Inappropriate behavior witnessed near the public transport station.',
      'Eve teasing reported near the market area. Multiple witnesses present.',
      'Stalking incident reported by a student returning from college.',
    ],
    'Bomb Threat': [
      'Suspicious package found near the entrance. Area has been cordoned off.',
      'Anonymous threat received. Security protocols initiated.',
      'Unattended bag discovered in the metro station. Bomb squad alerted.',
      'Threatening message received via email. Building evacuated.',
    ],
    'Fire / Explosion': [
      'Smoke visible from the building. Fire department has been notified.',
      'Small explosion heard in the vicinity. Cause under investigation.',
      'Gas leak reported in residential area. Evacuation in progress.',
      'Electrical fire broke out in the commercial complex.',
    ],
    'Accident': [
      'Multi-vehicle collision on the highway. Emergency services responding.',
      'Pedestrian injured in traffic incident. Ambulance dispatched.',
      'Construction accident reported. Worker injured.',
      'Bus overturned on the highway. Multiple casualties reported.',
    ],
    'Theft': [
      'Pickpocketing incident reported. Suspect description available.',
      'Vehicle break-in observed in the parking area. CCTV footage being reviewed.',
      'Chain snatching incident near the temple. Two suspects on bike.',
      'ATM robbery attempted. Security guards overpowered.',
    ],
  };
  
  const options = descriptions[category];
  return options[Math.floor(Math.random() * options.length)];
}

export const mockIncidents: Incident[] = [];
export const mockReports: Report[] = [];

let incidentIndex = 1;
let reportIndex = 1;

// Generate 20 incidents with 3-4 reports each
for (let i = 0; i < 20; i++) {
  const cityIndex = i % indianCities.length;
  const city = indianCities[cityIndex];
  const category = categories[i % categories.length];
  const isResolved = Math.random() > 0.65;
  const priority = priorityTags[Math.floor(Math.random() * priorityTags.length)];
  const priorityScore = getPriorityScore(priority);
  const confidenceScore = 50 + Math.random() * 50;
  const reportCount = 2 + Math.floor(Math.random() * 3);
  
  const incident: Incident = {
    incident_id: generateIncidentId(incidentIndex),
    category,
    latitude: city.lat + (Math.random() - 0.5) * 0.02,
    longitude: city.lng + (Math.random() - 0.5) * 0.02,
    location_label: city.label,
    reported_time: getRandomDate(14),
    created_at: getRandomDate(14),
    updated_at: getRandomDate(5),
    resolution_tag: isResolved ? 'Resolved' : 'Unresolved',
    priority_tag: priority,
    priority_score: Math.round(priorityScore * 100) / 100,
    confidence_score: Math.round(confidenceScore * 100) / 100,
    report_count: reportCount,
    has_verified_report: true,
  };
  
  mockIncidents.push(incident);
  
  for (let r = 0; r < reportCount; r++) {
    const verificationState = r === 0 
      ? 'Verified' 
      : verificationStates[Math.floor(Math.random() * verificationStates.length)];
    
    const report: Report = {
      report_id: generateReportId(reportIndex),
      incident_id: incident.incident_id,
      category,
      description: getDescriptionForCategory(category),
      reported_time: incident.reported_time,
      submission_timestamp: getRandomDate(14),
      trust_score: Math.round((30 + Math.random() * 70) * 100) / 100,
      verification_state: verificationState,
      similarity_score: r === 0 ? undefined : Math.round((60 + Math.random() * 40) * 100) / 100,
      evidence_urls: Math.random() > 0.4 ? ['https://placehold.co/400x300/1a1a2e/gray?text=Evidence+' + reportIndex] : [],
    };
    
    mockReports.push(report);
    reportIndex++;
  }
  
  incidentIndex++;
}

// Generate additional flagged reports without incidents (for similarity matching)
for (let i = 0; i < 8; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const report: Report = {
    report_id: generateReportId(reportIndex++),
    incident_id: null,
    category,
    description: getDescriptionForCategory(category),
    reported_time: getRandomDate(3),
    submission_timestamp: getRandomDate(3),
    trust_score: Math.round((25 + Math.random() * 50) * 100) / 100,
    verification_state: 'Flagged for Admin Review',
    similarity_score: undefined,
    evidence_urls: Math.random() > 0.5 ? ['https://placehold.co/400x300/1a1a2e/gray?text=Flagged+Evidence'] : [],
  };
  mockReports.push(report);
}

// Generate verified reports without incidents (for similarity matching section)
for (let i = 0; i < 5; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const report: Report = {
    report_id: generateReportId(reportIndex++),
    incident_id: null,
    category,
    description: getDescriptionForCategory(category),
    reported_time: getRandomDate(2),
    submission_timestamp: getRandomDate(2),
    trust_score: Math.round((60 + Math.random() * 40) * 100) / 100,
    verification_state: 'Verified',
    similarity_score: undefined,
    evidence_urls: [],
  };
  mockReports.push(report);
}

// Mock responders data
export interface Responder {
  id: string;
  team_name: string;
  status: 'Available' | 'Responding' | 'Offline';
  latitude: number;
  longitude: number;
  location_label: string;
  assigned_incident_id: string | null;
  eta_minutes: number | null;
}

export const mockResponders: Responder[] = [
  {
    id: 'RSP-001',
    team_name: 'Alpha Response Unit',
    status: 'Responding',
    latitude: 28.6129,
    longitude: 77.2295,
    location_label: 'India Gate, Delhi',
    assigned_incident_id: 'INC-00001',
    eta_minutes: 8,
  },
  {
    id: 'RSP-002',
    team_name: 'Bravo Medical Team',
    status: 'Available',
    latitude: 19.0178,
    longitude: 72.8478,
    location_label: 'Worli, Mumbai',
    assigned_incident_id: null,
    eta_minutes: null,
  },
  {
    id: 'RSP-003',
    team_name: 'Charlie Fire Unit',
    status: 'Responding',
    latitude: 12.9352,
    longitude: 77.6245,
    location_label: 'Indiranagar, Bangalore',
    assigned_incident_id: 'INC-00003',
    eta_minutes: 12,
  },
  {
    id: 'RSP-004',
    team_name: 'Delta Police Patrol',
    status: 'Available',
    latitude: 17.4399,
    longitude: 78.4983,
    location_label: 'Secunderabad, Hyderabad',
    assigned_incident_id: null,
    eta_minutes: null,
  },
  {
    id: 'RSP-005',
    team_name: 'Echo Rapid Response',
    status: 'Offline',
    latitude: 22.5645,
    longitude: 88.3433,
    location_label: 'Salt Lake, Kolkata',
    assigned_incident_id: null,
    eta_minutes: null,
  },
  {
    id: 'RSP-006',
    team_name: 'Foxtrot Ambulance',
    status: 'Responding',
    latitude: 13.0524,
    longitude: 80.2509,
    location_label: 'T. Nagar, Chennai',
    assigned_incident_id: 'INC-00004',
    eta_minutes: 5,
  },
];

export function getMockIncidents(): Incident[] {
  return mockIncidents;
}

export function getMockReports(): Report[] {
  return mockReports;
}

export function getMockIncidentById(id: string): Incident | undefined {
  return mockIncidents.find(i => i.incident_id === id);
}

export function getMockReportsByIncidentId(incidentId: string): Report[] {
  return mockReports.filter(r => r.incident_id === incidentId);
}

export function getMockFlaggedReports(): Report[] {
  return mockReports.filter(r => r.verification_state === 'Flagged for Admin Review');
}

export function getMockPublicIncidents(): Incident[] {
  return mockIncidents.filter(i => i.has_verified_report);
}

export function getMockCandidateIncidents(reportId: string): { incident: Incident; similarity_score: number }[] {
  const report = mockReports.find(r => r.report_id === reportId);
  if (!report) return [];
  
  const sameCategory = mockIncidents.filter(i => i.category === report.category);
  const otherCategory = mockIncidents.filter(i => i.category !== report.category);
  
  const candidates = [
    ...sameCategory.slice(0, 3).map(incident => ({
      incident,
      similarity_score: Math.round((75 + Math.random() * 25) * 100) / 100,
    })),
    ...otherCategory.slice(0, 2).map(incident => ({
      incident,
      similarity_score: Math.round((30 + Math.random() * 30) * 100) / 100,
    })),
  ];
  
  return candidates.sort((a, b) => b.similarity_score - a.similarity_score);
}

export function getMockResponders(): Responder[] {
  return mockResponders;
}

export const MOCK_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};