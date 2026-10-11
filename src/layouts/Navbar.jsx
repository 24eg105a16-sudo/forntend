import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle Navigation"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            Financial Overview
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/transactions/new" className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>New Transaction</span>
        </Link>

        <Link to="/profile" className="user-profile-badge">
          <div className="avatar-circle">
            {getInitials(user?.name)}
          </div>
          <div style={{ display: 'none', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
