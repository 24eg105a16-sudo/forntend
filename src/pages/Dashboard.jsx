import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  PiggyBank
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getMonthlySummary(6),
        dashboardApi.getCategoryBreakdown('EXPENSE'),
      ]);

      setSummary(summaryRes.data.data);
      setMonthlyData(monthlyRes.data.data);
      setCategoryData(categoryRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ margin: '2rem 0' }}>
        <AlertTriangle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)', marginTop: '0.2rem' }}>
            Real-time breakdown of your income, expenses, and budget limits
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/transactions/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="stats-grid">
        {/* Total Income */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Income</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-income-bg)', color: 'var(--color-income)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-income)' }}>
            {formatCurrency(summary?.totalIncome)}
          </div>
          <div className="stat-subtext">All-time recorded income</div>
        </div>

        {/* Total Expenses */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Expenses</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-expense-bg)', color: 'var(--color-expense)' }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-expense)' }}>
            {formatCurrency(summary?.totalExpenses)}
          </div>
          <div className="stat-subtext">All-time recorded expenses</div>
        </div>

        {/* Available Balance */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Available Balance</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Wallet size={22} />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(summary?.availableBalance)}
          </div>
          <div className="stat-subtext">Income minus expenses</div>
        </div>

        {/* Current Month Spending */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">This Month's Spending</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(summary?.currentMonthSpending)}
          </div>
          <div className="stat-subtext">Total spent in current month</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Income vs Expenses (Last 6 Months)</h3>
              <p className="card-subtitle">Monthly cash flow trends</p>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <span>No monthly data recorded yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Expense by Category (This Month)</h3>
              <p className="card-subtitle">Proportion of spending per category</p>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {categoryData && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <span>No expense transactions for this month</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Budget Usage Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Monthly Budget Progress</h3>
            <p className="card-subtitle">Spending limits & warning indicators for current month</p>
          </div>
          <Link to="/budgets" className="btn btn-secondary btn-sm">
            <span>Manage Budgets</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {summary?.monthlyBudgetUsage && summary.monthlyBudgetUsage.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {summary.monthlyBudgetUsage.map((b) => {
              const statusClass =
                b.status === 'EXCEEDED'
                  ? 'badge-exceeded'
                  : b.status === 'WARNING'
                  ? 'badge-warning'
                  : 'badge-normal';

              const fillClass =
                b.status === 'EXCEEDED'
                  ? 'fill-exceeded'
                  : b.status === 'WARNING'
                  ? 'fill-warning'
                  : 'fill-normal';

              return (
                <div
                  key={b.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fafbfc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {b.category}
                    </span>
                    <span className={`badge ${statusClass}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar-fill ${fillClass}`}
                      style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--color-navy-light)' }}>
                    <span>
                      Spent: <strong>{formatCurrency(b.spentAmount)}</strong>
                    </span>
                    <span>
                      Limit: <strong>{formatCurrency(b.monthlyLimit)}</strong> ({b.percentageUsed}%)
                    </span>
                  </div>

                  {b.status === 'WARNING' && (
                    <div style={{ fontSize: '0.775rem', color: '#b45309', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={13} />
                      <span>Approaching limit (80% reached)</span>
                    </div>
                  )}

                  {b.status === 'EXCEEDED' && (
                    <div style={{ fontSize: '0.775rem', color: '#b91c1c', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={13} />
                      <span>Budget exceeded by {formatCurrency(Math.abs(b.remainingAmount))}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <PiggyBank size={32} />
            </div>
            <h4 style={{ fontWeight: 600, color: 'var(--color-navy)' }}>No Budgets Configured</h4>
            <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0.35rem 0 1rem 0' }}>
              Set category spending limits for the current month to track and receive budget alerts.
            </p>
            <Link to="/budgets" className="btn btn-primary btn-sm">
              Create Budget Limit
            </Link>
          </div>
        )}
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Transactions</h3>
            <p className="card-subtitle">Latest 5 financial entries</p>
          </div>
          <Link to="/transactions" className="btn btn-secondary btn-sm">
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.transactionDate)}</td>
                    <td>
                      <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.category}</td>
                    <td style={{ color: 'var(--color-navy-light)' }}>{tx.description || '-'}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: tx.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)',
                      }}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No transactions found. Add your first income or expense entry!</p>
          </div>
        )}
      </div>
    </div>
  );
}
