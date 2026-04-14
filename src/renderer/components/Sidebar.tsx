import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../stores/appStore'

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
    searchResults,
    search,
    clearSearch,
    setSettingsOpen
  } = useStore()

  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    search(query)
  }

  const handleSelectSearchResult = (conversationId: string) => {
    selectConversation(conversationId)
    clearSearch()
    setShowSearch(false)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-64 h-full bg-dark-100 flex flex-col border-r border-dark-200">
      {/* Header */}
      <div className="p-4 border-b border-dark-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-100">Biochat</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-gray-200 transition-colors"
              title="搜索"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-gray-200 transition-colors"
              title="设置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search input */}
        {showSearch && (
          <div className="relative mb-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="搜索对话..."
              className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-dark-300 rounded-lg text-sm"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  clearSearch()
                  setShowSearch(false)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Search results */}
        {showSearch && searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto bg-dark-50 rounded-lg border border-dark-300 mb-2">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectSearchResult(result.conversationId)}
                className="p-2 hover:bg-dark-200 cursor-pointer border-b border-dark-300 last:border-b-0"
              >
                <div className="text-xs text-gray-500 mb-1">{result.conversationTitle}</div>
                <div className="text-sm text-gray-300 line-clamp-2">{result.content}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* New chat button */}
        <button
          onClick={createConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建对话
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2">
          历史对话
        </div>
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            暂无对话记录
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-dark-200 text-gray-100'
                    : 'text-gray-400 hover:bg-dark-200 hover:text-gray-200'
                }`}
                onClick={() => selectConversation(conv.id)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="flex-1 truncate text-sm">{conv.title}</span>
                <span className="text-xs opacity-60">{formatDate(conv.updatedAt)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-300 rounded transition-all"
                  title="删除"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-200">
        <div className="text-xs text-gray-500 text-center">
          Biochat v1.1.0
        </div>
      </div>
    </div>
  )
}
