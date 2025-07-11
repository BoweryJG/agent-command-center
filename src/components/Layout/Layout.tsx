import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { UserRole } from '../../types/auth.types';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  color: string;
  requiredRoles?: UserRole[];
  permission?: string;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    color: 'from-electric-blue to-electric-cyan',
  },
  {
    path: '/voice-studio',
    label: 'Voice Studio',
    icon: '🎙️',
    color: 'from-electric-purple to-electric-pink',
  },
  {
    path: '/personality-forge',
    label: 'Personality Forge',
    icon: '🧬',
    color: 'from-electric-cyan to-electric-blue',
  },
  {
    path: '/agent-academy',
    label: 'Agent Academy',
    icon: '🎓',
    color: 'from-electric-pink to-electric-purple',
    requiredRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    path: '/quick-clips',
    label: 'Quick Clips',
    icon: '⚡',
    color: 'from-electric-blue to-electric-purple',
  },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter((item) => {
    if (item.requiredRoles && user) {
      return item.requiredRoles.includes(user.role);
    }
    if (item.permission) {
      return permissions.can(item.permission);
    }
    return true;
  });
  return (
    <div className="min-h-screen bg-neural-dark flex">
      {/* Sidebar */}
      <aside className="w-72 bg-neural-darker border-r border-neural-accent/20">
        <div className="p-6">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-electric-purple bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Agent Command Center
          </motion.h1>
        </div>

        <nav className="px-4 space-y-2">
          {filteredNavItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-neural'
                      : 'hover:bg-neural-light text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          {user && (
            <div className="neural-card p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-purple to-electric-pink p-0.5">
                  <div className="w-full h-full rounded-full bg-neural-dark flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-text-muted capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Status Indicator */}
          <div className="neural-card">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm text-text-secondary">System Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-neural-darker border-b border-neural-accent/20 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neural-light transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-electric-purple to-electric-pink p-0.5">
                  <div className="w-full h-full rounded-full bg-neural-dark flex items-center justify-center text-xs font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 rounded-lg bg-neural-dark border border-neural-accent/20 shadow-xl z-50"
                  >
                    <div className="p-2">
                      <NavLink
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neural-light transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile Settings</span>
                      </NavLink>
                      
                      {permissions.hasFeature('showUserManagement') && (
                        <NavLink
                          to="/admin/users"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neural-light transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>User Management</span>
                        </NavLink>
                      )}
                      
                      <hr className="my-2 border-neural-accent/20" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neural-light transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="h-[calc(100%-73px)] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;