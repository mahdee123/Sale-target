import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary top-navbar">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/">
                    Sales Target Tracker
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {isAdmin && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin/branches">Branches</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin/salesmen">Salesmen</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        Reports
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><Link className="dropdown-item" to="/admin/sales">All Sales</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/reports/daily">Daily Report</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/reports/monthly">Monthly Report</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/reports/branch">Branch Report</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/reports/salesman">Salesman Report</Link></li>
                                    </ul>
                                </li>
                            </>
                        )}

                        {!isAdmin && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/salesman/entry">New Sale</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/salesman/my-sales">My Sales</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/salesman/reports">My Reports</Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="d-flex align-items-center">
                        <span className="text-light me-3">
                            <i className="bi bi-person-circle me-1"></i>
                            {user?.full_name || user?.mobile}
                            <small className="ms-2 badge bg-light text-primary">{user?.role}</small>
                        </span>
                        <button className="btn btn-outline-light" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
