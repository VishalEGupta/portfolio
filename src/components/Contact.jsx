import { useIsMobile } from '../hooks/useIsMobile'

/*
 * Module-level style object. Defined outside the component so React doesn't
 * re-create the object on every render (it's a constant, not derived from props/state).
 */
const styles = {
  /*
   * Eyebrow label — identical pattern to About.jsx.
   * Repeated here intentionally: each component is self-contained, which makes
   * it easy to edit one section without affecting another. The trade-off is some
   * duplication; the project avoids shared abstractions for single-use patterns.
   */
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  /*
   * Sub-heading — smaller than the Hero h1 (28px vs ~56px), but still uses
   * primary text color and negative letter-spacing to stay in the same editorial
   * family. h2 is the correct semantic tag here: it's the section's main title,
   * subordinate to the page's single h1 in Hero.jsx.
   */
  heading: {
    fontSize: '28px',
    fontWeight: '500',
    color: '#e8e6e0',
    letterSpacing: '-0.02em',
    margin: '0 0 16px', // gap between heading and the email link below
  },
  // Accent color makes the email address visually stand out as a clickable action
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
    /*
     * id="contact" makes the "#contact" anchor in Nav.jsx scroll here.
     * The borderTop visually separates this section from whatever appears above it
     * (typically Projects) without needing a full <hr> element or extra wrapper.
     */
    <section id="contact" style={{ padding: isMobile ? '40px 24px' : '60px 48px', borderTop: '1px solid #1e1e1e' }}>
      {/* Section eyebrow — decorative label, not a heading */}
      <p style={styles.label}>Contact</p>

      {/* h2 establishes this as a named sub-section under the page's h1 in Hero.
          Screen readers and search engines use this hierarchy to understand structure. */}
      <h2 style={styles.heading}>Always up for interesting conversations.</h2>

      {/* mailto: is a standard URI scheme — clicking it opens the user's default
          email client with the To field pre-filled. No JavaScript needed. */}
      <a href="mailto:vishal.e.gupta@gmail.com" style={styles.email}>
        vishal.e.gupta@gmail.com
      </a>
    </section>
  )
}
