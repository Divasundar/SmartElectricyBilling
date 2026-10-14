import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, Menu, Check } from 'lucide-react';
import { getInitials } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../hooks/useAppState';
import { BackendStatusBadge } from '../ui/BackendStatusBadge';

interface TopNavbarProps {
  userName?: string;
  userRole?: string;
  onMobileMenuOpen: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  userName: userNameProp,
  userRole: userRoleProp,
  onMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationRead } = useAppState();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const effectiveName = userNameProp || currentUser?.name || 'Administrator';
  const effectiveRole = userRoleProp || currentUser?.role || 'ADMIN';

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleLabel = {
    ADMIN: 'Administrator',
    BILLING_CLERK: 'Billing Clerk',
    CONSUMER: 'Consumer',
  }[effectiveRole] ?? effectiveRole;

  const notifTypeColors: Record<string, string> = {
    SUCCESS: 'text-green-500',
    WARNING: 'text-amber-500',
    ERROR: 'text-red-500',
    INFO: 'text-blue-500',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden sm:block w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search consumers, bills..."
            className="input pl-9 text-sm w-full bg-gray-50"
            aria-label="Global search"
          />
        </div>
      </div>

      {/* Right: backend status + notifications + user */}
      <div className="flex items-center gap-2">
        {/* Backend connection status badge */}
        <BackendStatusBadge />
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={`Notifications (${unreadCount} unread)`}
            id="notification-button"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-gray-200 shadow-dropdown z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <span className="badge badge-red">{unreadCount} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-accent-muted/40' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 shrink-0 ${notifTypeColors[n.type]}`}>
                        {n.read ? <Check size={14} /> : <Bell size={14} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-accent font-medium hover:underline"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            id="user-menu-button"
            aria-expanded={userOpen}
          >
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-accent">{getInitials(effectiveName)}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{effectiveName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-200 shadow-dropdown z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900">{effectiveName}</p>
                <p className="text-[11px] text-gray-400">{roleLabel}</p>
              </div>
              <div className="py-1">
                {effectiveRole === 'CONSUMER' && (
                  <button
                    onClick={() => { setUserOpen(false); navigate('/consumer/profile'); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Profile
                  </button>
                )}
                {effectiveRole === 'ADMIN' && (
                  <button
                    onClick={() => { setUserOpen(false); navigate('/admin/settings'); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Settings
                  </button>
                )}
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  id="topbar-logout-btn"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
