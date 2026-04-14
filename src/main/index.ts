import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import log from 'electron-log'
import { initDatabase, getDatabase } from './database'

// Configure logging
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

// Global exception handler
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason)
})

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged

function createWindow() {
  log.info('Creating main window...')
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#18181b',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  log.info('Main window created successfully')
}

app.whenReady().then(async () => {
  log.info('App ready, initializing...')
  
  try {
    await initDatabase()
    log.info('Database initialized')
  } catch (error) {
    log.error('Database initialization failed:', error)
  }

  // Setup IPC handlers
  setupIpcHandlers()
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function setupIpcHandlers() {
  const db = getDatabase()
  
  // Conversations CRUD
  ipcMain.handle('db:getConversations', () => {
    try {
      const stmt = db.prepare('SELECT * FROM conversations ORDER BY updatedAt DESC')
      return { success: true, data: stmt.all() }
    } catch (error: any) {
      log.error('getConversations error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:createConversation', (_, data: { id: string, title: string }) => {
    try {
      const now = Date.now()
      const stmt = db.prepare(
        'INSERT INTO conversations (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)'
      )
      stmt.run(data.id, data.title, now, now)
      return { success: true }
    } catch (error: any) {
      log.error('createConversation error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:updateConversation', (_, data: { id: string, title?: string }) => {
    try {
      const now = Date.now()
      if (data.title) {
        const stmt = db.prepare(
          'UPDATE conversations SET title = ?, updatedAt = ? WHERE id = ?'
        )
        stmt.run(data.title, now, data.id)
      }
      return { success: true }
    } catch (error: any) {
      log.error('updateConversation error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deleteConversation', (_, id: string) => {
    try {
      const stmt = db.prepare('DELETE FROM conversations WHERE id = ?')
      stmt.run(id)
      // Also delete all messages in this conversation
      const msgStmt = db.prepare('DELETE FROM messages WHERE conversationId = ?')
      msgStmt.run(id)
      return { success: true }
    } catch (error: any) {
      log.error('deleteConversation error:', error)
      return { success: false, error: error.message }
    }
  })

  // Messages CRUD
  ipcMain.handle('db:getMessages', (_, conversationId: string) => {
    try {
      const stmt = db.prepare(
        'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC'
      )
      return { success: true, data: stmt.all(conversationId) }
    } catch (error: any) {
      log.error('getMessages error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:createMessage', (_, data: {
    id: string,
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  }) => {
    try {
      const now = Date.now()
      const stmt = db.prepare(
        'INSERT INTO messages (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)'
      )
      stmt.run(data.id, data.conversationId, data.role, data.content, now)
      
      // Update conversation's updatedAt
      const updateStmt = db.prepare('UPDATE conversations SET updatedAt = ? WHERE id = ?')
      updateStmt.run(now, data.conversationId)
      
      return { success: true }
    } catch (error: any) {
      log.error('createMessage error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deleteMessage', (_, id: string) => {
    try {
      const stmt = db.prepare('DELETE FROM messages WHERE id = ?')
      stmt.run(id)
      return { success: true }
    } catch (error: any) {
      log.error('deleteMessage error:', error)
      return { success: false, error: error.message }
    }
  })

  // Settings
  ipcMain.handle('settings:get', (_, key: string) => {
    try {
      const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
      const row = stmt.get(key) as { value: string } | undefined
      return { success: true, data: row?.value || null }
    } catch (error: any) {
      log.error('settings:get error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:set', (_, key: string, value: string) => {
    try {
      const stmt = db.prepare(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
      )
      stmt.run(key, value)
      return { success: true }
    } catch (error: any) {
      log.error('settings:set error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:getAll', () => {
    try {
      const stmt = db.prepare('SELECT key, value FROM settings')
      const rows = stmt.all() as { key: string, value: string }[]
      const settings: Record<string, string> = {}
      rows.forEach(row => {
        settings[row.key] = row.value
      })
      return { success: true, data: settings }
    } catch (error: any) {
      log.error('settings:getAll error:', error)
      return { success: false, error: error.message }
    }
  })

  // Search
  ipcMain.handle('db:searchMessages', (_, query: string) => {
    try {
      const stmt = db.prepare(
        `SELECT m.*, c.title as conversationTitle 
         FROM messages m 
         JOIN conversations c ON m.conversationId = c.id 
         WHERE m.content LIKE ? 
         ORDER BY m.createdAt DESC 
         LIMIT 50`
      )
      return { success: true, data: stmt.all(`%${query}%`) }
    } catch (error: any) {
      log.error('searchMessages error:', error)
      return { success: false, error: error.message }
    }
  })

  // Window controls
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  log.info('IPC handlers registered')
}
