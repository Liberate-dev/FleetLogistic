import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: `file:${path.join(__dirname, 'prisma/dev.db')}`,
  },
  migrate: {
    adapter: async () => {
      const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
      const Database = (await import('better-sqlite3')).default
      const db = new Database(path.join(__dirname, 'prisma/dev.db'))
      return new PrismaBetterSqlite3(db)
    },
  },
})