import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import log from 'electron-log'

let db: Database.Database | null = null

export function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const userDataPath = app.getPath('userData')
      const dbPath = path.join(userDataPath, 'biochat.db')
      log.info('Database path:', dbPath)
      
      db = new Database(dbPath)
      db.pragma('journal_mode = WAL')
      
      // Create tables
      db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversationId TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (conversationId) REFERENCES conversations(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_messages_conversation 
          ON messages(conversationId);
        CREATE INDEX IF NOT EXISTS idx_messages_created 
          ON messages(createdAt);
        CREATE INDEX IF NOT EXISTS idx_conversations_updated 
          ON conversations(updatedAt);
      `)
      
      log.info('Database tables created')
      resolve()
    } catch (error) {
      log.error('Database initialization error:', error)
      reject(error)
    }
  })
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
