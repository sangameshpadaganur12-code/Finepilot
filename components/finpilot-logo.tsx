import { cn } from '@/lib/utils';

export function FinPilotLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('text-primary', className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" className="fill-current" />
      <path
        d="M10 21V11M10 11l6 6 4-4 2 2"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="15" r="1.6" fill="white" />
    </svg>
  );
}
