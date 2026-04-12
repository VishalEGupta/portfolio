import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { scenes, results, computeMBTI } from '../data/quizData'

// Single source of truth for the fade-out duration (ms).
// Used in both the CSS transition (below) and the setTimeout delays so they
// stay in sync — change this one constant to speed up or slow down all transitions.
const TRANSITION_MS = 400

export default function Quiz() {
  const isMobile = useIsMobile()
  const [currentScene, setCurrentScene] = useState('intro')  // Which scene key is active
  const [path, setPath] = useState([])                        // History of visited scene keys (for Back button)
  // scoreHistory stores each answered question's scores as a separate object.
  // This makes handleBack trivially correct: just pop the last entry to undo.
  // A running total would require recalculating from scratch on every Back press.
  const [scoreHistory, setScoreHistory] = useState([])
  const [visible, setVisible] = useState(true)                // Controls CSS opacity for fade transitions
  const [selectedOption, setSelectedOption] = useState(null)  // Index of the chosen option (for highlight)
  const [hoveredOption, setHoveredOption] = useState(null)    // Index of hovered option (for hover style)

  // Collapse the score history into a single {E:3, I:1, ...} tally on every render.
  // This is cheap and always in sync — no need for a separate "total scores" state.
  const totalScores = scoreHistory.reduce((acc, s) => {
    for (const k in s) acc[k] = (acc[k] || 0) + s[k]
    return acc
  }, {})

  const pad = isMobile ? '24px' : '48px'  // Horizontal padding, shared across layout sections
  const scene = scenes[currentScene]       // The current scene definition from quizData.js

  /*
   * fadeToScene — animate out, swap scene, animate in.
   *
   * The double requestAnimationFrame is a browser timing trick:
   *   1. setTimeout fires → state updates (currentScene changes, DOM re-renders with new content)
   *   2. First rAF: queued before the next paint — DOM has new content but hasn't painted yet
   *   3. Second rAF: fires after that paint — NOW we set visible=true so the fade-in plays
   *      on the correct content, not the previous scene.
   * Without the double rAF, setting visible=true immediately after setCurrentScene
   * could race with the DOM update and show the fade-in on the wrong scene.
   */
  const fadeToScene = (nextKey) => {
    setVisible(false)
    setTimeout(() => {
      setPath((prev) => [...prev, currentScene])  // Push current scene onto history stack
      setCurrentScene(nextKey)
      setSelectedOption(null)
      setHoveredOption(null)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    }, TRANSITION_MS)
  }

  const handleBack = () => {
    if (path.length === 0) return
    setVisible(false)
    setTimeout(() => {
      const prev = path[path.length - 1]
      setPath((p) => p.slice(0, -1))
      // Drop the most recent score entry if the previous scene was a question
      // (i.e. we're undoing an answer we just gave).
      // Going back to 'intro' doesn't pop a score — intro has no answers.
      if (scenes[prev]?.type === 'question') {
        setScoreHistory((h) => h.slice(0, -1))
      }
      setCurrentScene(prev)
      setSelectedOption(null)
      setHoveredOption(null)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    }, TRANSITION_MS)
  }

  const handleAnswer = (option, index) => {
    // Highlight the selected option immediately for tactile feedback.
    setSelectedOption(index)
    // Append this answer's scores to history (option.scores is an object like {E:2, N:1}).
    setScoreHistory((h) => [...h, option.scores || {}])

    let nextKey = option.next
    if (nextKey === 'q4_dynamic') {
      // Compute routing using current scoreHistory + this answer's scores.
      // Can't use the pending state update — read scoreHistory directly here.
      const updatedHistory = [...scoreHistory, option.scores || {}]
      const updated = updatedHistory.reduce((acc, s) => {
        for (const k in s) acc[k] = (acc[k] || 0) + s[k]
        return acc
      }, {})
      nextKey = (updated.F || 0) >= (updated.T || 0) ? 'q4_ab' : 'q4_cd'
    }

    // Wait 350ms so the highlight is visible before the fade-out starts.
    setTimeout(() => fadeToScene(nextKey), 350)
  }

  const handleRetake = () => {
    setVisible(false)
    setTimeout(() => {
      // Reset all state to initial values — same as a fresh page load.
      setPath([])
      setScoreHistory([])
      setCurrentScene('intro')
      setSelectedOption(null)
      setHoveredOption(null)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    }, TRANSITION_MS)
  }

  // progress is defined on each scene in quizData (0–100). The result scene gets 100
  // and intro/undefined get 0 (bar not shown for those).
  const progress = scene.progress ?? (scene.type === 'result' ? 100 : 0)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar: back-to-portfolio link on the left, Back button on the right.
          Back button only shows when there's history AND we're not on the result screen. */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `16px ${pad}`,
        borderBottom: '1px solid #1e1e1e',
      }}>
        <a
          href="/portfolio/"
          style={{
            color: '#555555',
            fontSize: '13px',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          &larr; portfolio
        </a>
        {path.length > 0 && scene.type !== 'result' && (
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#555555',
              fontSize: '13px',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              padding: 0,
            }}
          >
            back
          </button>
        )}
      </div>

      {/* Progress bar — hidden on intro since progress=0 and the scene hasn't started. */}
      {scene.type !== 'intro' && (
        <ProgressBar progress={progress} pad={pad} />
      )}

      {/* Content area: fades in/out on scene transitions using opacity + translateY.
          The opacity and transform are driven by the `visible` boolean. */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `40px ${pad}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
      }}>
        {scene.type === 'intro' && (
          <IntroScreen onStart={() => fadeToScene(scene.next)} isMobile={isMobile} />
        )}

        {scene.type === 'question' && (
          <QuestionScreen
            scene={scene}
            selectedOption={selectedOption}
            hoveredOption={hoveredOption}
            onAnswer={handleAnswer}
            onHover={setHoveredOption}
            isMobile={isMobile}
          />
        )}

        {scene.type === 'result' && (
          // computeMBTI converts the score tally to a 4-letter type string (e.g. "INFP"),
          // which is used as the key into the results map.
          <ResultScreen
            result={results[computeMBTI(totalScores, scoreHistory)]}
            onRetake={handleRetake}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  )
}

// ProgressBar is a pure presentational component extracted from Quiz to keep the
// render function readable. It takes progress (0–100) and pad (horizontal padding).
function ProgressBar({ progress, pad }) {
  return (
    <div style={{ padding: `16px ${pad} 0` }}>
      <div style={{
        height: 3,
        backgroundColor: '#1e1e1e',  // Track (empty)
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        {/* Fill — width animates smoothly between questions (0.5s ease). */}
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#a78bfa',
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// ImagePlaceholder renders a dashed box wherever real artwork would go.
// It lets the quiz be shipped and tested before all assets are ready,
// without the layout breaking or shifting when images are missing.
function ImagePlaceholder({ width, height, label = 'Image', style = {} }) {
  return (
    <div style={{
      width,
      height,
      border: '2px dashed #333',
      borderRadius: 12,
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}>
      <span style={{ color: '#444', fontSize: '14px', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  )
}

function IntroScreen({ onStart, isMobile }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div style={{ textAlign: 'center', maxWidth: 520 }}>
      <ImagePlaceholder
        width={isMobile ? 120 : 160}
        height={isMobile ? 120 : 160}
        label="Hero image"
        style={{ margin: '0 auto 24px', borderRadius: '50%' }}
      />
      <p style={{
        fontSize: '13px',
        color: '#555555',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: '0 0 8px',
      }}>
        Personality Quiz
      </p>
      <h1 style={{
        // clamp(min, preferred, max) — fluid typography that scales with viewport
        // width (6vw) between fixed min (1.8rem) and max (3rem) bounds.
        fontSize: 'clamp(1.8rem, 6vw, 3rem)',
        fontWeight: 600,
        color: '#e8e6e0',
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        margin: '0 0 16px',
      }}>
        What Board Game Are You?
      </h1>
      <p style={{
        fontSize: isMobile ? '16px' : '18px',
        color: '#888888',
        lineHeight: 1.6,
        margin: '0 0 40px',
      }}>
        It's game night. Your choices will reveal which classic board game matches your personality.
      </p>
      {/* Hover state managed in local state (not CSS :hover) because the project
          uses inline styles throughout — CSS pseudo-selectors aren't available. */}
      <button
        onClick={onStart}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          background: hovering ? '#b89dfc' : '#a78bfa',
          color: '#0f0f0f',
          border: 'none',
          padding: '14px 48px',
          borderRadius: 8,
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.02em',
          transition: 'background 0.2s, transform 0.2s',
          transform: hovering ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        Start
      </button>
    </div>
  )
}

function QuestionScreen({ scene, selectedOption, hoveredOption, onAnswer, onHover, isMobile }) {
  const labels = ['A', 'B', 'C', 'D']

  return (
    <div style={{ maxWidth: 580, width: '100%' }}>
      {/* Chapter label — e.g. "The Arrival" — sets the narrative context. */}
      <p style={{
        fontSize: '12px',
        color: '#a78bfa',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 500,
        margin: '0 0 20px',
      }}>
        {scene.chapter}
      </p>
      {/* Narrative paragraph: the story beat that sets up the question. Italic to
          distinguish it visually from the direct question below. */}
      <p style={{
        fontSize: isMobile ? '15px' : '16px',
        color: '#888888',
        lineHeight: 1.7,
        margin: '0 0 28px',
        fontStyle: 'italic',
      }}>
        {scene.narrative}
      </p>
      <h2 style={{
        fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)',
        fontWeight: 500,
        color: '#e8e6e0',
        letterSpacing: '-0.02em',
        lineHeight: 1.3,
        margin: '0 0 24px',
      }}>
        {scene.question}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {scene.options.map((option, i) => {
          const selected = selectedOption === i
          const hovered = hoveredOption === i
          // Once an option is selected, disable all others to prevent double-clicking.
          const disabled = selectedOption !== null
          const highlighted = selected || hovered

          return (
            <button
              key={i}
              onClick={() => !disabled && onAnswer(option, i)}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              // Non-selected options are disabled (greyed out) after selection,
              // but the selected one stays enabled so its highlight is visible.
              disabled={disabled && !selected}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: isMobile ? '14px 16px' : '16px 20px',
                backgroundColor: selected ? '#a78bfa' : highlighted ? '#1e1e1e' : '#161616',
                border: `1px solid ${selected ? '#a78bfa' : highlighted ? '#333' : '#1e1e1e'}`,
                borderRadius: 10,
                cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                // Non-selected options fade to 40% opacity after an answer is locked in.
                opacity: disabled && !selected ? 0.4 : 1,
              }}
            >
              {/* Letter label (A/B/C/D) — inverts to dark on selection to contrast
                  with the purple fill background. */}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: selected ? '#0f0f0f' : '#555555',
                minWidth: 20,
                paddingTop: 2,
                transition: 'color 0.2s',
              }}>
                {labels[i]}
              </span>
              <span style={{
                fontSize: isMobile ? '15px' : '16px',
                color: selected ? '#0f0f0f' : '#e8e6e0',
                lineHeight: 1.5,
                transition: 'color 0.2s',
              }}>
                {option.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ResultScreen({ result, onRetake, isMobile }) {
  const [traitsVisible, setTraitsVisible] = useState(false)
  const [gameVisible, setGameVisible] = useState(false)
  const [hoveringRetake, setHoveringRetake] = useState(false)

  // Staggered reveal: traits appear at 500ms, game card at 900ms.
  // This creates a deliberate sequence — type → description → traits → game —
  // making the result feel like a build-up rather than everything dumping at once.
  useEffect(() => {
    const t1 = setTimeout(() => setTraitsVisible(true), 500)
    const t2 = setTimeout(() => setGameVisible(true), 900)
    // Cleanup on unmount (e.g. if user hits Retake before timers fire)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div style={{ textAlign: 'center', maxWidth: 540 }}>
      {/* Show real image if available, otherwise placeholder. Keeps layout stable
          before assets are added. */}
      {result.image ? (
        <img
          src={result.image}
          alt={result.type}
          style={{
            width: isMobile ? 100 : 140,
            height: isMobile ? 100 : 140,
            borderRadius: '50%',
            objectFit: 'cover',
            margin: '0 auto 20px',
            display: 'block',
          }}
        />
      ) : (
        <ImagePlaceholder
          width={isMobile ? 100 : 140}
          height={isMobile ? 100 : 140}
          label="Portrait"
          style={{
            margin: '0 auto 20px',
            borderRadius: '50%',
          }}
        />
      )}
      <p style={{
        fontSize: '12px',
        color: '#555555',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        margin: '0 0 10px',
      }}>
        You are
      </p>
      {/* MBTI type code styled with the type's accent color (defined in results map). */}
      <h2 style={{
        fontSize: 'clamp(2.4rem, 8vw, 3.6rem)',
        fontWeight: 700,
        color: result.color,
        letterSpacing: '0.04em',
        lineHeight: 1,
        margin: '0 0 6px',
      }}>
        {result.type}
      </h2>
      <p style={{
        fontSize: isMobile ? '18px' : '20px',
        color: '#e8e6e0',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        margin: '0 0 24px',
      }}>
        {result.title}
      </p>
      <p style={{
        fontSize: isMobile ? '15px' : '16px',
        color: '#c0beb8',
        lineHeight: 1.7,
        margin: '0 0 24px',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {result.description}
      </p>

      {/* Trait pills — fade in + slide up at 500ms (traitsVisible gate). */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 40,
        opacity: traitsVisible ? 1 : 0,
        transform: traitsVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {result.traits.map((trait) => (
          // `18` appended to result.color is hex for 9.4% opacity — a very faint tint.
          // `30` is ~19% opacity — used for the border to be slightly more visible.
          <span
            key={trait}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: `${result.color}18`,
              color: result.color,
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              border: `1px solid ${result.color}30`,
            }}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Game card — fades in at 900ms, after traits have appeared. */}
      <div style={{
        opacity: gameVisible ? 1 : 0,
        transform: gameVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        padding: '28px 24px',
        backgroundColor: '#161616',
        border: '1px solid #1e1e1e',
        borderRadius: 12,
        marginBottom: 32,
      }}>
        <p style={{
          fontSize: '11px',
          color: '#555555',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          margin: '0 0 16px',
        }}>
          Your board game match
        </p>
        {result.game.image ? (
          <img
            src={result.game.image}
            alt={result.game.name}
            style={{
              width: isMobile ? 72 : 88,
              height: isMobile ? 72 : 88,
              borderRadius: 12,
              objectFit: 'cover',
              margin: '0 auto 14px',
              display: 'block',
            }}
          />
        ) : (
          // Emoji fallback while game box-art images aren't ready yet.
          <div style={{
            fontSize: isMobile ? '48px' : '60px',
            lineHeight: 1,
            margin: '0 0 10px',
          }}>
            {result.game.emoji}
          </div>
        )}
        <h3 style={{
          fontSize: isMobile ? '20px' : '22px',
          fontWeight: 600,
          color: '#e8e6e0',
          letterSpacing: '-0.02em',
          margin: '0 0 10px',
        }}>
          {result.game.name}
        </h3>
        <p style={{
          fontSize: isMobile ? '14px' : '15px',
          color: '#888888',
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {result.game.reason}
        </p>
      </div>

      <button
        onClick={onRetake}
        onMouseEnter={() => setHoveringRetake(true)}
        onMouseLeave={() => setHoveringRetake(false)}
        style={{
          background: 'transparent',
          border: `1px solid ${hoveringRetake ? '#555' : '#333'}`,
          padding: '12px 36px',
          borderRadius: 8,
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: '0.02em',
          transition: 'all 0.2s',
          color: hoveringRetake ? '#e8e6e0' : '#888888',
        }}
      >
        Retake Quiz
      </button>
    </div>
  )
}
