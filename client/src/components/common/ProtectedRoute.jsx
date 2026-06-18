import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='loading-screen'>
        <div className='spinner'></div>
      </div>
    );
  }

  return user ? children : <Navigate to='/login' />;
};

export default ProtectedRoute;