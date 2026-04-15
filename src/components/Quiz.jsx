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

        {scene.type === 'transition' && (
          <TransitionScreen
            scene={scene}
            onAdvance={(nextKey) => {
              // totalScores is safe here: the q3 answer committed to state before
              // fadeToScene was called, and the 2500ms delay ensures state has settled.
              if (nextKey === 'q4_dynamic') {
                nextKey = (totalScores.F || 0) >= (totalScores.T || 0) ? 'q4_ab' : 'q4_cd'
              }
              fadeToScene(nextKey)
            }}
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

function TransitionScreen({ scene, onAdvance }) {
  useEffect(() => {
    const timer = setTimeout(() => onAdvance(scene.next), scene.delay ?? 2500)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ textAlign: 'center', maxWidth: 480 }}>
      <p style={{
        fontSize: '18px',
        color: '#888888',
        fontStyle: 'italic',
        lineHeight: 1.8,
        letterSpacing: '0.01em',
      }}>
        {scene.body}
      </p>
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
  const [tagsVisible, setTagsVisible] = useState(false)
  const [compatVisible, setCompatVisible] = useState(false)
  const [hoveringRetake, setHoveringRetake] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setTraitsVisible(true), 300)
    const t2 = setTimeout(() => setTagsVisible(true), 700)
    const t3 = setTimeout(() => setCompatVisible(true), 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div style={{
      width: '100%',
      maxWidth: 520,
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid #1e1e1e',
      backgroundColor: '#111111',
    }}>

      {/* 1. Title banner */}
      <div style={{
        backgroundColor: result.color,
        padding: isMobile ? '14px 18px 12px' : '18px 24px 14px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#0f0f0f',
          opacity: 0.65,
          margin: '0 0 5px',
        }}>
          Your board game is…
        </p>
        <h2 style={{
          fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : '26px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: '#0f0f0f',
          margin: '0 0 4px',
        }}>
          {result.game.emoji} {result.game.name}
        </h2>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#0f0f0f',
          opacity: 0.5,
          margin: '0 0 4px',
          letterSpacing: '0.01em',
        }}>
          {result.title}
        </p>
        <p style={{
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#0f0f0f',
          opacity: 0.72,
          margin: 0,
        }}>
          {result.tagline}
        </p>
      </div>

      {/* 2. Hero split: emoji left, witty traits right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '90px 1fr' : '110px 1fr',
        borderBottom: '1px solid #1e1e1e',
        opacity: traitsVisible ? 1 : 0,
        transform: traitsVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          backgroundColor: '#0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '44px' : '56px',
          minHeight: isMobile ? '130px' : '150px',
          borderRight: '1px solid #1e1e1e',
        }}>
          {result.image ? (
            <img
              src={result.image}
              alt={result.title}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          ) : (
            result.game.emoji
          )}
        </div>
        <div style={{
          padding: isMobile ? '12px' : '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          justifyContent: 'center',
        }}>
          {result.traits.map((trait) => (
            <span
              key={trait}
              style={{
                display: 'inline-block',
                padding: '5px 12px',
                borderRadius: 20,
                backgroundColor: `${result.color}18`,
                border: `1px solid ${result.color}30`,
                color: result.color,
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 500,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Personality traits with rotated label */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: isMobile ? '12px 14px' : '14px 16px',
        borderBottom: '1px solid #1e1e1e',
        opacity: tagsVisible ? 1 : 0,
        transform: tagsVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: '9px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#444444',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          paddingTop: 2,
          fontWeight: 500,
        }}>
          Personality Traits
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          paddingTop: 2,
        }}>
          {result.tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                padding: '5px 11px',
                borderRadius: 20,
                backgroundColor: '#191919',
                border: '1px solid #252525',
                color: '#888888',
                fontSize: '11px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 4. You'll love / Hard pass */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: '1px solid #1e1e1e',
        opacity: compatVisible ? 1 : 0,
        transform: compatVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={{
          padding: isMobile ? '12px' : '14px 16px',
          borderRight: '1px solid #1e1e1e',
        }}>
          <p style={{
            fontSize: '10px',
            color: '#555555',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: '0 0 10px',
          }}>
            🤝 You'll love
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {result.compatibleGames.map((g) => (
              <span key={g.name} style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 20,
                backgroundColor: '#191919',
                border: '1px solid #252525',
                color: '#888888',
                fontSize: '11px',
              }}>
                {g.emoji} {g.name}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          padding: isMobile ? '12px' : '14px 16px',
        }}>
          <p style={{
            fontSize: '10px',
            color: '#555555',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: '0 0 10px',
          }}>
            💀 Hard pass
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {result.clashGames.map((g) => (
              <span key={g.name} style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 20,
                backgroundColor: '#191919',
                border: '1px solid #252525',
                color: '#888888',
                fontSize: '11px',
              }}>
                {g.emoji} {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Retake button */}
      <div style={{
        padding: '16px',
        textAlign: 'center',
        borderBottom: '1px solid #1e1e1e',
      }}>
        <button
          onClick={onRetake}
          onMouseEnter={() => setHoveringRetake(true)}
          onMouseLeave={() => setHoveringRetake(false)}
          style={{
            background: 'transparent',
            border: `1px solid ${hoveringRetake ? '#555555' : '#333333'}`,
            padding: '10px 32px',
            borderRadius: 8,
            fontSize: '13px',
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

      {/* 6. Research links */}
      <div style={{
        padding: isMobile ? '14px' : '16px 20px',
      }}>
        <p style={{
          fontSize: '10px',
          color: '#444444',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: '0 0 10px',
          fontWeight: 500,
        }}>
          Further Reading
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              title: 'Situational Judgment Tests as a Method for Measuring Personality',
              authors: 'Olaru, Burrus, MacCann, Zaromb, Wilhelm & Roberts — PLoS ONE, 2019',
              url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6392235/',
            },
            {
              title: 'Predicting Judging-Perceiving of Myers-Briggs Type Indicator (MBTI) in Online Social Forum',
              authors: 'Choong & Varathan — PeerJ, 2021',
              url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8234987/',
            },
            {
              title: 'Myers-Briggs Type Indicator',
              authors: 'Woods & Hill — StatPearls, 2022',
              url: 'https://www.ncbi.nlm.nih.gov/books/NBK554596/',
            },
          ].map(({ title, authors, url }) => (
            <div key={url}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  color: '#7c6fd4',
                  textDecoration: 'none',
                  lineHeight: 1.4,
                  display: 'block',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#7c6fd4' }}
              >
                {title}
              </a>
              <span style={{
                fontSize: '11px',
                color: '#444444',
                lineHeight: 1.4,
              }}>
                {authors}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
