import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Conversation, Message, Settings } from '../types'

interface AppState {
  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null
  
  // Messages
  messages: Message[]
  
  // Settings
  settings: Settings
  isSettingsOpen: boolean
  
  // UI State
  isLoading: boolean
  isStreaming: boolean
  searchQuery: string
  searchResults: any[]
  
  // Actions
  loadConversations: () => Promise<void>
  createConversation: () => Promise<void>
  selectConversation: (id: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<Settings>) => Promise<void>
  setSettingsOpen: (open: boolean) => void
  
  setSearchQuery: (query: string) => void
  search: (query: string) => Promise<void>
  clearSearch: () => void
  
  setStreaming: (streaming: boolean) => void
}

const defaultSettings: Settings = {
  apiEndpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  theme: 'dark'
}

export const useStore = create<AppState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  settings: defaultSettings,
  isSettingsOpen: false,
  isLoading: false,
  isStreaming: false,
  searchQuery: '',
  searchResults: [],

  loadConversations: async () => {
    const result = await window.api.db.getConversations()
    if (result.success && result.data) {
      set({ conversations: result.data })
    }
  },

  createConversation: async () => {
    const id = uuidv4()
    const title = '新对话'
    
    await window.api.db.createConversation({ id, title })
    await get().loadConversations()
    set({ currentConversationId: id, messages: [] })
  },

  selectConversation: async (id: string) => {
    set({ currentConversationId: id, isLoading: true })
    await get().loadMessages(id)
    set({ isLoading: false })
  },

  deleteConversation: async (id: string) => {
    await window.api.db.deleteConversation(id)
    const { currentConversationId } = get()
    
    if (currentConversationId === id) {
      set({ currentConversationId: null, messages: [] })
    }
    
    await get().loadConversations()
  },

  updateConversationTitle: async (id: string, title: string) => {
    await window.api.db.updateConversation({ id, title })
    await get().loadConversations()
  },

  loadMessages: async (conversationId: string) => {
    const result = await window.api.db.getMessages(conversationId)
    if (result.success && result.data) {
      set({ messages: result.data })
    }
  },

  sendMessage: async (content: string) => {
    const { currentConversationId, settings, messages } = get()
    
    if (!currentConversationId) {
      await get().createConversation()
    }
    
    const convId = currentConversationId || uuidv4()
    const userMessage: Message = {
      id: uuidv4(),
      conversationId: convId,
      role: 'user',
      content,
      createdAt: Date.now()
    }
    
    set(state => ({
      messages: [...state.messages, userMessage],
      isStreaming: true
    }))
    
    // Save user message
    await window.api.db.createMessage(userMessage)
    
    // Update conversation title if it's the first message
    if (messages.length === 0) {
      const title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
      await window.api.db.updateConversation({ id: convId, title })
      await get().loadConversations()
    }
    
    // Call AI API
    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: apiMessages,
          stream: true
        })
      })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const reader = response.body?.getReader()
      const assistantMessage: Message = {
        id: uuidv4(),
        conversationId: convId,
        role: 'assistant',
        content: '',
        createdAt: Date.now()
      }
      
      set(state => ({
        messages: [...state.messages, assistantMessage]
      }))
      
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = new TextDecoder().decode(value)
        const lines = text.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content
              if (content) {
                assistantMessage.content += content
                set(state => ({
                  messages: state.messages.map((m, i) => 
                    m.id === assistantMessage.id ? { ...assistantMessage } : m
                  )
                }))
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Save assistant message
      await window.api.db.createMessage(assistantMessage)
      
    } catch (error: any) {
      console.error('AI API Error:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        conversationId: convId,
        role: 'assistant',
        content: `错误: ${error.message}`,
        createdAt: Date.now()
      }
      set(state => ({
        messages: [...state.messages, errorMessage]
      }))
      await window.api.db.createMessage(errorMessage)
    } finally {
      set({ isStreaming: false })
    }
  },

  deleteMessage: async (id: string) => {
    await window.api.db.deleteMessage(id)
    set(state => ({
      messages: state.messages.filter(m => m.id !== id)
    }))
  },

  loadSettings: async () => {
    const result = await window.api.settings.getAll()
    if (result.success && result.data) {
      set({
        settings: {
          apiEndpoint: result.data.apiEndpoint || defaultSettings.apiEndpoint,
          apiKey: result.data.apiKey || defaultSettings.apiKey,
          model: result.data.model || defaultSettings.model,
          theme: (result.data.theme as 'dark' | 'light') || defaultSettings.theme
        }
      })
    }
  },

  updateSettings: async (newSettings: Partial<Settings>) => {
    const { settings } = get()
    const updated = { ...settings, ...newSettings }
    
    // Save to database
    for (const [key, value] of Object.entries(newSettings)) {
      await window.api.settings.set(key, String(value))
    }
    
    set({ settings: updated })
  },

  setSettingsOpen: (open: boolean) => {
    set({ isSettingsOpen: open })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  search: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] })
      return
    }
    
    const result = await window.api.db.searchMessages(query)
    if (result.success && result.data) {
      set({ searchResults: result.data })
    }
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [] })
  },

  setStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming })
  }
}))
