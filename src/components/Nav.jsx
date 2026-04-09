const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 48px',
    borderBottom: '1px solid #1e1e1e',
  },
  name: {
    color: '#e8e6e0',
    fontSize: '15px',
    fontWeight: '500',
    letterSpacing: '0.02em',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '32px',
  },
  link: {
    color: '#888888',
    fontSize: '14px',
    textDecoration: 'none',
    letterSpacing: '0.02em',
    transition: 'color 0.2s',
  },
}

export default function Nav() {
  return (
    <nav style={styles.nav}>
      <a href="/" style={styles.name}>Vishal Gupta</a>
      <div style={styles.links}>
        <a href="#about" style={styles.link}>about</a>
        <a href="#projects" style={styles.link}>projects</a>
        <a href="#contact" style={styles.link}>contact</a>
      </div>
    </nav>
  )
}
