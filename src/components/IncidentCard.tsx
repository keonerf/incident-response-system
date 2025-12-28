import { Card, CardContent } from '@/components/ui/card';
import { Incident } from '@/types/incident';
import { PriorityBadge } from './PriorityBadge';
import { ResolutionBadge } from './ResolutionBadge';
import { CategoryIcon } from './CategoryIcon';
import { MapPin, Clock, FileText } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  showDetails?: boolean;
  onClick?: () => void;
}

export function IncidentCard({ incident, showDetails = false, onClick }: IncidentCardProps) {
  return (
    <Card 
      className={`transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <CategoryIcon category={incident.category} className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{incident.category}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{incident.location_label || 'Unknown location'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ResolutionBadge resolution={incident.resolution_tag} />
            <PriorityBadge priority={incident.priority_tag} />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{new Date(incident.reported_time).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{incident.report_count} report{incident.report_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Priority Score:</span>
              <span className="ml-2 font-medium">{incident.priority_score.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence:</span>
              <span className="ml-2 font-medium">{incident.confidence_score.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
