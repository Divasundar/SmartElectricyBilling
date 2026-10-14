import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  iconBg = 'bg-gray-50',
  className = '',
}) => {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`${iconBg} p-2.5 rounded-lg`}>
          {icon}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold
              ${isPositive ? 'text-green-600' : ''} 
              ${isNegative ? 'text-red-500' : ''}`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};
