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
    marginBottom: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#161616',
    borderRadius: '8px',
    padding: '28px',
    textAlign: 'left',
    border: '1px solid #1e1e1e',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#e8e6e0',
    margin: '0 0 10px',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#888888',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    fontSize: '11px',
    letterSpacing: '0.06em',
    color: '#a78bfa',
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    border: '1px solid rgba(167, 139, 250, 0.2)',
    borderRadius: '4px',
    padding: '3px 8px',
  },
  comingSoon: {
    fontSize: '11px',
    letterSpacing: '0.06em',
    color: '#555555',
    backgroundColor: '#1e1e1e',
    borderRadius: '4px',
    padding: '3px 8px',
    marginLeft: 'auto',
    display: 'inline-block',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
}

const projects = [
  {
    title: 'This site',
    description: 'Personal portfolio built with React and Vite. Deployed via GitHub Pages.',
    tags: ['React', 'Vite', 'GitHub Pages'],
    comingSoon: false,
  },
]

export default function Projects() {
  return (
    <section id="projects" style={styles.section}>
      <p style={styles.label}>Projects</p>
      <div style={styles.grid}>
        {projects.map((p) => (
          <div key={p.title} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{p.title}</h3>
              {p.comingSoon && <span style={styles.comingSoon}>coming soon</span>}
            </div>
            <p style={styles.cardDesc}>{p.description}</p>
            <div style={styles.tags}>
              {p.tags.map((t) => (
                <span key={t} style={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
