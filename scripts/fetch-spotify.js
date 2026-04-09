import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const { SPOTIFY_CLIENT_ID, SPOTIFY_REFRESH_TOKEN, GH_TOKEN, ANTHROPIC_API_KEY } = process.env

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REFRESH_TOKEN) {
  console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_REFRESH_TOKEN')
  process.exit(1)
}

const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: SPOTIFY_REFRESH_TOKEN,
    client_id: SPOTIFY_CLIENT_ID,
  }),
})

const tokenData = await tokenRes.json()
const { access_token, refresh_token } = tokenData

if (!access_token) {
  console.error('Token exchange failed:', tokenData.error, tokenData.error_description)
  process.exit(1)
}

// Rotate refresh token if Spotify issued a new one
if (refresh_token && GH_TOKEN) {
  execSync(
    'gh secret set SPOTIFY_REFRESH_TOKEN --body @- --repo VishalEGupta/portfolio',
    { input: refresh_token, env: { ...process.env, GH_TOKEN } }
  )
  console.log('Rotated refresh token')
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
