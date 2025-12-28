import { AlertTriangle, Flame, Car, Shield, Bomb } from 'lucide-react';
import { IncidentCategory } from '@/types/incident';

interface CategoryIconProps {
  category: IncidentCategory;
  className?: string;
}

export function CategoryIcon({ category, className = "h-5 w-5" }: CategoryIconProps) {
  switch (category) {
    case 'Sexual Assault':
      return <Shield className={className} />;
    case 'Bomb Threat':
      return <Bomb className={className} />;
    case 'Fire / Explosion':
      return <Flame className={className} />;
    case 'Accident':
      return <Car className={className} />;
    case 'Theft':
      return <AlertTriangle className={className} />;
    default:
      return <AlertTriangle className={className} />;
  }
}
