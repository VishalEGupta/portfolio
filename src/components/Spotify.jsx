import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

let handleDevLogin, handleDevCallback

if (import.meta.env.DEV) {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const REDIRECT_URI = `${window.location.origin}/portfolio/callback`
  const SCOPES = 'user-top-read user-read-currently-playing'

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }
  const generateCodeChallenge = async (verifier) => {
    const data = new TextEncoder().encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  handleDevLogin = async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    localStorage.setItem('spotify_code_verifier', verifier)
    const params = new URLSearchParams({ client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT_URI, scope: SCOPES, code_challenge_method: 'S256', code_challenge: challenge })
    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  handleDevCallback = async (code) => {
    const verifier = localStorage.getItem('spotify_code_verifier')
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: CLIENT_ID, code_verifier: verifier }),
    })
    const data = await res.json()
    if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)
    localStorage.removeItem('spotify_code_verifier')
    window.history.replaceState({}, '', '/portfolio/spotify')
  }
}

const styles = {
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  muted: {
    fontSize: '14px',
    color: '#555555',
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
}

export default function Spotify() {
  const isMobile = useIsMobile()
  const [data, setData] = useState(null)
  const [mood, setMood] = useState(null)

  useEffect(() => {
    // DEV: handle OAuth callback
    if (import.meta.env.DEV) {
      const code = new URLSearchParams(window.location.search).get('code')
      const verifier = localStorage.getItem('spotify_code_verifier')
      if (code && verifier) { handleDevCallback(code); return }
    }
    fetch('/portfolio/spotify-data.json')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setData(d)
        if (d?.mood) setMood(d.mood)
      })
      .catch(() => {})
  }, [])

  const sectionStyle = {
    padding: isMobile ? '40px 24px' : '60px 48px',
    borderTop: '1px solid #1e1e1e',
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '32px' : '40px',
    maxWidth: '700px',
  }

  if (!data) {
    return (
      <section id="spotify" style={sectionStyle}>
        <p style={styles.label}>Spotify</p>
        {import.meta.env.DEV
          ? <button onClick={handleDevLogin} style={{ fontSize: '13px', color: '#1DB954', backgroundColor: 'transparent', border: '1px solid rgba(29,185,84,0.4)', borderRadius: '4px', padding: '8px 20px', cursor: 'pointer' }}>Connect Spotify (dev)</button>
          : <p style={styles.muted}>loading...</p>
        }
      </section>
    )
  }

  const { tracks, artists } = data

  return (
    <section id="spotify" style={sectionStyle}>
      <p style={styles.label}>Spotify</p>
      {mood && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          backgroundColor: '#161616',
          border: `1px solid ${mood.color}33`,
          borderLeft: `3px solid ${mood.color}`,
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '32px',
          maxWidth: '700px',
        }}>
          <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{mood.emoji}</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: mood.color, margin: '0 0 6px', textTransform: 'capitalize' }}>{mood.mood}</p>
            <p style={{ fontSize: '13px', color: '#888888', margin: 0, lineHeight: 1.6 }}>{mood.description}</p>
          </div>
        </div>
      )}
      <div style={gridStyle}>
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
                <p style={styles.rowSub}>{a.genres?.[0] ?? ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
