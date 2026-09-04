import { useEffect, useMemo, useState } from 'react'
import './App.css'

type ChoiceId = 'paper' | 'scissors' | 'rock'
type Result = 'win' | 'lose' | 'draw'
type Scores = {
  score: number
  highScore: number
}

const assetPath = '/images/'
const scoreStorageKey = 'rock-paper-scissors-score'
const highScoreStorageKey = 'rock-paper-scissors-high-score'

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

function readStoredNumber(key: string) {
  const storedValue = localStorage.getItem(key)
  const parsedValue = storedValue ? Number.parseInt(storedValue, 10) : 0
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0
}

function readStoredScores(): Scores {
  const savedScore = readStoredNumber(scoreStorageKey)
  const savedHighScore = Math.max(readStoredNumber(highScoreStorageKey), savedScore)

  return {
    score: savedScore,
    highScore: savedHighScore,
  }
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
      <span className="grid aspect-square w-[76%] place-items-center rounded-full bg-[#e8e8f0] shadow-[inset_0_0.45rem_0_#c9c9dc]">
        <img className="w-[45%]" src={choice.icon} alt="" />
      </span>
      <span className="sr-only">{choice.label}</span>
    </>
  )

  return onClick ? (
    <button
      className={`choice ${choice.className} ${isWinner ? 'choice--winner' : ''} cursor-pointer transition-[filter,transform] duration-200 ease-out hover:-translate-y-1 hover:brightness-110 focus-visible:-translate-y-1 focus-visible:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus-ring`}
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
  const [{ score, highScore }, setScores] = useState<Scores>(() => readStoredScores())
  const [scoreMotion, setScoreMotion] = useState<'up' | 'down' | 'still'>('still')
  const [scoreTick, setScoreTick] = useState(0)
  const [playerChoice, setPlayerChoice] = useState<ChoiceId | null>(null)
  const [houseChoice, setHouseChoice] = useState<ChoiceId | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isLightTheme, setIsLightTheme] = useState(false)

  const resultText = useMemo(() => {
    if (result === 'win') return 'You win'
    if (result === 'lose') return 'You lose'
    if (result === 'draw') return 'Draw'
    return ''
  }, [result])

  useEffect(() => {
    localStorage.setItem(scoreStorageKey, String(score))
    localStorage.setItem(highScoreStorageKey, String(highScore))
  }, [highScore, score])

  function playRound(choiceId: ChoiceId) {
    const house = getHouseChoice()
    const roundResult = getResult(choiceId, house)

    setPlayerChoice(choiceId)
    setHouseChoice(house)
    setResult(roundResult)

    if (roundResult === 'win') {
      const nextScore = score + 1
      setScoreMotion('up')
      setScoreTick((currentTick) => currentTick + 1)
      setScores((currentScores) => ({
        score: nextScore,
        highScore: Math.max(currentScores.highScore, nextScore),
      }))
      return
    }

    if (roundResult === 'lose') {
      const nextScore = Math.max(0, score - 1)
      setScoreMotion(nextScore === score ? 'still' : 'down')
      if (nextScore !== score) {
        setScoreTick((currentTick) => currentTick + 1)
      }
      setScores((currentScores) => ({
        ...currentScores,
        score: nextScore,
      }))
      return
    }

    setScoreMotion('still')
  }

  function resetRound() {
    setPlayerChoice(null)
    setHouseChoice(null)
    setResult(null)
  }

  return (
    <main
      className={`${isLightTheme ? 'theme-light' : ''} relative flex min-h-screen flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_top,var(--game-bg-start),var(--game-bg-end)_72%)] px-6 py-8 font-barlow text-[var(--page-text)] transition-colors duration-300 max-[720px]:pb-28`}
    >
      <header
        className="flex w-full max-w-[43.75rem] items-center justify-between rounded-2xl border-3 border-header-outline py-4 pr-5 pl-7 max-[720px]:rounded-lg max-[720px]:py-3 max-[720px]:pr-3 max-[720px]:pl-5"
        aria-label="Game score"
      >
        <img
          className="h-auto w-[clamp(5.4rem,20vw,10rem)] transition-[filter] duration-300 [filter:var(--logo-filter)]"
          src={`${assetPath}logo.svg`}
          alt="Rock Paper Scissors"
        />
        <div className="grid min-h-[clamp(4.5rem,15vw,7.1rem)] min-w-[clamp(5rem,18vw,9.4rem)] place-items-center rounded-lg bg-linear-to-b from-panel-bg to-panel-bg-soft px-4 py-2.5 text-panel-text uppercase leading-none">
          <span className="text-[clamp(0.68rem,2.5vw,1rem)] tracking-[0.12rem] text-score-label">Score</span>
          <strong key={scoreTick} className={`scorebox__value scorebox__value--${scoreMotion} text-[clamp(2.5rem,8vw,4.1rem)]`}>
            {score}
          </strong>
          <span className="rounded-full bg-score-label/10 px-2 py-1 text-[0.65rem] tracking-[0.08rem] text-score-label">
            Best {highScore}
          </span>
        </div>
      </header>

      <section className="grid w-full flex-1 place-items-center pt-10 pb-18 max-[720px]:pt-16" aria-live="polite">
        {!playerChoice || !houseChoice || !result ? (
          <div
            className="choice-board grid aspect-[1.05] w-[min(80vw,29.7rem)] grid-cols-2 grid-rows-2 bg-[length:68%] bg-[position:center_58%] bg-no-repeat max-[720px]:w-[min(88vw,22rem)]"
            style={{ backgroundImage: `url(${assetPath}bg-triangle.svg)` }}
          >
            {boardChoices.map((choiceId) => (
              <ChoiceButton key={choiceId} choice={choices[choiceId]} onClick={() => playRound(choiceId)} />
            ))}
          </div>
        ) : (
          <div className="result-board grid w-full max-w-[60rem] grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-[clamp(1rem,4vw,4rem)] max-[720px]:grid-cols-2 max-[720px]:gap-x-[clamp(1rem,4vw,4rem)] max-[720px]:gap-y-14">
            <div className="picked picked--player flex min-w-0 flex-col items-center gap-[clamp(1.8rem,5vw,4rem)] max-[720px]:flex-col-reverse max-[720px]:gap-6">
              <p className="m-0 text-center text-[clamp(0.9rem,2.3vw,1.25rem)] font-bold tracking-[0.1rem] uppercase">You picked</p>
              <ChoiceButton choice={choices[playerChoice]} isWinner={result === 'win'} />
            </div>

            <div className="result-panel grid justify-items-center gap-4 uppercase max-[720px]:col-span-2 max-[720px]:row-start-2">
              <h1 className="m-0 text-center text-[clamp(3rem,7vw,3.8rem)] leading-[0.9]" id="round-result">
                {resultText}
              </h1>
              <button
                className="min-w-55 cursor-pointer rounded-lg border-0 bg-panel-bg px-6 py-3.5 text-[0.95rem] tracking-[0.12rem] text-button-text uppercase transition-[box-shadow,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:text-button-hover hover:shadow-[0_0.7rem_1.5rem_rgba(0,0,0,0.24)] focus-visible:-translate-y-0.5 focus-visible:text-button-hover focus-visible:shadow-[0_0.7rem_1.5rem_rgba(0,0,0,0.24)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
                type="button"
                onClick={resetRound}
                autoFocus
                aria-describedby="round-result"
                aria-label="Play again. Return to choice selection."
              >
                Play again
              </button>
            </div>

            <div className="picked picked--house flex min-w-0 flex-col items-center gap-[clamp(1.8rem,5vw,4rem)] max-[720px]:flex-col-reverse max-[720px]:gap-6">
              <p className="m-0 text-center text-[clamp(0.9rem,2.3vw,1.25rem)] font-bold tracking-[0.1rem] uppercase">
                The house picked
              </p>
              <ChoiceButton choice={choices[houseChoice]} isWinner={result === 'lose'} />
            </div>
          </div>
        )}
      </section>

      <div className="absolute right-8 bottom-8 flex items-center gap-4 max-[720px]:right-1/2 max-[720px]:bottom-6 max-[720px]:translate-x-1/2 max-[720px]:flex-col-reverse max-[720px]:gap-3">
        <button
          className="min-w-32 cursor-pointer rounded-lg border-2 border-[var(--rules-border)] bg-transparent px-6 py-2.5 text-[0.85rem] tracking-[0.16rem] text-[var(--page-text)] uppercase transition-colors duration-200 hover:bg-[var(--rules-hover-bg)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
          type="button"
          onClick={() => setIsRulesOpen(true)}
        >
          Rules
        </button>

        <button
          className="group flex h-11 min-w-32 cursor-pointer items-center justify-between gap-3 rounded-full border-2 border-[var(--rules-border)] bg-[var(--rules-hover-bg)] px-3 text-[0.78rem] tracking-[0.12rem] text-[var(--page-text)] uppercase transition-[background-color,border-color,color] duration-200 hover:bg-[var(--rules-hover-bg)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
          type="button"
          role="switch"
          aria-checked={isLightTheme}
          aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} theme`}
          onClick={() => setIsLightTheme((currentTheme) => !currentTheme)}
        >
          <span aria-hidden="true">{isLightTheme ? 'Light' : 'Dark'}</span>
          <span className="relative h-6 w-11 rounded-full bg-panel-bg/90 shadow-inner">
            <span
              className={`absolute top-1 grid aspect-square w-4 place-items-center rounded-full bg-score-label text-[0.62rem] leading-none text-panel-bg transition-transform duration-300 ${
                isLightTheme ? 'translate-x-6' : 'translate-x-1'
              }`}
              aria-hidden="true"
            >
              {isLightTheme ? 'L' : 'D'}
            </span>
          </span>
        </button>
      </div>

      {isRulesOpen && (
        <div
          className="modal-backdrop fixed inset-0 z-10 grid place-items-center bg-modal-backdrop p-6 max-[480px]:bg-panel-bg max-[480px]:p-0"
          role="presentation"
        >
          <section
            className="rules-modal grid w-[min(100%,25rem)] gap-8 rounded-lg bg-panel-bg p-8 text-panel-text max-[480px]:min-h-screen max-[480px]:content-between max-[480px]:rounded-none max-[480px]:px-8 max-[480px]:pt-23 max-[480px]:pb-15"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
          >
            <div className="flex items-center justify-between max-[480px]:contents">
              <h2 className="m-0 text-3xl uppercase max-[480px]:text-center" id="rules-title">
                Rules
              </h2>
              <button
                className="grid aspect-square w-10 cursor-pointer place-items-center border-0 bg-transparent focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus-ring max-[480px]:justify-self-center"
                type="button"
                onClick={() => setIsRulesOpen(false)}
                aria-label="Close rules"
              >
                <img src={`${assetPath}icon-close.svg`} alt="" />
              </button>
            </div>
            <img
              className="w-full"
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
