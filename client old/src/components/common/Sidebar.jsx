import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  ArrowLeftRight,
  Bell,
  UserCircle,
  X,
  Zap,
} from 'lucide-react';
import '../../styles/sidebar.css';

const navItems = [
  {
    to: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
  },
  {
    to: '/groups',
    icon: <Users size={20} />,
    label: 'Groups',
  },
  {
    to: '/expenses',
    icon: <Receipt size={20} />,
    label: 'Expenses',
  },
  {
    to: '/balances',
    icon: <ArrowLeftRight size={20} />,
    label: 'Balances',
  },
  {
    to: '/notifications',
    icon: <Bell size={20} />,
    label: 'Notifications',
  },
  {
    to: '/profile',
    icon: <UserCircle size={20} />,
    label: 'Settings',
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className='sidebar-overlay'
          onClick={onClose}
          role='presentation'
          aria-hidden='true'
        />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className='sidebar-header'>
          <div className='sidebar-logo'>
            <span className='sidebar-logo-icon'>💸</span>
            <span className='sidebar-logo-text'>SplitMate</span>
          </div>
          <button
            className='sidebar-close-btn'
            onClick={onClose}
            aria-label='Close sidebar'
          >
            <X size={20} />
          </button>
        </div>

        <nav className='sidebar-nav'>
          <div className='sidebar-nav-items'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`
                }
                onClick={onClose}
              >
                <span className='sidebar-nav-icon'>{item.icon}</span>
                <span className='sidebar-nav-label'>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className='sidebar-footer'>
            <div className='sidebar-pro-card'>
              <Zap size={20} className='sidebar-pro-icon' />
              <div className='sidebar-pro-text'>
                <p className='sidebar-pro-title'>Upgrade to Pro</p>
                <p className='sidebar-pro-desc'>Unlock advanced features</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;