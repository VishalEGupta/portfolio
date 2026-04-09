const styles = {
  section: {
    padding: '80px 48px 120px',
    borderTop: '1px solid #1e1e1e',
  },
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
  return (
    <section id="contact" style={styles.section}>
      <p style={styles.label}>Contact</p>
      <h2 style={styles.heading}>Always up for interesting conversations.</h2>
      <a href="mailto:hello@vishalgupta.dev" style={styles.email}>
        hello@vishalgupta.dev
      </a>
    </section>
  )
}
