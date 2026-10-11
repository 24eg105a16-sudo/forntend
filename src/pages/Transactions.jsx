import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  ArrowUpDown
} from 'lucide-react';
import { transactionApi, reportApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortDir, setSortDir] = useState('DESC');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [page, type, category, startDate, endDate, sortBy, sortDir]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        size: pageSize,
        sortBy,
        sortDir,
      };

      if (type) params.type = type;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search.trim()) params.search = search.trim();

      const res = await transactionApi.getTransactions(params);
      const pageData = res.data.data;
      setTransactions(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setSortBy('transactionDate');
    setSortDir('DESC');
    setPage(0);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    try {
      setDeleting(true);
      await transactionApi.deleteTransaction(deleteModalId);
      setDeleteModalId(null);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {};
      if (type) params.type = type;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search.trim()) params.search = search.trim();

      const response = await reportApi.exportCsv(params);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Could not download CSV export.');
    } finally {
      setExporting(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortDir('DESC');
    }
    setPage(0);
  };

  const allCategories = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
            Transactions
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)', marginTop: '0.2rem' }}>
            Browse, filter, edit, and export your transaction records ({totalElements} total)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCsv}
            disabled={exporting || transactions.length === 0}
            className="btn btn-secondary"
          >
            <Download size={17} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <Link to="/transactions/new" className="btn btn-primary">
            <Plus size={18} />
            <span>New Transaction</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search Description</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Grocery, Salary..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction Type</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            {/* End Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Search size={16} />
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                title="Reset Filters"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Transactions Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', padding: '4rem', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleSort('transactionDate')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Date</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th
                      style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleSort('amount')}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Amount</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', width: '110px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.transactionDate)}</td>
                      <td>
                        <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tx.category}</td>
                      <td style={{ color: 'var(--color-navy-light)' }}>
                        {tx.description || '-'}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: tx.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)',
                        }}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                          <button
                            onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                            className="btn-icon"
                            title="Edit Transaction"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModalId(tx.id)}
                            className="btn-icon"
                            style={{ color: 'var(--color-danger)' }}
                            title="Delete Transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="pagination" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-navy-light)' }}>
                Showing page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong> ({totalElements} items)
              </span>

              <div className="pagination-controls">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '1.05rem' }}>No Transactions Found</p>
            <p style={{ fontSize: '0.85rem', margin: '0.35rem 0 1.25rem 0' }}>
              No transactions matched your current search filters.
            </p>
            <Link to="/transactions/new" className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Transaction</span>
            </Link>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteModalId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              Confirm Transaction Deletion
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--color-navy-light)', margin: '1rem 0 1.5rem 0' }}>
              Are you sure you want to permanently delete this transaction? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
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
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
