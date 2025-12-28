import { Badge } from '@/components/ui/badge';
import { VerificationState } from '@/types/incident';

interface VerificationBadgeProps {
  state: VerificationState;
}

export function VerificationBadge({ state }: VerificationBadgeProps) {
  const getVariant = () => {
    switch (state) {
      case 'Verified':
        return 'verified';
      case 'Unverified':
        return 'unverified';
      case 'Flagged for Admin Review':
        return 'flagged';
      case 'Not Verified':
        return 'rejected';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant()}>
      {state}
    </Badge>
  );
}
