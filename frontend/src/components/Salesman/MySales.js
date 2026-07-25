import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MySales = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        month: '',
        year: new Date().getFullYear().toString()
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchSales();
    }, [filters]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.month) params.month = filters.month;
            if (filters.year) params.year = filters.year;

            const response = await salesAPI.getMySales(params);
            setSales(response.data);
        } catch (error) {
            toast.error('Failed to load sales');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await salesAPI.deleteSale(id);
                toast.success('Entry deleted successfully');
                fetchSales();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete entry');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount) + ' TK';
    };

    // Group sales by date
    const salesByDate = sales.reduce((acc, sale) => {
        if (!acc[sale.sale_date]) {
            acc[sale.sale_date] = [];
        }
        acc[sale.sale_date].push(sale);
        return acc;
    }, {});

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/salesman/entry')}>
                    ← Back
                </button>
                <h2 className="mb-0">My Sales History</h2>
            </div>

            {/* Filters */}
            <div className="card mb-4 mobile-filter-section">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Month</label>
                            <select
                                className="form-select"
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            >
                                <option value="">All Months</option>
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

            {/* Summary */}
            <div className="row mb-4 summary-cards-mobile">
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h6>Total Entries</h6>
                            <h2>{sales.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h6>Total Sales</h6>
                            <h2>{formatCurrency(sales.reduce((sum, s) => sum + s.amount, 0))}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales by Date */}
            {loading ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : sales.length > 0 ? (
                Object.entries(salesByDate).map(([date, daySales]) => (
                    <div key={date} className="card mb-3">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                {new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h6>
                            <span className="badge bg-success">
                                Total: {formatCurrency(daySales.reduce((sum, s) => sum + s.amount, 0))}
                            </span>
                        </div>
                        <div className="card-body p-0">
                            <div className="desktop-table">
                                <table className="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th className="text-end">Amount</th>
                                            <th className="text-center" style={{ width: '100px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {daySales.map((sale) => (
                                            <tr key={sale.id}>
                                                <td>{sale.sale_time}</td>
                                                <td className="text-end">
                                                    <strong>{formatCurrency(sale.amount)}</strong>
                                                </td>
                                                <td className="text-center">
                                                    {sale.sale_date === today && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(sale.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mobile-card-list">
                                <div className="mobile-date-header">
                                    <span>{new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                    <span className="badge bg-success">
                                        Total: {formatCurrency(daySales.reduce((sum, s) => sum + s.amount, 0))}
                                    </span>
                                </div>
                                {daySales.map((sale) => (
                                    <div key={sale.id} className="mobile-entry-item">
                                        <div className="mobile-entry-info">
                                            <span className="mobile-entry-time">{sale.sale_time}</span>
                                            <span className="mobile-entry-amount">{formatCurrency(sale.amount)}</span>
                                        </div>
                                        {sale.sale_date === today && (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(sale.id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="card">
                    <div className="card-body text-center text-muted py-5">
                        <h5>No sales entries found</h5>
                        <p>Start adding your sales entries to see them here.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySales;
