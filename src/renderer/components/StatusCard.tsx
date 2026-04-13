import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StatusCardProps {
  title: string;
  status: boolean | null;
  port?: number;
  description?: string;
  icon?: React.ReactNode;
}

export default function StatusCard({
  title,
  status,
  port,
  description,
  icon,
}: StatusCardProps) {
  const getStatusIcon = () => {
    if (status === null) {
      return <Loader2 className="animate-spin" style={{ color: 'var(--color-text-secondary)' }} />;
    }
    if (status) {
      return <CheckCircle style={{ color: '#22c55e' }} />;
    }
    return <XCircle style={{ color: '#ef4444' }} />;
  };

  const getStatusColor = () => {
    if (status === null) return 'var(--color-text-secondary)';
    return status ? '#22c55e' : '#ef4444';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
            {title}
          </h3>
          {port && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Port: {port}
            </p>
          )}
          {description && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
            {status === null ? 'Checking...' : status ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
