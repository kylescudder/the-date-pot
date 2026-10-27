import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/server/db/schema.ts',
  migrations: {
    schema: 'drizzle',
    table: '__drizzle_migrations'
  },
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ''
  }
})
