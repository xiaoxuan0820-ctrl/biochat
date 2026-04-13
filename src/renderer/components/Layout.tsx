import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-auto p-6"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {children}
      </motion.main>
    </div>
  );
}
