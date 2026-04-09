const styles = {
  section: {
    padding: '80px 48px',
    borderTop: '1px solid #1e1e1e',
  },
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  body: {
    fontSize: '18px',
    color: '#888888',
    lineHeight: '1.7',
    maxWidth: '560px',
    margin: '0',
  },
}

export default function About() {
  return (
    <section id="about" style={styles.section}>
      <p style={styles.label}>About</p>
      <p style={styles.body}>
        I'm based in Houston, building software and data tools. I studied Mechanical Engineering and CS at UT Austin.
      </p>
    </section>
  )
}
