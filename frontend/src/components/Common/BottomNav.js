import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
    const location = useLocation();
    const { isAdmin } = useAuth();

    const isActive = (path) => location.pathname.startsWith(path);

    if (isAdmin) {
        return (
            <nav className="bottom-nav safe-bottom">
                <Link to="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Dashboard</span>
                </Link>
                <Link to="/admin/branches" className={`nav-item ${isActive('/admin/branches') ? 'active' : ''}`}>
                    <span className="nav-icon">🏪</span>
                    <span className="nav-label">Branches</span>
                </Link>
                <Link to="/admin/salesmen" className={`nav-item ${isActive('/admin/salesmen') ? 'active' : ''}`}>
                    <span className="nav-icon">👥</span>
                    <span className="nav-label">Salesmen</span>
                </Link>
                <Link to="/admin/sales" className={`nav-item ${isActive('/admin/reports') || isActive('/admin/sales') ? 'active' : ''}`}>
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">Reports</span>
                </Link>
            </nav>
        );
    }

    return (
        <nav className="bottom-nav safe-bottom">
            <Link to="/salesman/entry" className={`nav-item ${location.pathname === '/salesman/entry' ? 'active' : ''}`}>
                <span className="nav-icon">➕</span>
                <span className="nav-label">New Sale</span>
            </Link>
            <Link to="/salesman/my-sales" className={`nav-item ${isActive('/salesman/my-sales') ? 'active' : ''}`}>
                <span className="nav-icon">💰</span>
                <span className="nav-label">My Sales</span>
            </Link>
            <Link to="/salesman/reports" className={`nav-item ${isActive('/salesman/reports') ? 'active' : ''}`}>
                <span className="nav-icon">📈</span>
                <span className="nav-label">Reports</span>
            </Link>
            <Link to="/login" className="nav-item" onClick={() => { localStorage.clear(); }}>
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Logout</span>
            </Link>
        </nav>
    );
};

export default BottomNav;
