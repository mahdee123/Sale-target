import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [statsRes, salesmenRes] = await Promise.all([
                salesAPI.getDashboard(),
                salesAPI.getSalesmanPerformance({})
            ]);
            setStats(statsRes.data);
            setSalesmen(salesmenRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount) + ' TK';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-3">
            {/* Mobile Header */}
            <div className="mobile-header d-md-none">
                <h5 className="page-title">Dashboard</h5>
            </div>
            <h2 className="mb-4 d-none d-md-block">Admin Dashboard</h2>

            {/* Summary Cards */}
            <div className="row g-2 mb-3 stat-cards-grid">
                <div className="col-6 col-md-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body p-2 p-md-3">
                            <h6 className="card-title mb-1" style={{fontSize: '12px'}}>Branches</h6>
                            <h3 className="mb-0">{stats?.total_branches || 0}</h3>
                        </div>
                        <div className="card-footer bg-transparent border-0 p-2 d-none d-md-block">
                            <Link to="/admin/branches" className="text-white small">View All →</Link>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body p-2 p-md-3">
                            <h6 className="card-title mb-1" style={{fontSize: '12px'}}>Salesmen</h6>
                            <h3 className="mb-0">{stats?.total_salesmen || 0}</h3>
                        </div>
                        <div className="card-footer bg-transparent border-0 p-2 d-none d-md-block">
                            <Link to="/admin/salesmen" className="text-white small">View All →</Link>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body p-2 p-md-3">
                            <h6 className="card-title mb-1" style={{fontSize: '12px'}}>Today</h6>
                            <h3 className="mb-0" style={{fontSize: '18px'}}>{formatCurrency(stats?.today_sales || 0)}</h3>
                        </div>
                        <div className="card-footer bg-transparent border-0 p-2 d-none d-md-block">
                            <Link to="/admin/reports/daily" className="text-white small">View Report →</Link>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card bg-warning text-dark h-100">
                        <div className="card-body p-2 p-md-3">
                            <h6 className="card-title mb-1" style={{fontSize: '12px'}}>Monthly</h6>
                            <h3 className="mb-0" style={{fontSize: '18px'}}>{formatCurrency(stats?.month_sales || 0)}</h3>
                        </div>
                        <div className="card-footer bg-transparent border-0 p-2 d-none d-md-block">
                            <Link to="/admin/reports/monthly" className="text-dark small">View Report →</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branch Overview - Desktop Table */}
            <div className="card mb-3 desktop-table">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Branch Overview</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Branch Name</th>
                                    <th>Salesmen</th>
                                    <th className="text-end">Today's Sale</th>
                                    <th className="text-end">Monthly Sale</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.branch_overview?.length > 0 ? (
                                    stats.branch_overview.map((branch) => (
                                        <tr key={branch.id}>
                                            <td><strong>{branch.branch_name}</strong></td>
                                            <td><span className="badge bg-secondary">{branch.salesman_count}</span></td>
                                            <td className="text-end">{formatCurrency(branch.today_sale)}</td>
                                            <td className="text-end">{formatCurrency(branch.month_sale)}</td>
                                            <td className="text-center">
                                                <Link to={`/admin/reports/branch?branch_id=${branch.id}`} className="btn btn-sm btn-outline-primary">
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">No branches found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Branch Overview - Mobile Cards */}
            <div className="mobile-card-list mb-3">
                <h6 className="fw-bold mb-2 px-1">Branch Overview</h6>
                {stats?.branch_overview?.length > 0 ? (
                    stats.branch_overview.map((branch) => (
                        <div key={branch.id} className="mobile-card">
                            <div className="mobile-card-header">
                                <div>
                                    <h6 className="mobile-card-title">{branch.branch_name}</h6>
                                    <span className="mobile-card-subtitle">{branch.salesman_count} Salesmen</span>
                                </div>
                            </div>
                            <div className="mobile-card-body">
                                <div className="mobile-card-field">
                                    <div className="mobile-card-field-label">Today</div>
                                    <div className="mobile-card-field-value text-success">{formatCurrency(branch.today_sale)}</div>
                                </div>
                                <div className="mobile-card-field">
                                    <div className="mobile-card-field-label">Monthly</div>
                                    <div className="mobile-card-field-value">{formatCurrency(branch.month_sale)}</div>
                                </div>
                            </div>
                            <div className="mobile-card-actions">
                                <Link to={`/admin/reports/branch?branch_id=${branch.id}`} className="btn btn-sm btn-primary">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="mobile-card">
                        <div className="text-center text-muted py-3">No branches found.</div>
                    </div>
                )}
            </div>

            {/* Salesman Performance - Desktop Table */}
            <div className="card desktop-table">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Today's Salesman Performance</h5>
                    <Link to="/admin/reports/salesman" className="btn btn-sm btn-outline-primary">View Full Report</Link>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Salesman Name</th>
                                    <th>Branch</th>
                                    <th className="text-center">Entries</th>
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
                                            <td className="text-center"><span className="badge bg-secondary">{person.today_entries}</span></td>
                                            <td className="text-end"><strong className="text-success">{formatCurrency(person.today_sales)}</strong></td>
                                            <td className="text-end"><strong>{formatCurrency(person.month_sales)}</strong></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center text-muted py-4">No salesmen found.</td></tr>
                                )}
                            </tbody>
                            {salesmen.length > 0 && (
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan="2"><strong>Total</strong></td>
                                        <td className="text-center"><strong>{salesmen.reduce((sum, p) => sum + p.today_entries, 0)}</strong></td>
                                        <td className="text-end"><strong className="text-success">{formatCurrency(salesmen.reduce((sum, p) => sum + p.today_sales, 0))}</strong></td>
                                        <td className="text-end"><strong>{formatCurrency(salesmen.reduce((sum, p) => sum + p.month_sales, 0))}</strong></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* Salesman Performance - Mobile Cards */}
            <div className="mobile-card-list">
                <h6 className="fw-bold mb-2 px-1">Salesman Performance</h6>
                {salesmen.length > 0 ? (
                    salesmen.map((person) => (
                        <div key={person.id} className="mobile-card">
                            <div className="mobile-card-header">
                                <div>
                                    <h6 className="mobile-card-title">{person.full_name}</h6>
                                    <span className="mobile-card-subtitle">{person.branch_name || 'N/A'}</span>
                                </div>
                                <span className="badge bg-secondary">{person.today_entries} entries</span>
                            </div>
                            <div className="mobile-card-body">
                                <div className="mobile-card-field">
                                    <div className="mobile-card-field-label">Today</div>
                                    <div className="mobile-card-field-value text-success">{formatCurrency(person.today_sales)}</div>
                                </div>
                                <div className="mobile-card-field">
                                    <div className="mobile-card-field-label">Monthly</div>
                                    <div className="mobile-card-field-value">{formatCurrency(person.month_sales)}</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="mobile-card">
                        <div className="text-center text-muted py-3">No salesmen found.</div>
                    </div>
                )}
                {salesmen.length > 0 && (
                    <div className="mobile-card" style={{background: '#e8f4fd'}}>
                        <div className="mobile-card-body">
                            <div className="mobile-card-field">
                                <div className="mobile-card-field-label">Total Entries</div>
                                <div className="mobile-card-field-value large">{salesmen.reduce((sum, p) => sum + p.today_entries, 0)}</div>
                            </div>
                            <div className="mobile-card-field">
                                <div className="mobile-card-field-label">Total Sales</div>
                                <div className="mobile-card-field-value large text-success">{formatCurrency(salesmen.reduce((sum, p) => sum + p.today_sales, 0))}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
