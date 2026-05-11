import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState("Dashboard");
  // 1. Add state for mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* 2. Pass isOpen and toggleSidebar to the Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 3. Pass toggleSidebar to Navbar so the hamburger menu works */}
        <Navbar 
          activePage={activePage} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;