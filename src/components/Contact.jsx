import { useIsMobile } from '../hooks/useIsMobile'

const styles = {
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '500',
    color: '#e8e6e0',
    letterSpacing: '-0.02em',
    margin: '0 0 16px',
  },
  email: {
    fontSize: '15px',
    color: '#a78bfa',
    textDecoration: 'none',
    letterSpacing: '0.01em',
  },
}

export default function Contact() {
  const isMobile = useIsMobile()
  return (
    <section id="contact" style={{ padding: isMobile ? '40px 24px' : '60px 48px', borderTop: '1px solid #1e1e1e' }}>
      <p style={styles.label}>Contact</p>
      <h2 style={styles.heading}>Always up for interesting conversations.</h2>
      <a href="mailto:vishal.e.gupta@gmail.com" style={styles.email}>
        vishal.e.gupta@gmail.com
      </a>
    </section>
  )
}
