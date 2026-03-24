import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import TimetablesPage from './pages/TimetablesPage';
import TimetableViewPage from './pages/TimetableViewPage';
import TimetableEditorPage from './pages/TimetableEditorPage';
import SubjectSelectionPage from './pages/SubjectSelectionPage';
import ExpectationsPage from './pages/ExpectationsPage';
import StaffPage from './pages/StaffPage';
import CurriculumPage from './pages/CurriculumPage';

// Layout wrapper with sidebar
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><DashboardPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><UsersPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetables"
        element={
          <ProtectedRoute>
            <AppLayout><TimetablesPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetables/new"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><TimetableEditorPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetables/:id"
        element={
          <ProtectedRoute>
            <AppLayout><TimetableViewPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetables/:id/edit"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><TimetableEditorPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expectations"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><ExpectationsPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/preferences"
        element={
          <ProtectedRoute roles={['staff']}>
            <AppLayout><SubjectSelectionPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <AppLayout><StaffPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/curriculum"
        element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <AppLayout><CurriculumPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#e2e8f0',
              border: '1px solid #1e2d45',
              fontSize: '0.85rem',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
