import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function VerifiedBadge({ size = 'md', showLabel = true }: VerifiedBadgeProps) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-[12px] px-2.5 py-1',
    lg: 'text-[14px] px-3.5 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill font-medium bg-emerald-50 text-primary border border-primary/20 ${textSizes[size]}`}
      title="Verified Citizen: 5+ completed pickups with zero rejections"
    >
      <ShieldCheck className={`${iconSizes[size]} text-primary`} />
      {showLabel && <span>Verified Citizen</span>}
    </span>
  );
}
