import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI, branchAPI, salesmanAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MonthlyReport = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [dailyReport, setDailyReport] = useState(null);
    const [branches, setBranches] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [filters, setFilters] = useState({
        branch_id: '',
        salesman_id: '',
        year: new Date().getFullYear().toString()
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchReport();
        setSelectedMonth(null);
        setDailyReport(null);
    }, [filters]);

    const fetchDropdownData = async () => {
        try {
            const [branchesRes, salesmenRes] = await Promise.all([
                branchAPI.getAll(),
                salesmanAPI.getAll()
            ]);
            setBranches(branchesRes.data);
            setSalesmen(salesmenRes.data);
        } catch (error) {
            toast.error('Failed to load filters');
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.salesman_id) params.salesman_id = filters.salesman_id;
            if (filters.year) params.year = filters.year;

            const response = await salesAPI.getMonthlyReport(params);
            setReport(response.data);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleMonthClick = async (monthNum) => {
        if (selectedMonth === monthNum) {
            setSelectedMonth(null);
            setDailyReport(null);
            return;
        }

        setSelectedMonth(monthNum);
        setLoading(true);
        try {
            const params = {
                month: monthNum.padStart(2, '0'),
                year: filters.year
            };
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.salesman_id) params.salesman_id = filters.salesman_id;

            const response = await salesAPI.getDailyReport(params);
            setDailyReport(response.data);
        } catch (error) {
            toast.error('Failed to load daily report');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount) + ' TK';
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h2 className="mb-0">Monthly Report</h2>
            </div>

            {/* Filters */}
            <div className="card mb-4 mobile-filter-section">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Branch</label>
                            <select
                                className="form-select"
                                value={filters.branch_id}
                                onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })}
                            >
                                <option value="">All Branches</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Salesman</label>
                            <select
                                className="form-select"
                                value={filters.salesman_id}
                                onChange={(e) => setFilters({ ...filters, salesman_id: e.target.value })}
                            >
                                <option value="">All Salesmen</option>
                                {salesmen.map((salesman) => (
                                    <option key={salesman.id} value={salesman.id}>{salesman.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Year</label>
                            <select
                                className="form-select"
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            >
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Year Total */}
            <div className="row mb-4 summary-cards-mobile">
                <div className="col-md-6">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h6>Year Total ({filters.year})</h6>
                            <h2>{formatCurrency(report?.year_total || 0)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h6>Months with Sales</h6>
                            <h2>{report?.monthly_report?.length || 0}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Table */}
            <div className="desktop-table">
                <div className="card mb-4">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Monthly Breakdown - {filters.year}</h5>
                    </div>
                    <div className="card-body">
                        {loading && !selectedMonth ? (
                            <div className="d-flex justify-content-center p-4">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Month</th>
                                            <th className="text-center">Total Entries</th>
                                            <th className="text-end">Monthly Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report?.monthly_report?.length > 0 ? (
                                            report.monthly_report.map((month) => (
                                                <tr
                                                    key={month.month}
                                                    onClick={() => handleMonthClick(month.month)}
                                                    style={{ cursor: 'pointer' }}
                                                    className={selectedMonth === month.month ? 'table-active' : ''}
                                                >
                                                    <td>
                                                        <strong>
                                                            {selectedMonth === month.month ? '▼ ' : '▶ '}
                                                            {months[parseInt(month.month) - 1]}
                                                        </strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary">{month.total_entries}</span>
                                                    </td>
                                                    <td className="text-end">
                                                        <strong className="text-success">{formatCurrency(month.monthly_total)}</strong>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-4">
                                                    No data found for this year.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {report?.monthly_report?.length > 0 && (
                                        <tfoot className="table-light">
                                            <tr>
                                                <td><strong>Year Total</strong></td>
                                                <td className="text-center">
                                                    <strong>{report.monthly_report.reduce((sum, m) => sum + m.total_entries, 0)}</strong>
                                                </td>
                                                <td className="text-end">
                                                    <strong className="text-primary">{formatCurrency(report.year_total)}</strong>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Card List */}
            <div className="mobile-card-list">
                {loading && !selectedMonth ? (
                    <div className="d-flex justify-content-center p-4">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : report?.monthly_report?.length > 0 ? (
                    <>
                        {report.monthly_report.map((month) => (
                            <div
                                key={month.month}
                                className={`mobile-month-card ${selectedMonth === month.month ? 'active' : ''}`}
                                onClick={() => handleMonthClick(month.month)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="mobile-card-header">
                                    <span className="mobile-card-title">
                                        {selectedMonth === month.month ? '▼ ' : '▶ '}
                                        {months[parseInt(month.month) - 1]}
                                    </span>
                                    <span className="badge bg-secondary">{month.total_entries} entries</span>
                                </div>
                                <div className="mobile-card-body">
                                    <div className="mobile-total-field">
                                        <small className="text-muted">Monthly Total</small>
                                        <strong className="text-success fs-5">{formatCurrency(month.monthly_total)}</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="text-center text-muted py-4">
                        No data found for this year.
                    </div>
                )}
            </div>

            {/* Daily Breakdown (when month is selected) */}
            {selectedMonth && (
                <div className="card mobile-daily-breakdown">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            Daily Breakdown - {months[parseInt(selectedMonth) - 1]} {filters.year}
                        </h5>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => { setSelectedMonth(null); setDailyReport(null); }}
                        >
                            Close
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="d-flex justify-content-center p-4">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : dailyReport?.daily_report?.length > 0 ? (
                            <>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <span className="badge bg-primary fs-6">
                                            Month Total: {formatCurrency(dailyReport.month_total)}
                                        </span>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <span className="badge bg-info fs-6">
                                            Days with Sales: {dailyReport.daily_report.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date</th>
                                                <th className="text-center">Entries</th>
                                                <th className="text-end">Daily Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dailyReport.daily_report.map((day) => (
                                                <tr key={day.sale_date}>
                                                    <td>
                                                        <strong>{new Date(day.sale_date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}</strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary">{day.entries}</span>
                                                    </td>
                                                    <td className="text-end">
                                                        <strong className="text-success">{formatCurrency(day.daily_total)}</strong>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <td><strong>Total</strong></td>
                                                <td className="text-center">
                                                    <strong>{dailyReport.daily_report.reduce((sum, d) => sum + d.entries, 0)}</strong>
                                                </td>
                                                <td className="text-end">
                                                    <strong className="text-primary">{formatCurrency(dailyReport.month_total)}</strong>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {/* Mobile daily card list */}
                                <div className="mobile-daily-card-list">
                                    {dailyReport.daily_report.map((day) => (
                                        <div key={day.sale_date} className="mobile-daily-card">
                                            <div className="mobile-card-header">
                                                <span className="mobile-card-title">
                                                    {new Date(day.sale_date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="badge bg-secondary">{day.entries}</span>
                                            </div>
                                            <div className="mobile-card-body">
                                                <div className="mobile-total-field">
                                                    <small className="text-muted">Daily Total</small>
                                                    <strong className="text-success fs-5">{formatCurrency(day.daily_total)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted py-4">
                                No daily data found for this month.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyReport;
