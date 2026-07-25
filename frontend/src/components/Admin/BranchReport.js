import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { salesAPI, branchAPI } from '../../services/api';
import { toast } from 'react-toastify';

const BranchReport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [branches, setBranches] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [allBranches, setAllBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        branch_id: searchParams.get('branch_id') || '',
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
            setAllBranches(response.data);
        } catch (error) {
            toast.error('Failed to load branches');
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.month) params.month = filters.month.padStart(2, '0');
            if (filters.year) params.year = filters.year;

            const [branchRes, salesmenRes] = await Promise.all([
                salesAPI.getBranchReport(params),
                salesAPI.getSalesmanPerformance({ branch_id: filters.branch_id })
            ]);
            setBranches(branchRes.data);
            setSalesmen(salesmenRes.data);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount) + ' TK';
    };

    const totalTodaySales = branches.reduce((sum, b) => sum + b.today_sales, 0);
    const totalMonthSales = branches.reduce((sum, b) => sum + b.month_sales, 0);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h2 className="mb-0">Branch Report</h2>
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
                                {allBranches.map((branch) => (
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
                                    <option key={index + 1} value={(index + 1).toString()}>{month}</option>
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

            {/* Branch Summary */}
            <div className="row mb-4 summary-cards-mobile">
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h6>Total Branches</h6>
                            <h2>{branches.length}</h2>
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

            {/* Branch Table */}
            <div className="card mb-4">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Branch Performance - {months[parseInt(filters.month) - 1]} {filters.year}</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="d-flex justify-content-center p-4">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="desktop-table">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Branch Name</th>
                                                <th className="text-center">Salesmen</th>
                                                <th className="text-end">Today's Sale</th>
                                                <th className="text-end">Monthly Sale</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {branches.length > 0 ? (
                                                branches.map((branch) => (
                                                    <tr key={branch.id}>
                                                        <td><strong>{branch.branch_name}</strong></td>
                                                        <td className="text-center">
                                                            <span className="badge bg-secondary">{branch.salesman_count}</span>
                                                        </td>
                                                        <td className="text-end">{formatCurrency(branch.today_sales)}</td>
                                                        <td className="text-end">
                                                            <strong>{formatCurrency(branch.month_sales)}</strong>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-4">
                                                        No branches found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {branches.length > 0 && (
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td><strong>Total</strong></td>
                                                    <td className="text-center">
                                                        <strong>{branches.reduce((sum, b) => sum + b.salesman_count, 0)}</strong>
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
                            </div>
                            <div className="mobile-card-list">
                                {branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <div key={branch.id} className="mobile-card">
                                            <div className="mobile-card-header">
                                                <span className="mobile-card-title">{branch.branch_name}</span>
                                                <span className="badge bg-secondary">{branch.salesman_count} Salesmen</span>
                                            </div>
                                            <div className="mobile-card-body">
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Today's Sale</span>
                                                    <span className="mobile-card-value">{formatCurrency(branch.today_sales)}</span>
                                                </div>
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Monthly Sale</span>
                                                    <span className="mobile-card-value">{formatCurrency(branch.month_sales)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-4">No branches found.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Salesman Performance */}
            <div className="card">
                <div className="card-header bg-white">
                    <h5 className="mb-0">
                        {filters.branch_id
                            ? `Salesman Performance - ${allBranches.find(b => b.id == filters.branch_id)?.branch_name || ''}`
                            : 'All Salesman Performance'
                        }
                    </h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="d-flex justify-content-center p-4">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="desktop-table">
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
                                            {salesmen.length > 0 ? (
                                                salesmen.map((person) => (
                                                    <tr key={person.id}>
                                                        <td><strong>{person.full_name}</strong></td>
                                                        <td>{person.branch_name || 'N/A'}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-secondary">{person.today_entries}</span>
                                                        </td>
                                                        <td className="text-end">
                                                            <strong className="text-success">{formatCurrency(person.today_sales)}</strong>
                                                        </td>
                                                        <td className="text-end">
                                                            <strong>{formatCurrency(person.month_sales)}</strong>
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
                                        {salesmen.length > 0 && (
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td colSpan="2"><strong>Total</strong></td>
                                                    <td className="text-center">
                                                        <strong>{salesmen.reduce((sum, p) => sum + p.today_entries, 0)}</strong>
                                                    </td>
                                                    <td className="text-end">
                                                        <strong className="text-success">
                                                            {formatCurrency(salesmen.reduce((sum, p) => sum + p.today_sales, 0))}
                                                        </strong>
                                                    </td>
                                                    <td className="text-end">
                                                        <strong>{formatCurrency(salesmen.reduce((sum, p) => sum + p.month_sales, 0))}</strong>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                            <div className="mobile-card-list">
                                {salesmen.length > 0 ? (
                                    salesmen.map((person) => (
                                        <div key={person.id} className="mobile-card">
                                            <div className="mobile-card-header">
                                                <span className="mobile-card-title">{person.full_name}</span>
                                                <span className="badge bg-secondary">{person.today_entries} Entries</span>
                                            </div>
                                            <div className="mobile-card-body">
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Today Sales</span>
                                                    <span className="mobile-card-value">{formatCurrency(person.today_sales)}</span>
                                                </div>
                                                <div className="mobile-card-field">
                                                    <span className="mobile-card-label">Monthly Sales</span>
                                                    <span className="mobile-card-value">{formatCurrency(person.month_sales)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-4">No salesmen found.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchReport;
