import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident, PriorityTag } from '@/types/incident';

interface IncidentMapProps {
  incidents: Incident[];
  onMarkerClick?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
}

function getMarkerColor(incident: Incident): string {
  if (incident.resolution_tag === 'Resolved') {
    return '#16a34a';
  }
  
  switch (incident.priority_tag) {
    case 'Critical':
      return '#991b1b';
    case 'High':
      return '#dc2626';
    case 'Medium':
      return '#ea580c';
    case 'Low':
      return '#eab308';
    default:
      return '#6b7280';
  }
}

function createMarkerIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function IncidentMap({ 
  incidents, 
  onMarkerClick, 
  center = [20.5937, 78.9629], 
  zoom = 5 
}: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const currentIds = new Set(incidents.map(i => i.incident_id));
    
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    incidents.forEach(incident => {
      const color = getMarkerColor(incident);
      const icon = createMarkerIcon(color);

      if (markersRef.current.has(incident.incident_id)) {
        const marker = markersRef.current.get(incident.incident_id)!;
        marker.setLatLng([incident.latitude, incident.longitude]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([incident.latitude, incident.longitude], { icon })
          .addTo(mapInstanceRef.current!);

        marker.bindPopup(`
          <div style="min-width: 150px;">
            <strong>${incident.category}</strong><br/>
            <span style="color: #666;">${new Date(incident.reported_time).toLocaleString()}</span><br/>
            <span style="
              display: inline-block;
              padding: 2px 8px;
              margin-top: 4px;
              border-radius: 4px;
              font-size: 12px;
              background-color: ${incident.resolution_tag === 'Resolved' ? '#16a34a' : '#6b7280'};
              color: white;
            ">${incident.resolution_tag}</span>
          </div>
        `);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(incident));
        }

        markersRef.current.set(incident.incident_id, marker);
      }
    });
  }, [incidents, onMarkerClick]);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
  );
}
