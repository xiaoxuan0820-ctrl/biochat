import React, { useRef, useEffect } from 'react'
import { useStore } from '../stores/appStore'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatView() {
  const { 
    messages, 
    isStreaming, 
    conversations, 
    currentConversationId,
    updateConversationTitle
  } = useStore()

  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    if (currentConversation) {
      setEditTitle(currentConversation.title)
      setIsEditing(true)
    }
  }

  const handleSaveTitle = () => {
    if (currentConversationId && editTitle.trim()) {
      updateConversationTitle(currentConversationId, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-dark-200 bg-dark-100">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="px-2 py-1 bg-dark-50 border border-dark-300 rounded text-sm font-medium w-64"
            />
          ) : (
            <h2 
              className="font-medium text-gray-200 cursor-pointer hover:text-white truncate max-w-md"
              onClick={handleStartEdit}
              title="点击修改标题"
            >
              {currentConversation?.title || '新对话'}
            </h2>
          )}
          <button
            onClick={handleStartEdit}
            className="p-1 rounded hover:bg-dark-200 text-gray-500 hover:text-gray-300"
            title="修改标题"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        
        {isStreaming && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex gap-1">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
            <span>AI 正在思考...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput disabled={isStreaming} />
    </div>
  )
}
