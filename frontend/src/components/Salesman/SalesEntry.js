import React, { useState } from 'react';
import { salesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SalesEntry = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [recentEntries, setRecentEntries] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const response = await salesAPI.addSale({ amount: parseFloat(amount) });
            toast.success('Sale entry added successfully!');
            setRecentEntries([response.data, ...recentEntries]);
            setAmount('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add entry');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN').format(amt) + ' TK';
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="container py-3">
            {/* Welcome Card */}
            <div className="card bg-primary text-white mb-3">
                <div className="card-body text-center py-3">
                    <h5 className="mb-1">Welcome, {user?.full_name}</h5>
                    <p className="mb-0 small">{today}</p>
                </div>
            </div>

            {/* Sales Entry Form */}
            <div className="card mb-3 mobile-form-card">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Add New Sale Entry</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Sales Amount (TK)</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control form-control-lg"
                                    placeholder="Enter sales amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1"
                                    step="any"
                                    required
                                />
                                <span className="input-group-text">TK</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Entry'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="card mb-3">
                <div className="card-header bg-white">
                    <h6 className="mb-0">Quick Amount</h6>
                </div>
                <div className="card-body">
                    <div className="quick-amount-grid">
                        {[500, 1000, 2000, 5000, 10000].map((quickAmount) => (
                            <button
                                key={quickAmount}
                                className="quick-amount-btn btn btn-outline-primary"
                                onClick={() => setAmount(quickAmount.toString())}
                            >
                                {formatCurrency(quickAmount)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Entries */}
            {recentEntries.length > 0 && (
                <div className="card">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Recent Entries Today</h5>
                    </div>
                    <div className="card-body">
                        <div className="desktop-table">
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th className="text-end">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentEntries.map((entry, index) => (
                                            <tr key={entry.id || index}>
                                                <td>{entry.sale_time}</td>
                                                <td className="text-end">
                                                    <strong className="text-success">
                                                        {formatCurrency(entry.amount)}
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mobile-card-list">
                            {recentEntries.map((entry, index) => (
                                <div className="mobile-card" key={entry.id || index}>
                                    <div className="mobile-card-time">{entry.sale_time}</div>
                                    <div className="mobile-card-amount text-success">
                                        <strong>{formatCurrency(entry.amount)}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesEntry;
