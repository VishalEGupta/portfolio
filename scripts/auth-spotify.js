#!/usr/bin/env node
/**
 * One-shot Spotify OAuth helper (PKCE flow).
 * Usage: node scripts/auth-spotify.js
 *
 * Reads SPOTIFY_CLIENT_ID (and optionally GH_TOKEN) from .env.local or env.
 * Opens the browser, catches the callback on 127.0.0.1:5173,
 * exchanges the code for tokens, verifies the refresh token works,
 * then stores it in .env.local and the GitHub repo secret.
 */

import { createServer } from 'http'
import { readFileSync, writeFileSync } from 'fs'
import { execFile, spawnSync } from 'child_process'
import { createHash, randomBytes } from 'crypto'

// Load .env.local if present
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* no .env.local, that's fine */ }

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const GH_TOKEN = process.env.GH_TOKEN
const PORT = 5173
const REDIRECT_URI = `http://127.0.0.1:${PORT}/portfolio/callback`
const SCOPES = 'user-top-read user-read-currently-playing'
const REPO = 'VishalEGupta/portfolio'

if (!CLIENT_ID) {
  console.error('Missing SPOTIFY_CLIENT_ID in .env.local or environment')
  process.exit(1)
}

// Use Authorization Code + client_secret (stable, non-rotating tokens) when available.
// Fall back to PKCE only if no client_secret.
const usePKCE = !CLIENT_SECRET
console.log(usePKCE ? 'Using PKCE flow' : 'Using Authorization Code flow (client_secret)')

let verifier, challenge
if (usePKCE) {
  verifier = randomBytes(32).toString('base64url')
  challenge = createHash('sha256').update(verifier).digest('base64url')
}

const authUrl = new URL('https://accounts.spotify.com/authorize')
authUrl.searchParams.set('client_id', CLIENT_ID)
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
authUrl.searchParams.set('scope', SCOPES)
if (usePKCE) {
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('code_challenge', challenge)
}

// Wait for the OAuth callback
const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
    if (url.pathname !== '/portfolio/callback') return
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<html><body style="font-family:sans-serif;padding:40px"><h2>Done — you can close this tab.</h2></body></html>')
    server.close()
    if (error) reject(new Error(`Spotify auth error: ${error}`))
    else resolve(code)
  })
  server.listen(PORT, '127.0.0.1', () => {
    console.log('Opening browser for Spotify authorization...')
    execFile('open', [authUrl.toString()])
  })
  server.on('error', reject)
})

// Exchange code for tokens
const exchangeParams = {
  grant_type: 'authorization_code',
  code,
  redirect_uri: REDIRECT_URI,
  client_id: CLIENT_ID,
}
if (usePKCE) {
  exchangeParams.code_verifier = verifier
} else {
  exchangeParams.client_secret = CLIENT_SECRET
}
const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(exchangeParams),
})

const tokenData = await tokenRes.json()
if (!tokenData.refresh_token) {
  console.error('Token exchange failed:', tokenData.error, tokenData.error_description)
  process.exit(1)
}

// Immediately verify the refresh token works before storing it
console.log('Verifying refresh token...')
const verifyParams = {
  grant_type: 'refresh_token',
  refresh_token: tokenData.refresh_token,
  client_id: CLIENT_ID,
}
if (!usePKCE) verifyParams.client_secret = CLIENT_SECRET
const verifyRes = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(verifyParams),
})

const verifyData = await verifyRes.json()
if (!verifyData.access_token) {
  console.error('Refresh token verification failed:', verifyData.error, verifyData.error_description)
  console.error('Check your Spotify app at https://developer.spotify.com/dashboard:')
  console.error('  - Redirect URI http://127.0.0.1:5173/portfolio/callback must be listed')
  console.error('  - Your account must be in the allowlist if app is in Development Mode')
  process.exit(1)
}

// Spotify may rotate the refresh token on use — always store the latest one
const refreshToken = verifyData.refresh_token ?? tokenData.refresh_token
console.log('Token verified. Prefix:', refreshToken.slice(0, 8))

// Write to .env.local
const envPath = new URL('../.env.local', import.meta.url).pathname
try {
  let envContent = ''
  try { envContent = readFileSync(envPath, 'utf8') } catch {}
  const line = `SPOTIFY_REFRESH_TOKEN=${refreshToken}`
  if (/^SPOTIFY_REFRESH_TOKEN=/m.test(envContent)) {
    envContent = envContent.replace(/^SPOTIFY_REFRESH_TOKEN=.*/m, line)
  } else {
    if (envContent && !envContent.endsWith('\n')) envContent += '\n'
    envContent += line + '\n'
  }
  writeFileSync(envPath, envContent)
  console.log('Written to .env.local')
} catch (e) {
  console.warn('Could not write to .env.local:', e.message)
}

// Store in GitHub — use spawnSync with direct arg to avoid shell/stdin encoding issues
if (GH_TOKEN) {
  const result = spawnSync(
    'gh',
    ['secret', 'set', 'SPOTIFY_REFRESH_TOKEN', '--body', refreshToken, '--repo', REPO],
    { env: { ...process.env, GH_TOKEN }, encoding: 'utf8' }
  )
  if (result.status !== 0) {
    console.error('Failed to set GitHub secret:', result.stderr)
    console.log('\nCopy this refresh token manually into GitHub secret SPOTIFY_REFRESH_TOKEN:')
    console.log(refreshToken)
  } else {
    console.log(`Secret SPOTIFY_REFRESH_TOKEN updated on ${REPO}`)
  }
} else {
  console.log('\nNo GH_TOKEN set — copy this refresh token manually into GitHub secret SPOTIFY_REFRESH_TOKEN:')
  console.log(refreshToken)
}
