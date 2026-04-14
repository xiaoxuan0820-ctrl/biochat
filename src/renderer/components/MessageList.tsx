import React, { useRef, useEffect } from 'react'
import { useStore } from '../stores/appStore'
import type { Message } from '../types'
import hljs from 'highlight.js'

// Markdown renderer
function renderMarkdown(text: string): string {
  // Basic markdown parsing
  let html = text
  
  // Escape HTML
  html = html.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
  
  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'plaintext'
    try {
      if (hljs.getLanguage(language)) {
        const highlighted = hljs.highlight(code.trim(), { language }).value
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
      }
    } catch (e) {}
    return `<pre><code class="hljs">${code.trim()}</code></pre>`
  })
  
  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  
  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
  
  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>')
  html = html.replace(/^\*\*\*$/gm, '<hr>')
  
  // Paragraphs
  html = html.split('\n\n').map(block => {
    if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<ol') || 
        block.startsWith('<blockquote') || block.startsWith('<pre') || block.startsWith('<hr')) {
      return block
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  }).join('\n')
  
  return html
}

interface MessageItemProps {
  message: Message
  onDelete: (id: string) => void
}

function MessageItem({ message, onDelete }: MessageItemProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex gap-3 p-4 animate-fadeIn ${isUser ? 'bg-dark-100' : 'bg-transparent'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-600' : 'bg-dark-300'
      }`}>
        {isUser ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">
            {isUser ? '你' : 'AI 助手'}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 rounded hover:bg-dark-200 text-gray-500 hover:text-red-400"
              title="删除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div 
          className={`markdown-body text-sm ${isUser ? 'text-gray-100' : 'text-gray-200'}`}
          dangerouslySetInnerHTML={{ __html: isUser ? message.content : renderMarkdown(message.content) }}
        />
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const { deleteMessage } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>发送消息开始对话</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <div key={message.id} className="group hover:bg-dark-100/50 transition-colors">
            <MessageItem message={message} onDelete={deleteMessage} />
          </div>
        ))}
      </div>
    </div>
  )
}
