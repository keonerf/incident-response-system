import { Badge } from '@/components/ui/badge';
import { PriorityTag } from '@/types/incident';

interface PriorityBadgeProps {
  priority: PriorityTag;
  score?: number;
  showScore?: boolean;
}

export function PriorityBadge({ priority, score, showScore = false }: PriorityBadgeProps) {
  const variant = priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
  
  return (
    <Badge variant={variant}>
      {priority}
      {showScore && score !== undefined && ` (${score.toFixed(1)})`}
    </Badge>
  );
}
