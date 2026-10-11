import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, ShieldCheck, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Profile() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileSummary();
  }, []);

  const fetchProfileSummary = async () => {
    try {
      const res = await dashboardApi.getSummary();
      setSummary(res.data.data);
    } catch {
      // Ignore background summary error on profile
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
          Account Profile
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)', marginTop: '0.2rem' }}>
          Manage your personal details and security settings
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            className="avatar-circle"
            style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f1f5f9' }}>
              <User size={20} color="var(--color-navy-light)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-light)', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{user?.name || '-'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f1f5f9' }}>
              <Mail size={20} color="var(--color-navy-light)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-light)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{user?.email || '-'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f1f5f9' }}>
              <Calendar size={20} color="var(--color-navy-light)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-light)', textTransform: 'uppercase', fontWeight: 600 }}>Joined Date</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                {user?.createdAt ? formatDate(user.createdAt.slice(0, 10)) : 'Active'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5' }}>
              <ShieldCheck size={20} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-light)', textTransform: 'uppercase', fontWeight: 600 }}>Password Hash</div>
              <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>BCrypt (Secure)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Snapshot */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          Financial Health Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-light)' }}>Total Lifetime Inflow</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-income)', marginTop: '0.25rem' }}>
              {formatCurrency(summary?.totalIncome)}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-light)' }}>Total Lifetime Outflow</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-expense)', marginTop: '0.25rem' }}>
              {formatCurrency(summary?.totalExpenses)}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-light)' }}>Current Net Balance</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: '0.25rem' }}>
              {formatCurrency(summary?.availableBalance)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={logout} className="btn btn-secondary">
          <LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}
