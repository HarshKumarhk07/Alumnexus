import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { Clock, XCircle } from 'lucide-react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Blogs from './pages/Blogs';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import AlumniDirectory from './pages/AlumniDirectory';
import StudentDirectory from './pages/StudentDirectory';
import PublicDirectory from './pages/PublicDirectory';
import Queries from './pages/Queries';

const VerificationStatusScreen = ({ status }) => {
  const { logout } = useAuth();

  if (status === 'rejected') {
    return (
      <div className="h-[80vh] flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md text-center border-2 border-red-200 premium-shadow">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-4">Verification Rejected</h2>
          <p className="text-[var(--text-light)] mb-8">
            Your account request has been disapproved by the admin. Please contact support for more information.
          </p>
          <button onClick={logout} className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:scale-105 transition-smooth w-full">Logout</button>
        </div>
      </div>
    );
  }

  // Pending State
  return (
    <div className="h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card p-10 max-w-md text-center premium-shadow">
        <div className="w-20 h-20 bg-[var(--surface)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-4">Verification Pending</h2>
        <p className="text-[var(--text-light)] mb-8">
          Your account request has been sent to the admin. Please check back later to see if it has been approved.
        </p>
        <button onClick={logout} className="px-6 py-3 bg-[var(--surface)] text-[var(--primary)] font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--background)] transition-smooth w-full">Logout</button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Restrict both alumni and students who are not verified
  if ((user.role === 'alumni' || user.role === 'student') && !user.isVerified) {
    return <VerificationStatusScreen status={user.verificationStatus} />;
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/public-directory" element={<PublicDirectory />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/directory" element={<ProtectedRoute><AlumniDirectory /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute roles={['alumni', 'admin']}><StudentDirectory /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/blogs" element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/queries" element={<ProtectedRoute><Queries /></ProtectedRoute>} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
};

export default App;
