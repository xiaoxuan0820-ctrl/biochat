import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  FileText,
  File,
  Image,
  FileCode,
  ChevronRight,
  ChevronDown,
  Download,
  ExternalLink,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
  previewable?: boolean;
  children?: FileItem[];
}

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getDeerflowOutputs();
      if (result.error) {
        setError(result.error);
      } else {
        setFiles(result.files);
      }
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return <FolderOpen size={18} style={{ color: '#f59e0b' }} />;
    }
    switch (file.extension) {
      case '.pdf':
        return <FileCode size={18} style={{ color: '#ef4444' }} />;
      case '.md':
        return <FileText size={18} style={{ color: 'var(--color-primary)' }} />;
      case '.png':
      case '.jpg':
      case '.jpeg':
        return <Image size={18} style={{ color: '#8b5cf6' }} />;
      default:
        return <File size={18} style={{ color: 'var(--color-text-secondary)' }} />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const openFile = async (file: FileItem) => {
    await window.electronAPI.openFile(file.path);
  };

  const previewFile = async (file: FileItem) => {
    if (!file.previewable) return;
    setSelectedFile(file);
    setLoadingContent(true);
    try {
      const response = await fetch(`file://${file.path}`);
      const content = await response.text();
      setFileContent(content);
    } catch {
      setFileContent('Failed to load file content');
    } finally {
      setLoadingContent(false);
    }
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => (item.type === 'directory' ? toggleDir(item.path) : previewFile(item))}
        >
          {item.type === 'directory' ? (
            expandedDirs.has(item.path) ? (
              <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />
            ) : (
              <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
            )
          ) : (
            <span className="w-4" />
          )}
          {getFileIcon(item)}
          <span className="flex-1 truncate" style={{ color: 'var(--color-text)' }}>
            {item.name}
          </span>
          {item.size !== undefined && (
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {formatSize(item.size)}
            </span>
          )}
          {item.type === 'file' && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openFile(item);
                }}
                className="p-1 rounded hover:bg-[var(--color-bg-secondary)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <ExternalLink size={14} />
              </button>
            </div>
          )}
        </motion.div>
        {item.type === 'directory' && expandedDirs.has(item.path) && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
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
      className="h-full flex gap-6"
    >
      {/* File Tree */}
      <motion.div
        variants={itemVariants}
        className="w-1/2 card overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <FolderOpen size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              DeerFlow Outputs
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadFiles}
            disabled={loading}
            className="btn-secondary p-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p style={{ color: '#ef4444' }}>{error}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                Make sure DeerFlow is installed and has generated outputs
              </p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen size={48} style={{ color: 'var(--color-text-secondary)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--color-text-secondary)' }}>No outputs found</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                Start a conversation to generate reports
              </p>
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
      </motion.div>

      {/* Preview Panel */}
      <motion.div
        variants={itemVariants}
        className="w-1/2 card overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <FileText size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {selectedFile ? selectedFile.name : 'Preview'}
            </h2>
          </div>
          {selectedFile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openFile(selectedFile)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <ExternalLink size={14} />
              Open
            </motion.button>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {!selectedFile ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Select a file to preview
              </p>
            </div>
          ) : loadingContent ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : (
            <pre
              className="p-4 text-sm font-mono whitespace-pre-wrap"
              style={{ color: 'var(--color-text)' }}
            >
              {fileContent}
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
