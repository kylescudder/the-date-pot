import { database, migrate } from '../src/server/db'
import { readDatabaseEnv } from '../src/server/env'

const sql = database(readDatabaseEnv().DATABASE_URL)
try {
  await migrate(sql)
  console.log('The Date Pot schema is ready')
} finally {
  await sql.end()
}
