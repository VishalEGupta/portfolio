import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { scenes, results, computeMBTI } from '../data/quizData'

const TRANSITION_MS = 400

export default function Quiz() {
  const isMobile = useIsMobile()
  const [currentScene, setCurrentScene] = useState('intro')
  const [path, setPath] = useState([])
  const [scoreHistory, setScoreHistory] = useState([])
  const [visible, setVisible] = useState(true)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)

  const totalScores = scoreHistory.reduce((acc, s) => {
    for (const k in s) acc[k] = (acc[k] || 0) + s[k]
    return acc
  }, {})

  const pad = isMobile ? '24px' : '48px'
  const scene = scenes[currentScene]

  const fadeToScene = (nextKey) => {
    setVisible(false)
    setTimeout(() => {
      setPath((prev) => [...prev, currentScene])
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
    setSelectedOption(index)
    setScoreHistory((h) => [...h, option.scores || {}])
    setTimeout(() => fadeToScene(option.next), 350)
  }

  const handleRetake = () => {
    setVisible(false)
    setTimeout(() => {
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

  const progress = scene.progress ?? (scene.type === 'result' ? 100 : 0)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
    }}>
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

      {scene.type !== 'intro' && (
        <ProgressBar progress={progress} pad={pad} />
      )}

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
          <ResultScreen
            result={results[computeMBTI(totalScores)]}
            onRetake={handleRetake}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  )
}

function ProgressBar({ progress, pad }) {
  return (
    <div style={{ padding: `16px ${pad} 0` }}>
      <div style={{
        height: 3,
        backgroundColor: '#1e1e1e',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
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
          const disabled = selectedOption !== null
          const highlighted = selected || hovered

          return (
            <button
              key={i}
              onClick={() => !disabled && onAnswer(option, i)}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
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
                opacity: disabled && !selected ? 0.4 : 1,
              }}
            >
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

  useEffect(() => {
    const t1 = setTimeout(() => setTraitsVisible(true), 500)
    const t2 = setTimeout(() => setGameVisible(true), 900)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div style={{ textAlign: 'center', maxWidth: 540 }}>
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
