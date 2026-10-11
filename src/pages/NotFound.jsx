import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div className="empty-state-icon" style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
        <AlertCircle size={40} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-navy)', letterSpacing: '-0.04em', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-navy-muted)', margin: '0.75rem 0' }}>
        Page Not Found
      </h2>
      <p style={{ maxWidth: '420px', color: 'var(--color-navy-light)', marginBottom: '1.75rem' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
