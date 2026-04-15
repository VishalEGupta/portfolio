// App.jsx is the root component. It decides which page to render based on the URL.
// This project uses manual client-side routing instead of React Router — lightweight
// because there are only 3 routes and they never change at runtime.

import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Spotify from './components/Spotify'
import About from './components/About'
import Contact from './components/Contact'
import Quiz from './components/Quiz'

// Read the URL path once, outside the component. It's a module-level constant because
// the page never navigates without a full reload — no need to re-read it on re-renders.
const path = window.location.pathname

// The Spotify feature lives at /portfolio/spotify. After the user authenticates via
// Spotify's OAuth flow, Spotify redirects back to /callback with a ?code= query param.
// The endsWith('/callback') check ensures that redirect lands in the Spotify component,
// which exchanges the code for an access token.
const isSpotifyPage = path.startsWith('/portfolio/spotify') ||
  path.endsWith('/callback')

// The quiz is a standalone page — it doesn't use the main portfolio layout (no Nav/Hero/etc.).
const isQuizPage = path.startsWith('/portfolio/quiz')

export default function App() {
  // Quiz page: renders in isolation, no navigation shell around it.
  if (isQuizPage) {
    return <Quiz />
  }

  // Spotify page: shows Nav + the Spotify component (music data / auth UI).
  if (isSpotifyPage) {
    return (
      <div>
        <Nav />
        <Spotify />
      </div>
    )
  }

  // Default: the main portfolio page — Nav anchored at the top, then each section
  // stacked vertically in reading order: Hero → Projects → About → Contact.
  return (
    <div>
      <Nav />
      <Hero />
      <Projects />
      <About />
      <Contact />
    </div>
  )
}
