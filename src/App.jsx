import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Spotify from './components/Spotify'
import About from './components/About'
import Contact from './components/Contact'

const isCallback = window.location.pathname.endsWith('/callback')

export default function App() {
  if (isCallback) {
    return <Spotify />
  }

  return (
    <div>
      <Nav />
      <Hero />
      <Projects />
      <Spotify />
      <About />
      <Contact />
    </div>
  )
}
