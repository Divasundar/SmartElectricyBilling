import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Gauge, Layers, Receipt, CreditCard,
  BarChart2, UserCog, Settings, LogOut, Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/admin/dashboard' },
  { label: 'Consumers', icon: <Users size={17} />, path: '/admin/consumers' },
  { label: 'Meters', icon: <Gauge size={17} />, path: '/admin/meters' },
  { label: 'Tariffs', icon: <Layers size={17} />, path: '/admin/tariffs' },
  { label: 'Bills', icon: <Receipt size={17} />, path: '/admin/bills' },
  { label: 'Payments', icon: <CreditCard size={17} />, path: '/admin/payments' },
  { label: 'Reports', icon: <BarChart2 size={17} />, path: '/admin/reports' },
  { label: 'Users', icon: <UserCog size={17} />, path: '/admin/users' },
  { label: 'Settings', icon: <Settings size={17} />, path: '/admin/settings' },
];

const CLERK_NAV: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/clerk/dashboard' },
  { label: 'Consumers', icon: <Users size={17} />, path: '/clerk/consumers' },
  { label: 'Meters', icon: <Gauge size={17} />, path: '/clerk/meters' },
  { label: 'Bills', icon: <Receipt size={17} />, path: '/clerk/bills' },
  { label: 'Payments', icon: <CreditCard size={17} />, path: '/clerk/payments' },
  { label: 'Reports', icon: <BarChart2 size={17} />, path: '/clerk/reports' },
];

const CONSUMER_NAV: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/consumer/dashboard' },
  { label: 'My Bills', icon: <Receipt size={17} />, path: '/consumer/bills' },
  { label: 'Consumption', icon: <BarChart2 size={17} />, path: '/consumer/consumption' },
  { label: 'Payments', icon: <CreditCard size={17} />, path: '/consumer/payments' },
  { label: 'Profile', icon: <UserCog size={17} />, path: '/consumer/profile' },
];

interface SidebarProps {
  role?: UserRole;
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role: roleProp, collapsed, onToggle, onMobileClose }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const activeRole: UserRole = roleProp || currentUser?.role || 'ADMIN';

  const navItems =
    activeRole === 'ADMIN' ? ADMIN_NAV :
    activeRole === 'BILLING_CLERK' ? CLERK_NAV :
    CONSUMER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
    onMobileClose?.();
  };

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-lg shrink-0">
          <Zap size={16} className="text-black" fill="currentColor" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="block text-xs font-bold text-white leading-none tracking-widest uppercase">
              Smart
            </span>
            <span className="block text-xs font-bold text-accent leading-none tracking-widest uppercase mt-0.5">
              Billing
            </span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-card transition-colors z-50 hidden md:flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            {activeRole === 'BILLING_CLERK' ? 'Billing Clerk' : activeRole.charAt(0) + activeRole.slice(1).toLowerCase()}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `nav-item mb-0.5 ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            aria-label={item.label}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-0' : ''}`}
          aria-label="Logout"
          title={collapsed ? 'Logout' : undefined}
          id="sidebar-logout-btn"
        >
          <LogOut size={17} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
