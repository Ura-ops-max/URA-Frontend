import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './protected.route';
import { authenticationRoutePaths, baseRoutePaths, protectedRoutePaths } from './common/routes';
import AppLayout from '@/layout/app.layout';
import NotFound from '@/pages/public/NotFound';
import AuthRoute from './auth.route';
import BaseLayout from '@/layout/base.layout';
import PublichLayout from '@/layout/public.layout';
import AuthLayout from '@/layout/auth.layout';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseLayout />}>
          <Route element={<PublichLayout />}>
            {baseRoutePaths.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Route>
        </Route>

        <Route path="/" element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            <Route element={<AuthLayout />}>
              {authenticationRoutePaths.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          </Route>
        </Route>

        {/* Protected Route */}
        {/* Protected Route */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route key={route.path} path={route.path} element={route.element}>
                {/* If route has children, map them here */}
                {route.children?.map((child, index) => (
                  <Route
                    key={index}
                    index={child.index}
                    path={child.path} // This will be "profile", "security", etc.
                    element={child.element}
                  />
                ))}
              </Route>
            ))}
          </Route>
        </Route>
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
