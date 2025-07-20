
// apps/web-client/src/components/lobby/QuickMatchButton.tsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Zap } from 'lucide-react';

interface QuickMatchButtonProps {
  onQuickMatch: () => void;
}

export const QuickMatchButton: React.FC<QuickMatchButtonProps> = ({
  onQuickMatch
}) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickMatch = async () => {
    setIsSearching(true);
    try {
      await onQuickMatch();
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Button
      onClick={handleQuickMatch}
      loading={isSearching}
      size="lg"
      className="min-w-[200px] bg-gradient-to-r from-poker-gold to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
    >
      <Zap size={20} className="mr-2" />
      {isSearching ? 'Finding Table...' : 'Quick Match'}
    </Button>
  );
};
