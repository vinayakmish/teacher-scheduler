import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import UserProfile from './pages/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';
import { UserRole } from '@teacher-scheduler/shared-types';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect to appropriate dashboard based on role
  const getDashboardRoute = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.TEACHER:
        return '/teacher';
      case UserRole.STUDENT:
        return '/student';
      default:
        return '/login';
    }
  };

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={getDashboardRoute()} replace />}
        />

        <Route
          path="/admin/*"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherDashboard />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/student/*"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.TEACHER,
                UserRole.STUDENT,
              ]}
            >
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Access Denied
                </h1>
                <p className="text-gray-600">
                  You don't have permission to access this page.
                </p>
              </div>
            </div>
          }
        />

        <Route
          path="*"
          element={<Navigate to={getDashboardRoute()} replace />}
        />
      </Routes>
    </Layout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
