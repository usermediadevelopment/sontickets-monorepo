import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import firebaseAuth from '~/config/firebase/auth';
import { useAuth } from '~/hooks/useAuth';

type ProtectedRouteProps = {
  children: JSX.Element;
};
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, signIn } = useAuth();
  const [verifyingUser, setVerifying] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const listener = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const user = JSON.parse((localStorage.getItem('user') as string) ?? '{}');
        signIn(user);
      }
      setVerifying(false);
    });

    return () => {
      listener();
    };
  }, []);

  if (verifyingUser) {
    return <div>Verifying user...</div>;
  }

  if (
    location.pathname === '/' ||
    location.pathname === '/reservas' ||
    location.pathname === '/reports' ||
    location.pathname === '/settings'
  ) {
    if (user.userRole?.name === 'superadmin') {
      return <Navigate to='/admin' replace />;
    }
  }

  if (!user.token) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default ProtectedRoute;
