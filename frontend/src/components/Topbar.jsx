import React from 'react';
import { Search, Settings, Menu, Sun, Moon, ChevronDown } from 'lucide-react';
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
        <div className="topbar-search hidden md:flex">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Search everywhere..." className="erp-input search-input" />
            <div className="search-shortcut">
              <span className="key">Ctrl</span>
              <span className="key">K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="action-group">
          <button className="action-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <NotificationBell />

          <button className="action-btn" title="Settings">
            <Settings size={20} />
          </button>
        </div>

        <div className="user-profile">
          <div className="avatar-wrapper">
            <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="online-indicator"></div>
          </div>
          <div className="user-details hidden md:flex">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Guest'}</span>
          </div>
          <ChevronDown size={14} className="profile-chevron hidden md:block" />
        </div>
      </div>

      <style>{`
        .erp-topbar {
          height: var(--topbar-height);
          background: rgba(11, 15, 25, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 40;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          width: 40px; height: 40px;
          border-radius: 10px;
          cursor: pointer;
          display: none;
          align-items: center; justify-content: center;
        }
        
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex; }
        }
        
        .topbar-search {
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 450px;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 1.25rem;
          color: #64748b;
          z-index: 5;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 3.5rem 0.75rem 3rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          height: 44px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .search-input:focus {
          background: rgba(11, 15, 25, 0.7);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.1), 0 0 0 4px rgba(79, 70, 229, 0.05);
          width: 110%;
        }

        .search-shortcut {
          position: absolute;
          right: 1rem;
          display: flex;
          gap: 2px;
          pointer-events: none;
        }

        .search-shortcut .key {
          padding: 2px 5px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 700;
        }
        
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.03);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .action-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          width: 38px; height: 38px;
          border-radius: 10px;
          transition: all 0.2s;
          display: flex;
          align-items: center; justify-content: center;
        }
        
        .action-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 6px 12px 6px 6px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-profile:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
        }

        .avatar-wrapper {
          position: relative;
        }
        
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--enterprise-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .online-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          background: var(--success);
          border: 2px solid var(--bg-main);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
        }
        
        .user-role {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-weight: 600;
        }

        .profile-chevron {
          color: #475569;
          margin-left: 2px;
        }
      `}</style>
    </header>
  );
};

export default Topbar;
