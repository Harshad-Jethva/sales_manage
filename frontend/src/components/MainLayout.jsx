import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ThreeBackground from './ThreeBackground';

import FloatingWindowManager from './common/FloatingWindowManager';
import GPSTracker from './common/GPSTracker';

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

      {/* GPS Tracking for Salesmen */}
      <GPSTracker />

      {/* Sidebar fixed */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="erp-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="erp-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .erp-layout {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          background: #0B0F19; /* Solid base back-up */
        }

        .erp-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--sidebar-width);
          min-width: 0;
          transition: margin 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          position: relative;
          z-index: 10;
        }

        .erp-main {
          flex: 1;
          padding: 2.5rem;
          overflow-x: hidden;
          overflow-y: auto;
          max-width: var(--max-content-width);
          width: 100%;
          margin: 0 auto;
          /* Add subtle fade-in animation for route changes */
          animation: routeFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes routeFadeIn {
          from { opacity: 0; transform: translateY(10px); }
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
