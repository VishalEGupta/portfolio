import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

// handleDevLogin and handleDevCallback are declared here so they exist in this
// module's scope, but they're only assigned inside the DEV block below.
// In production builds Vite eliminates the DEV block entirely via dead-code
// elimination, so these stay undefined and are never called.
let handleDevLogin, handleDevCallback

/*
 * PKCE auth helpers — DEV only
 *
 * In production, Spotify data is pre-fetched by a GitHub Actions workflow and
 * stored in spotify-data.json. No client-side auth needed.
 *
 * In development, we need to talk to the Spotify API directly. These helpers
 * implement the PKCE (Proof Key for Code Exchange) flow, which is the correct
 * OAuth 2.0 approach for SPAs — there's no server to hold a client secret, so
 * PKCE uses a cryptographic challenge instead.
 *
 * Flow: generate verifier → hash it → send hash to Spotify → Spotify redirects
 * back with a code → exchange code + original verifier for tokens.
 * The verifier never leaves the browser; only its hash is sent over the network.
 */
if (import.meta.env.DEV) {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const REDIRECT_URI = `${window.location.origin}/portfolio/callback`
  const SCOPES = 'user-top-read user-read-currently-playing'

  // Generate a random 32-byte value, base64url-encoded (no +, /, or = chars).
  // This is the PKCE "code verifier" — a one-time secret that stays in localStorage.
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // SHA-256 hash the verifier, then base64url-encode it.
  // Only this *hash* (the "code challenge") is sent to Spotify's auth endpoint,
  // so intercepting the redirect URL can't be used to steal a token.
  const generateCodeChallenge = async (verifier) => {
    const data = new TextEncoder().encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // Step 1 of PKCE: redirect the user to Spotify's /authorize page.
  // The verifier is saved to localStorage so it survives the full-page redirect.
  handleDevLogin = async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    localStorage.setItem('spotify_code_verifier', verifier)
    const params = new URLSearchParams({ client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT_URI, scope: SCOPES, code_challenge_method: 'S256', code_challenge: challenge })
    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  // Step 2 of PKCE: after Spotify redirects back with ?code=, exchange it for tokens.
  // We send the original verifier (not just the hash) — Spotify re-hashes it server-side
  // to confirm it matches the challenge we sent in step 1.
  handleDevCallback = async (code) => {
    const verifier = localStorage.getItem('spotify_code_verifier')
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: CLIENT_ID, code_verifier: verifier }),
    })
    const data = await res.json()
    // Save refresh_token for future sessions — access tokens expire in 1 hour,
    // but a refresh token lets us get a new one without re-doing the full flow.
    if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)
    localStorage.removeItem('spotify_code_verifier')
    // Clean the ?code= from the URL so it doesn't re-trigger on refresh.
    window.history.replaceState({}, '', '/portfolio/spotify')
  }
}

