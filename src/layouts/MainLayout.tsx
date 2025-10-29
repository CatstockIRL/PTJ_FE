import React from 'react';
import { Header } from './components/Header'; 
import { Footer } from './components/Footer'; 

import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* HEADER */}
      <Header onToggleSidebar={function (): void {
        throw new Error('Function not implemented.');
      } } />

      {/* NỘI DUNG TRANG */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default MainLayout;