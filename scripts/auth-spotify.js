#!/usr/bin/env node
/**
 * One-shot Spotify OAuth helper.
 * Usage: node scripts/auth-spotify.js
 *
 * Reads credentials from .env.local or the environment.
 * Uses Authorization Code + client_secret flow when SPOTIFY_CLIENT_SECRET is set,
 * otherwise falls back to PKCE.
 * Opens the browser, catches the callback on 127.0.0.1:5173,
 * exchanges the code for tokens, and writes SPOTIFY_REFRESH_TOKEN
 * to the GitHub repo secret automatically.
 */

import { createServer } from 'http'
import { readFileSync } from 'fs'
import { execSync, execFile } from 'child_process'
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
  console.error('Missing SPOTIFY_CLIENT_ID')
  process.exit(1)
}

const usePKCE = true
console.log('Using PKCE flow')

// PKCE helpers (only used when no client secret)
const verifier = randomBytes(32).toString('base64url')
const challenge = createHash('sha256').update(verifier).digest('base64url')

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
const tokenParams = {
  grant_type: 'authorization_code',
  code,
  redirect_uri: REDIRECT_URI,
  client_id: CLIENT_ID,
}
if (usePKCE) {
  tokenParams.code_verifier = verifier
} else {
  tokenParams.client_secret = CLIENT_SECRET
}

const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(tokenParams),
})

const tokenData = await tokenRes.json()
if (!tokenData.refresh_token) {
  console.error('Token exchange failed:', tokenData.error, tokenData.error_description)
  process.exit(1)
}

console.log('Got refresh token.')

if (GH_TOKEN) {
  execSync(`gh secret set SPOTIFY_REFRESH_TOKEN --body @- --repo ${REPO}`, {
    input: tokenData.refresh_token,
    env: { ...process.env, GH_TOKEN },
  })
  console.log(`Secret SPOTIFY_REFRESH_TOKEN updated on ${REPO}`)
} else {
  console.log('\nNo GH_TOKEN set — copy this refresh token manually:')
  console.log(tokenData.refresh_token)
}
