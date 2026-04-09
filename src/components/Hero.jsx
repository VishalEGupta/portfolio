import { useIsMobile } from '../hooks/useIsMobile'

const styles = {
  heading: {
    fontSize: 'clamp(2rem, 8vw, 3.5rem)',
    fontWeight: '500',
    color: '#e8e6e0',
    letterSpacing: '-0.03em',
    lineHeight: '1.05',
    margin: '0 0 28px',
  },
  tagline: {
    fontSize: '20px',
    color: '#888888',
    lineHeight: '1.6',
    maxWidth: '560px',
    margin: '0',
  },
}

export default function Hero() {
  const isMobile = useIsMobile()
  return (
    <section style={{ padding: isMobile ? '40px 24px' : '60px 48px' }}>
      <h1 style={styles.heading}>Hi, I'm Vishal.</h1>
      <p style={styles.tagline}>
        Lately I've been deep in AI agents, Python, and APIs — building things that actually work in production.
      </p>
    </section>
  )
}
