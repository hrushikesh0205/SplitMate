import { useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import '../../styles/layout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='layout'>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className='layout-body'>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className='layout-main'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;