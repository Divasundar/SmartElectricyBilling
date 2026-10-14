// ============================================================
// SMART BILLING — Backend Connection Status Badge
// Displays a subtle pill in the navbar showing whether the
// React app is talking to the Spring Boot backend or offline.
// ============================================================
import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export const BackendStatusBadge: React.FC = () => {
  const { backendSyncStatus, isBackendConnected } = useAppState();

  if (backendSyncStatus === 'idle' || backendSyncStatus === 'syncing') {
    return (
      <span
        title="Connecting to backend..."
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11px',
          fontWeight: 500,
          color: '#888',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2px 10px',
          letterSpacing: '0.02em',
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#888',
          animation: 'pulse 1.4s infinite',
        }} />
        Connecting…
      </span>
    );
  }

  if (isBackendConnected && backendSyncStatus === 'connected') {
    return (
      <span
        title="Connected to Spring Boot backend"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11px',
          fontWeight: 500,
          color: '#39ff14',
          background: 'rgba(57,255,20,0.08)',
          border: '1px solid rgba(57,255,20,0.25)',
          borderRadius: '20px',
          padding: '2px 10px',
          letterSpacing: '0.02em',
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#39ff14',
          boxShadow: '0 0 6px #39ff14',
        }} />
        Backend Live
      </span>
    );
  }

  return (
    <span
      title="Backend offline — using local demo data"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11px',
        fontWeight: 500,
        color: '#f59e0b',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '20px',
        padding: '2px 10px',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: '#f59e0b',
      }} />
      Demo Mode
    </span>
  );
};
