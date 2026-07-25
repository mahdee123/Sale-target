import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchAPI } from '../../services/api';
import { toast } from 'react-toastify';

const BranchManagement = () => {
    const navigate = useNavigate();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [branchName, setBranchName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await branchAPI.getAll();
            setBranches(response.data);
        } catch (error) {
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingBranch) {
                await branchAPI.update(editingBranch.id, { branch_name: branchName });
                toast.success('Branch updated successfully');
            } else {
                await branchAPI.create({ branch_name: branchName });
                toast.success('Branch created successfully');
            }
            setShowModal(false);
            setBranchName('');
            setEditingBranch(null);
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setBranchName(branch.branch_name);
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await branchAPI.delete(id);
                toast.success('Branch deleted successfully');
                fetchBranches();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete branch');
            }
        }
    };

    const openModal = () => {
        setEditingBranch(null);
        setBranchName('');
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
            <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                    <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/admin/dashboard')}>
                        ← Back
                    </button>
                    <h2 className="mb-0">Branch Management</h2>
                </div>
                <button className="btn btn-primary w-100" onClick={openModal}>
                    + Add Branch
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="card desktop-table">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Branch Name</th>
                                    <th>Salesmen</th>
                                    <th>Created Date</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches.length > 0 ? (
                                    branches.map((branch, index) => (
                                        <tr key={branch.id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{branch.branch_name}</strong></td>
                                            <td>
                                                <span className="badge bg-info">{branch.salesman_count} Salesmen</span>
                                            </td>
                                            <td>{new Date(branch.created_at).toLocaleDateString()}</td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(branch)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(branch.id, branch.branch_name)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No branches found. Click "Add Branch" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-card-list">
                {branches.length > 0 ? (
                    branches.map((branch) => (
                        <div key={branch.id} className="card mobile-card mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="mobile-card-title mb-0">{branch.branch_name}</h5>
                                    <span className="badge bg-info">{branch.salesman_count} Salesmen</span>
                                </div>
                                <div className="text-muted mb-3">
                                    <small>Created: {new Date(branch.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="mobile-card-actions d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary flex-fill"
                                        onClick={() => handleEdit(branch)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger flex-fill"
                                        onClick={() => handleDelete(branch.id, branch.branch_name)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card mobile-card">
                        <div className="card-body text-center text-muted py-4">
                            No branches found. Click "Add Branch" to create one.
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
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
                                        <label className="form-label">Branch Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., Banasree Branch"
                                            value={branchName}
                                            onChange={(e) => setBranchName(e.target.value)}
                                            required
                                        />
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
                                        {submitting ? 'Saving...' : (editingBranch ? 'Update' : 'Create')}
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

export default BranchManagement;
