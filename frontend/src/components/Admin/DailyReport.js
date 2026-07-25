import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI, branchAPI, salesmanAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DailyReport = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [branches, setBranches] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        branch_id: '',
        salesman_id: '',
        month: (new Date().getMonth() + 1).toString(),
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
            if (filters.month) params.month = filters.month;
            if (filters.year) params.year = filters.year;

            const response = await salesAPI.getDailyReport(params);
            setReport(response.data);
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
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h2 className="mb-0">Daily Report</h2>
            </div>

            {/* Filters */}
            <div className="card mb-4 mobile-filter-section">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
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
                        <div className="col-md-3">
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

            {/* Month Total */}
            <div className="row mb-4 summary-cards-mobile">
                <div className="col-md-6">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h6>Month Total ({months[parseInt(filters.month) - 1]} {filters.year})</h6>
                            <h2>{formatCurrency(report?.month_total || 0)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h6>Total Days with Sales</h6>
                            <h2>{report?.daily_report?.length || 0}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Table */}
            <div className="desktop-table">
            <div className="card">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Daily Breakdown</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="d-flex justify-content-center p-4">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
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
                                    {report?.daily_report?.length > 0 ? (
                                        report.daily_report.map((day) => (
                                            <tr key={day.sale_date}>
                                                <td>
                                                    <strong>{new Date(day.sale_date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
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
                                {report?.daily_report?.length > 0 && (
                                    <tfoot className="table-light">
                                        <tr>
                                            <td><strong>Total</strong></td>
                                            <td className="text-center">
                                                <strong>{report.daily_report.reduce((sum, d) => sum + d.entries, 0)}</strong>
                                            </td>
                                            <td className="text-end">
                                                <strong className="text-primary">{formatCurrency(report.month_total)}</strong>
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
                {loading ? (
                    <div className="d-flex justify-content-center p-4">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : report?.daily_report?.length > 0 ? (
                    <>
                        {report.daily_report.map((day) => (
                            <div className="card mb-3" key={day.sale_date}>
                                <div className="mobile-card-header d-flex justify-content-between align-items-center">
                                    <span className="mobile-card-title">
                                        {new Date(day.sale_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className="badge bg-secondary">{day.entries} entries</span>
                                </div>
                                <div className="mobile-card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">Daily Total</span>
                                        <strong className="text-success fs-5">{formatCurrency(day.daily_total)}</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="card mb-3 border-primary">
                            <div className="mobile-card-header d-flex justify-content-between align-items-center">
                                <span className="mobile-card-title fw-bold">Total</span>
                                <span className="badge bg-primary">{report.daily_report.reduce((sum, d) => sum + d.entries, 0)} entries</span>
                            </div>
                            <div className="mobile-card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Month Total</span>
                                    <strong className="text-success fs-5">{formatCurrency(report.month_total)}</strong>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted py-4">
                        No data found for this period.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyReport;
