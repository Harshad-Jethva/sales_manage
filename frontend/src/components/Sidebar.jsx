import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Receipt, Building2, Wallet,
  BarChart3, ShoppingCart, ChevronDown, ChevronRight,
  UserPlus, UserCog, UserMinus, List, Menu, X, LogOut, Plus, Edit, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState('Clients');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsMobileOpen(false);
  }, [location, isMobile]);

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'accountant'] },
    {
      icon: Users,
      label: 'Clients',
      path: '/clients',
      roles: ['admin', 'accountant'],
      subItems: [
        { icon: List, label: 'Show Clients', path: '/clients' },
        { icon: UserPlus, label: 'Add Client', path: '/clients/add' },
        { icon: UserCog, label: 'Update Client', path: '/clients/update' },
        { icon: UserMinus, label: 'Delete Client', path: '/clients/delete' },
      ]
    },
    { icon: ShoppingCart, label: 'Inventory', path: '/bills', roles: ['admin', 'accountant'] },
    {
      icon: Building2,
      label: 'Stores',
      path: '/stores',
      roles: ['admin', 'accountant'],
      subItems: [
        { icon: List, label: 'Show Stores', path: '/stores' },
        { icon: Plus, label: 'Add Store', path: '/stores/add' },
        { icon: Edit, label: 'Update Store', path: '/stores/update' },
        { icon: Trash2, label: 'Delete Store', path: '/stores/delete' },
      ]
    },
    {
      icon: Wallet,
      label: 'Accounts',
      roles: ['admin', 'accountant'],
      subItems: [
        { icon: List, label: 'Show Accounts', path: '/accounts' },
        { icon: Plus, label: 'Add Account', path: '/accounts/add' },
        { icon: Edit, label: 'Update Account', path: '/accounts/update' },
        { icon: Trash2, label: 'Delete Account', path: '/accounts/delete' },
      ]
    },
    { icon: ShoppingCart, label: 'POS / Billing', path: '/pos', roles: ['admin', 'cashier'] },
    { icon: Receipt, label: 'History', path: '/history', roles: ['admin', 'cashier', 'accountant'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'accountant'] },
  ];

  const menuItems = allMenuItems.filter(item =>
    !item.roles || item.roles.includes(user?.role || 'cashier')
  );

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const isParentActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    return item.path && location.pathname.startsWith(item.path);
  };

  const SidebarContent = () => (
    <>
      <div className="sidebar-header">
        <div className="logo-box">
          <span className="logo-icon">S</span>
        </div>
        <div className="logo-text">
          <h2>SalesPro</h2>
          <span className="badge">v2.0</span>
        </div>
        {isMobile && (
          <button className="btn-close-mobile" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      <div className="sidebar-scroll">
        <nav className="nav-list">
          {menuItems.map((item) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const isActive = isParentActive(item);
            const isOpen = openSubmenu === item.label;

            return (
              <div key={item.label} className="nav-group">
                {hasSub ? (
                  <>
                    <motion.div
                      className={`nav-item parent ${isActive ? 'active' : ''}`}
                      onClick={() => toggleSubmenu(item.label)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="nav-label">
                        <item.icon className="nav-icon" size={20} />
                        <span>{item.label}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="submenu-container"
                        >
                          {item.subItems.map(sub => (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              end={sub.path === '/clients'}
                              className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}
                            >
                              <div className="dot"></div>
                              <span>{sub.label}</span>
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <motion.div className="nav-label" whileHover={{ x: 4 }}>
                      <item.icon className="nav-icon" size={20} />
                      <span>{item.label}</span>
                    </motion.div>
                    {isActive && <motion.div layoutId="active-indicator" className="active-indicator" />}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <h4>{user?.name || 'User'}</h4>
            <p>{user?.role || 'Guest'}</p>
          </div>
          <button className="btn-logout" onClick={logout}><LogOut size={16} /></button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`mobile-toggle ${isMobileOpen ? 'hidden' : ''}`}
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={24} color="white" />
      </button>

      {/* Desktop Sidebar */}
      <aside className={`sidebar-desktop ${isMobile ? 'hidden' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <>
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              className="sidebar-mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* --- VARIABLES --- */
        :root {
          --sidebar-width: 280px;
          --sidebar-bg: rgba(15, 23, 42, 0.85);
          --sidebar-border: rgba(255, 255, 255, 0.08);
          --primary-color: #6366f1;
        }

        /* --- DESKTOP SIDEBAR --- */
        .sidebar-desktop {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--sidebar-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid var(--sidebar-border);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .sidebar-desktop.hidden { display: none; }

        /* --- MOBILE SIDEBAR --- */
        .mobile-toggle {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 60;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          display: none;
        }
        .mobile-toggle.hidden { opacity: 0; pointer-events: none; }

        .mobile-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px);
          z-index: 90;
        }

        .sidebar-mobile {
          position: fixed;
          top: 0; left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: #0f172a; /* Solid color for mobile performance */
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-shadow: 10px 0 30px rgba(0,0,0,0.5);
        }

        @media (max-width: 1024px) {
          .mobile-toggle { display: block; }
        }

        /* --- CONTENT STYLES --- */
        .sidebar-header {
          padding: 2rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          border-bottom: 1px solid var(--sidebar-border);
        }
        
        .logo-box {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #4f46e5, #ec4899);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.5rem; color: white;
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.4);
        }

        .logo-text h2 { margin: 0; font-size: 1.25rem; font-weight: 800; background: linear-gradient(to right, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .badge { font-size: 0.65rem; background: rgba(255,255,255,0.1); padding: 0.1rem 0.4rem; border-radius: 4px; color: #94a3b8; font-weight: 600; }
        
        .btn-close-mobile {
          margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer;
        }

        .sidebar-scroll { flex: 1; overflow-y: auto; padding: 1.5rem 1rem; }
        .sidebar-scroll::-webkit-scrollbar { width: 0; }

        .nav-group { margin-bottom: 0.5rem; }

        .nav-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          color: #94a3b8;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          background: transparent;
        }

        .nav-item:hover { color: white; background: rgba(255,255,255,0.03); }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
          color: white;
        }

        .nav-label { display: flex; align-items: center; gap: 0.8rem; font-weight: 500; font-size: 0.95rem; }
        
        .active-indicator {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 4px; height: 20px;
          background: #6366f1;
          border-radius: 4px 0 0 4px;
          box-shadow: -2px 0 10px rgba(99, 102, 241, 0.5);
        }

        .submenu-container {
          margin-left: 1.5rem;
          padding: 0.5rem 0 0.5rem 0.8rem;
          border-left: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
        }

        .sub-item {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.6rem 1rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          border-radius: 8px;
          transition: 0.2s;
        }

        .sub-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .sub-item .dot { width: 5px; height: 5px; background: #64748b; border-radius: 50%; transition: 0.2s; }
        .sub-item.active .dot { background: #6366f1; box-shadow: 0 0 8px #6366f1; }
        .sub-item.active { color: white; background: rgba(99, 102, 241, 0.1); }

        .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--sidebar-border); }
        .user-card {
          display: flex; align-items: center; gap: 1rem;
          background: rgba(255,255,255,0.03);
          padding: 0.8rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .user-avatar {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: white;
        }

        .user-info h4 { margin: 0; font-size: 0.9rem; color: white; }
        .user-info p { margin: 0; font-size: 0.75rem; color: #94a3b8; }
        
        .btn-logout {
          margin-left: auto;
          background: none; border: none;
          color: #f87171;
          opacity: 0.7;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 6px;
          transition: 0.2s;
        }
        .btn-logout:hover { opacity: 1; background: rgba(248, 113, 113, 0.1); }

      `}</style>
    </>
  );
};

export default Sidebar;
