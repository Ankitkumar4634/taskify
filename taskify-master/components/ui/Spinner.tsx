import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  stroke?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  stroke = 'currentColor',
  className
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', 'h-4 w-4', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default Spinner;
