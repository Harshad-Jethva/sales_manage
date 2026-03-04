import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ThreeBackground from './ThreeBackground';

import FloatingWindowManager from './common/FloatingWindowManager';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="erp-layout">
      {/* Background layer */}
      <ThreeBackground />

      {/* Floating Windows Manager */}
      <FloatingWindowManager />

      {/* Sidebar fixed */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="erp-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="erp-main">
          <Outlet />
        </main>
      </div>

      <style jsx>{`
        .erp-layout {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          background: transparent;
        }

        .erp-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--sidebar-width);
          min-width: 0; /* Important for flex child truncation */
          transition: margin 0.3s ease;
          position: relative;
          z-index: 10;
        }

        .erp-main {
          flex: 1;
          padding: 2rem;
          overflow-x: hidden;
          overflow-y: auto;
          /* Add subtle fade-in animation for route changes */
          animation: routeFadeIn 0.3s ease-out forwards;
        }

        @keyframes routeFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .erp-content-wrapper {
            margin-left: 0;
            width: 100%;
          }
          
          .erp-main {
            padding: 1.5rem 1rem;
          }
        }
        @media print {
          .erp-content-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .erp-main {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
