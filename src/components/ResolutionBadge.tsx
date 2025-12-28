import { Badge } from '@/components/ui/badge';
import { ResolutionTag } from '@/types/incident';

interface ResolutionBadgeProps {
  resolution: ResolutionTag;
}

export function ResolutionBadge({ resolution }: ResolutionBadgeProps) {
  const variant = resolution === 'Resolved' ? 'resolved' : 'unresolved';
  
  return (
    <Badge variant={variant}>
      {resolution}
    </Badge>
  );
}
