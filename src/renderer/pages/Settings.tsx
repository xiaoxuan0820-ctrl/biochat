import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Settings,
  Key,
  Moon,
  Sun,
  Bot,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from 'lucide-react';

const MODEL_OPTIONS = [
  { id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek Chat' },
  { id: 'kimi', name: 'Kimi', description: 'Moonshot AI' },
  { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI GPT-4' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAI GPT-4 Turbo' },
  { id: 'claude-3', name: 'Claude 3', description: 'Anthropic Claude 3' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic Claude 3 Opus' },
  { id: 'gemini', name: 'Gemini Pro', description: 'Google Gemini Pro' },
];

const API_PROVIDERS = [
  { id: 'deepseek', name: 'DeepSeek', placeholder: 'sk-xxxxxxxxxxxxxxxx' },
  { id: 'kimi', name: 'Kimi (Moonshot)', placeholder: 'sk-xxxxxxxxxxxxxxxx' },
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-xxxxxxxxxxxxxxxx' },
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-xxxxxxxxxxxxxxxx' },
  { id: 'google', name: 'Google AI', placeholder: 'AIza...' },
];

export default function SettingsPage() {
  const { theme, setTheme, model, setModel, apiKeys, setApiKey, deleteApiKey } = useStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [appInfo, setAppInfo] = useState<{ home: string; app: string; userData: string } | null>(null);

  useEffect(() => {
    window.electronAPI.getAppPath().then(setAppInfo);
  }, []);

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSaveKey = async (provider: string) => {
    const key = keyInputs[provider];
    if (key) {
      await window.electronAPI.setApiKey(provider, key);
      setApiKey(provider, key);
      setKeyInputs((prev) => ({ ...prev, [provider]: '' }));
      setSavedKeys((prev) => ({ ...prev, [provider]: true }));
      setTimeout(() => setSavedKeys((prev) => ({ ...prev, [provider]: false })), 2000);
    }
  };

  const handleDeleteKey = async (provider: string) => {
    await window.electronAPI.deleteApiKey(provider);
    deleteApiKey(provider);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
          Settings
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Configure your Biochat preferences
        </p>
      </motion.div>

      {/* Appearance */}
      <motion.section variants={itemVariants} className="card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            {theme === 'dark' ? (
              <Moon size={20} style={{ color: 'var(--color-primary)' }} />
            ) : (
              <Sun size={20} style={{ color: 'var(--color-primary)' }} />
            )}
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Appearance
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Customize the look and feel
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme('light')}
            className="flex-1 p-4 rounded-xl border-2 transition-all"
            style={{
              borderColor: theme === 'light' ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: theme === 'light' ? 'var(--color-primary)' + '10' : 'transparent',
            }}
          >
            <Sun
              size={24}
              className="mx-auto mb-2"
              style={{ color: theme === 'light' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Light
            </p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme('dark')}
            className="flex-1 p-4 rounded-xl border-2 transition-all"
            style={{
              borderColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: theme === 'dark' ? 'var(--color-primary)' + '10' : 'transparent',
            }}
          >
            <Moon
              size={24}
              className="mx-auto mb-2"
              style={{ color: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Dark
            </p>
          </motion.button>
        </div>
      </motion.section>

      {/* Model Selection */}
      <motion.section variants={itemVariants} className="card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <Bot size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Default Model
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Select your preferred AI model
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MODEL_OPTIONS.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModel(option.id)}
              className="p-3 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: model === option.id ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor:
                  model === option.id ? 'var(--color-primary)' + '10' : 'transparent',
              }}
            >
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                {option.name}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {option.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* API Keys */}
      <motion.section variants={itemVariants} className="card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <Key size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              API Keys
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your AI service API keys
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {API_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {provider.name}
                </span>
                {apiKeys[provider.id] && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                  >
                    Configured
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={keyInputs[provider.id] || ''}
                    onChange={(e) => setKeyInputs((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                    placeholder={provider.placeholder}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {showKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSaveKey(provider.id)}
                  disabled={!keyInputs[provider.id]}
                  className="btn-primary px-4 flex items-center gap-2"
                  style={{ opacity: keyInputs[provider.id] ? 1 : 0.5 }}
                >
                  {savedKeys[provider.id] ? (
                    <>
                      <Check size={16} />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </motion.button>
                {apiKeys[provider.id] && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteKey(provider.id)}
                    className="btn-secondary px-3"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* App Info */}
      <motion.section variants={itemVariants} className="card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <Settings size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Application Info
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Biochat v1.0.0
            </p>
          </div>
        </div>
        {appInfo ? (
          <div className="space-y-2">
            <div className="flex justify-between p-3 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Home Directory</span>
              <span className="text-sm font-mono truncate max-w-[60%]" style={{ color: 'var(--color-text)' }}>
                {appInfo.home}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>User Data</span>
              <span className="text-sm font-mono truncate max-w-[60%]" style={{ color: 'var(--color-text)' }}>
                {appInfo.userData}
              </span>
            </div>
          </div>
        ) : (
          <Loader2 className="animate-spin mx-auto" size={24} style={{ color: 'var(--color-primary)' }} />
        )}
      </motion.section>
    </motion.div>
  );
}
