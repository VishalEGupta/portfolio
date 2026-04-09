import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Spotify from './components/Spotify'
import About from './components/About'
import Contact from './components/Contact'

const isSpotifyPage = window.location.pathname.startsWith('/portfolio/spotify') ||
  window.location.pathname.endsWith('/callback')

export default function App() {
  if (isSpotifyPage) {
    return (
      <div>
        <Nav />
        <Spotify />
      </div>
    )
  }

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
