import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, AlertCircle } from 'lucide-react';
import { transactionApi } from '../services/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

export default function AddTransaction() {
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

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
      setError('Please provide a valid amount greater than 0');
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
      setLoading(true);
      await transactionApi.createTransaction({
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
        setError(err.response?.data?.message || 'Failed to save transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/transactions" className="btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
            Add Transaction
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)' }}>
            Record a new incoming payment or outgoing expense
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
          {/* Type Selector Toggle Buttons */}
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
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
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

          {/* Transaction Date */}
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
            <label className="form-label" htmlFor="description">Description (Optional)</label>
            <input
              id="description"
              type="text"
              className="form-control"
              placeholder="e.g. Grocery run at supermarket"
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
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Save Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
