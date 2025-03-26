
import React from 'react';

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, description }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

export default StatCard;
