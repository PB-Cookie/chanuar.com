import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";

const ProtectedRoute = ({ children, roleRequired }: { children: React.ReactNode, roleRequired?: 'user' | 'admin' }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roleRequired && role !== roleRequired) {
    // Redirect to appropriate dashboard if role doesn't match
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
};

const AppContent = () => {
  const { user, role, loading } = useAuth();

  React.useEffect(() => {
    const checkNotifications = async () => {
      if (!user) return;

      // 1. Day 1 Notification
      const date = new Date();
      if (date.getDate() === 1) {
        const notified = localStorage.getItem('lastNotificationDate');
        const today = date.toDateString();

        if (notified !== today) {
          alert("Hoy es día 1 del mes! Time for the monthly challenge!");
          localStorage.setItem('lastNotificationDate', today);
        }
      }

      // 2. Rejection Notification
      const { data: targetData } = await import('./lib/supabase').then(m => m.supabase
        .from('monthly_targets')
        .select('id')
        .eq('month', date.getMonth() + 1)
        .eq('year', date.getFullYear())
        .single()
      );

      if (targetData) {
        const { data: submission } = await import('./lib/supabase').then(m => m.supabase
          .from('submissions')
          .select('status, id')
          .eq('user_id', user.id)
          .eq('target_id', targetData.id)
          .maybeSingle()
        );

        if (submission && submission.status === 'rejected') {
          const rejectionKey = `rejection_notified_${submission.id}`;
          if (!localStorage.getItem(rejectionKey)) {
            alert("Your submission was rejected. Please check the dashboard and try again.");
            localStorage.setItem(rejectionKey, 'true');
          }
        }
      }
    };

    checkNotifications();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roleRequired="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute roleRequired="admin">
          <AdminManagement />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={user ? (role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
