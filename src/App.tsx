import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers & Routing
import { AuthProvider } from './context/AuthContext';
import { AppStateProvider } from './context/AppStateContext';
import { RoleRoute } from './routes/RoleRoute';

// Auth
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ConsumersPage } from './pages/admin/ConsumersPage';
import { MetersPage } from './pages/admin/MetersPage';
import { TariffsPage } from './pages/admin/TariffsPage';
import { BillsPage } from './pages/admin/BillsPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Clerk Pages
import { ClerkDashboard } from './pages/clerk/ClerkDashboard';
import {
  ClerkConsumersPage,
  ClerkMetersPage,
  ClerkBillsPage,
  ClerkPaymentsPage,
  ClerkReportsPage,
} from './pages/clerk/ClerkPages';

// Consumer Pages
import { ConsumerDashboard } from './pages/consumer/ConsumerDashboard';
import { ConsumerBillsPage } from './pages/consumer/ConsumerBillsPage';
import { ConsumerConsumptionPage } from './pages/consumer/ConsumerConsumptionPage';
import { ConsumerPaymentsPage } from './pages/consumer/ConsumerPaymentsPage';
import { ConsumerProfilePage } from './pages/consumer/ConsumerProfilePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <Routes>
            {/* Public & Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Portal Routes (Role-Protected: ADMIN) */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/consumers"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <ConsumersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/meters"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <MetersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/tariffs"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <TariffsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/bills"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <BillsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <PaymentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <ReportsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <UsersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleRoute allowedRole="ADMIN">
                  <SettingsPage />
                </RoleRoute>
              }
            />

            {/* Billing Clerk Portal Routes (Role-Protected: BILLING_CLERK) */}
            <Route
              path="/clerk/dashboard"
              element={
                <RoleRoute allowedRole="BILLING_CLERK">
                  <ClerkDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/clerk/consumers"
              element={
                <RoleRoute allowedRole="BILLING_CLERK">
                  <ClerkConsumersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/clerk/meters"
              element={
                <RoleRoute allowedRole="BILLING_CLERK">
                  <ClerkMetersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/clerk/bills"
              element={
                <RoleRoute allowedRole="BILLING_CLERK">
                  <ClerkBillsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/clerk/payments"
              element={
                <RoleRoute allowedRole="BILLING_CLERK">
                  <ClerkPaymentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/clerk/reports"
              element={
                <RoleRoute allowedRole="BILLING_CLERK">
                  <ClerkReportsPage />
                </RoleRoute>
              }
            />

            {/* Consumer Portal Routes (Role-Protected: CONSUMER) */}
            <Route
              path="/consumer/dashboard"
              element={
                <RoleRoute allowedRole="CONSUMER">
                  <ConsumerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/consumer/bills"
              element={
                <RoleRoute allowedRole="CONSUMER">
                  <ConsumerBillsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/consumer/consumption"
              element={
                <RoleRoute allowedRole="CONSUMER">
                  <ConsumerConsumptionPage />
                </RoleRoute>
              }
            />
            <Route
              path="/consumer/payments"
              element={
                <RoleRoute allowedRole="CONSUMER">
                  <ConsumerPaymentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/consumer/profile"
              element={
                <RoleRoute allowedRole="CONSUMER">
                  <ConsumerProfilePage />
                </RoleRoute>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppStateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
