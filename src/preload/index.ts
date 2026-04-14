import { contextBridge, ipcRenderer } from 'electron'

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

export interface ApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

const api = {
  // Database operations
  db: {
    getConversations: (): Promise<ApiResult<Conversation[]>> => 
      ipcRenderer.invoke('db:getConversations'),
    
    createConversation: (data: { id: string, title: string }): Promise<ApiResult> =>
      ipcRenderer.invoke('db:createConversation', data),
    
    updateConversation: (data: { id: string, title?: string }): Promise<ApiResult> =>
      ipcRenderer.invoke('db:updateConversation', data),
    
    deleteConversation: (id: string): Promise<ApiResult> =>
      ipcRenderer.invoke('db:deleteConversation', id),
    
    getMessages: (conversationId: string): Promise<ApiResult<Message[]>> =>
      ipcRenderer.invoke('db:getMessages', conversationId),
    
    createMessage: (data: {
      id: string
      conversationId: string
      role: 'user' | 'assistant'
      content: string
    }): Promise<ApiResult> =>
      ipcRenderer.invoke('db:createMessage', data),
    
    deleteMessage: (id: string): Promise<ApiResult> =>
      ipcRenderer.invoke('db:deleteMessage', id),
    
    searchMessages: (query: string): Promise<ApiResult<any[]>> =>
      ipcRenderer.invoke('db:searchMessages', query)
  },
  
  // Settings
  settings: {
    get: (key: string): Promise<ApiResult<string>> =>
      ipcRenderer.invoke('settings:get', key),
    
    set: (key: string, value: string): Promise<ApiResult> =>
      ipcRenderer.invoke('settings:set', key, value),
    
    getAll: (): Promise<ApiResult<Record<string, string>>> =>
      ipcRenderer.invoke('settings:getAll')
  },
  
  // Window controls
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close')
  }
}

contextBridge.exposeInMainWorld('api', api)

export type API = typeof api
