import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIncidents } from '@/context/IncidentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ResolutionBadge } from '@/components/ResolutionBadge';
import { VerificationBadge } from '@/components/VerificationBadge';
import { CategoryIcon } from '@/components/CategoryIcon';
import { IncidentMap } from '@/components/IncidentMap';
import { Incident, Report, SimilarityCandidate, IncidentCategory, PriorityTag, VerificationState, ResolutionTag } from '@/types/incident';
import { 
  Shield, LogOut, Radio, AlertTriangle, FileText, 
  CheckCircle, XCircle, GitMerge, Plus, Clock, MapPin,
  ChevronDown, ChevronUp, Eye, Filter, Map as MapIcon, List, Users,
  SortAsc, AlertCircle
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USE_MOCK_DATA, getMockCandidateIncidents, getMockResponders, Responder } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type SortOption = 'priority' | 'confidence' | 'reports' | 'time';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { incidents, reports, isConnected, fetchIncidents, fetchReports, getReportsByIncidentId, getFlaggedReports } = useIncidents();
  const { toast } = useToast();
  
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set());
  const [expandedFlaggedReports, setExpandedFlaggedReports] = useState<Set<string>>(new Set());
  const [similarityCandidates, setSimilarityCandidates] = useState<Map<string, SimilarityCandidate[]>>(new Map());
  const [processingReports, setProcessingReports] = useState<Set<string>>(new Set());
  const [processingIncidents, setProcessingIncidents] = useState<Set<string>>(new Set());
  
  const [showMap, setShowMap] = useState(false);
  const [focusedIncidentId, setFocusedIncidentId] = useState<string | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [resolutionFilter, setResolutionFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents();
      fetchReports();
    }
  }, [isAuthenticated, fetchIncidents, fetchReports]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleIncidentExpand = (incidentId: string) => {
    setExpandedIncidents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(incidentId)) {
        newSet.delete(incidentId);
      } else {
        newSet.add(incidentId);
      }
      return newSet;
    });
  };

  const toggleFlaggedReportExpand = (reportId: string) => {
    setExpandedFlaggedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleApproveReport = async (reportId: string) => {
    if (USE_MOCK_DATA) {
      toast({ title: 'Mock Mode', description: 'Report approved (mock action)' });
      return;
    }
    
    setProcessingReports(prev => new Set(prev).add(reportId));
    try {
      await api.approveReport(reportId);
      await fetchReports();
      await fetchIncidents();
      toast({ title: 'Success', description: 'Report approved successfully' });
    } catch (error: any) {
      console.error('Failed to approve report:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to approve report',
        variant: 'destructive'
      });
    } finally {
      setProcessingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleRejectReport = async (reportId: string) => {
    if (USE_MOCK_DATA) {
      toast({ title: 'Mock Mode', description: 'Report rejected (mock action)' });
      return;
    }
    
    setProcessingReports(prev => new Set(prev).add(reportId));
    try {
      await api.rejectReport(reportId);
      await fetchReports();
      toast({ title: 'Success', description: 'Report rejected successfully' });
    } catch (error: any) {
      console.error('Failed to reject report:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to reject report',
        variant: 'destructive'
      });
    } finally {
      setProcessingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleToggleResolution = async (incidentId: string, currentResolution: string) => {
    if (USE_MOCK_DATA) {
      toast({ title: 'Mock Mode', description: `Resolution toggled (mock action)` });
      return;
    }
    
    setProcessingIncidents(prev => new Set(prev).add(incidentId));
    try {
      const newResolution = currentResolution === 'Resolved' ? 'Unresolved' : 'Resolved';
      await api.resolveIncident(incidentId, newResolution as ResolutionTag);
      await fetchIncidents();
      toast({ title: 'Success', description: `Incident marked as ${newResolution}` });
    } catch (error: any) {
      console.error('Failed to toggle resolution:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update resolution',
        variant: 'destructive'
      });
    } finally {
      setProcessingIncidents(prev => {
        const newSet = new Set(prev);
        newSet.delete(incidentId);
        return newSet;
      });
    }
  };

  const handleMergeReport = async (reportId: string, incidentId: string) => {
    if (USE_MOCK_DATA) {
      toast({ title: 'Mock Mode', description: 'Report merged with incident (mock action)' });
      return;
    }
    
    // Note: Backend doesn't have a merge endpoint - this would need to be implemented
    // For now, we'll show an error
    toast({ 
      title: 'Not Implemented', 
      description: 'Merge functionality requires backend implementation',
      variant: 'destructive'
    });
    
    // TODO: Implement merge endpoint in backend or use approve + manual assignment
  };

  const handleCreateNewIncident = async (reportId: string) => {
    if (USE_MOCK_DATA) {
      toast({ title: 'Mock Mode', description: 'New incident created (mock action)' });
      return;
    }
    
    // Note: Backend doesn't have a create-incident endpoint - approving a verified report creates incident automatically
    // For now, we'll show an error
    toast({ 
      title: 'Not Implemented', 
      description: 'Create incident functionality requires backend implementation',
      variant: 'destructive'
    });
    
    // TODO: Implement create-incident endpoint in backend or use approve + manual assignment
  };

  const handleMarkerClick = (incident: Incident) => {
    const incidentId = incident.incident_id;
    setFocusedIncidentId(incidentId);
    setShowMap(false);
    setExpandedIncidents(prev => new Set(prev).add(incidentId));
    setTimeout(() => {
      document.getElementById(`incident-${incidentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  if (!isAuthenticated) {
    return null;
  }

  const allIncidents = Array.from(incidents.values());
  
  const filteredIncidents = allIncidents.filter(incident => {
    if (categoryFilter !== 'all' && incident.category !== categoryFilter) return false;
    if (resolutionFilter !== 'all' && incident.resolution_tag !== resolutionFilter) return false;
    if (priorityFilter !== 'all' && incident.priority_tag !== priorityFilter) return false;
    return true;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority_tag] - priorityOrder[b.priority_tag];
      case 'confidence':
        return b.confidence_score - a.confidence_score;
      case 'reports':
        return b.report_count - a.report_count;
      case 'time':
        return new Date(b.reported_time).getTime() - new Date(a.reported_time).getTime();
      default:
        return 0;
    }
  });

  const flaggedReports = getFlaggedReports();
  
  const verifiedReportsWithoutIncident = Array.from(reports.values()).filter(
    r => r.verification_state === 'Verified' && r.incident_id === null
  );

  const responders = USE_MOCK_DATA ? getMockResponders() : [];

  const categories: IncidentCategory[] = ['Sexual Assault', 'Bomb Threat', 'Fire / Explosion', 'Accident', 'Theft'];
  const priorities: PriorityTag[] = ['Critical', 'High', 'Medium', 'Low'];
  const resolutions: ResolutionTag[] = ['Resolved', 'Unresolved'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Incident Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? 'success' : 'destructive'} className="gap-1">
                <Radio className="h-3 w-3" />
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">
                  <Eye className="h-4 w-4 mr-1" />
                  Public View
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="incidents" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Incidents
              <Badge variant="secondary" className="ml-1">{allIncidents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="flagged" className="gap-2">
              <FileText className="h-4 w-4" />
              Flagged
              <Badge variant="warning" className="ml-1">{flaggedReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="similarity" className="gap-2">
              <GitMerge className="h-4 w-4" />
              Match
              <Badge variant="secondary" className="ml-1">{verifiedReportsWithoutIncident.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="responders" className="gap-2">
              <Users className="h-4 w-4" />
              Responders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {priorities.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={resolutionFilter} onValueChange={setResolutionFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {resolutions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 ml-auto">
                    <SortAsc className="h-4 w-4 text-muted-foreground" />
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="confidence">Confidence</SelectItem>
                        <SelectItem value="reports">Report Count</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant={showMap ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                  >
                    {showMap ? <List className="h-4 w-4 mr-1" /> : <MapIcon className="h-4 w-4 mr-1" />}
                    {showMap ? 'List View' : 'Map View'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showMap ? (
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="h-[500px]">
                    <IncidentMap
                      incidents={sortedIncidents}
                      onMarkerClick={handleMarkerClick}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {sortedIncidents.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No incidents</h3>
                      <p className="text-muted-foreground">No incidents match your filters.</p>
                    </CardContent>
                  </Card>
                ) : (
                  sortedIncidents.map((incident) => {
                    const incidentReports = getReportsByIncidentId(incident.incident_id);
                    const isExpanded = expandedIncidents.has(incident.incident_id);
                    const isFocused = focusedIncidentId === incident.incident_id;
                    
                    return (
                      <Collapsible key={incident.incident_id} open={isExpanded}>
                        <Card 
                          id={`incident-${incident.incident_id}`}
                          className={`border-border transition-all cursor-pointer ${isFocused ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => toggleIncidentExpand(incident.incident_id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  <CategoryIcon category={incident.category} className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{incident.category}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{incident.location_label || 'Unknown'}</span>
                                    <Clock className="h-3 w-3 ml-2" />
                                    <span>{new Date(incident.reported_time).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-2">
                                  <ResolutionBadge resolution={incident.resolution_tag} />
                                  <PriorityBadge priority={incident.priority_tag} score={incident.priority_score} showScore />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Confidence: <span className="font-medium text-foreground">{incident.confidence_score.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{incident.report_count} report{incident.report_count !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {incident.incident_id}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={incident.resolution_tag === 'Resolved' ? 'outline' : 'default'}
                                  size="sm"
                                  disabled={processingIncidents.has(incident.incident_id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleResolution(incident.incident_id, incident.resolution_tag);
                                  }}
                                >
                                  {incident.resolution_tag === 'Resolved' ? 'Mark Unresolved' : 'Mark Resolved'}
                                </Button>
                                
                                <CollapsibleTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleIncidentExpand(incident.incident_id);
                                    }}
                                  >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <span className="ml-1">Reports</span>
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>

                            <CollapsibleContent>
                              <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Linked Reports ({incidentReports.length})</h4>
                                {incidentReports.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    No reports linked to this incident
                                  </p>
                                ) : (
                                  incidentReports.map((report) => (
                                    <div key={report.report_id} className="p-4 bg-muted/30 rounded-lg border border-border">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <CategoryIcon category={report.category} className="h-4 w-4" />
                                            <span className="font-medium">{report.category}</span>
                                            <VerificationBadge state={report.verification_state} />
                                          </div>
                                          
                                          {report.description && (
                                            <p className="text-sm text-foreground">{report.description}</p>
                                          )}
                                          
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                                            <div>
                                              <span className="block text-foreground font-medium">{report.trust_score.toFixed(2)}</span>
                                              Trust Score
                                            </div>
                                            {report.similarity_score && (
                                              <div>
                                                <span className="block text-foreground font-medium">{report.similarity_score.toFixed(2)}</span>
                                                Similarity
                                              </div>
                                            )}
                                            <div>
                                              <span className="block text-foreground font-medium">{new Date(report.reported_time).toLocaleDateString()}</span>
                                              Reported
                                            </div>
                                            <div>
                                              <span className="block text-foreground font-medium">{new Date(report.submission_timestamp).toLocaleDateString()}</span>
                                              Submitted
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {report.evidence_urls.length > 0 && (
                                          <div className="flex gap-2">
                                            {report.evidence_urls.slice(0, 2).map((url, idx) => (
                                              <img
                                                key={idx}
                                                src={url}
                                                alt="Evidence"
                                                className="w-16 h-16 object-cover rounded border border-border"
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </CollapsibleContent>
                          </CardContent>
                        </Card>
                      </Collapsible>
                    );
                  })
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="flagged" className="space-y-4">
            {flaggedReports.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-success mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All clear</h3>
                  <p className="text-muted-foreground">No reports flagged for review.</p>
                </CardContent>
              </Card>
            ) : (
              flaggedReports.map((report) => {
                const isExpanded = expandedFlaggedReports.has(report.report_id);
                
                return (
                  <Collapsible key={report.report_id} open={isExpanded}>
                    <Card className="border-warning/50 bg-warning/5">
                      <CardContent className="p-4">
                        <div 
                          className="flex items-start gap-4 cursor-pointer"
                          onClick={() => toggleFlaggedReportExpand(report.report_id)}
                        >
                          <div className="p-2 rounded-lg bg-warning/10">
                            <AlertCircle className="h-5 w-5 text-warning" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryIcon category={report.category} className="h-4 w-4" />
                              <h3 className="font-semibold">{report.category}</h3>
                              <VerificationBadge state={report.verification_state} />
                              <span className="text-sm text-muted-foreground ml-auto">
                                Trust: <span className="font-medium text-foreground">{report.trust_score.toFixed(2)}</span>
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {report.description || 'No description provided'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              disabled={processingReports.has(report.report_id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveReport(report.report_id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={processingReports.has(report.report_id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectReport(report.report_id);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFlaggedReportExpand(report.report_id);
                              }}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="mt-4 pt-4 border-t border-border space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <span className="text-xs text-muted-foreground block">Category</span>
                                <span className="font-medium">{report.category}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Trust Score</span>
                                <span className="font-medium">{report.trust_score.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Reported Time</span>
                                <span className="font-medium">{new Date(report.reported_time).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Submitted</span>
                                <span className="font-medium">{new Date(report.submission_timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {report.description && (
                              <div>
                                <span className="text-xs text-muted-foreground block mb-1">Description</span>
                                <p className="text-sm bg-muted/30 p-3 rounded">{report.description}</p>
                              </div>
                            )}

                            {report.evidence_urls.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground block mb-2">Evidence</span>
                                <div className="flex gap-3 flex-wrap">
                                  {report.evidence_urls.map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                      <img
                                        src={url}
                                        alt="Evidence"
                                        className="w-24 h-24 object-cover rounded border border-border hover:opacity-80 transition"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </CardContent>
                    </Card>
                  </Collapsible>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="similarity" className="space-y-4">
            {verifiedReportsWithoutIncident.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <GitMerge className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending matches</h3>
                  <p className="text-muted-foreground">All verified reports have been assigned to incidents.</p>
                </CardContent>
              </Card>
            ) : (
              verifiedReportsWithoutIncident.map((report) => {
                const candidates = USE_MOCK_DATA 
                  ? getMockCandidateIncidents(report.report_id) 
                  : (similarityCandidates.get(report.report_id) || []);
                
                return (
                  <Card key={report.report_id} className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Report: {report.category}
                        <Badge variant="secondary" className="ml-auto">{report.report_id}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <CategoryIcon category={report.category} className="h-5 w-5" />
                          <span className="font-medium">{report.category}</span>
                          <VerificationBadge state={report.verification_state} />
                          <span className="text-sm text-muted-foreground ml-auto">
                            Trust: <span className="font-medium text-foreground">{report.trust_score.toFixed(2)}</span>
                          </span>
                        </div>
                        {report.description && (
                          <p className="text-sm text-foreground">{report.description}</p>
                        )}
                      </div>

                      {candidates.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <GitMerge className="h-4 w-4" />
                            Candidate Incidents (sorted by similarity)
                          </h4>
                          {candidates.map((candidate) => (
                            <div
                              key={candidate.incident.incident_id}
                              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                            >
                              <div className="flex items-center gap-4">
                                <CategoryIcon category={candidate.incident.category} className="h-5 w-5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{candidate.incident.category}</p>
                                    <PriorityBadge priority={candidate.incident.priority_tag} />
                                    <ResolutionBadge resolution={candidate.incident.resolution_tag} />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {candidate.incident.location_label}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-primary">{candidate.similarity_score.toFixed(2)}%</div>
                                  <div className="text-xs text-muted-foreground">Similarity</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{candidate.incident.confidence_score.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">Confidence</div>
                                </div>
                                <Button
                                  size="sm"
                                  disabled={processingReports.has(report.report_id)}
                                  onClick={() => handleMergeReport(report.report_id, candidate.incident.incident_id)}
                                >
                                  <GitMerge className="h-4 w-4 mr-1" />
                                  Merge
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No similar incidents found
                        </p>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={processingReports.has(report.report_id)}
                        onClick={() => handleCreateNewIncident(report.report_id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create New Incident
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="responders" className="space-y-4">
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Future Scope – Backend Integration Pending</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This section displays mock responder data for demonstration purposes. Real-time responder tracking will be available after backend integration.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {responders.map((responder) => (
                <Card key={responder.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{responder.team_name}</h3>
                        <p className="text-xs text-muted-foreground">{responder.id}</p>
                      </div>
                      <Badge 
                        variant={
                          responder.status === 'Available' ? 'success' : 
                          responder.status === 'Responding' ? 'warning' : 
                          'secondary'
                        }
                      >
                        {responder.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{responder.location_label}</span>
                      </div>
                      
                      {responder.assigned_incident_id && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span>Assigned: {responder.assigned_incident_id}</span>
                        </div>
                      )}
                      
                      {responder.eta_minutes && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>ETA: {responder.eta_minutes} minutes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Lat: {responder.latitude.toFixed(4)}, Lng: {responder.longitude.toFixed(4)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}