import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Home,
  MessageSquare,
  Settings,
  FolderOpen,
  Sparkles,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/files', icon: FolderOpen, label: 'Files' },
  { path: '/skills', icon: Sparkles, label: 'Skills' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full border-r"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            B
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg"
              style={{ color: 'var(--color-text)' }}
            >
              Biochat
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isActive ? '' : 'hover:bg-[var(--color-bg-tertiary)]'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text)',
                }}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-tertiary)]"
          style={{ color: 'var(--color-text)' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!sidebarCollapsed && (
            <span className="font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </motion.button>

        {/* Collapse Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-tertiary)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!sidebarCollapsed && <span className="font-medium">Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
