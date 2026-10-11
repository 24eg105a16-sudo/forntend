import React, { useState, useEffect } from 'react';
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
import {
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  AlertCircle
} from 'lucide-react';
import { reportApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

export default function Reports() {
  const [monthsCount, setMonthsCount] = useState(12);
  const [monthlyData, setMonthlyData] = useState([]);

  // Date range for category breakdown
  const [reportType, setReportType] = useState('EXPENSE');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryData, setCategoryData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [monthsCount, reportType, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [monthlyRes, categoryRes] = await Promise.all([
        reportApi.getMonthlyReport(monthsCount),
        reportApi.getCategoryReport(reportType, startDate, endDate),
      ]);

      setMonthlyData(monthlyRes.data.data || []);
      setCategoryData(categoryRes.data.data || []);
    } catch (err) {
      setError('Failed to fetch reporting analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {
        type: reportType,
        startDate,
        endDate,
      };

      const response = await reportApi.exportCsv(params);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate CSV export.');
    } finally {
      setExporting(false);
    }
  };

  // Cumulative totals for the selected period
  const totalPeriodIncome = monthlyData.reduce((acc, curr) => acc + (parseFloat(curr.income) || 0), 0);
  const totalPeriodExpense = monthlyData.reduce((acc, curr) => acc + (parseFloat(curr.expense) || 0), 0);
  const netSavings = totalPeriodIncome - totalPeriodExpense;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
            Financial Reports & Analytics
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-navy-light)', marginTop: '0.2rem' }}>
            Multi-month trends, category comparisons, and CSV data extraction
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="btn btn-primary"
          >
            <Download size={17} />
            <span>{exporting ? 'Generating...' : 'Export Period to CSV'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cumulative Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Inflow ({monthsCount} Months)</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-income-bg)', color: 'var(--color-income)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-income)' }}>
            {formatCurrency(totalPeriodIncome)}
          </div>
          <div className="stat-subtext">Sum of all income across active window</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Outflow ({monthsCount} Months)</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-expense-bg)', color: 'var(--color-expense)' }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-expense)' }}>
            {formatCurrency(totalPeriodExpense)}
          </div>
          <div className="stat-subtext">Sum of all expenses across active window</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Net Savings</span>
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div
            className="stat-value"
            style={{ color: netSavings >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}
          >
            {formatCurrency(netSavings)}
          </div>
          <div className="stat-subtext">Period net retained funds</div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="card-title">Monthly Income vs Expense Comparison</h3>
            <p className="card-subtitle">Detailed breakdown by month</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-navy-light)' }}>Range:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
              value={monthsCount}
              onChange={(e) => setMonthsCount(Number(e.target.value))}
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
              <option value={24}>Last 24 Months</option>
            </select>
          </div>
        </div>

        <div style={{ height: '360px', width: '100%', marginTop: '1rem' }}>
          {monthlyData && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No transaction records available for comparison</div>
          )}
        </div>
      </div>

      {/* Date Range Category Breakdown Section */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="card-title">Category Breakdown Analysis</h3>
            <p className="card-subtitle">Analyze expenditure or revenue distribution across custom dates</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="EXPENSE">Expenses</option>
              <option value="INCOME">Income</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input
                type="date"
                className="form-control"
                style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ color: 'var(--color-navy-light)' }}>to</span>
              <input
                type="date"
                className="form-control"
                style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '1.5rem', alignItems: 'center' }}>
          {/* Pie Chart */}
          <div style={{ height: '320px', width: '100%' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No category activity during this date range</div>
            )}
          </div>

          {/* Breakdown Table */}
          <div>
            {categoryData.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>Transactions</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'right' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((item) => (
                      <tr key={item.category}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: CATEGORY_COLORS[item.category] || '#64748b',
                              }}
                            />
                            <strong>{item.category}</strong>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{item.count}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.totalAmount)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-navy-light)' }}>{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">Select different date ranges to inspect category data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
