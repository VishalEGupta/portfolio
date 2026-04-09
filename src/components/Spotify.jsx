import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

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

  useEffect(() => {
    fetch('/portfolio/spotify-data.json')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
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
        <p style={styles.muted}>loading...</p>
      </section>
    )
  }

  const { tracks, artists } = data

  return (
    <section id="spotify" style={sectionStyle}>
      <p style={styles.label}>Spotify</p>
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
