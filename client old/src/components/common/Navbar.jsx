import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Bell, ChevronDown } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import NotificationBell from '../notifications/NotificationBell.jsx';
import '../../styles/navbar.css';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <div className='navbar-start'>
          <button className='navbar-menu-btn' onClick={onMenuClick} aria-label='Toggle menu'>
            <Menu size={20} />
          </button>
          <Link to='/dashboard' className='navbar-logo'>
            <span className='navbar-logo-icon'>💸</span>
            <span className='navbar-logo-text'>SplitMate</span>
          </Link>
        </div>

        <div className='navbar-end'>
          <NotificationBell />

          <div className='navbar-divider' />

          <div className='navbar-user-menu'>
            <button
              className='navbar-user-btn'
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <div className='navbar-user-avatar'>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className='navbar-user-name'>{user?.name?.split(' ')[0]}</span>
              <ChevronDown
                size={16}
                className={`navbar-user-chevron ${dropdownOpen ? 'open' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className='navbar-dropdown'>
                <div className='navbar-dropdown-header'>
                  <div className='navbar-dropdown-avatar'>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name} />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className='navbar-dropdown-info'>
                    <p className='navbar-dropdown-name'>{user?.name}</p>
                    <p className='navbar-dropdown-email'>{user?.email}</p>
                  </div>
                </div>

                <div className='navbar-dropdown-divider' />

                <Link
                  to='/profile'
                  className='navbar-dropdown-item'
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>

                <button
                  className='navbar-dropdown-item navbar-dropdown-item-danger'
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;