import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { budgetApi } from '../services/api';
import { formatCurrency, getCurrentMonthString } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function Budgets() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await budgetApi.getBudgets(selectedMonth);
      setBudgets(res.data.data || []);
    } catch (err) {
      setError('Failed to load budgets for the selected month.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setCategory(EXPENSE_CATEGORIES[0]);
    setMonthlyLimit('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBudget(b);
    setCategory(b.category);
    setMonthlyLimit(b.monthlyLimit);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const limitVal = parseFloat(monthlyLimit);
    if (isNaN(limitVal) || limitVal <= 0) {
      setModalError('Please enter a valid monthly spending limit greater than 0');
      return;
    }

    try {
      setModalSubmitting(true);
      if (editingBudget) {
        await budgetApi.updateBudget(editingBudget.id, {
          category,
          monthlyLimit: limitVal,
          budgetMonth: selectedMonth,
        });
        setSuccess(`Budget for ${category} updated successfully.`);
      } else {
        await budgetApi.createBudget({
          category,
          monthlyLimit: limitVal,
          budgetMonth: selectedMonth,
        });
        setSuccess(`Budget for ${category} created successfully.`);
      }

      setIsModalOpen(false);
      fetchBudgets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save budget limit.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await budgetApi.deleteBudget(deleteId);
      setDeleteId(null);
      setSuccess('Budget deleted successfully.');
      fetchBudgets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Could not delete budget.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
            Monthly Budgets
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)', marginTop: '0.2rem' }}>
            Set category spending limits and monitor budget health with automated threshold alerts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem' }}>
            <Calendar size={16} color="var(--color-navy-light)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: 'var(--color-navy)' }}
            />
          </div>

          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div style={{ display: 'flex', minHeight: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : budgets.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {budgets.map((b) => {
            const isExceeded = b.status === 'EXCEEDED';
            const isWarning = b.status === 'WARNING';

            const badgeClass = isExceeded
              ? 'badge-exceeded'
              : isWarning
              ? 'badge-warning'
              : 'badge-normal';

            const fillClass = isExceeded
              ? 'fill-exceeded'
              : isWarning
              ? 'fill-warning'
              : 'fill-normal';

            return (
              <div
                key={b.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: isExceeded ? '4px solid var(--color-danger)' : isWarning ? '4px solid var(--color-warning)' : '4px solid var(--color-primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                      {b.category}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-light)' }}>
                      Month: {b.budgetMonth}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${badgeClass}`}>
                      {b.status}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="btn-icon"
                      title="Edit Budget"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="btn-icon"
                      style={{ color: 'var(--color-danger)' }}
                      title="Delete Budget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="progress-bar-container" style={{ height: '10px' }}>
                    <div
                      className={`progress-bar-fill ${fillClass}`}
                      style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-navy-muted)', marginTop: '0.25rem' }}>
                    <span>{b.percentageUsed}% Used</span>
                    <span>Limit: {formatCurrency(b.monthlyLimit)}</span>
                  </div>
                </div>

                {/* Spent & Remaining Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-light)', textTransform: 'uppercase', fontWeight: 600 }}>Spent</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                      {formatCurrency(b.spentAmount)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-light)', textTransform: 'uppercase', fontWeight: 600 }}>Remaining</div>
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: b.remainingAmount < 0 ? 'var(--color-danger)' : 'var(--color-primary)',
                      }}
                    >
                      {formatCurrency(b.remainingAmount)}
                    </div>
                  </div>
                </div>

                {/* Alert Banners */}
                {isWarning && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', fontSize: '0.825rem', color: '#92400e' }}>
                    <AlertTriangle size={16} />
                    <span>Warning: 80% of budget reached!</span>
                  </div>
                )}

                {isExceeded && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', fontSize: '0.825rem', color: '#991b1b' }}>
                    <AlertTriangle size={16} />
                    <span>Over budget by {formatCurrency(Math.abs(b.remainingAmount))}!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <PiggyBank size={36} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              No Budgets Set for {selectedMonth}
            </h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '420px', margin: '0.5rem 0 1.5rem 0' }}>
              Setting up category limits allows you to catch overspending before it happens and receive visual warnings.
            </p>
            <button onClick={handleOpenCreateModal} className="btn btn-primary">
              <Plus size={18} />
              <span>Create First Budget</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
              {editingBudget ? 'Edit Budget Limit' : 'Set Category Budget Limit'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-navy-light)', marginBottom: '1.25rem' }}>
              Specify the maximum expense allowed for this category during {selectedMonth}.
            </p>

            {modalError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!!editingBudget}
                  required
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="500.00"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Budget Month</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedMonth}
                  disabled
                  style={{ backgroundColor: '#f1f5f9' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={modalSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              Delete Budget
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)', margin: '0.75rem 0 1.5rem 0' }}>
              Are you sure you want to remove this budget? Transactions in this category will remain unaffected.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
