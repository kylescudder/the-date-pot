import postgres from 'postgres'

export function createHealthCheck(databaseUrl: string) {
  let probe: Promise<void> | undefined
  return () => {
    probe ??= check().finally(() => {
      probe = undefined
    })
    return probe
  }

  async function check() {
    // Own this connection so a deadline can retire it without touching app SQL.
    const sql = postgres(databaseUrl, {
      max: 1,
      connect_timeout: 3,
      connection: { statement_timeout: 3000 },
      onnotice: () => {}
    })
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        sql`SELECT 1`,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('timeout')), 3000)
        })
      ])
    } finally {
      clearTimeout(timer)
      // A SQL statement timeout cannot stop a socket that never reaches Postgres.
      await sql.end({ timeout: 0 })
    }
  }
}
