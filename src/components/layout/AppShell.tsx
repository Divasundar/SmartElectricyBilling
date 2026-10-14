import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import type { UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, userRole: userRoleProp, userName: userNameProp }) => {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeRole: UserRole = userRoleProp || currentUser?.role || 'ADMIN';
  const activeName: string = userNameProp || currentUser?.name || 'Administrator';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — Desktop: always visible, Mobile: off-canvas */}
      <div
        className={`fixed left-0 top-0 h-screen z-40 transition-transform duration-250
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ width: sidebarCollapsed ? 64 : 220 }}
      >
        <Sidebar
          role={activeRole}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div
        className={`transition-all duration-200 flex flex-col min-h-screen ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-[220px]'
        }`}
      >
        <TopNavbar
          userName={activeName}
          userRole={activeRole}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
