const styles = {
  section: {
    padding: '120px 48px 100px',
  },
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '64px',
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
  return (
    <section style={styles.section}>
      <p style={styles.label}>Portfolio</p>
      <h1 style={styles.heading}>Hi, I'm Vishal.</h1>
      <p style={styles.tagline}>
        Lately I've been deep in AI agents, Python, and APIs — building things that actually work in production.
      </p>
    </section>
  )
}
