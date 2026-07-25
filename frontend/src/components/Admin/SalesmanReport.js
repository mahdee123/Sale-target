import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI, branchAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SalesmanReport = () => {
    const navigate = useNavigate();
    const [performance, setPerformance] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        branch_id: '',
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString()
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [filters]);

    const fetchBranches = async () => {
        try {
            const response = await branchAPI.getAll();
            setBranches(response.data);
        } catch (error) {
            toast.error('Failed to load branches');
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.month) params.month = filters.month;
            if (filters.year) params.year = filters.year;

            const response = await salesAPI.getSalesmanPerformance(params);
            setPerformance(response.data);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount) + ' TK';
    };

    const totalTodaySales = performance.reduce((sum, p) => sum + p.today_sales, 0);
    const totalMonthSales = performance.reduce((sum, p) => sum + p.month_sales, 0);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h2 className="mb-0">Salesman Report</h2>
            </div>

            {/* Filters */}
            <div className="mobile-filter-section">
                <div className="card mb-4">
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
            </div>

            {/* Summary */}
            <div className="summary-cards-mobile row mb-4">
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h6>Total Active Salesmen</h6>
                            <h2>{performance.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h6>Today's Total</h6>
                            <h2>{formatCurrency(totalTodaySales)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h6>Month Total</h6>
                            <h2>{formatCurrency(totalMonthSales)}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Table - Desktop */}
            <div className="desktop-table">
                <div className="card">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Salesman Performance - {months[parseInt(filters.month) - 1]} {filters.year}</h5>
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
                                            <th>Salesman Name</th>
                                            <th>Branch</th>
                                            <th className="text-center">Today Entries</th>
                                            <th className="text-end">Today Sales</th>
                                            <th className="text-end">Monthly Sales</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performance.length > 0 ? (
                                            performance.map((person) => (
                                                <tr key={person.id}>
                                                    <td><strong>{person.full_name}</strong></td>
                                                    <td>{person.branch_name || 'N/A'}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary">{person.today_entries}</span>
                                                    </td>
                                                    <td className="text-end">{formatCurrency(person.today_sales)}</td>
                                                    <td className="text-end">
                                                        <strong className="text-success">{formatCurrency(person.month_sales)}</strong>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-4">
                                                    No salesmen found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {performance.length > 0 && (
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan="2"><strong>Total</strong></td>
                                                <td className="text-center">
                                                    <strong>{performance.reduce((sum, p) => sum + p.today_entries, 0)}</strong>
                                                </td>
                                                <td className="text-end">
                                                    <strong>{formatCurrency(totalTodaySales)}</strong>
                                                </td>
                                                <td className="text-end">
                                                    <strong className="text-primary">{formatCurrency(totalMonthSales)}</strong>
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

            {/* Performance List - Mobile */}
            <div className="mobile-card-list">
                {loading ? (
                    <div className="d-flex justify-content-center p-4">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : performance.length > 0 ? (
                    <>
                        {performance.map((person) => (
                            <div className="mobile-card" key={person.id}>
                                <div className="mobile-card-header">
                                    <div className="mobile-card-title">{person.full_name}</div>
                                    <div className="mobile-card-subtitle">{person.branch_name || 'N/A'}</div>
                                </div>
                                <div className="mobile-card-body">
                                    <div className="mobile-card-field">
                                        <span className="badge bg-secondary">{person.today_entries}</span> Today Entries
                                    </div>
                                    <div className="mobile-card-field text-success">
                                        <strong>{formatCurrency(person.today_sales)}</strong> Today Sales
                                    </div>
                                    <div className="mobile-card-field">
                                        <strong>{formatCurrency(person.month_sales)}</strong> Monthly Sales
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mobile-card mobile-card-total">
                            <div className="mobile-card-header">
                                <div className="mobile-card-title">Total</div>
                            </div>
                            <div className="mobile-card-body">
                                <div className="mobile-card-field">
                                    <span className="badge bg-secondary">{performance.reduce((sum, p) => sum + p.today_entries, 0)}</span> Today Entries
                                </div>
                                <div className="mobile-card-field text-success">
                                    <strong>{formatCurrency(totalTodaySales)}</strong> Today Sales
                                </div>
                                <div className="mobile-card-field">
                                    <strong>{formatCurrency(totalMonthSales)}</strong> Monthly Sales
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted py-4">
                        No salesmen found.
                    </div>
                )}
            </div>
            </div>
    );
};

export default SalesmanReport;
