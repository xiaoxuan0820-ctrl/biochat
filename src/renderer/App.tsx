import React, { useEffect } from 'react'
import { useStore } from './stores/appStore'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
import Settings from './components/Settings'

function App() {
  const { 
    loadConversations, 
    loadSettings, 
    currentConversationId,
    isSettingsOpen,
    setSettingsOpen
  } = useStore()

  useEffect(() => {
    // Load initial data
    loadConversations()
    loadSettings()
  }, [])

  return (
    <div className="flex h-full w-full bg-dark-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentConversationId ? (
          <ChatView />
        ) : (
          <EmptyState onSettingsClick={() => setSettingsOpen(true)} />
        )}
      </div>
      
      {/* Settings Modal */}
      {isSettingsOpen && <Settings />}
    </div>
  )
}

function EmptyState({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { settings } = useStore()
  
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">欢迎使用 Biochat</h2>
        <p className="text-gray-400 mb-6">
          一个现代化的 AI 对话客户端，支持多种 AI 后端
        </p>
        {!settings.apiKey && (
          <button
            onClick={onSettingsClick}
            className="btn btn-primary"
          >
            配置 API 设置
          </button>
        )}
        <p className="text-gray-500 text-sm mt-4">
          点击左侧「新建对话」开始聊天
        </p>
      </div>
    </div>
  )
}

export default App
