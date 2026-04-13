import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import StatusCard from '../components/StatusCard';
import {
  Container,
  MessageSquare,
  FolderOpen,
  FileText,
  Clock,
  ChevronRight,
  Docker,
  Bot,
  Plus,
  Play,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { dockerStatus, deerflowStatus, recentConversations } = useStore();
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setAppVersion);
  }, []);

  const quickActions = [
    {
      icon: <Plus size={24} />,
      title: 'New Chat',
      description: 'Start a new conversation',
      action: () => navigate('/chat'),
      color: '#246BFD',
    },
    {
      icon: <FolderOpen size={24} />,
      title: 'Browse Files',
      description: 'View generated reports',
      action: () => navigate('/files'),
      color: '#8b5cf6',
    },
    {
      icon: <FileText size={24} />,
      title: 'View Skills',
      description: 'Explore available skills',
      action: () => navigate('/skills'),
      color: '#f59e0b',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Welcome to Biochat
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Your elegant DeerFlow desktop client · v{appVersion}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/chat')}
          className="btn-primary flex items-center gap-2 text-base px-6 py-3"
        >
          <Plus size={20} />
          New Chat
        </motion.button>
      </motion.div>

      {/* Service Status */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Service Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusCard
            title="Docker"
            status={dockerStatus}
            port={2375}
            description="Container runtime"
            icon={<Docker size={24} style={{ color: '#2496ED' }} />}
          />
          <StatusCard
            title="DeerFlow"
            status={deerflowStatus}
            port={2026}
            description="AI research framework"
            icon={<Bot size={24} style={{ color: '#246BFD' }} />}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="card text-left flex flex-col gap-3"
              style={{ borderColor: `${action.color}30` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: action.color }}
              >
                {action.icon}
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {action.title}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {action.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Conversations */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            Recent Conversations
          </h2>
          {recentConversations.length > 0 && (
            <button
              onClick={() => useStore.getState().clearConversations()}
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Clear all
            </button>
          )}
        </div>
        {recentConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <Container size={48} style={{ color: 'var(--color-text-secondary)' }} className="mx-auto mb-4" />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No recent conversations
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Start a new chat to see your conversation history here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {recentConversations.slice(0, 5).map((conv, index) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="card w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} style={{ color: 'var(--color-primary)' }} />
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {conv.title}
                    </p>
                    <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                      <Clock size={12} />
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} style={{ color: 'var(--color-text-secondary)' }} />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Getting Started */}
      {(!dockerStatus || !deerflowStatus) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-l-4 border-l-yellow-500"
          style={{ borderColor: '#eab308' }}
        >
          <div className="flex items-start gap-4">
            <Play size={24} style={{ color: '#eab308' }} />
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                Getting Started
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                To use Biochat, you need to have Docker and DeerFlow running. Please install Docker
                and start DeerFlow to enable all features.
              </p>
              <div className="flex gap-2 mt-3">
                <a
                  href="https://www.docker.com/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  Install Docker
                </a>
                <a
                  href="https://github.com/aicompanion/deerflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  DeerFlow GitHub
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
