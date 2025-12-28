import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReport } from '@/context/ReportContext';
import { VerificationBadge } from '@/components/VerificationBadge';
import { CategoryIcon } from '@/components/CategoryIcon';
import { MapPin, Clock, FileCheck, ArrowLeft, Home } from 'lucide-react';

export default function ReportStatusPage() {
  const navigate = useNavigate();
  const { submittedReport } = useReport();

  useEffect(() => {
    if (!submittedReport) {
      navigate('/report');
    }
  }, [submittedReport, navigate]);

  if (!submittedReport) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10">
            <FileCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Report Submitted</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Thank you for helping keep our community safe
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background">
                <CategoryIcon category={submittedReport.category} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Incident Type</p>
                <p className="font-semibold">{submittedReport.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reported Time</p>
                <p className="font-semibold">
                  {new Date(submittedReport.reported_time).toLocaleString()}
                </p>
              </div>
            </div>

            {submittedReport.location_label && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{submittedReport.location_label}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
              <p className="font-medium mt-1">Your report is being reviewed</p>
            </div>
            <VerificationBadge state={submittedReport.verification_state} />
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/report">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Submit Another Report
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
