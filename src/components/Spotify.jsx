import { useState, useEffect } from 'react'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.DEV
  ? 'http://127.0.0.1:5173/callback'
  : 'https://vishalegupta.github.io/portfolio/callback'
const SCOPES = 'user-top-read user-read-currently-playing'

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function apiFetch(endpoint, token) {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204 || res.status === 404) return null
  if (!res.ok) return null
  return res.json()
}

const styles = {
  section: {
    padding: '60px 48px',
    borderTop: '1px solid #1e1e1e',
  },
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  connectBtn: {
    fontSize: '13px',
    color: '#1DB954',
    backgroundColor: 'transparent',
    border: '1px solid rgba(29, 185, 84, 0.4)',
    borderRadius: '4px',
    padding: '8px 20px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  muted: {
    fontSize: '14px',
    color: '#555555',
  },
  nowPlaying: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '12px 16px',
    backgroundColor: '#161616',
    border: '1px solid #1e1e1e',
    borderRadius: '6px',
    maxWidth: '400px',
  },
  nowPlayingImg: {
    width: '40px',
    height: '40px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  nowPlayingStatus: {
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#1DB954',
    margin: '0 0 2px',
  },
  nowPlayingName: {
    fontSize: '14px',
    color: '#e8e6e0',
    margin: 0,
  },
  nowPlayingArtist: {
    fontSize: '12px',
    color: '#888888',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    maxWidth: '700px',
  },
  colLabel: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  rowNum: {
    fontSize: '12px',
    color: '#555555',
    width: '14px',
    flexShrink: 0,
    textAlign: 'right',
  },
  rowImg: {
    width: '36px',
    height: '36px',
    flexShrink: 0,
  },
  rowInfo: {
    minWidth: 0,
  },
  rowName: {
    fontSize: '14px',
    color: '#e8e6e0',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSub: {
    fontSize: '12px',
    color: '#888888',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  disconnectBtn: {
    marginTop: '32px',
    fontSize: '12px',
    color: '#555555',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    letterSpacing: '0.04em',
    display: 'block',
  },
  callbackPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
  },
  callbackText: {
    fontSize: '14px',
    color: '#555555',
    letterSpacing: '0.06em',
  },
}

export default function Spotify() {
  const isCallback = window.location.pathname.endsWith('/callback')

  const [token, setToken] = useState(() => localStorage.getItem('spotify_access_token'))
  const [tracks, setTracks] = useState(null)
  const [artists, setArtists] = useState(null)
  const [nowPlaying, setNowPlaying] = useState(undefined)

  // Handle OAuth callback: exchange code for token, then redirect home
  useEffect(() => {
    if (!isCallback) return
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) return
    ;(async () => {
      const verifier = localStorage.getItem('spotify_code_verifier')
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: verifier,
        }),
      })
      const data = await res.json()
      localStorage.setItem('spotify_access_token', data.access_token)
      localStorage.removeItem('spotify_code_verifier')
      window.location.replace(import.meta.env.DEV ? '/' : '/portfolio/')
    })()
  }, [])

  // Fetch data once token is available
  useEffect(() => {
    if (!token || isCallback) return
    ;(async () => {
      const [tracksData, artistsData, nowData] = await Promise.all([
        apiFetch('/me/top/tracks?limit=5&time_range=medium_term', token),
        apiFetch('/me/top/artists?limit=5&time_range=medium_term', token),
        apiFetch('/me/player/currently-playing', token),
      ])
      setTracks(tracksData?.items ?? [])
      setArtists(artistsData?.items ?? [])
      setNowPlaying(nowData?.item ?? null)
    })()
  }, [token])

  async function handleLogin() {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    localStorage.setItem('spotify_code_verifier', verifier)
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })
    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  function handleDisconnect() {
    localStorage.removeItem('spotify_access_token')
    setToken(null)
    setTracks(null)
    setArtists(null)
    setNowPlaying(undefined)
  }

  if (isCallback) {
    return (
      <div style={styles.callbackPage}>
        <p style={styles.callbackText}>connecting...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <section id="spotify" style={styles.section}>
        <p style={styles.label}>Spotify</p>
        <button onClick={handleLogin} style={styles.connectBtn}>Connect Spotify</button>
      </section>
    )
  }

  if (!tracks || !artists) {
    return (
      <section id="spotify" style={styles.section}>
        <p style={styles.label}>Spotify</p>
        <p style={styles.muted}>loading...</p>
      </section>
    )
  }

  return (
    <section id="spotify" style={styles.section}>
      <p style={styles.label}>Spotify</p>

      {nowPlaying && (
        <div style={styles.nowPlaying}>
          <img src={nowPlaying.album.images[2]?.url} style={styles.nowPlayingImg} alt="" />
          <div>
            <p style={styles.nowPlayingStatus}>Now Playing</p>
            <p style={styles.nowPlayingName}>{nowPlaying.name}</p>
            <p style={styles.nowPlayingArtist}>{nowPlaying.artists.map(a => a.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        <div>
          <p style={styles.colLabel}>Top Tracks</p>
          {tracks.map((t, i) => (
            <div key={t.id} style={styles.row}>
              <span style={styles.rowNum}>{i + 1}</span>
              <img src={t.album.images[2]?.url} style={styles.rowImg} alt="" />
              <div style={styles.rowInfo}>
                <p style={styles.rowName}>{t.name}</p>
                <p style={styles.rowSub}>{t.artists.map(a => a.name).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p style={styles.colLabel}>Top Artists</p>
          {artists.map((a, i) => (
            <div key={a.id} style={styles.row}>
              <span style={styles.rowNum}>{i + 1}</span>
              <img src={a.images[2]?.url} style={{ ...styles.rowImg, borderRadius: '50%' }} alt="" />
              <div style={styles.rowInfo}>
                <p style={styles.rowName}>{a.name}</p>
                <p style={styles.rowSub}>{a.genres[0] ?? ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleDisconnect} style={styles.disconnectBtn}>disconnect</button>
    </section>
  )
}
