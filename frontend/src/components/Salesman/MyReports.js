import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MyReports = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('daily');
    const [dailyReport, setDailyReport] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString()
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchReports();
    }, [filters, activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = {
                salesman_id: user.id,
                month: filters.month,
                year: filters.year
            };

            if (activeTab === 'daily') {
                const response = await salesAPI.getDailyReport(params);
                setDailyReport(response.data);
            } else {
                const response = await salesAPI.getMonthlyReport(params);
                setMonthlyReport(response.data);
            }
        } catch (error) {
            toast.error('Failed to load report');
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
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/salesman/entry')}>
                    ← Back
                </button>
                <h2 className="mb-0">My Reports</h2>
            </div>

            {/* Filters */}
            <div className="mobile-filter-section">
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Month</label>
                            <select
                                className="form-select"
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            >
                                {months.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
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
            </div>

            {/* Tabs */}
            <div className="mobile-tabs mb-4">
                <button
                    className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                    onClick={() => setActiveTab('daily')}
                >
                    Daily Report
                </button>
                <button
                    className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monthly')}
                >
                    Monthly Report
                </button>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : activeTab === 'daily' ? (
                <>
                    {/* Daily Report */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card bg-primary text-white">
                                <div className="card-body text-center">
                                    <h6>Month Total ({months[parseInt(filters.month) - 1]} {filters.year})</h6>
                                    <h2>{formatCurrency(dailyReport?.month_total || 0)}</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Daily Breakdown</h5>
                        </div>
                        <div className="card-body">
                            <div className="desktop-table">
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
                                            {dailyReport?.daily_report?.length > 0 ? (
                                                dailyReport.daily_report.map((day) => (
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
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-muted py-4">
                                                        No data found for this period.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="mobile-card-list">
                                {dailyReport?.daily_report?.length > 0 ? (
                                    dailyReport.daily_report.map((day) => (
                                        <div className="card mb-3" key={day.sale_date}>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="card-title mb-0">
                                                        {new Date(day.sale_date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </h6>
                                                    <span className="badge bg-secondary">{day.entries} entries</span>
                                                </div>
                                                <h4 className="text-success mb-0">{formatCurrency(day.daily_total)}</h4>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        No data found for this period.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Monthly Report */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card bg-primary text-white">
                                <div className="card-body text-center">
                                    <h6>Year Total ({filters.year})</h6>
                                    <h2>{formatCurrency(monthlyReport?.year_total || 0)}</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Monthly Breakdown - {filters.year}</h5>
                        </div>
                        <div className="card-body">
                            <div className="desktop-table">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Month</th>
                                                <th className="text-center">Entries</th>
                                                <th className="text-end">Monthly Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyReport?.monthly_report?.length > 0 ? (
                                                monthlyReport.monthly_report.map((month) => (
                                                    <tr key={month.month}>
                                                        <td>
                                                            <strong>{months[parseInt(month.month) - 1]}</strong>
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
                                    </table>
                                </div>
                            </div>
                            <div className="mobile-card-list">
                                {monthlyReport?.monthly_report?.length > 0 ? (
                                    monthlyReport.monthly_report.map((month) => (
                                        <div className="card mb-3" key={month.month}>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="card-title mb-0">
                                                        {months[parseInt(month.month) - 1]}
                                                    </h6>
                                                    <span className="badge bg-secondary">{month.total_entries} entries</span>
                                                </div>
                                                <h4 className="text-success mb-0">{formatCurrency(month.monthly_total)}</h4>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        No data found for this year.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyReports;
