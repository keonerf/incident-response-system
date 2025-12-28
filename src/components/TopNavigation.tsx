import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';

export function TopNavigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Incident Reporting System
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Public Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/login">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Admin Login
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}