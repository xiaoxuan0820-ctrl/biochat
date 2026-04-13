import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Download,
  Check,
  ExternalLink,
  Search,
  Loader2,
  FileCode,
  Puzzle,
  Zap,
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  installed: boolean;
  icon?: string;
}

const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'pdf',
    name: 'PDF Processing',
    description: 'Extract text, tables, and images from PDF documents',
    author: 'Biochat',
    category: 'document',
    installed: true,
  },
  {
    id: 'excel_master',
    name: 'Excel Master',
    description: 'Full Excel workflow with data exploration, cleaning, and visualization',
    author: 'Biochat',
    category: 'data',
    installed: true,
  },
  {
    id: 'docx',
    name: 'Word Documents',
    description: 'Create, edit, and analyze Word documents',
    author: 'Biochat',
    category: 'document',
    installed: true,
  },
  {
    id: 'echart',
    name: 'Data Visualization',
    description: 'Generate charts and data visualizations',
    author: 'Biochat',
    category: 'visualization',
    installed: true,
  },
  {
    id: 'drawio-generator',
    name: 'Diagram Generator',
    description: 'Create flowcharts, mind maps, and architecture diagrams',
    author: 'Biochat',
    category: 'visualization',
    installed: true,
  },
  {
    id: 'create-ppt',
    name: 'PowerPoint Creator',
    description: 'Generate professional presentations and slides',
    author: 'Biochat',
    category: 'document',
    installed: true,
  },
  {
    id: 'hotspot-research',
    name: 'Hotspot Research',
    description: 'Cross-platform trending topic analysis',
    author: 'Biochat',
    category: 'research',
    installed: false,
  },
  {
    id: 'topic-tracking',
    name: 'Topic Tracking',
    description: 'Track high时效性 content and trends',
    author: 'Biochat',
    category: 'research',
    installed: false,
  },
  {
    id: 'dalle-image',
    name: 'Image Generation',
    description: 'Generate images using DALL-E models',
    author: 'Biochat',
    category: 'creative',
    installed: false,
  },
];

const MARKETPLACE_SKILLS: Skill[] = [
  {
    id: 'stock-analysis',
    name: 'Stock Analysis',
    description: 'Real-time stock data and technical analysis',
    author: 'Community',
    category: 'finance',
    installed: false,
  },
  {
    id: 'news-collector',
    name: 'Daily News Collector',
    description: 'Auto-collect and summarize daily news',
    author: 'Community',
    category: 'research',
    installed: false,
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Automated code quality and security analysis',
    author: 'Community',
    category: 'developer',
    installed: false,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Transcribe and summarize meeting recordings',
    author: 'Community',
    category: 'productivity',
    installed: false,
  },
];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([...BUILT_IN_SKILLS, ...MARKETPLACE_SKILLS]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'available'>('all');
  const [installing, setInstalling] = useState<string | null>(null);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'installed' && skill.installed) ||
      (filter === 'available' && !skill.installed);
    return matchesSearch && matchesFilter;
  });

  const handleInstall = async (skillId: string) => {
    setInstalling(skillId);
    // Simulate installation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSkills((prev) =>
      prev.map((skill) => (skill.id === skillId ? { ...skill, installed: true } : skill))
    );
    setInstalling(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document':
        return <FileCode size={16} style={{ color: 'var(--color-primary)' }} />;
      case 'data':
        return <Zap size={16} style={{ color: '#f59e0b' }} />;
      case 'visualization':
        return <Sparkles size={16} style={{ color: '#8b5cf6' }} />;
      default:
        return <Puzzle size={16} style={{ color: 'var(--color-text-secondary)' }} />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
          Skills Market
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Enhance Biochat with powerful skills and plugins
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-secondary)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="input pl-10"
          />
        </div>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          {(['all', 'installed', 'available'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: filter === f ? 'var(--color-primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--color-text)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Skills Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <motion.div
              key={skill.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className="card flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  {skill.installed ? (
                    <Check size={24} style={{ color: '#22c55e' }} />
                  ) : (
                    getCategoryIcon(skill.category)
                  )}
                </div>
                {skill.installed && (
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                  >
                    Installed
                  </span>
                )}
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {skill.name}
              </h3>
              <p className="text-sm mb-3 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                {skill.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  by {skill.author}
                </span>
                {!skill.installed ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInstall(skill.id)}
                    disabled={installing === skill.id}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    {installing === skill.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Install
                      </>
                    )}
                  </motion.button>
                ) : (
                  <button className="btn-secondary flex items-center gap-2 text-sm">
                    <ExternalLink size={14} />
                    Open
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="card flex items-center justify-around py-4"
      >
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {skills.length}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Total Skills
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {skills.filter((s) => s.installed).length}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Installed
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {MARKETPLACE_SKILLS.length}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Available
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
