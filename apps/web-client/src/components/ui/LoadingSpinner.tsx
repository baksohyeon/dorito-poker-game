
// apps/web-client/src/components/ui/LoadingSpinner.tsx
import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-600 border-t-poker-green',
        sizes[size],
        className
      )}
    />
  );
};