import { SvgIcon } from '@mui/material';
import type { SvgIconProps } from '@mui/material';

const SprintPlannerIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="plannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0369a1', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Background rounded square */}
      <rect x="2" y="2" width="28" height="28" fill="url(#plannerGradient)" rx="6" stroke="#ffffff" strokeWidth="1"/>
      
      {/* Sprint board with cards - perfectly centered */}
      <rect x="5" y="6" width="6" height="8" fill="#ffffff" rx="2" opacity="0.9"/>
      <rect x="13" y="6" width="6" height="8" fill="#ffffff" rx="2" opacity="0.7"/>
      <rect x="21" y="6" width="6" height="8" fill="#ffffff" rx="2" opacity="0.5"/>
      
      {/* Story points on cards - centered on each card */}
      <circle cx="8" cy="10" r="1.5" fill="#0284c7"/>
      <circle cx="16" cy="10" r="1.5" fill="#0284c7"/>
      <circle cx="24" cy="10" r="1.5" fill="#0284c7"/>
      
      {/* Progress indicator - perfectly centered */}
      <rect x="6" y="18" width="20" height="3" fill="#ffffff" rx="1.5" opacity="0.3"/>
      <rect x="6" y="18" width="12" height="3" fill="#ffffff" rx="1.5"/>
      
      {/* Sprint indicator dots - evenly spaced and centered */}
      <circle cx="10" cy="25" r="1.5" fill="#ffffff" opacity="0.8"/>
      <circle cx="16" cy="25" r="1.5" fill="#ffffff" opacity="0.6"/>
      <circle cx="22" cy="25" r="1.5" fill="#ffffff" opacity="0.4"/>
    </SvgIcon>
  );
};

export default SprintPlannerIcon;
