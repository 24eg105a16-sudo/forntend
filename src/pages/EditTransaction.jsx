import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { transactionApi } from '../services/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      setInitialLoading(true);
      setError('');
      const res = await transactionApi.getTransactionById(id);
      const data = res.data.data;
      setType(data.type);
      setAmount(data.amount);
      setCategory(data.category);
      setDescription(data.description || '');
      setTransactionDate(data.transactionDate);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transaction details');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'EXPENSE') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!category) {
      setError('Category is required');
      return;
    }

    if (!transactionDate) {
      setError('Transaction date is required');
      return;
    }

    try {
      setSaving(true);
      await transactionApi.updateTransaction(id, {
        type,
        amount: parsedAmount,
        category,
        description: description.trim(),
        transactionDate,
      });

      navigate('/transactions');
    } catch (err) {
      if (err.response?.data?.validationErrors) {
        setFieldErrors(err.response.data.validationErrors);
        setError('Please fix the validation errors below');
      } else {
        setError(err.response?.data?.message || 'Failed to update transaction');
      }
    } finally {
      setSaving(false);
    }
  };

  const currentCategories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/transactions" className="btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
            Edit Transaction
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)' }}>
            Modify details for transaction #{id}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('EXPENSE')}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: type === 'EXPENSE' ? 'var(--color-expense)' : 'var(--color-surface)',
                  color: type === 'EXPENSE' ? 'white' : 'var(--color-navy)',
                  borderColor: type === 'EXPENSE' ? 'var(--color-expense)' : 'var(--color-border-strong)',
                }}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('INCOME')}
                className="btn"
                style={{
                  flex: 1,
                  backgroundColor: type === 'INCOME' ? 'var(--color-income)' : 'var(--color-surface)',
                  color: type === 'INCOME' ? 'white' : 'var(--color-navy)',
                  borderColor: type === 'INCOME' ? 'var(--color-income)' : 'var(--color-border-strong)',
                }}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {fieldErrors.amount && <span className="form-error">{fieldErrors.amount}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {currentCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.category && <span className="form-error">{fieldErrors.category}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="date">Transaction Date</label>
            <input
              id="date"
              type="date"
              className="form-control"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
            {fieldErrors.transactionDate && <span className="form-error">{fieldErrors.transactionDate}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
            {fieldErrors.description && <span className="form-error">{fieldErrors.description}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/transactions" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
              ) : (
                <>
                  <Save size={18} />
                  <span>Update Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
