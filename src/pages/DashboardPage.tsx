import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIncidents } from '@/context/IncidentContext';
import { IncidentMap } from '@/components/IncidentMap';
import { IncidentCard } from '@/components/IncidentCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Incident, IncidentCategory, ResolutionTag } from '@/types/incident';
import { AlertTriangle, Filter, Radio, MapPin, List, Plus } from 'lucide-react';

const CATEGORIES: IncidentCategory[] = [
  'Sexual Assault',
  'Bomb Threat',
  'Fire / Explosion',
  'Accident',
  'Theft',
];

export default function DashboardPage() {
  const { getPublicIncidents, isConnected } = useIncidents();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [resolutionFilter, setResolutionFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  const publicIncidents = getPublicIncidents();

  const filteredIncidents = useMemo(() => {
    let filtered = [...publicIncidents];
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(i => i.category === categoryFilter);
    }
    
    if (resolutionFilter !== 'all') {
      filtered = filtered.filter(i => i.resolution_tag === resolutionFilter);
    }
    
    filtered.sort((a, b) => {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      const priorityDiff = priorityOrder[a.priority_tag] - priorityOrder[b.priority_tag];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.reported_time).getTime() - new Date(a.reported_time).getTime();
    });
    
    return filtered;
  }, [publicIncidents, categoryFilter, resolutionFilter]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Incident Dashboard</h1>
                <p className="text-xs text-muted-foreground">Live monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? 'success' : 'destructive'} className="gap-1">
                <Radio className="h-3 w-3" />
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              <Button asChild size="sm">
                <Link to="/report">
                  <Plus className="h-4 w-4 mr-1" />
                  Report
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={resolutionFilter} onValueChange={setResolutionFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="hidden md:flex"
              >
                Split
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-4">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No incidents to display</h2>
            <p className="text-muted-foreground max-w-md">
              {publicIncidents.length === 0
                ? 'There are currently no verified incidents.'
                : 'No incidents match your current filters.'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 h-[calc(100vh-200px)] ${
            viewMode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'
          }`}>
            {viewMode !== 'map' && (
              <div className="overflow-auto space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
                </p>
                {filteredIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.incident_id}
                    incident={incident}
                    onClick={() => setSelectedIncident(incident)}
                  />
                ))}
              </div>
            )}
            
            {viewMode !== 'list' && (
              <div className="rounded-lg overflow-hidden border">
                <IncidentMap
                  incidents={filteredIncidents}
                  onMarkerClick={setSelectedIncident}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
