import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import SidebarWithHeader from '~/components/SidebarWithHeader';
import Reports from '~/pages/private/reports';

import Reservations from '~/pages/private/reservations';
import { Settings } from '~/pages/private/settings';

import DeleteReservations from '~/pages/public/DeleteReservations';

import Login from '~/pages/public/Login';
import ProtectedRoute from './routes/ProtectedRoute';

import HeaderSuperAdmin from '~/components/HeaderSuperAdmin';
import SuperAdminSettings from '~/pages/private/superadmin/settings/Settings';
import { Forms } from '~/pages/public/Forms/Forms';
import Performance from '~/pages/private/performance';

const Router = () => {
  // This effect runs once, after the first render
  useEffect(() => {
    document.title = import.meta.env.VITE_APP_NAME;
  }, []);

  return (
    <Routes>
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <SidebarWithHeader />
          </ProtectedRoute>
        }
      >
        <Route path={'/'} element={<Reservations />} />
        <Route path={'/reservas'} element={<Reservations />} />
        <Route path={'/reports'} element={<Reports />} />
        <Route path={'/performance'} element={<Performance />} />
        <Route path={'/settings'} element={<Settings />} />
      </Route>
      <Route
        path='/admin'
        element={
          <ProtectedRoute>
            <HeaderSuperAdmin />
          </ProtectedRoute>
        }
      >
        <Route path={''} element={<SuperAdminSettings />} />
      </Route>
      <Route path={'/form/:externalId'} element={<Forms />} />
      <Route path={'/reservations/:externalId/:code'} element={<Forms />} />
      <Route path={'/login'} element={<Login />} />
      <Route path={'/delete'} element={<DeleteReservations />} />
    </Routes>
  );
};

export default Router;
