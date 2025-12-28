import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useReport } from '@/context/ReportContext';
import { IncidentCategory } from '@/types/incident';
import { AlertTriangle, Upload, Image, Video, MapPin, Clock, Loader2 } from 'lucide-react';
import { USE_MOCK_DATA } from '@/lib/mockData';
import { api } from '@/lib/api';
import { TopNavigation } from '@/components/TopNavigation';

const CATEGORIES: IncidentCategory[] = [
  'Sexual Assault',
  'Bomb Threat',
  'Fire / Explosion',
  'Accident',
  'Theft',
];

export default function ReportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSubmittedReport } = useReport();
  
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [reportedTime, setReportedTime] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location unavailable',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);
        toast({
          title: 'Location captured',
          description: 'Your current location has been recorded.',
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: 'Location error',
          description: 'Could not get your location. Please enter manually.',
          variant: 'destructive',
        });
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidence(file);
      setEvidenceType('image');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidence(file);
      setEvidenceType('video');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      toast({
        title: 'Category required',
        description: 'Please select an incident category.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalLatitude = latitude;
      let finalLongitude = longitude;

      if (finalLatitude === null || finalLongitude === null) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          finalLatitude = position.coords.latitude;
          finalLongitude = position.coords.longitude;
        } catch {
          finalLatitude = 28.6139;
          finalLongitude = 77.2090;
        }
      }

      if (USE_MOCK_DATA) {
        const mockReportId = `RPT-MOCK-${Date.now()}`;
        setSubmittedReport({
          report_id: mockReportId,
          category: category,
          reported_time: reportedTime || new Date().toISOString(),
          location_label: locationLabel || 'Location captured',
          verification_state: 'Unverified',
        });
        navigate('/report/status');
        return;
      }

      const result = await api.submitReport({
        category: category,
        description: description,
        latitude: finalLatitude,
        longitude: finalLongitude,
        location_label: locationLabel || undefined,
        reported_time: reportedTime || new Date().toISOString(),
        evidence: evidence || undefined,
      });
      
      setSubmittedReport({
        report_id: result.report_id,
        category: category,
        reported_time: reportedTime || new Date().toISOString(),
        location_label: locationLabel || 'Location captured',
        verification_state: result.verification_state,
      });

      navigate('/report/status');
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Could not submit your report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="flex items-center justify-center p-4 pt-20 min-h-screen">
      <Card className="w-full max-w-lg shadow-lg border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Report Incident</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Your report helps keep everyone safe
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Incident Type <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IncidentCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location or use device location"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {latitude !== null && longitude !== null && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                When did this happen?
              </Label>
              <Input
                id="time"
                type="datetime-local"
                value={reportedTime}
                onChange={(e) => setReportedTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Evidence <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <Button
                  type="button"
                  variant={evidenceType === 'image' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={evidenceType === 'video' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>
              {evidence && (
                <p className="text-xs text-muted-foreground">
                  Selected: {evidence.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || !category}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
