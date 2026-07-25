import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { branchAPI } from '../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        branch_id: ''
    });
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const { login } = useAuth();
    const navigate = useNavigate();

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
            setLoadingBranches(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/auth/register', {
                full_name: formData.full_name,
                mobile: formData.mobile,
                password: formData.password,
                branch_id: formData.branch_id
            });

            toast.success('Account created successfully!');
            const userData = await login({
                mobile: formData.mobile,
                password: formData.password
            });
            navigate('/salesman/entry');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (loadingBranches) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
            <div className="w-100" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Create Account</h2>
                    <p className="text-muted">Register as a Salesman</p>
                </div>

                <div className="mobile-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="full_name"
                                placeholder="Enter your full name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Mobile Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="mobile"
                                placeholder="Enter mobile number"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Select Branch</label>
                            <select
                                className="form-select"
                                name="branch_id"
                                value={formData.branch_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Select Branch --</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.branch_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="text-decoration-none">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
