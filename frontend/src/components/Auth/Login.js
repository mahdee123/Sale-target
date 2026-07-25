import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSalesmanLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login({ mobile, password });
            toast.success('Login successful!');
            navigate('/salesman/entry');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login({ mobile: adminUser, password: adminPass });
            toast.success('Admin login successful!');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
            <div className="w-100" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Sales Target Tracker</h2>
                    <p className="text-muted">Sign in to your account</p>
                </div>

                <div className="mobile-form-card">
                    {!showAdminLogin ? (
                        <>
                            <form onSubmit={handleSalesmanLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Mobile Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter mobile number"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <Link to="/register" className="text-decoration-none">
                                    Create New Account
                                </Link>
                            </div>

                            <hr className="my-3" />

                            <div className="text-center">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setShowAdminLogin(true)}
                                >
                                    Admin Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0 fw-bold">Admin Login</h6>
                                <button
                                    className="btn btn-sm btn-link p-0"
                                    onClick={() => setShowAdminLogin(false)}
                                >
                                    Back
                                </button>
                            </div>

                            <form onSubmit={handleAdminLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter admin username"
                                        value={adminUser}
                                        onChange={(e) => setAdminUser(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter admin password"
                                        value={adminPass}
                                        onChange={(e) => setAdminPass(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-dark w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Signing in...
                                        </>
                                    ) : (
                                        'Admin Sign In'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
