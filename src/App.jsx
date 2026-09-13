import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import '@fortawesome/fontawesome-free/css/all.min.css';

/* Components */
import PageLoad from '@pages/PageLoad.jsx';
import Header from '@components/layout/Header.jsx';
import Footer from '@components/layout/Footer.jsx';
import routes from '@routes/routes.jsx';

/**
 * Layout component cho các trang public
 */
const PublicLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <PageLoad zIndex={1000} />;
  }

  return (
    <Fragment>
      <Header setLoading={(value) => setIsLoading(value)} />
      <div className="container">{children}</div>
      <Footer />
    </Fragment>
  );
};

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Component bảo vệ route, kiểm tra quyền truy cập
 */
const ProtectedRoute = ({ children, isProtected, adminOnly }) => {
  const { currentUser } = useSelector((state) => state.auth.login);

  if (isProtected) {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (adminOnly && !currentUser.isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isProtected: PropTypes.bool,
  adminOnly: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
  isProtected: false,
  adminOnly: false,
};

/**
 * Component chính của ứng dụng
 */
const App = () => {
  const location = useLocation();
  const isPublicPage =
    location.pathname === '/login' ||
    location.pathname === '/admin/login' ||
    location.pathname === '/register' ||
    location.pathname === '/resetPassword' ||
    location.pathname === '/login-google/success';

  /**
   * Render route cho admin
   */
  const renderAdminRoute = ({ path, page: Page, children, isProtected, adminOnly }, index) => (
    <Route
      key={index}
      path={path}
      element={
        <ProtectedRoute isProtected={isProtected} adminOnly={adminOnly}>
          <Page />
        </ProtectedRoute>
      }
    >
      {children?.map(({ path: subPath, page: SubPage }, subIndex) => (
        <Route
          key={subIndex}
          path={subPath}
          element={
            <ProtectedRoute isProtected={isProtected} adminOnly={adminOnly}>
              <SubPage />
            </ProtectedRoute>
          }
        />
      ))}
    </Route>
  );

  /**
   * Render route thông thường
   */
  const renderNormalRoute = ({ path, page: Page, isProtected, adminOnly }, index) => (
    <Route
      key={index}
      path={path}
      element={
        <ProtectedRoute isProtected={isProtected} adminOnly={adminOnly}>
          {isPublicPage ? (
            <Page />
          ) : (
            <PublicLayout>
              <Page />
            </PublicLayout>
          )}
        </ProtectedRoute>
      }
    />
  );

  return (
    <Fragment>
      <Routes>
        {routes.map((route, index) =>
          route.path === '/admin' ? renderAdminRoute(route, index) : renderNormalRoute(route, index),
        )}
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </Fragment>
  );
};

export default App;
