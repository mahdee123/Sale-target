import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';

// Common Components
import Navbar from './components/Common/Navbar';
import BottomNav from './components/Common/BottomNav';

// Admin Components
import Dashboard from './components/Admin/Dashboard';
import BranchManagement from './components/Admin/BranchManagement';
import SalesmanManagement from './components/Admin/SalesmanManagement';
import SalesReports from './components/Admin/SalesReports';
import DailyReport from './components/Admin/DailyReport';
import MonthlyReport from './components/Admin/MonthlyReport';
import BranchReport from './components/Admin/BranchReport';
import SalesmanReport from './components/Admin/SalesmanReport';

// Salesman Components
import SalesEntry from './components/Salesman/SalesEntry';
import MySales from './components/Salesman/MySales';
import MyReports from './components/Salesman/MyReports';

// Layout Component
const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <div className="mobile-page-bottom">
                {children}
            </div>
            <BottomNav />
        </>
    );
};

// Home redirect based on role
const HomeRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/salesman/entry" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <ToastContainer
                        position="top-center"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Home Redirect */}
                        <Route path="/" element={
                            <PrivateRoute>
                                <HomeRedirect />
                            </PrivateRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={
                            <PrivateRoute adminOnly>
                                <Layout><Dashboard /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/branches" element={
                            <PrivateRoute adminOnly>
                                <Layout><BranchManagement /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/salesmen" element={
                            <PrivateRoute adminOnly>
                                <Layout><SalesmanManagement /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/sales" element={
                            <PrivateRoute adminOnly>
                                <Layout><SalesReports /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/reports/daily" element={
                            <PrivateRoute adminOnly>
                                <Layout><DailyReport /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/reports/monthly" element={
                            <PrivateRoute adminOnly>
                                <Layout><MonthlyReport /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/reports/branch" element={
                            <PrivateRoute adminOnly>
                                <Layout><BranchReport /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/admin/reports/salesman" element={
                            <PrivateRoute adminOnly>
                                <Layout><SalesmanReport /></Layout>
                            </PrivateRoute>
                        } />

                        {/* Salesman Routes */}
                        <Route path="/salesman/entry" element={
                            <PrivateRoute>
                                <Layout><SalesEntry /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/salesman/my-sales" element={
                            <PrivateRoute>
                                <Layout><MySales /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/salesman/reports" element={
                            <PrivateRoute>
                                <Layout><MyReports /></Layout>
                            </PrivateRoute>
                        } />

                        {/* 404 Redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
