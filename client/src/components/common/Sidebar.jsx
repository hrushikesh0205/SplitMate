import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  ArrowLeftRight,
  Bell,
  UserCircle,
  X,
} from 'lucide-react';
import '../../styles/sidebar.css';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/groups', icon: <Users size={20} />, label: 'Groups' },
  { to: '/expenses', icon: <Receipt size={20} />, label: 'Expenses' },
  { to: '/balances', icon: <ArrowLeftRight size={20} />, label: 'Balances' },
  { to: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
  { to: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className='sidebar-overlay' onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className='sidebar-header'>
          <span className='sidebar-brand'>💸 SplitMate</span>
          <button className='sidebar-close' onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className='sidebar-nav'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
              }
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className='sidebar-footer'>
          <p>SplitMate v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;