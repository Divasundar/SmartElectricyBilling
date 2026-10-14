import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: string[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumb,
}) => {
  return (
    <div className="page-header flex items-start justify-between gap-4">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 mb-2" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb}>
                {i > 0 && <span className="text-gray-300 text-xs">/</span>}
                <span className={`text-xs ${i === breadcrumb.length - 1 ? 'text-gray-500' : 'text-gray-400'}`}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
