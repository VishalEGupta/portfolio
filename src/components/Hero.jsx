import { useIsMobile } from '../hooks/useIsMobile'

/*
 * Styles are module-level so they're computed once, not on every render.
 * Colors are set explicitly on every element — the project deliberately avoids
 * relying on CSS inheritance so the dark theme stays predictable.
 */
const styles = {
  heading: {
    /*
     * clamp(min, preferred, max) is a CSS fluid type technique:
     *   - On small screens it won't go below 2rem
     *   - It scales with viewport width (8vw) in between
     *   - On large screens it caps at 3.5rem
     * This avoids breakpoint-specific font-size rules entirely.
     */
    fontSize: 'clamp(2rem, 8vw, 3.5rem)',
    fontWeight: '500',
    color: '#e8e6e0',         // near-white primary text color from design spec
    letterSpacing: '-0.03em', // tight tracking makes large headings feel editorial
    lineHeight: '1.05',       // very tight — works because it's a single short line
    margin: '0 0 28px',       // no top margin (section padding handles spacing); gap below before tagline
  },
  tagline: {
    fontSize: '20px',
    color: '#888888',   // muted secondary color so the heading reads first
    lineHeight: '1.6',  // looser than the heading — improves readability for multi-word prose
    maxWidth: '560px',  // limits line length so the eye doesn't have to travel too far
    margin: '0',
  },
}

export default function Hero() {
  // isMobile drives the section's horizontal padding — narrower on small screens
  const isMobile = useIsMobile()
  return (
    /*
     * The section's padding is an inline expression rather than a styles object entry
     * because it's the only property that changes between breakpoints.
     * Keeping it inline avoids defining a whole second style variant just for padding.
     */
    <section style={{ padding: isMobile ? '40px 24px' : '60px 48px' }}>
      {/* h1 is the page's primary heading — there should be exactly one per page
          for SEO and accessibility. It establishes the document hierarchy. */}
      <h1 style={styles.heading}>Hi, I'm Vishal.</h1>

      {/* The tagline is a <p> (paragraph) rather than a heading because it's
          supporting copy, not a navigational landmark. */}
      <p style={styles.tagline}>
        Lately I've been deep in AI agents, Python, and APIs — building things that actually work in production.
      </p>
    </section>
  )
}
