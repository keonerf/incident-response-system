import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Incident, Report, WebSocketEvent } from '@/types/incident';
import { 
  USE_MOCK_DATA, 
  getMockIncidents, 
  getMockReports, 
  getMockPublicIncidents,
  getMockReportsByIncidentId,
  getMockFlaggedReports,
  getMockIncidentById
} from '@/lib/mockData';
import { api, transformWebSocketIncident, transformWebSocketReport } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

interface IncidentContextType {
  incidents: Map<string, Incident>;
  reports: Map<string, Report>;
  isConnected: boolean;
  fetchIncidents: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchPublicIncidents: () => Promise<void>;
  getPublicIncidents: () => Incident[];
  getIncidentById: (id: string) => Incident | undefined;
  getReportsByIncidentId: (incidentId: string) => Report[];
  getFlaggedReports: () => Report[];
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Map<string, Incident>>(new Map());
  const [reports, setReports] = useState<Map<string, Report>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (USE_MOCK_DATA) {
      const data = getMockIncidents();
      const newMap = new Map<string, Incident>();
      data.forEach(incident => newMap.set(incident.incident_id, incident));
      setIncidents(newMap);
      return;
    }
    
    try {
      // For admin dashboard, fetch all incidents
      // For public dashboard, use getPublicIncidents which calls the public endpoint
      const data = await api.getAdminIncidents();
      const newMap = new Map<string, Incident>();
      data.forEach(incident => newMap.set(incident.incident_id, incident));
      setIncidents(newMap);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      // If unauthorized, might be public user - try public endpoint
      try {
        const data = await api.getPublicIncidents();
        const newMap = new Map<string, Incident>();
        data.forEach(incident => newMap.set(incident.incident_id, incident));
        setIncidents(newMap);
      } catch (publicError) {
        console.error('Failed to fetch public incidents:', publicError);
      }
    }
  }, []);

  const fetchReports = useCallback(async () => {
    if (USE_MOCK_DATA) {
      const data = getMockReports();
      const newMap = new Map<string, Report>();
      data.forEach(report => newMap.set(report.report_id, report));
      setReports(newMap);
      return;
    }
    
    try {
      // Fetch flagged reports (admin only)
      const flaggedData = await api.getFlaggedReports();
      const newMap = new Map<string, Report>();
      flaggedData.forEach(report => newMap.set(report.report_id, report));
      setReports(newMap);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      // If unauthorized, user might not be admin - that's okay
    }
  }, []);

  const fetchPublicIncidents = useCallback(async () => {
    if (USE_MOCK_DATA) {
      const data = getMockPublicIncidents();
      const newMap = new Map<string, Incident>();
      data.forEach(incident => newMap.set(incident.incident_id, incident));
      setIncidents(newMap);
      return;
    }
    
    try {
      const data = await api.getPublicIncidents();
      const newMap = new Map<string, Incident>();
      data.forEach(incident => newMap.set(incident.incident_id, incident));
      setIncidents(newMap);
    } catch (error) {
      console.error('Failed to fetch public incidents:', error);
    }
  }, []);

  const getPublicIncidents = useCallback(() => {
    return Array.from(incidents.values()).filter(i => i.has_verified_report);
  }, [incidents]);

  const getIncidentById = useCallback((id: string) => {
    return incidents.get(id);
  }, [incidents]);

  const getReportsByIncidentId = useCallback((incidentId: string) => {
    return Array.from(reports.values()).filter(r => r.incident_id === incidentId);
  }, [reports]);

  const getFlaggedReports = useCallback(() => {
    return Array.from(reports.values()).filter(
      r => r.verification_state === 'Flagged for Admin Review'
    );
  }, [reports]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setIsConnected(true);
      return;
    }
    
    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    const handleIncidentEvent = (event: WebSocketEvent, data: any) => {
      try {
        const transformed = transformWebSocketIncident(data);
        setIncidents(prev => {
          const newMap = new Map(prev);
          newMap.set(transformed.incident_id, transformed);
          return newMap;
        });
      } catch (error) {
        console.error('Error handling incident event:', error);
      }
    };

    const handleReportEvent = (_event: WebSocketEvent, data: any) => {
      try {
        const transformed = transformWebSocketReport(data);
        setReports(prev => {
          const newMap = new Map(prev);
          newMap.set(transformed.report_id, transformed);
          return newMap;
        });
        // If report has incident_id, refresh incidents to get updated report counts
        if (transformed.incident_id) {
          fetchPublicIncidents();
        }
      } catch (error) {
        console.error('Error handling report event:', error);
      }
    };

    newSocket.on('INCIDENT_CREATED', (data: any) => handleIncidentEvent('INCIDENT_CREATED', data));
    newSocket.on('INCIDENT_UPDATED', (data: any) => handleIncidentEvent('INCIDENT_UPDATED', data));
    newSocket.on('INCIDENT_RESOLVED', (data: any) => handleIncidentEvent('INCIDENT_RESOLVED', data));
    newSocket.on('REPORT_VERIFICATION_UPDATED', (data: any) => handleReportEvent('REPORT_VERIFICATION_UPDATED', data));

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [fetchPublicIncidents]);

  useEffect(() => {
    // For public view, fetch public incidents
    // For admin view, fetchIncidents will be called from AdminDashboardPage
    fetchPublicIncidents();
  }, [fetchPublicIncidents]);

    return (
    <IncidentContext.Provider
      value={{
        incidents,
        reports,
        isConnected,
        fetchIncidents,
        fetchReports,
        fetchPublicIncidents,
        getPublicIncidents,
        getIncidentById,
        getReportsByIncidentId,
        getFlaggedReports,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
}
