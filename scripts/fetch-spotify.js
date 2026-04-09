import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const { SPOTIFY_CLIENT_ID, SPOTIFY_REFRESH_TOKEN, GH_TOKEN } = process.env

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
    `gh secret set SPOTIFY_REFRESH_TOKEN --body "${refresh_token}" --repo VishalEGupta/portfolio`,
    { env: { ...process.env, GH_TOKEN } }
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

const data = {
  tracks: tracksData?.items ?? [],
  artists: artistsData?.items ?? [],
}

writeFileSync('public/spotify-data.json', JSON.stringify(data))
console.log(`Wrote ${data.tracks.length} tracks, ${data.artists.length} artists`)
