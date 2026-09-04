import { useMemo, useState } from 'react'
import './App.css'

type ChoiceId = 'paper' | 'scissors' | 'rock'
type Result = 'win' | 'lose' | 'draw'

const assetPath = '/images/'

const choices: Record<
  ChoiceId,
  {
    id: ChoiceId
    label: string
    icon: string
    className: string
  }
> = {
  paper: {
    id: 'paper',
    label: 'Paper',
    icon: `${assetPath}icon-paper.svg`,
    className: 'choice--paper',
  },
  scissors: {
    id: 'scissors',
    label: 'Scissors',
    icon: `${assetPath}icon-scissors.svg`,
    className: 'choice--scissors',
  },
  rock: {
    id: 'rock',
    label: 'Rock',
    icon: `${assetPath}icon-rock.svg`,
    className: 'choice--rock',
  },
}

const boardChoices: ChoiceId[] = ['paper', 'scissors', 'rock']
const beats: Record<ChoiceId, ChoiceId> = {
  paper: 'rock',
  scissors: 'paper',
  rock: 'scissors',
}

function getHouseChoice() {
  const options = Object.keys(choices) as ChoiceId[]
  const randomValues = new Uint32Array(1)
  crypto.getRandomValues(randomValues)
  return options[randomValues[0] % options.length]
}

function getResult(player: ChoiceId, house: ChoiceId): Result {
  if (player === house) return 'draw'
  return beats[player] === house ? 'win' : 'lose'
}

function ChoiceButton({
  choice,
  onClick,
  isWinner = false,
  disabled = false,
}: {
  choice: (typeof choices)[ChoiceId]
  onClick?: () => void
  isWinner?: boolean
  disabled?: boolean
}) {
  const content = (
    <>
      <span className="choice__disc">
        <img src={choice.icon} alt="" />
      </span>
      <span className="sr-only">{choice.label}</span>
    </>
  )

  return onClick ? (
    <button
      className={`choice ${choice.className} ${isWinner ? 'choice--winner' : ''}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Choose ${choice.label}`}
    >
      {content}
    </button>
  ) : (
    <div className={`choice ${choice.className} ${isWinner ? 'choice--winner' : ''}`} aria-label={choice.label}>
      {content}
    </div>
  )
}

function App() {
  const [score, setScore] = useState(0)
  const [scoreMotion, setScoreMotion] = useState<'up' | 'down' | 'still'>('still')
  const [scoreTick, setScoreTick] = useState(0)
  const [playerChoice, setPlayerChoice] = useState<ChoiceId | null>(null)
  const [houseChoice, setHouseChoice] = useState<ChoiceId | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [isRulesOpen, setIsRulesOpen] = useState(false)

  const resultText = useMemo(() => {
    if (result === 'win') return 'You win'
    if (result === 'lose') return 'You lose'
    if (result === 'draw') return 'Draw'
    return ''
  }, [result])

  function playRound(choiceId: ChoiceId) {
    const house = getHouseChoice()
    const roundResult = getResult(choiceId, house)

    setPlayerChoice(choiceId)
    setHouseChoice(house)
    setResult(roundResult)
    setScore((currentScore) => {
      if (roundResult === 'win') {
        setScoreMotion('up')
        setScoreTick((currentTick) => currentTick + 1)
        return currentScore + 1
      }
      if (roundResult === 'lose') {
        const nextScore = Math.max(0, currentScore - 1)
        setScoreMotion(nextScore === currentScore ? 'still' : 'down')
        if (nextScore !== currentScore) {
          setScoreTick((currentTick) => currentTick + 1)
        }
        return nextScore
      }
      setScoreMotion('still')
      return currentScore
    })
  }

  function resetRound() {
    setPlayerChoice(null)
    setHouseChoice(null)
    setResult(null)
  }

  return (
    <main className="game">
      <header className="scoreboard" aria-label="Game score">
        <img className="scoreboard__logo" src={`${assetPath}logo.svg`} alt="Rock Paper Scissors" />
        <div className="scorebox">
          <span>Score</span>
          <strong key={scoreTick} className={`scorebox__value scorebox__value--${scoreMotion}`}>
            {score}
          </strong>
        </div>
      </header>

      <section className="game__stage" aria-live="polite">
        {!playerChoice || !houseChoice || !result ? (
          <div className="choice-board" style={{ backgroundImage: `url(${assetPath}bg-triangle.svg)` }}>
            {boardChoices.map((choiceId) => (
              <ChoiceButton key={choiceId} choice={choices[choiceId]} onClick={() => playRound(choiceId)} />
            ))}
          </div>
        ) : (
          <div className="result-board">
            <div className="picked picked--player">
              <p>You picked</p>
              <ChoiceButton choice={choices[playerChoice]} isWinner={result === 'win'} />
            </div>

            <div className="result-panel">
              <h1 id="round-result">{resultText}</h1>
              <button
                className="play-again"
                type="button"
                onClick={resetRound}
                autoFocus
                aria-describedby="round-result"
                aria-label="Play again. Return to choice selection."
              >
                Play again
              </button>
            </div>

            <div className="picked picked--house">
              <p>The house picked</p>
              <ChoiceButton choice={choices[houseChoice]} isWinner={result === 'lose'} />
            </div>
          </div>
        )}
      </section>

      <button className="rules-button" type="button" onClick={() => setIsRulesOpen(true)}>
        Rules
      </button>

      {isRulesOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title">
            <div className="rules-modal__header">
              <h2 id="rules-title">Rules</h2>
              <button type="button" onClick={() => setIsRulesOpen(false)} aria-label="Close rules">
                <img src={`${assetPath}icon-close.svg`} alt="" />
              </button>
            </div>
            <img
              className="rules-modal__image"
              src={`${assetPath}image-rules.svg`}
              alt="Paper beats rock, rock beats scissors, scissors beats paper."
            />
          </section>
        </div>
      )}
    </main>
  )
}

export default App
