import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Receipt, Building2, Wallet, Bell, Send,
  BarChart3, ShoppingCart, ChevronDown, ChevronRight,
  UserPlus, UserCog, UserMinus, List, Menu, X, LogOut, Plus, Edit, Trash2,
  ChevronLeft, ShoppingBag, Truck, Package, Shield, Database, Clock, FileText,
  Calendar, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState('');
  const [openSubSubmenu, setOpenSubSubmenu] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
      // Automatically collapse on smaller desktop screens
      if (!mobile && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (!mobile) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileOpen]);

  // Update layout CSS variable when collapsed state changes
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.style.setProperty(
        '--sidebar-width',
        isCollapsed ? '80px' : '260px'
      );
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '0px');
    }
  }, [isCollapsed, isMobile]);

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

    // Cashier Specific Menu
    { icon: Receipt, label: 'POS Terminal', path: '/pos', roles: ['admin', 'cashier'] },
    { icon: Users, label: 'Client Ledger', path: '/pos/clients', roles: ['admin', 'cashier', 'accountant'] },
    {
      icon: Receipt,
      label: 'Bills',
      roles: ['admin', 'cashier'],
      subItems: [
        { icon: List, label: 'History Bill', path: '/pos/all-bills' },
        { icon: BarChart3, label: 'Report', path: '/pos/report' },
        { icon: Wallet, label: 'Cash Handover', path: '/pos/cash-handover' },
      ]
    },

    // Salesman Specific Menu
    { icon: LayoutDashboard, label: 'Salesman Home', path: '/salesman/dashboard', roles: ['admin', 'salesman'] },
    { icon: Plus, label: 'Place Order', path: '/salesman/place-order', roles: ['admin', 'salesman'] },
    { icon: Receipt, label: 'My Orders', path: '/salesman/order-history', roles: ['admin', 'salesman'] },
    { icon: Users, label: 'Client History', path: '/salesman/client-history', roles: ['admin', 'salesman'] },
    { icon: ShoppingBag, label: 'Products', path: '/salesman/products', roles: ['admin', 'salesman'] },
    { icon: Calendar, label: 'Route Calendar', path: '/salesman/route-calendar', roles: ['admin', 'salesman'] },
    { icon: MapPin, label: 'Live Navigation', path: '/salesman/route-navigation', roles: ['admin', 'salesman'] },
    { icon: Wallet, label: 'Cash Handover', path: '/salesman/cash-handover', roles: ['admin', 'salesman'] },

    // Warehouse Panel
    { icon: Truck, label: 'Warehouse Terminal', path: '/warehouse/dashboard', roles: ['admin', 'warehouse'] },
    { icon: Package, label: 'Receive Orders', path: '/warehouse/receive-order', roles: ['admin', 'warehouse'] },
    { icon: List, label: 'Stock Ledger', path: '/warehouse/inventory', roles: ['admin', 'warehouse'] },
    {
      icon: MapPin,
      label: 'Route Manager',
      roles: ['admin', 'warehouse'],
      subItems: [
        { icon: Calendar, label: 'Route Planner', path: '/warehouse/route-planner' },
        { icon: List, label: 'Route History', path: '/warehouse/route-history' },
        { icon: MapPin, label: 'Live Tracking', path: '/warehouse/live-tracking' },
        { icon: Wallet, label: 'Cash Handover', path: '/warehouse/cash-handover' },
      ]
    },

    // POS Pages in Warehouse Panel
    { icon: Receipt, label: 'POS Terminal', path: '/pos', roles: ['admin', 'warehouse'] },
    { icon: Users, label: 'Client Ledger', path: '/pos/clients', roles: ['admin', 'warehouse'] },
    {
      icon: Receipt,
      label: 'Bills',
      roles: ['admin', 'warehouse'],
      subItems: [
        { icon: List, label: 'History Bill', path: '/pos/all-bills' },
        { icon: BarChart3, label: 'Report', path: '/pos/report' },
      ]
    },

    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'accountant'] },

  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Admin Dashboard', path: '/admin/dashboard', roles: ['admin'] },
    { icon: UserCog, label: 'Panel Access', path: '/admin/access-control', roles: ['admin'] },
    {
      icon: Database,
      label: 'Management',
      roles: ['admin'],
      subItems: [
        { icon: Shield, label: 'Employee Accounts', path: '/admin/employees' },
        { icon: Users, label: 'Client Management', path: '/admin/clients' },
        { icon: Truck, label: 'Vendor Management', path: '/admin/vendors' },
      ]
    },
    {
      icon: Users,
      label: 'Attendance & HR',
      roles: ['admin'],
      subItems: [
        { icon: LayoutDashboard, label: 'HR Dashboard', path: '/admin/attendance/dashboard' },
        { icon: Calendar, label: 'Attendance Manage', path: '/admin/attendance/manage' },
        { icon: BarChart3, label: 'Attendance Reports', path: '/admin/attendance/reports' },
        { icon: Wallet, label: 'Salary Settings', path: '/admin/attendance/salary-settings' },
        { icon: Clock, label: 'Holiday Settings', path: '/admin/attendance/holidays' },
        { icon: FileText, label: 'Salary Report', path: '/admin/attendance/salary-report' },
      ]
    },
    {
      icon: Package,
      label: 'Stock Management',
      roles: ['admin'],
      subItems: [
        { icon: List, label: 'Stock Details', path: '/admin/stock-details' },
        { icon: BarChart3, label: 'Stock Reports', path: '/admin/stock-reports' },
        { icon: Clock, label: 'Expiry Management', path: '/admin/expiry-management' },
      ]

    },
    {
      icon: MapPin,
      label: 'Route Manager',
      roles: ['admin'],
      subItems: [
        { icon: Calendar, label: 'Route Planner', path: '/admin/route-planner' },
        { icon: List, label: 'Route History', path: '/admin/route-history' },
        { icon: MapPin, label: 'Live Tracking', path: '/admin/live-tracking' },
        { icon: FileText, label: 'Tracking Reports', path: '/admin/tracking-reports' },
      ]
    },
    { icon: UserPlus, label: 'Account Control', path: '/admin/client-accounts', roles: ['admin'] },
    {
      icon: Bell,
      label: 'Notification Center',
      roles: ['admin'],
      subItems: [
        { icon: Send, label: 'Send Broadcast', path: '/admin/notifications' },
        { icon: Receipt, label: 'Response History', path: '/admin/notification-responses' },
      ]
    },
    {
      icon: Wallet,
      label: 'Overdue Management',
      roles: ['admin'],
      subItems: [
        { icon: List, label: 'Overdue Collections', path: '/admin/overdue-collections' },
        { icon: Receipt, label: 'Collection History', path: '/admin/collection-history' },
      ]
    },
    {
      icon: Wallet,
      label: 'Cash Management',
      roles: ['admin'],
      subItems: [
        { icon: Plus, label: 'New Handover', path: '/admin/cash-handover' },
        { icon: Clock, label: 'Handover History', path: '/admin/cash-history' },
      ]
    },
    {
      icon: Wallet,
      label: 'Account Panel',
      roles: ['admin'],
      subItems: [
        { icon: LayoutDashboard, label: 'Account Dashboard', path: '/' },
        {
          icon: Users,
          label: 'Clients',
          subItems: [
            { icon: List, label: 'Show Clients', path: '/clients' },
            { icon: UserPlus, label: 'Add Client', path: '/clients/add' },
            { icon: UserCog, label: 'Update Client', path: '/clients/update' },
            { icon: UserMinus, label: 'Delete Client', path: '/clients/delete' }
          ]
        },
        { icon: ShoppingCart, label: 'Inventory', path: '/bills' },
        {
          icon: Building2,
          label: 'Stores',
          subItems: [
            { icon: List, label: 'Show Stores', path: '/stores' },
            { icon: Plus, label: 'Add Store', path: '/stores/add' },
            { icon: Edit, label: 'Update Store', path: '/stores/update' },
            { icon: Trash2, label: 'Delete Store', path: '/stores/delete' }
          ]
        },
        {
          icon: Wallet,
          label: 'Accounts',
          subItems: [
            { icon: List, label: 'Show Accounts', path: '/accounts' },
            { icon: Plus, label: 'Add Account', path: '/accounts/add' },
            { icon: Edit, label: 'Update Account', path: '/accounts/update' },
            { icon: Trash2, label: 'Delete Account', path: '/accounts/delete' }
          ]
        },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
      ]
    },
    {
      icon: Receipt,
      label: 'POS Panel',
      roles: ['admin'],
      subItems: [
        { icon: Receipt, label: 'POS Terminal', path: '/pos' },
        { icon: Users, label: 'Client Ledger', path: '/pos/clients' },
        { icon: List, label: 'History Bill', path: '/pos/all-bills' },
        { icon: BarChart3, label: 'Report', path: '/pos/report' },
      ]
    },
    {
      icon: Users,
      label: 'Salesman Panel',
      roles: ['admin'],
      subItems: [
        { icon: LayoutDashboard, label: 'Salesman Home', path: '/salesman/dashboard' },
        { icon: Plus, label: 'Place Order', path: '/salesman/place-order' },
        { icon: Receipt, label: 'My Orders', path: '/salesman/order-history' },
        { icon: Users, label: 'Client History', path: '/salesman/client-history' },
        { icon: ShoppingBag, label: 'Products', path: '/salesman/products' },
        { icon: Calendar, label: 'Route Calendar', path: '/salesman/route-calendar' },
        { icon: MapPin, label: 'Live Navigation', path: '/salesman/route-navigation' },
      ]
    },
    {
      icon: Truck,
      label: 'Warehouse Panel',
      roles: ['admin'],
      subItems: [
        { icon: Truck, label: 'Warehouse Terminal', path: '/warehouse/dashboard' },
        { icon: Package, label: 'Receive Orders', path: '/warehouse/receive-order' },
        { icon: List, label: 'Stock Ledger', path: '/warehouse/inventory' },
        {
          icon: MapPin,
          label: 'Route Manager',
          subItems: [
            { icon: Calendar, label: 'Route Planner', path: '/warehouse/route-planner' },
            { icon: List, label: 'Route History', path: '/warehouse/route-history' },
            { icon: MapPin, label: 'Live Tracking', path: '/warehouse/live-tracking' },
          ]
        },
      ]
    }
  ];

  const menuItems = user?.role === 'admin'
    ? adminMenuItems
    : allMenuItems.filter(item => !item.roles || item.roles.includes(user?.role || 'cashier'));

  const toggleSubmenu = (label) => {
    if (isCollapsed) setIsCollapsed(false); // Auto-expand when clicking a submenu parent
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const toggleSubSubmenu = (label) => {
    setOpenSubSubmenu(openSubSubmenu === label ? null : label);
  };

  const isParentActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    return item.path && location.pathname.startsWith(item.path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const SidebarContent = () => (
    <>
      <div className="sidebar-header">
        <div className="logo-box">
          <span className="logo-icon">S</span>
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="logo-text"
          >
            <h2>HAB CREATION</h2>
            <span className="badge">v2.0</span>
          </motion.div>
        )}

        {isMobile && (
          <button className="btn-close-mobile" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        )}

        {!isMobile && (
          <button
            className={`collapse-toggle ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <div className="sidebar-scroll custom-scrollbar">
        <motion.nav
          className="nav-list"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {menuItems.map((item) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const isActive = isParentActive(item);
            const isOpen = openSubmenu === item.label && !isCollapsed;

            return (
              <motion.div key={item.label} className="nav-group" variants={itemVariants}>
                {hasSub ? (
                  <>
                    <motion.div
                      className={`nav-item parent ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                      onClick={() => toggleSubmenu(item.label)}
                      whileHover={{ x: isCollapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      title={isCollapsed ? item.label : ""}
                    >
                      <div className="nav-label">
                        <item.icon className={`nav-icon ${isActive ? 'active-icon' : ''}`} size={22} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {isOpen && !isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="submenu-container"
                        >
                          {item.subItems.map((sub, idx) => (
                            sub.subItems ? (
                              <div key={sub.label || idx} className="nested-submenu">
                                <div
                                  className={`sub-item nested-parent ${openSubSubmenu === sub.label ? 'active' : ''}`}
                                  onClick={() => toggleSubSubmenu(sub.label)}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div className={`dot ${openSubSubmenu === sub.label ? 'active-dot' : ''}`}></div>
                                    <span>{sub.label}</span>
                                  </div>
                                  <motion.div animate={{ rotate: openSubSubmenu === sub.label ? 180 : 0 }} className="nested-chevron">
                                    <ChevronDown size={14} />
                                  </motion.div>
                                </div>
                                <AnimatePresence>
                                  {openSubSubmenu === sub.label && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="sub-submenu-container"
                                    >
                                      {sub.subItems.map(subSub => (
                                        <NavLink
                                          key={subSub.path}
                                          to={subSub.path}
                                          end={subSub.path === '/clients'}
                                          className={({ isActive }) => `sub-sub-item ${isActive ? 'active' : ''}`}
                                        >
                                          <div className="dot"></div>
                                          <span>{subSub.label}</span>
                                        </NavLink>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <NavLink
                                key={sub.path || idx}
                                to={sub.path}
                                end={sub.path === '/clients'}
                                className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}
                              >
                                <div className="dot"></div>
                                <span>{sub.label}</span>
                              </NavLink>
                            )
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <motion.div className="nav-label" whileHover={{ x: isCollapsed ? 0 : 4 }}>
                      <item.icon className={`nav-icon ${isActive ? 'active-icon' : ''}`} size={22} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </motion.div>
                    {isActive && !isCollapsed && <motion.div layoutId="active-indicator" className="active-indicator" />}
                  </NavLink>
                )}
              </motion.div>
            );
          })}
        </motion.nav>
      </div>

      <div className="sidebar-footer">
        <div className={`user-card ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          {!isCollapsed && (
            <div className="user-info">
              <h4>{user?.name || 'User'}</h4>
              <p>{user?.role || 'Guest'}</p>
            </div>
          )}
          {!isCollapsed && (
            <button className="btn-logout" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar-desktop print:hidden ${isMobile ? 'hidden' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
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

      <style>{`
        /* --- DESKTOP SIDEBAR --- */
        .sidebar-desktop {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: rgba(11, 15, 25, 0.7); /* Deep Sea Base */
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.2);
        }

        .sidebar-desktop.collapsed {
          width: 80px;
        }

        .sidebar-desktop.hidden { display: none; }

        /* --- MOBILE SIDEBAR --- */
        .mobile-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 90;
        }

        .sidebar-mobile {
          position: fixed;
          top: 0; left: 0;
          width: 280px;
          height: 100vh;
          background: #0B0F19; /* Solid color for mobile */
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-shadow: 10px 0 30px rgba(0,0,0,0.6);
        }

        /* --- CONTENT STYLES --- */
        .sidebar-header {
          padding: 1.5rem;
          display: flex; 
          align-items: center; 
          gap: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          min-height: 72px; /* Topbar sync */
        }
        
        .sidebar-desktop.collapsed .sidebar-header {
          justify-content: center;
          padding: 1.5rem 0;
        }
        
        .logo-box {
          width: 38px; height: 38px;
          background: var(--enterprise-gradient);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.25rem; color: white;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          flex-shrink: 0;
        }

        .logo-text { overflow: hidden; white-space: nowrap; }
        .logo-text h2 { margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; }
        .badge { font-size: 0.65rem; background: rgba(255,255,255,0.1); padding: 0.1rem 0.4rem; border-radius: 4px; color: #94a3b8; font-weight: 600; }
        
        .collapse-toggle {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          background: var(--bg-surface);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: 0.3s;
          z-index: 10;
        }
        
        .collapse-toggle:hover {
          color: white;
          background: var(--primary);
          border-color: var(--primary);
        }
        
        .collapse-toggle.collapsed {
          transform: translateY(-50%) rotate(180deg);
        }

        .btn-close-mobile {
          margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer;
        }

        .sidebar-scroll { flex: 1; overflow-y: auto; padding: 1.5rem 1rem; overflow-x: hidden; }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.3);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.8);
        }
        
        .sidebar-desktop.collapsed .sidebar-scroll {
          padding: 1.5rem 0.5rem;
        }

        .nav-group { margin-bottom: 0.5rem; width: 100%; }

        .nav-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: transparent;
          border: 1px solid transparent;
        }

        .nav-item.collapsed {
          justify-content: center;
          padding: 0.85rem 0;
        }

        .nav-item:hover { 
          color: white; 
          background: rgba(255,255,255,0.03); 
          box-shadow: 0 0 15px rgba(255,255,255,0.02);
          transform: translateX(4px);
        }

        .nav-item.active {
          background: rgba(79, 70, 229, 0.1);
          color: white;
          border-color: rgba(79, 70, 229, 0.2);
          box-shadow: inset 0 0 20px rgba(79, 70, 229, 0.05), 0 0 15px rgba(79, 70, 229, 0.1);
        }

        .nav-label { 
          display: flex; align-items: center; gap: 0.8rem; font-weight: 500; font-size: 0.95rem; 
          white-space: nowrap;
        }
        
        .nav-item.collapsed .nav-label {
          margin: 0;
        }
        
        .nav-icon {
          color: var(--text-secondary);
          transition: color 0.3s;
        }
        
        .nav-item.active .nav-icon {
          color: var(--primary);
        }
        
        .active-indicator {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 4px; height: 18px;
          background: var(--primary);
          border-radius: 4px 0 0 4px;
          box-shadow: -2px 0 10px rgba(79, 70, 229, 0.5);
        }

        .submenu-container {
          margin-left: 1.5rem;
          padding: 0.5rem 0 0.5rem 0.8rem;
          border-left: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .sub-item {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.6rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          border-radius: 8px;
          transition: 0.2s;
        }

        .sub-item:hover { color: white; background: rgba(255,255,255,0.03); cursor: pointer; }
        .sub-item .dot { width: 5px; height: 5px; background: rgba(255,255,255,0.2); border-radius: 50%; transition: 0.2s; }
        .sub-item.active .dot { background: var(--primary); box-shadow: 0 0 8px var(--primary); }
        .sub-item.active { color: white; background: rgba(79, 70, 229, 0.1); }
        
        .nested-parent {
          justify-content: space-between;
          padding-right: 0.5rem;
        }
        
        .sub-submenu-container {
          margin-left: 1rem;
          padding: 0.2rem 0 0.2rem 0.5rem;
          border-left: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }

        .sub-sub-item {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8rem;
          border-radius: 6px;
          transition: 0.2s;
        }
        
        .sub-sub-item:hover { color: white; background: rgba(255,255,255,0.02); }
        .sub-sub-item .dot { width: 4px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 50%; transition: 0.2s; }
        .sub-sub-item.active .dot { background: var(--primary); box-shadow: 0 0 8px var(--primary); }
        .sub-sub-item.active { color: white; background: rgba(79, 70, 229, 0.1); }
        
        .active-dot { background: var(--primary) !important; box-shadow: 0 0 8px var(--primary); }

        .sidebar-footer { padding: 1.5rem 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08); }
        
        .sidebar-desktop.collapsed .sidebar-footer {
          padding: 1.5rem 0.5rem;
        }
        
        .user-card {
          display: flex; align-items: center; gap: 1rem;
          background: rgba(255,255,255,0.02);
          padding: 0.75rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          transition: 0.3s;
        }
        
        .user-card.collapsed {
          padding: 0.5rem;
          justify-content: center;
          background: transparent;
          border-color: transparent;
        }
        
        .user-avatar {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--enterprise-gradient);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: white; flex-shrink: 0;
        }

        .user-info { min-width: 0; }
        .user-info h4 { margin: 0; font-size: 0.875rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-info p { margin: 0; font-size: 0.75rem; color: var(--text-secondary); text-transform: capitalize; }
        
        .btn-logout {
          margin-left: auto;
          background: none; border: none;
          color: var(--danger);
          opacity: 0.7;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 6px;
          transition: 0.2s;
        }
        .btn-logout:hover { opacity: 1; background: rgba(239, 68, 68, 0.1); }

      `}</style>
    </>
  );
};

export default Sidebar;
