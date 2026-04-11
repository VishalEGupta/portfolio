import { writeFileSync } from 'fs'
import { spawnSync } from 'child_process'

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, GH_TOKEN, ANTHROPIC_API_KEY } = process.env

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REFRESH_TOKEN) {
  console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_REFRESH_TOKEN')
  process.exit(1)
}

console.log('client_id prefix:', SPOTIFY_CLIENT_ID.slice(0, 8))
console.log('refresh_token prefix:', SPOTIFY_REFRESH_TOKEN.slice(0, 8))
console.log('has client_secret:', !!SPOTIFY_CLIENT_SECRET)

// Authorization Code flow (client_secret) gives stable non-rotating tokens.
// PKCE (no client_secret) rotates tokens on every refresh — only use as fallback.
const tokenBody = {
  grant_type: 'refresh_token',
  refresh_token: SPOTIFY_REFRESH_TOKEN,
  client_id: SPOTIFY_CLIENT_ID,
}
if (SPOTIFY_CLIENT_SECRET) tokenBody.client_secret = SPOTIFY_CLIENT_SECRET

const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(tokenBody),
})

const tokenData = await tokenRes.json()
const { access_token, refresh_token } = tokenData

if (!access_token) {
  console.error('Token exchange failed:', tokenData.error, tokenData.error_description)
  console.error('Full response:', JSON.stringify(tokenData))
  process.exit(1)
}

// Rotate refresh token only for PKCE (client_secret tokens don't rotate)
if (refresh_token && GH_TOKEN && !SPOTIFY_CLIENT_SECRET) {
  const result = spawnSync(
    'gh', ['secret', 'set', 'SPOTIFY_REFRESH_TOKEN', '--body', refresh_token, '--repo', 'VishalEGupta/portfolio'],
    { env: { ...process.env, GH_TOKEN }, encoding: 'utf8' }
  )
  if (result.status === 0) {
    console.log('Rotated refresh token')
  } else {
    console.warn('Could not rotate refresh token (non-fatal):', result.stderr?.trim())
  }
}

async function get(endpoint) {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (res.status === 204 || !res.ok) return null
  return res.json()
}

const [tracksData, artistsData] = await Promise.all([
  get('/me/top/tracks?limit=5&time_range=short_term'),
  get('/me/top/artists?limit=5&time_range=short_term'),
])

const tracks = tracksData?.items ?? []
const artists = artistsData?.items ?? []

let mood = null
if (ANTHROPIC_API_KEY && tracks.length > 0) {
  const trackList = tracks
    .map((t, i) => `${i + 1}. "${t.name}" by ${t.artists.map(a => a.name).join(', ')}`)
    .join('\n')

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analyze the mood of this listening history and respond with ONLY valid JSON, no markdown fences:\n\n${trackList}\n\nReturn exactly this shape:\n{"mood":"one or two word mood label","description":"2-3 sentences explaining the mood based on specific tracks","emoji":"single emoji","color":"#hexcolor"}`,
      }],
    }),
  })

  const claudeData = await claudeRes.json()
  const raw = claudeData.content?.[0]?.text?.trim() ?? ''
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    mood = JSON.parse(cleaned)
    console.log('Mood analyzed:', mood.mood)
  } catch {
    console.warn('Failed to parse mood response:', raw)
  }
}

const data = { tracks, artists, mood }

writeFileSync('public/spotify-data.json', JSON.stringify(data))
console.log(`Wrote ${data.tracks.length} tracks, ${data.artists.length} artists`)
