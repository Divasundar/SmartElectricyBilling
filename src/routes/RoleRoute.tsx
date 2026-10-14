// ============================================================
// SMART BILLING — Role-Protected Route Component
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleRouteProps {
  allowedRole?: UserRole;
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRole,
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const validRoles = allowedRoles || (allowedRole ? [allowedRole] : []);
  const hasAccess = validRoles.includes(currentUser.role);

  if (!hasAccess) {
    // Redirect unauthorized user to their role's designated dashboard
    switch (currentUser.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'BILLING_CLERK':
        return <Navigate to="/clerk/dashboard" replace />;
      case 'CONSUMER':
        return <Navigate to="/consumer/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleRoute;
