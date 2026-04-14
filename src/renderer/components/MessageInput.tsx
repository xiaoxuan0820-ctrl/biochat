import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../stores/appStore'

interface MessageInputProps {
  disabled?: boolean
}

export default function MessageInput({ disabled }: MessageInputProps) {
  const { sendMessage, settings } = useStore()
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    
    // Check if API is configured
    if (!settings.apiKey) {
      alert('请先在设置中配置 API Key')
      return
    }
    
    setInput('')
    await sendMessage(trimmed)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = disabled || !settings.apiKey

  return (
    <div className="border-t border-dark-200 bg-dark-100 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? '请先配置 API Key' : '输入消息... (Shift+Enter 换行)'}
            disabled={isDisabled}
            className="w-full pr-12 pl-4 py-3 bg-dark-50 border border-dark-300 rounded-xl resize-none text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            rows={1}
          />
          <button
            type="submit"
            disabled={isDisabled || !input.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
              input.trim() && !isDisabled
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-dark-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {settings.model ? (
            <span>使用模型: {settings.model}</span>
          ) : (
            <span className="text-yellow-500">未配置模型</span>
          )}
        </div>
      </div>
    </div>
  )
}
