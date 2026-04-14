export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface Settings {
  apiEndpoint: string
  apiKey: string
  model: string
  theme: 'dark' | 'light'
}

export interface ApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

declare global {
  interface Window {
    api: {
      db: {
        getConversations: () => Promise<ApiResult<Conversation[]>>
        createConversation: (data: { id: string, title: string }) => Promise<ApiResult>
        updateConversation: (data: { id: string, title?: string }) => Promise<ApiResult>
        deleteConversation: (id: string) => Promise<ApiResult>
        getMessages: (conversationId: string) => Promise<ApiResult<Message[]>>
        createMessage: (data: {
          id: string
          conversationId: string
          role: 'user' | 'assistant'
          content: string
        }) => Promise<ApiResult>
        deleteMessage: (id: string) => Promise<ApiResult>
        searchMessages: (query: string) => Promise<ApiResult<any[]>>
      }
      settings: {
        get: (key: string) => Promise<ApiResult<string>>
        set: (key: string, value: string) => Promise<ApiResult>
        getAll: () => Promise<ApiResult<Record<string, string>>>
      }
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        close: () => Promise<void>
      }
    }
  }
}