// Styles defined at module level — not recreated on every render.
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
    // minWidth: 0 is required for text-overflow: ellipsis to work inside a flex child.
    // Without it, the child can grow past the flex container's width.
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
  const [data, setData] = useState(null)  // Spotify tracks + artists from the JSON file
  const [mood, setMood] = useState(null)  // Claude-generated mood object {mood, description, emoji, color}

  useEffect(() => {
    // DEV only: intercept the OAuth redirect before attempting a data fetch.
    // When Spotify redirects back to /portfolio/callback?code=..., the component
    // remounts with a `code` param in the URL. We detect it here, exchange it for
    // tokens, then return early (no data fetch yet — that happens on next load).
    if (import.meta.env.DEV) {
      const code = new URLSearchParams(window.location.search).get('code')
      const verifier = localStorage.getItem('spotify_code_verifier')
      if (code && verifier) { handleDevCallback(code); return }
    }

    // Production path: fetch the static JSON file that GitHub Actions generates nightly.
    // The workflow calls the Spotify API server-side using stored credentials and writes
    // the result to public/spotify-data.json, which gets deployed with the site.
    // This means no client-side auth is ever needed in production.
    fetch('/portfolio/spotify-data.json')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setData(d)
        // The mood object may be embedded in the JSON (generated by the Claude API
        // in the same Actions workflow). Set it separately so the mood card can
        // render independently of the tracks/artists grid.
        if (d?.mood) setMood(d.mood)
      })
      .catch(() => {})
  }, [])

  // Responsive layout values derived from breakpoint hook
  const sectionStyle = {
    padding: isMobile ? '40px 24px' : '60px 48px',
    borderTop: '1px solid #1e1e1e',
  }

  const gridStyle = {
    display: 'grid',
    // Two columns on desktop, stacked on mobile
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '32px' : '40px',
    maxWidth: '700px',
  }

  // Loading / unauthenticated state
  if (!data) {
    return (
      <section id="spotify" style={sectionStyle}>
        <p style={styles.label}>Spotify</p>
        {/* In dev: show a login button so the developer can trigger the PKCE flow.
            In production: show a plain "loading..." text — the JSON should load fast. */}
        {import.meta.env.DEV
          ? <button onClick={handleDevLogin} style={{ fontSize: '13px', color: '#1DB954', backgroundColor: 'transparent', border: '1px solid rgba(29,185,84,0.4)', borderRadius: '4px', padding: '8px 20px', cursor: 'pointer' }}>Connect Spotify (dev)</button>
          : <p style={styles.muted}>loading...</p>
        }
      </section>
    )
  }

  const { tracks, artists } = data

  // Validate mood.color before using it as a CSS value. The color comes from the
  // Claude API response and could theoretically contain arbitrary strings. The regex
  // accepts only 6-digit hex colors (#rrggbb) to prevent CSS injection.
  const moodColor = /^#[0-9a-fA-F]{6}$/.test(mood?.color) ? mood.color : '#7c9cbf'

  return (
    <section id="spotify" style={sectionStyle}>
      <p style={styles.label}>Spotify</p>

      {/* Mood card — only rendered when the Claude API produced a mood object.
          The left border uses moodColor for visual accent. The `33` suffix on the
          border background is hex for 20% opacity (0x33 / 0xFF ≈ 0.2). */}
      {mood && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          backgroundColor: '#161616',
          border: `1px solid ${moodColor}33`,
          borderLeft: `3px solid ${moodColor}`,
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '32px',
          maxWidth: '700px',
        }}>
          <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{mood.emoji}</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: moodColor, margin: '0 0 6px', textTransform: 'capitalize' }}>{mood.mood}</p>
            <p style={{ fontSize: '13px', color: '#888888', margin: 0, lineHeight: 1.6 }}>{mood.description}</p>
          </div>
        </div>
      )}

      {/* Two-column grid: Top Tracks on the left, Top Artists on the right. */}
      <div style={gridStyle}>
        <div>
          <p style={styles.colLabel}>Top Tracks</p>
          {tracks.map((t, i) => (
            <div key={t.id} style={styles.row}>
              <span style={styles.rowNum}>{i + 1}</span>
              {/* images[2] is Spotify's smallest thumbnail (64×64px) — fast to load. */}
              <img src={t.album.images[2]?.url} style={styles.rowImg} alt="" />
              <div style={styles.rowInfo}>
                <p style={styles.rowName}>{t.name}</p>
                {/* A track can have multiple artists — join them with commas. */}
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
              {/* Artist images are circular (borderRadius: 50%) to distinguish them
                  visually from the square album art in the tracks column. */}
              <img src={a.images[2]?.url} style={{ ...styles.rowImg, borderRadius: '50%' }} alt="" />
              <div style={styles.rowInfo}>
                <p style={styles.rowName}>{a.name}</p>
                {/* Show only the primary genre (index 0). Artists often have many;
                    one is enough for a subtitle and keeps the row uncluttered. */}
                <p style={styles.rowSub}>{a.genres?.[0] ?? ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
