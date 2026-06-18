import { put, list, del } from '@vercel/blob'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

// Password store kept in its own blob prefix, separate from the public app
// state, and never returned to the client. Holds only a salted scrypt hash.

const PREFIX = 'auth/'

interface AuthConfig { salt: string; hash: string }

async function readConfig(): Promise<AuthConfig | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const { blobs } = await list({ prefix: PREFIX })
    if (!blobs.length) return null
    const newest = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const res = await fetch(newest.url, { cache: 'no-store' })
    return await res.json()
  } catch { return null }
}

async function writeConfig(cfg: AuthConfig) {
  const written = await put(`${PREFIX}config.json`, JSON.stringify(cfg), {
    access: 'public', addRandomSuffix: true, contentType: 'application/json', cacheControlMaxAge: 0,
  })
  try {
    const { blobs } = await list({ prefix: PREFIX })
    await Promise.all(blobs.filter(b => b.url !== written.url).map(b => del(b.url).catch(() => {})))
  } catch { /* best effort */ }
}

export async function isConfigured(): Promise<boolean> {
  return !!(await readConfig())
}

export async function verifyPassword(password: string): Promise<boolean> {
  const cfg = await readConfig()
  if (!cfg || !password) return false
  const candidate = scryptSync(password, cfg.salt, 64)
  const stored = Buffer.from(cfg.hash, 'hex')
  return candidate.length === stored.length && timingSafeEqual(candidate, stored)
}

export async function setPassword(password: string): Promise<void> {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  await writeConfig({ salt, hash })
}
