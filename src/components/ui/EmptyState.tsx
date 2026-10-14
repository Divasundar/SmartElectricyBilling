import React from 'react';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-gray-300 mb-4">
        {icon || <FileSearch size={40} />}
      </div>
      <p className="text-base font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export const LoadingState: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg className="animate-spin h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};
