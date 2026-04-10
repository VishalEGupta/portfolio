import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Spotify from './components/Spotify'
import About from './components/About'
import Contact from './components/Contact'
import Quiz from './components/Quiz'

const path = window.location.pathname

const isSpotifyPage = path.startsWith('/portfolio/spotify') ||
  path.endsWith('/callback')

const isQuizPage = path.startsWith('/portfolio/quiz')

export default function App() {
  if (isQuizPage) {
    return <Quiz />
  }

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
