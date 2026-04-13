import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Send,
  Bot,
  User,
  Loader2,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Plus,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deerflowStatus, addConversation, model } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (id) {
      // Load conversation history (placeholder for now)
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add to recent conversations
    addConversation(input.trim().slice(0, 50));

    // Simulate AI response (in production, this would connect to DeerFlow API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a demo response. In production, this would connect to DeerFlow at localhost:2026 to process your research request.\n\nYou selected model: ${model}\n\nDeerFlow status: ${deerflowStatus ? 'Running' : 'Not running'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openInDeerFlow = () => {
    window.electronAPI.openExternal('http://localhost:2026');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Bot size={24} style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            {id ? 'Conversation' : 'New Chat'}
          </h1>
          <span
            className="text-sm px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {model}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {deerflowStatus && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openInDeerFlow}
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Open DeerFlow
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <Bot size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Start a new conversation
            </h2>
            <p className="max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
              Ask me anything about research, data analysis, or content generation. I can help you
              with DeerFlow's AI-powered research capabilities.
            </p>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-tertiary)',
                }}
              >
                {message.role === 'user' ? (
                  <User size={16} color="white" />
                ) : (
                  <Bot size={16} style={{ color: 'var(--color-primary)' }} />
                )}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`}
                style={{
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-secondary)',
                  color: message.role === 'user' ? 'white' : 'var(--color-text)',
                }}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="p-1 rounded hover:bg-black/10 transition-colors"
                  >
                    {copiedId === message.id ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              <Bot size={16} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <Loader2 className="animate-spin" size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="input flex-1 resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4"
            style={{ opacity: !input.trim() || isLoading ? 0.5 : 1 }}
          >
            <Send size={20} />
          </motion.button>
        </form>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
