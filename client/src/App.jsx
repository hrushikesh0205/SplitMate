import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import AllExpensesPage from './pages/AllExpensesPage.jsx';
import BalancesPage from './pages/BalancesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GroupDeatailPage from './pages/GroupDetailPage.jsx'

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={user ? <Navigate to='/dashboard' /> : <LoginPage />} />
      <Route path='/register' element={user ? <Navigate to='/dashboard' /> : <RegisterPage />} />
<Route path='/groups/:id' element={<ProtectedRoute><GroupDeatailPage /></ProtectedRoute>} />
      <Route path='/dashboard' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path='/groups' element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
      <Route path='/expenses' element={<ProtectedRoute><AllExpensesPage /></ProtectedRoute>} />
      <Route path='/balances' element={<ProtectedRoute><BalancesPage /></ProtectedRoute>} />
      <Route path='/notifications' element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;