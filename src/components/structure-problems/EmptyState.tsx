
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">No structure problems detected!</p>
      <p className="text-sm text-muted-foreground mt-2">
        Your organization structure is well-balanced
      </p>
    </div>
  );
};

export default EmptyState;
