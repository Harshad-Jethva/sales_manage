import React from 'react';
import { Search, Settings, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './common/notifications/NotificationBell';

const Topbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="erp-topbar print:hidden">
      <div className="flex items-center gap-4">
        <button className="mobile-menu-btn md:hidden" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="topbar-search hidden md:block">
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Search everywhere..." className="erp-input search-input" />
        </div>
      </div>

      <div className="topbar-actions">
        <button className="action-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <NotificationBell />

        <button className="action-btn">
          <Settings size={20} />
        </button>
        <div className="user-profile">
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-details hidden md:flex">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Guest'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .erp-topbar {
          height: var(--topbar-height);
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 40;
          transition: width 0.3s ease;
        }
        
        .mobile-menu-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: none;
        }
        
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block; }
        }
        
        .topbar-search {
          position: relative;
          width: 300px;
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }
        
        .search-input {
          padding-left: 2.75rem;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          height: 40px;
        }
        
        .search-input:focus {
          background: rgba(15, 23, 42, 0.8);
          border-color: var(--primary);
        }
        
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          position: relative;
          padding: 0.5rem;
          border-radius: 50%;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center; justify-content: center;
        }
        
        .action-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .badge-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid var(--bg-surface);
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1rem;
          border-left: 1px solid var(--border-light);
          cursor: pointer;
        }
        
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }
      `}</style>
    </header>
  );
};

export default Topbar;
