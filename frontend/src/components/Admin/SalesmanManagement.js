import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesmanAPI, branchAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SalesmanManagement = () => {
    const navigate = useNavigate();
    const [salesmen, setSalesmen] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingSalesman, setEditingSalesman] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        mobile: '',
        password: '',
        branch_id: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesmenRes, branchesRes] = await Promise.all([
                salesmanAPI.getAll(),
                branchAPI.getAll()
            ]);
            setSalesmen(salesmenRes.data);
            setBranches(branchesRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingSalesman) {
                await salesmanAPI.update(editingSalesman.id, {
                    full_name: formData.full_name,
                    mobile: formData.mobile,
                    branch_id: formData.branch_id
                });
                toast.success('Salesman updated successfully');
            } else {
                await salesmanAPI.create(formData);
                toast.success('Salesman created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await salesmanAPI.resetPassword(editingSalesman.id, { password: newPassword });
            toast.success('Password reset successfully');
            setShowPasswordModal(false);
            setNewPassword('');
            setEditingSalesman(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 'active' ? 'disable' : 'enable';
        if (window.confirm(`Are you sure you want to ${action} this salesman?`)) {
            try {
                await salesmanAPI.toggleStatus(id);
                toast.success(`Salesman ${action}d successfully`);
                fetchData();
            } catch (error) {
                toast.error('Failed to update status');
            }
        }
    };

    const handleEdit = (salesman) => {
        setEditingSalesman(salesman);
        setFormData({
            full_name: salesman.full_name,
            mobile: salesman.mobile,
            password: '',
            branch_id: salesman.branch_id
        });
        setShowModal(true);
    };

    const openPasswordModal = (salesman) => {
        setEditingSalesman(salesman);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    const resetForm = () => {
        setEditingSalesman(null);
        setFormData({ full_name: '', mobile: '', password: '', branch_id: '' });
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                        ← Back
                    </button>
                    <h2 className="mb-0">Salesman Management</h2>
                </div>
                <button className="btn btn-primary" onClick={openModal}>
                    + Add Salesman
                </button>
            </div>

            <div className="desktop-table">
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Full Name</th>
                                        <th>Mobile</th>
                                        <th>Branch</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesmen.length > 0 ? (
                                        salesmen.map((salesman, index) => (
                                            <tr key={salesman.id}>
                                                <td>{index + 1}</td>
                                                <td><strong>{salesman.full_name}</strong></td>
                                                <td>{salesman.mobile}</td>
                                                <td>{salesman.branch_name || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${salesman.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                                        {salesman.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleEdit(salesman)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-1"
                                                        onClick={() => openPasswordModal(salesman)}
                                                    >
                                                        Reset PW
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${salesman.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                        onClick={() => handleToggleStatus(salesman.id, salesman.status)}
                                                    >
                                                        {salesman.status === 'active' ? 'Disable' : 'Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                No salesmen found. Click "Add Salesman" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mobile-card-list">
                {salesmen.length > 0 ? (
                    salesmen.map((salesman) => (
                        <div className="card mb-3" key={salesman.id}>
                            <div className="mobile-card-header">
                                <span className="mobile-card-title">{salesman.full_name}</span>
                                <span className={`badge ${salesman.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                    {salesman.status}
                                </span>
                            </div>
                            <div className="mobile-card-body">
                                <div className="mb-2">
                                    <small className="text-muted">Mobile:</small> {salesman.mobile}
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Branch:</small> {salesman.branch_name || 'N/A'}
                                </div>
                            </div>
                            <div className="mobile-card-actions">
                                <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => handleEdit(salesman)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-warning me-1"
                                    onClick={() => openPasswordModal(salesman)}
                                >
                                    Reset PW
                                </button>
                                <button
                                    className={`btn btn-sm ${salesman.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                    onClick={() => handleToggleStatus(salesman.id, salesman.status)}
                                >
                                    {salesman.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card">
                        <div className="card-body text-center text-muted py-4">
                            No salesmen found. Click "Add Salesman" to create one.
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSalesman ? 'Edit Salesman' : 'Add New Salesman'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {!editingSalesman && (
                                        <div className="mb-3">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Branch</label>
                                        <select
                                            className="form-select"
                                            value={formData.branch_id}
                                            onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.branch_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving...' : (editingSalesman ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showPasswordModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reset Password - {editingSalesman?.full_name}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPasswordModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleResetPassword}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowPasswordModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-warning"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesmanManagement;
