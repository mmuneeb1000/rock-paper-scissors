# Frontend Mentor - Rock, Paper, Scissors solution

This is a solution to the [Rock, Paper, Scissors challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/rock-paper-scissors-game-pTgwgvgH). The project is built with React, Vite, TypeScript, and Tailwind CSS.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
  - [AI collaboration](#ai-collaboration)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the game depending on their device's screen size
- Play Rock, Paper, Scissors against the computer
- Maintain the score state after refreshing the browser
- View the rules modal
- Toggle between dark and light themes

### Screenshot

![Rock Paper Scissors app preview](./public/screenshot.jpg)

### Links

- Solution URL: Add your Frontend Mentor solution URL here
- Live Site URL: Add your deployed site URL here

## My process

### Built with

- Semantic HTML5 markup
- React
- TypeScript
- Vite
- Tailwind CSS 4
- CSS custom properties
- CSS Grid
- Flexbox
- Local storage
- Mobile-first responsive layout

### What I learned

This project was a good pass at combining Tailwind's theme system with CSS custom properties. The app uses Tailwind utilities for most layout, color, spacing, typography, and responsive behavior, while keeping custom CSS for the circular game pieces and keyframe animations.

I also practiced keeping browser state resilient by reading score, high score, and theme preferences from local storage with safe fallbacks.

```ts
const [{ score, highScore }, setScores] = useState<Scores>(() => readStoredScores())
const [isLightTheme, setIsLightTheme] = useState(() => readStoredTheme())
```

The result screen also includes a small accessibility improvement: after a round ends, focus moves to the play-again button and the button references the result text.

```tsx
<button aria-describedby="round-result" aria-label="Play again. Return to choice selection.">
  Play again
</button>
```

### Continued development

Future improvements could include:

- Adding a score reset button with confirmation
- Persisting a match history
- Adding the bonus Rock, Paper, Scissors, Lizard, Spock mode
- Refining animations with more state-specific timing

### Useful resources

- [Frontend Mentor challenge page](https://www.frontendmentor.io/challenges/rock-paper-scissors-game-pTgwgvgH) - Challenge brief and expected behavior.
- [Tailwind CSS documentation](https://tailwindcss.com/docs) - Used for utility classes and theme tokens.
- [React documentation](https://react.dev/) - Used for component state and effects.
- [Vite documentation](https://vite.dev/) - Used for local development and production builds.

### AI collaboration

I used ChatGPT/Codex to help implement and review the solution. The collaboration focused on building the React game flow, converting styling to Tailwind CSS, checking accessibility, validating responsive layouts, and running final build checks.

## Author

- Frontend Mentor - Add your Frontend Mentor profile here
