import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/ui/PageTransition';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CourseLearningPage = lazy(() => import('./pages/CourseLearningPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  const location = useLocation();

  const transitionType =
    location.pathname === '/' ? 'scale' : location.pathname.includes('dashboard') ? 'slide' : 'fade';

  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-20 max-w-xl px-4">
          <LoadingSkeleton rows={5} />
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <PageTransition type={transitionType}>
                  <LandingPage />
                </PageTransition>
              }
            />
            <Route
              path="/team"
              element={
                <PageTransition type={transitionType}>
                  <TeamPage />
                </PageTransition>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <PageTransition type={transitionType}>
                    <NotificationsPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition type={transitionType}>
                    <DashboardPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageTransition type={transitionType}>
                    <ProfilePage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/course/:courseId"
              element={
                <ProtectedRoute>
                  <PageTransition type={transitionType}>
                    <CourseLearningPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <PageTransition type={transitionType}>
                    <AdminPanelPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/login"
            element={
              <PageTransition type="fade">
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition type="fade">
                <SignupPage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;
