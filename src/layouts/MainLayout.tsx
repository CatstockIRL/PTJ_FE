import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import EmployerSidebar from './components/EmployerSidebar';
import { useAuth } from '../features/auth/hooks';
import { ROLES } from '../constants/roles';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const isEmployerOrAdmin = user && (user.roles.includes(ROLES.EMPLOYER) || user.roles.includes(ROLES.ADMIN));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative">
        {isEmployerOrAdmin && (
          <div className="sticky top-[68px] h-[calc(100vh-68px)] z-20">
             <EmployerSidebar isOpen={isSidebarOpen} />
          </div>
        )}

        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;