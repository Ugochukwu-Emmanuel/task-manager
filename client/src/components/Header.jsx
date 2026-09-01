import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useDueTodayNotifications } from '../hooks/useDueTodayNotifications';
import NotificationToggle from './NotificationToggle';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const { tasks } = useTasks();
  useDueTodayNotifications(tasks);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__mark">TM</span>
        <div>
          <h1 className="header__title">Task Manager</h1>
          <p className="header__date">{today}</p>
        </div>
      </div>

      <nav className="header__nav">
        <NavLink to="/" end className="header__nav-link">
          Tasks
        </NavLink>
        <NavLink to="/analytics" className="header__nav-link header__nav-link--full-only">
          Analytics
        </NavLink>
        <NavLink to="/settings" className="header__nav-link header__nav-link--full-only">
          Settings
        </NavLink>
      </nav>

      {user && (
        <div className="header__user">
          <div className="header__notif header__notif--full-only">
            <NotificationToggle />
          </div>

          <span className="header__username">{user.name}</span>

          <button onClick={logout} className="header__logout header__logout--full-only">
            Log out
          </button>

          <div className="header__menu" ref={menuRef}>
            <button
              type="button"
              className="header__menu-toggle"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More options"
              onClick={() => setMenuOpen((open) => !open)}
            >
              Menu
            </button>

            {menuOpen && (
              <div className="header__menu-panel" role="menu">
                <div className="header__menu-item header__menu-item--notif">
                  <NotificationToggle />
                </div>
                <NavLink
                  to="/analytics"
                  role="menuitem"
                  className="header__menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Analytics
                </NavLink>
                <NavLink
                  to="/settings"
                  role="menuitem"
                  className="header__menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </NavLink>
                <button
                  type="button"
                  role="menuitem"
                  className="header__menu-link header__menu-link--danger"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;