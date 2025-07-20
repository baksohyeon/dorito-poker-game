// apps/web-client/src/components/ui/UICard.tsx
import React from 'react';
import { clsx } from 'clsx';

interface UICardProps {
  children: React.ReactNode;
  className?: string;
}

export const UICard: React.FC<UICardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
}; 