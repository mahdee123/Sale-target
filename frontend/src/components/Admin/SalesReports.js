import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI, branchAPI, salesmanAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SalesReports = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [branches, setBranches] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        branch_id: '',
        salesman_id: '',
        month: '',
        year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchSales();
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

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.branch_id) params.branch_id = filters.branch_id;
            if (filters.salesman_id) params.salesman_id = filters.salesman_id;
            if (filters.month) params.month = filters.month;
            if (filters.year) params.year = filters.year;

            const response = await salesAPI.getAll(params);
            setSales(response.data);
        } catch (error) {
            toast.error('Failed to load sales data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount) + ' TK';
    };

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h2 className="mb-0">All Sales</h2>
            </div>

            {/* Filters */}
            <div className="mobile-filter-section">
                <div className="card mb-4">
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
                                    <option value="">All Months</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
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

            {/* Summary */}
            <div className="mobile-summary-section row mb-4">
                <div className="col-md-4">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h6 className="text-muted">Total Entries</h6>
                            <h3>{sales.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h6 className="text-muted">Total Sales</h6>
                            <h3>{formatCurrency(totalSales)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table - Desktop */}
            <div className="desktop-table">
                <div className="card">
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
                                            <th>Time</th>
                                            <th>Salesman</th>
                                            <th>Branch</th>
                                            <th className="text-end">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.length > 0 ? (
                                            sales.map((sale) => (
                                                <tr key={sale.id}>
                                                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                                                    <td>{sale.sale_time}</td>
                                                    <td>{sale.salesman_name}</td>
                                                    <td>{sale.branch_name}</td>
                                                    <td className="text-end">
                                                        <strong>{formatCurrency(sale.amount)}</strong>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-4">
                                                    No sales found matching the filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sales Table - Mobile Card List */}
            <div className="mobile-card-list">
                {loading ? (
                    <div className="d-flex justify-content-center p-4">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : sales.length > 0 ? (
                    sales.map((sale) => (
                        <div className="card mb-3" key={sale.id}>
                            <div className="card-body">
                                <div className="mobile-card-header">
                                    <div className="mobile-card-title">{sale.salesman_name}</div>
                                    <div className="mobile-card-subtitle">{sale.branch_name}</div>
                                </div>
                                <div className="mobile-card-body">
                                    <div className="mobile-card-field">
                                        <span className="mobile-card-label">Date</span>
                                        <span className="mobile-card-value">{new Date(sale.sale_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mobile-card-field">
                                        <span className="mobile-card-label">Time</span>
                                        <span className="mobile-card-value">{sale.sale_time}</span>
                                    </div>
                                    <div className="mobile-card-field">
                                        <span className="mobile-card-label">Amount</span>
                                        <span className="mobile-card-value text-success" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(sale.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card">
                        <div className="card-body text-center text-muted py-4">
                            No sales found matching the filters.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesReports;
