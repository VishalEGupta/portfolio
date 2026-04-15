import { useIsMobile } from '../hooks/useIsMobile'

/*
 * Module-level style object — created once, shared across all renders.
 * All colors are set explicitly; never rely on inherited color from a parent
 * because inline-style components don't have a CSS cascade to fall back on.
 */
const styles = {
  /*
   * "label" is the small all-caps eyebrow text used as a section marker
   * (e.g. "ABOUT", "CONTACT"). Wide letter-spacing + uppercase is a common
   * typographic technique to make small text feel intentional and structured.
   * The dark #555555 color keeps it subordinate to the body copy below it.
   */
  label: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: '24px',
  },
  // Main paragraph — larger than nav links, muted color, capped width for readability
  body: {
    fontSize: '18px',
    color: '#888888',
    lineHeight: '1.7',  // generous leading makes longer prose comfortable to read
    maxWidth: '560px',
    margin: '0 0 20px', // bottom margin creates space before the resume link
  },
  // Resume link uses the accent color (#a78bfa, purple) to signal a call-to-action
  resume: {
    fontSize: '14px',
    color: '#a78bfa',
    textDecoration: 'none',
    letterSpacing: '0.01em',
  },
}

export default function About() {
  const isMobile = useIsMobile()
  return (
    /*
     * id="about" is what makes the "#about" anchor links in Nav.jsx scroll here.
     * When a user clicks "about" in the nav, the browser jumps to this element.
     * borderTop creates the visual divider between sections without a separate <hr>.
     */
    <section id="about" style={{ padding: isMobile ? '40px 24px' : '60px 48px', borderTop: '1px solid #1e1e1e' }}>
      {/* Section eyebrow label — uses <p> rather than a heading tag because it's
          decorative, not part of the document's heading hierarchy */}
      <p style={styles.label}>About</p>

      <p style={styles.body}>
        I'm based in Houston, building software and data tools. I studied Mechanical Engineering and CS at UT Austin.
      </p>

      {/* Opens the PDF in a new tab so the user doesn't lose their place on the page.
          rel="noopener noreferrer" is the standard security pairing for target="_blank". */}
      <a href="/portfolio/resume.pdf" target="_blank" rel="noopener noreferrer" style={styles.resume}>
        Resume ↗
      </a>
    </section>
  )
}
