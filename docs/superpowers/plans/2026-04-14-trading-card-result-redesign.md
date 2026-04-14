# Trading Card Result Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the quiz `ResultScreen` into a structured trading card layout and update all 16 result entries in `quizData.js` with new `tagline`, expanded `traits` (6 items), and new `tags` (8 neutral personality descriptors) fields.

**Architecture:** Two-file change. `quizData.js` gets new/expanded fields on all 16 result entries. `ResultScreen` in `Quiz.jsx` is rewritten — the vertically-stacked centered layout is replaced with four stacked sections: colored title banner, hero split (emoji left / traits right), personality traits with rotated label, and the existing compat/clash grid.

**Tech Stack:** React (Vite), CSS-in-JS inline styles, no external libraries.

---

## File Map

| File | Change |
|---|---|
| `src/data/quizData.js` | Add `tagline` (string), expand `traits` 4→6, add `tags` (8 items) to all 16 results |
| `src/components/Quiz.jsx` | Rewrite `ResultScreen` (L455–709) — new layout, updated animation timers |
| `src/data/quizData.test.js` | Add shape validation for new fields |

---

## Task 1: Add shape tests for new result fields

**Files:**
- Modify: `src/data/quizData.test.js`

- [ ] **Step 1: Read the existing test file**

```bash
cat src/data/quizData.test.js
```

- [ ] **Step 2: Add tests for new required fields**

Add to the existing test suite (after whatever tests are already there):

```js
describe('result shape — new trading card fields', () => {
  const allTypes = Object.keys(results)

  test.each(allTypes)('%s has a tagline string', (type) => {
    expect(typeof results[type].tagline).toBe('string')
    expect(results[type].tagline.length).toBeGreaterThan(0)
  })

  test.each(allTypes)('%s traits array has exactly 6 items', (type) => {
    expect(results[type].traits).toHaveLength(6)
  })

  test.each(allTypes)('%s tags array has exactly 8 items', (type) => {
    expect(results[type].tags).toHaveLength(8)
    results[type].tags.forEach((tag) => expect(typeof tag).toBe('string'))
  })
})
```

- [ ] **Step 3: Run tests — expect failure**

```bash
npm test -- --run 2>&1 | tail -30
```

Expected: tests fail because `tagline`, 6-item `traits`, and `tags` don't exist yet.

- [ ] **Step 4: Commit failing tests**

```bash
git add src/data/quizData.test.js
git commit -m "test: add shape validation for tagline, expanded traits, tags"
```

---

## Task 2: Update NT Analyst results (INTJ, INTP, ENTJ, ENTP)

**Files:**
- Modify: `src/data/quizData.js` (lines ~678–777)

- [ ] **Step 1: Replace the four NT result entries**

In `src/data/quizData.js`, find each entry and add/expand the fields. Full replacements:

**INTJ** — find `traits: ['10 moves ahead', 'Pawn sacrifice energy', 'Never blunders twice', 'Endgame specialist'],` and replace the entire traits + add tagline + tags:

```js
INTJ: {
  type: 'INTJ',
  title: 'The Architect',
  tagline: 'Ten steps ahead, always',
  description:
    "Imaginative, strategic, and always playing the long game. You see systems where others see chaos, and you can't help but optimize everything. Independent and fiercely analytical, you move quietly — then surprise everyone with a move they never saw coming.",
  traits: ['10 moves ahead', 'Pawn sacrifice energy', 'Never blunders twice', 'Endgame specialist', 'Quietly winning', 'End-game brain from turn 1'],
  tags: ['strategic', 'independent', 'high standards', 'direct', 'relentless planner', 'skeptical of shortcuts', 'private', 'systems thinker'],
  color: '#a78bfa',
  image: null,
  game: {
    name: 'Chess',
    emoji: '♟️',
    reason:
      "Like Chess, you think ten moves ahead. Every piece, every move, part of a larger plan only you can see. Patience and precision are your weapons.",
  },
  compatibleGames: [
    { name: 'Pandemic', emoji: '🧬' },
    { name: 'Clue', emoji: '🔍' },
    { name: 'Codenames', emoji: '🕵️' },
  ],
  clashGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Cards Against Humanity', emoji: '🃏' },
    { name: 'Candy Land', emoji: '🍭' },
  ],
},
```

**INTP** — find and replace with:

```js
INTP: {
  type: 'INTP',
  title: 'The Logician',
  tagline: 'Technically, you\'re all wrong',
  description:
    "An innovative thinker with an unquenchable thirst for knowledge. You love abstract ideas, logical puzzles, and asking \"what if?\" — and you'd rather be right than popular. Your mind is a playground of theories and possibilities.",
  traits: ['Walking card catalog', 'Challenges the answer key', 'Won the pie already', 'Niche specialist', 'Citations ready', 'Corrects the trivia host'],
  tags: ['analytical', 'curious', 'independent', 'precise', 'theoretical', 'absent-minded', 'honest', 'nonconformist'],
  color: '#7dd3fc',
  image: null,
  game: {
    name: 'Trivial Pursuit',
    emoji: '🧠',
    reason:
      "Your mind is a sprawling library of facts, theories, and random knowledge. Trivial Pursuit is your playground — the broader and weirder the question, the better.",
  },
  compatibleGames: [
    { name: 'Codenames', emoji: '🕵️' },
    { name: 'Scrabble', emoji: '📝' },
    { name: 'Chess', emoji: '♟️' },
  ],
  clashGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Candy Land', emoji: '🍭' },
    { name: 'Jenga', emoji: '🧱' },
  ],
},
```

**ENTJ** — find and replace with:

```js
ENTJ: {
  type: 'ENTJ',
  title: 'The Commander',
  tagline: 'I was born to conquer this board',
  description:
    "Bold, decisive, and strategic. You see the path forward and you're already leading the way — people naturally follow. You're charismatic, efficient, and you don't just play to win, you play to dominate.",
  traits: ['Owns Australia by T2', 'Alliance temporary', 'Continent collector', 'War is the plan', 'Already gave a speech', 'Your turn is taking too long'],
  tags: ['decisive', 'ambitious', 'natural leader', 'direct', 'confident', 'competitive', 'efficient', 'commanding'],
  color: '#ec4899',
  image: null,
  game: {
    name: 'Risk',
    emoji: '🌍',
    reason:
      "Like Risk, you're built for bold conquest. You plan, you execute, you dominate. The world is yours to shape — one calculated strike at a time.",
  },
  compatibleGames: [
    { name: 'Monopoly', emoji: '🏠' },
    { name: 'Chess', emoji: '♟️' },
    { name: 'Battleship', emoji: '⚓' },
  ],
  clashGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Apples to Apples', emoji: '🍎' },
    { name: 'Candy Land', emoji: '🍭' },
  ],
},
```

**ENTP** — find and replace with:

```js
ENTP: {
  type: 'ENTP',
  title: 'The Debater',
  tagline: 'That\'s not technically a word... or is it?',
  description:
    "Quick-witted and clever. You love intellectual sparring, creative problem-solving, and playing devil's advocate just for fun. You're the person who finds the brilliant, unexpected angle everyone else missed.",
  traits: ['Plays qi unironically', 'Challenges every word', 'Two-letter word hoarder', 'Dictionary is a weapon', 'Challenges the dictionary too', 'Won the argument, lost the game'],
  tags: ['quick-witted', 'argumentative', 'inventive', 'charming', 'curious', 'devil\'s advocate', 'energetic', 'unconventional'],
  color: '#38bdf8',
  image: null,
  game: {
    name: 'Scrabble',
    emoji: '📝',
    reason:
      "Words are your weapon. Like Scrabble, you find the brilliant, unexpected play that makes everyone groan in admiration. You live for the clever move.",
  },
  compatibleGames: [
    { name: 'Trivial Pursuit', emoji: '🧠' },
    { name: 'Codenames', emoji: '🕵️' },
    { name: 'Apples to Apples', emoji: '🍎' },
  ],
  clashGames: [
    { name: 'Candy Land', emoji: '🍭' },
    { name: 'Ticket to Ride', emoji: '🚂' },
    { name: 'Jenga', emoji: '🧱' },
  ],
},
```

- [ ] **Step 2: Run tests — NT types should now pass**

```bash
npm test -- --run 2>&1 | tail -30
```

Expected: INTJ, INTP, ENTJ, ENTP pass the shape tests; remaining 12 types still fail.

- [ ] **Step 3: Commit**

```bash
git add src/data/quizData.js
git commit -m "feat: add tagline, expanded traits, tags to NT Analyst results"
```

---

## Task 3: Update NF Diplomat results (INFJ, INFP, ENFJ, ENFP)

**Files:**
- Modify: `src/data/quizData.js` (lines ~780–880)

- [ ] **Step 1: Replace the four NF result entries**

**INFJ:**

```js
INFJ: {
  type: 'INFJ',
  title: 'The Advocate',
  tagline: 'Already had a cure in round two',
  description:
    "Quiet, insightful, and deeply idealistic. You see the world's potential and feel a calling to help bring it to life. You're rare — mystical, empathetic, and driven by a profound sense of purpose that guides everything you do.",
  traits: ['Has a cure by Round 2', 'Reads the full rulebook', 'Saves everyone quietly', 'Outbreak preventionist', 'Plays for the team win', 'Saw the crisis coming'],
  tags: ['empathetic', 'visionary', 'principled', 'private', 'purposeful', 'perceptive', 'idealistic', 'quietly determined'],
  color: '#818cf8',
  image: null,
  game: {
    name: 'Pandemic',
    emoji: '🧬',
    reason:
      "In a crisis, you're the calm, caring leader. Like Pandemic, you play to save everyone — winning together is the only real win. The world needs people like you.",
  },
  compatibleGames: [
    { name: 'Ticket to Ride', emoji: '🚂' },
    { name: 'Dungeons & Dragons', emoji: '🐉' },
    { name: 'Settlers of Catan', emoji: '🌾' },
  ],
  clashGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Battleship', emoji: '⚓' },
    { name: 'Cards Against Humanity', emoji: '🃏' },
  ],
},
```

**INFP:**

```js
INFP: {
  type: 'INFP',
  title: 'The Mediator',
  tagline: 'This character would never do that',
  description:
    "Poetic, kind, and deeply imaginative. You live in a world of rich inner dreams, and you bring that creativity everywhere. You're a quiet idealist who sees meaning in the small things and beauty in the overlooked.",
  traits: ['40-page backstory', 'Names their dice', 'Negotiates with the DM', 'Cries at character death', 'The DM is now crying too', 'Wrote lore between sessions'],
  tags: ['imaginative', 'empathetic', 'idealistic', 'authentic', 'open-minded', 'introspective', 'compassionate', 'quietly passionate'],
  color: '#c084fc',
  image: null,
  game: {
    name: 'Dungeons & Dragons',
    emoji: '🐉',
    reason:
      "Your imagination is infinite. Like D&D, you don't play games — you build worlds where anything is possible, and every story matters.",
  },
  compatibleGames: [
    { name: 'Pandemic', emoji: '🧬' },
    { name: 'Settlers of Catan', emoji: '🌾' },
    { name: 'The Game of Life', emoji: '🚗' },
  ],
  clashGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Battleship', emoji: '⚓' },
    { name: 'Monopoly', emoji: '🏠' },
  ],
},
```

**ENFJ:**

```js
ENFJ: {
  type: 'ENFJ',
  title: 'The Protagonist',
  tagline: 'Everyone leaves happy, somehow',
  description:
    "Charismatic and inspiring. You have a gift for bringing out the best in others — people feel seen, heard, and motivated around you. You're a natural leader who leads by caring, not commanding.",
  traits: ['Trades wood with warmth', 'The go-to neighbor', 'Longest road diplomat', 'Alliance architect', 'Checked in on everyone', 'Wins by being liked'],
  tags: ['charismatic', 'empathetic', 'inspiring', 'organized', 'reliable', 'diplomatic', 'warm', 'people-first'],
  color: '#14b8a6',
  image: null,
  game: {
    name: 'Settlers of Catan',
    emoji: '🌾',
    reason:
      "You're the ultimate community builder. Like Catan, you win by bringing people together, brokering deals, and building something lasting — together.",
  },
  compatibleGames: [
    { name: 'Pandemic', emoji: '🧬' },
    { name: 'Apples to Apples', emoji: '🍎' },
    { name: 'Dungeons & Dragons', emoji: '🐉' },
  ],
  clashGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Battleship', emoji: '⚓' },
    { name: 'Monopoly', emoji: '🏠' },
  ],
},
```

**ENFP:**

```js
ENFP: {
  type: 'ENFP',
  title: 'The Campaigner',
  tagline: 'Rules are more like suggestions',
  description:
    "Enthusiastic, creative, and sociable. You find possibility everywhere and bring infectious energy to every room you enter. Life is a story, and you're writing the most colorful chapter.",
  traits: ['Draws chaos, wins anyway', 'Team captain by vibes', 'Rules are suggestions', 'Abstract expressionist', 'Made it a bit', 'Everyone is guessing it'],
  tags: ['enthusiastic', 'creative', 'free-spirited', 'sociable', 'curious', 'spontaneous', 'expressive', 'warm'],
  color: '#e879f9',
  image: null,
  game: {
    name: 'Pictionary',
    emoji: '🎨',
    reason:
      "You're a born performer. Like Pictionary, you turn every game into a creative, expressive spectacle — and everyone loves being in your orbit.",
  },
  compatibleGames: [
    { name: 'Apples to Apples', emoji: '🍎' },
    { name: 'Cards Against Humanity', emoji: '🃏' },
    { name: 'Dungeons & Dragons', emoji: '🐉' },
  ],
  clashGames: [
    { name: 'Chess', emoji: '♟️' },
    { name: 'Clue', emoji: '🔍' },
    { name: 'Scrabble', emoji: '📝' },
  ],
},
```

- [ ] **Step 2: Run tests — 8 NT+NF types should now pass**

```bash
npm test -- --run 2>&1 | tail -30
```

- [ ] **Step 3: Commit**

```bash
git add src/data/quizData.js
git commit -m "feat: add tagline, expanded traits, tags to NF Diplomat results"
```

---

## Task 4: Update SJ Sentinel results (ISTJ, ISFJ, ESTJ, ESFJ)

**Files:**
- Modify: `src/data/quizData.js` (lines ~882–983)

- [ ] **Step 1: Replace the four SJ result entries**

**ISTJ:**

```js
ISTJ: {
  type: 'ISTJ',
  title: 'The Logistician',
  tagline: 'Already solved it, won\'t spoil it',
  description:
    "Practical, fact-minded, and reliable. You value order, tradition, and doing things the right way — and you deliver, every time. When you say something will be done, it will be done. Quietly, correctly, without drama.",
  traits: ['Notebook at the ready', 'Has Colonel Mustard', 'Never guesses, only knows', 'Solved it by T3', 'Cross-referenced every clue', 'Silent throughout, deadly'],
  tags: ['reliable', 'methodical', 'responsible', 'detail-oriented', 'private', 'honest', 'disciplined', 'traditional'],
  color: '#4ade80',
  image: null,
  game: {
    name: 'Clue',
    emoji: '🔍',
    reason:
      "You solve problems through careful deduction and methodical observation. Like Clue, nothing escapes your attention — and nothing beats a methodical process.",
  },
  compatibleGames: [
    { name: 'Chess', emoji: '♟️' },
    { name: 'Trivial Pursuit', emoji: '🧠' },
    { name: 'Ticket to Ride', emoji: '🚂' },
  ],
  clashGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Cards Against Humanity', emoji: '🃏' },
    { name: 'Dungeons & Dragons', emoji: '🐉' },
  ],
},
```

**ISFJ:**

```js
ISFJ: {
  type: 'ISFJ',
  title: 'The Defender',
  tagline: 'Quietly won while you were talking',
  description:
    "Dedicated, warm, and quietly observant. You take care of the people you love without needing to be asked — you just notice what's needed. Your strength is your steadiness, and your love shows up as action.",
  traits: ['Blocked your route kindly', 'Had the plan since T1', 'Longest route, zero drama', 'Quiet winner', 'Remembered your last move', 'Apologized while winning'],
  tags: ['caring', 'reliable', 'patient', 'observant', 'loyal', 'humble', 'steady', 'warm'],
  color: '#fb7185',
  image: null,
  game: {
    name: 'Ticket to Ride',
    emoji: '🚂',
    reason:
      "You build steady, quiet success. Like Ticket to Ride, while everyone else is making noise, you're methodically winning the long game — one careful connection at a time.",
  },
  compatibleGames: [
    { name: 'Pandemic', emoji: '🧬' },
    { name: 'Clue', emoji: '🔍' },
    { name: 'Settlers of Catan', emoji: '🌾' },
  ],
  clashGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Battleship', emoji: '⚓' },
    { name: 'Monopoly', emoji: '🏠' },
  ],
},
```

**ESTJ:**

```js
ESTJ: {
  type: 'ESTJ',
  title: 'The Executive',
  tagline: 'House rules? Absolutely not',
  description:
    "Organized, direct, and dependable. You get things done — you see what needs to happen and you make it happen, no excuses. People count on you because you always deliver. You don't do chaos.",
  traits: ['Brought the banker visor', 'Owns all four railroads', 'Rejects your house rules', 'Buys everything', 'Has been to jail, left immediately', 'Audited the bank'],
  tags: ['organized', 'direct', 'dependable', 'decisive', 'by-the-book', 'results-driven', 'consistent', 'no-nonsense'],
  color: '#f87171',
  image: null,
  game: {
    name: 'Monopoly',
    emoji: '🏠',
    reason:
      "You're a natural executive. Like Monopoly, you understand the rules, work the system, and build your empire one deal at a time. Winning is the point.",
  },
  compatibleGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Chess', emoji: '♟️' },
    { name: 'Clue', emoji: '🔍' },
  ],
  clashGames: [
    { name: 'Dungeons & Dragons', emoji: '🐉' },
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Apples to Apples', emoji: '🍎' },
  ],
},
```

**ESFJ:**

```js
ESFJ: {
  type: 'ESFJ',
  title: 'The Consul',
  tagline: 'Everyone wins somehow',
  description:
    "Caring, social, and endlessly supportive. You're the heart of every group — the one who remembers birthdays, checks in on people, and makes everyone feel welcome. Your superpower is making others feel at home.",
  traits: ['Picks your card for the win', 'Knows your funniest card', 'Brought homemade scorecards', 'Everyone wins somehow', 'Remembered your last joke', 'Made snacks for game night'],
  tags: ['warm', 'social', 'caring', 'supportive', 'organized', 'loyal', 'inclusive', 'people-pleasing'],
  color: '#facc15',
  image: null,
  game: {
    name: 'Apples to Apples',
    emoji: '🍎',
    reason:
      "You bring people together. Like Apples to Apples, you thrive in social games where everyone gets to share, laugh, and connect. The group having fun IS the win.",
  },
  compatibleGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Settlers of Catan', emoji: '🌾' },
    { name: 'The Game of Life', emoji: '🚗' },
  ],
  clashGames: [
    { name: 'Battleship', emoji: '⚓' },
    { name: 'Risk', emoji: '🌍' },
    { name: 'Scrabble', emoji: '📝' },
  ],
},
```

- [ ] **Step 2: Run tests — 12 types should now pass**

```bash
npm test -- --run 2>&1 | tail -30
```

- [ ] **Step 3: Commit**

```bash
git add src/data/quizData.js
git commit -m "feat: add tagline, expanded traits, tags to SJ Sentinel results"
```

---

## Task 5: Update SP Explorer results (ISTP, ISFP, ESTP, ESFP)

**Files:**
- Modify: `src/data/quizData.js` (lines ~984–1090)

- [ ] **Step 1: Replace the four SP result entries**

**ISTP:**

```js
ISTP: {
  type: 'ISTP',
  title: 'The Virtuoso',
  tagline: 'Steady hands, no fear',
  description:
    "Bold, practical, and endlessly curious about how things work. You're a hands-on experimenter who loves figuring things out by doing. You stay cool under pressure because you trust your instincts and your skill.",
  traits: ['Removes load-bearing block', 'Studies before touching', 'Steady hands, ice veins', 'Silent threat', 'Never telegraphs the move', 'Clinically unbothered'],
  tags: ['calm under pressure', 'practical', 'observant', 'independent', 'adaptable', 'precise', 'reserved', 'action-oriented'],
  color: '#f59e0b',
  image: null,
  game: {
    name: 'Jenga',
    emoji: '🧱',
    reason:
      "Cool, precise, fearless. Like Jenga, you thrive in high-stakes moments — steady hands, sharp eyes, and the nerve to make the move nobody else would dare.",
  },
  compatibleGames: [
    { name: 'Battleship', emoji: '⚓' },
    { name: 'Chess', emoji: '♟️' },
    { name: 'Clue', emoji: '🔍' },
  ],
  clashGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Cards Against Humanity', emoji: '🃏' },
    { name: 'Apples to Apples', emoji: '🍎' },
  ],
},
```

**ISFP:**

```js
ISFP: {
  type: 'ISFP',
  title: 'The Adventurer',
  tagline: 'Chose the scenic route, no regrets',
  description:
    "Flexible, charming, and quietly creative. You follow your passions wherever they lead, and you're always up for trying something new. Life is a canvas, and you paint it your own way — no fuss, no plan, all soul.",
  traits: ['Chose the scenic route', '4 kids, zero regrets', 'Artist career, no notes', 'Vibes-based retirement', 'Retired at the best time', 'Loved every detour'],
  tags: ['spontaneous', 'gentle', 'artistic', 'adaptable', 'sensitive', 'curious', 'free-spirited', 'present-moment'],
  color: '#34d399',
  image: null,
  game: {
    name: 'The Game of Life',
    emoji: '🚗',
    reason:
      "You're here for the ride, not the win. Like The Game of Life, you embrace whatever comes next — good, bad, or totally unexpected. It's all part of the journey.",
  },
  compatibleGames: [
    { name: 'Dungeons & Dragons', emoji: '🐉' },
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Apples to Apples', emoji: '🍎' },
  ],
  clashGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Monopoly', emoji: '🏠' },
    { name: 'Chess', emoji: '♟️' },
  ],
},
```

**ESTP:**

```js
ESTP: {
  type: 'ESTP',
  title: 'The Entrepreneur',
  tagline: 'Called the carrier hit on turn three',
  description:
    "Energetic, perceptive, and action-oriented. You live for the moment and thrive when you have to think on your feet. You read people, read rooms, and move fast — while everyone else is still weighing options.",
  traits: ['Called your carrier on T3', 'Pattern recognizer', 'Never misses when it counts', 'Strike first, think later', 'Already found the edge case', 'Reads the room before the rules'],
  tags: ['bold', 'perceptive', 'action-oriented', 'competitive', 'charming', 'adaptable', 'risk-taker', 'fast-moving'],
  color: '#94a3b8',
  image: null,
  game: {
    name: 'Battleship',
    emoji: '⚓',
    reason:
      "Fast, focused, tactical. Like Battleship, you read your opponents, strike with precision, and thrive on the thrill of the hunt. You don't overthink — you just win.",
  },
  compatibleGames: [
    { name: 'Risk', emoji: '🌍' },
    { name: 'Jenga', emoji: '🧱' },
    { name: 'Monopoly', emoji: '🏠' },
  ],
  clashGames: [
    { name: 'Pandemic', emoji: '🧬' },
    { name: 'Dungeons & Dragons', emoji: '🐉' },
    { name: 'Ticket to Ride', emoji: '🚂' },
  ],
},
```

**ESFP:**

```js
ESFP: {
  type: 'ESFP',
  title: 'The Entertainer',
  tagline: 'You are the party',
  description:
    "Spontaneous, enthusiastic, and playful. Life is never boring around you — you bring energy, humor, and joy wherever you go. You're the reason people remember the night. The spotlight was made for you.",
  traits: ['Reads cards in three voices', 'The spit-take card', 'Always the czar favorite', 'The party, not the guest', 'Improvised a new rule, it stuck', 'Scored points for charisma alone'],
  tags: ['spontaneous', 'fun-loving', 'expressive', 'bold', 'sociable', 'energetic', 'generous', 'in-the-moment'],
  color: '#fb923c',
  image: null,
  game: {
    name: 'Cards Against Humanity',
    emoji: '🃏',
    reason:
      "You live for the laugh. Like Cards Against Humanity, you're irreverent, hilarious, and the reason everyone remembers game night. You are the party.",
  },
  compatibleGames: [
    { name: 'Pictionary', emoji: '🎨' },
    { name: 'Apples to Apples', emoji: '🍎' },
    { name: 'The Game of Life', emoji: '🚗' },
  ],
  clashGames: [
    { name: 'Chess', emoji: '♟️' },
    { name: 'Clue', emoji: '🔍' },
    { name: 'Trivial Pursuit', emoji: '🧠' },
  ],
},
```

- [ ] **Step 2: Run all tests — all 16 types should pass**

```bash
npm test -- --run 2>&1 | tail -30
```

Expected: all shape tests pass, no failures.

- [ ] **Step 3: Commit**

```bash
git add src/data/quizData.js
git commit -m "feat: add tagline, expanded traits, tags to SP Explorer results"
```

---

## Task 6: Rewrite ResultScreen component

**Files:**
- Modify: `src/components/Quiz.jsx` (lines 455–709)

- [ ] **Step 1: Replace the entire ResultScreen function**

In `src/components/Quiz.jsx`, find `function ResultScreen({ result, onRetake, isMobile }) {` (line 455) and replace the entire function (through the closing `}` at line 709) with:

```jsx
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
          Your board game persona is…
        </p>
        <h2 style={{
          fontSize: isMobile ? 'clamp(20px, 5vw, 24px)' : '26px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: '#0f0f0f',
          margin: '0 0 5px',
        }}>
          {result.title}
        </h2>
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
        opacity: compatVisible ? 1 : 0,
        transform: compatVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={{
          padding: isMobile ? '12px 12px' : '14px 16px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.compatibleGames.map((g) => (
              <span key={g.name} style={{ fontSize: '12px', color: '#888888' }}>
                {g.emoji} {g.name}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          padding: isMobile ? '12px 12px' : '14px 16px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.clashGames.map((g) => (
              <span key={g.name} style={{ fontSize: '12px', color: '#888888' }}>
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
        borderTop: '1px solid #1e1e1e',
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
    </div>
  )
}
```

- [ ] **Step 2: Build to check for compile errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Quiz.jsx
git commit -m "feat: redesign ResultScreen as trading card layout"
```

---

## Task 7: Fix outer container alignment in Quiz

The new ResultScreen card has `width: 100%` and fills a container. The outer Quiz wrapper may have been sizing around the old centered layout. Verify and adjust.

**Files:**
- Modify: `src/components/Quiz.jsx` (the Quiz function, around line 114–221)

- [ ] **Step 1: Find how ResultScreen is rendered in the Quiz return**

Search for `<ResultScreen` in Quiz.jsx to find the wrapping div.

- [ ] **Step 2: Ensure the wrapper centers the card**

The wrapper around `<ResultScreen>` should be:

```jsx
<div style={{
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  padding: isMobile ? '0 0 40px' : '0 0 60px',
}}>
  <ResultScreen result={result} onRetake={handleRetake} isMobile={isMobile} />
</div>
```

If the current wrapper already centers (has `maxWidth` + `margin: auto` or `display:flex` + `justifyContent:center`), no change is needed. Only change it if the card is not centered or is clipped.

- [ ] **Step 3: Build again to confirm**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit if changed**

```bash
git add src/components/Quiz.jsx
git commit -m "fix: center trading card result in quiz wrapper"
```

---

## Task 8: Run full test suite and verify build

- [ ] **Step 1: Run all tests**

```bash
npm test -- --run 2>&1
```

Expected: all tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit if there are any leftover changes**

```bash
git status
```

Only commit if there are unstaged changes. If clean, skip this step.

---

## Self-Review

**Spec coverage:**
- ✅ Title banner (colored bg, eyebrow, title, tagline) — Task 6
- ✅ Hero split (emoji left, 6 witty traits right) — Task 6
- ✅ Personality traits section with rotated label — Task 6
- ✅ You'll love / Hard pass 2-col — Task 6
- ✅ Retake button — Task 6
- ✅ Animation sequence (300/700/1100ms) — Task 6
- ✅ `tagline` new field, all 16 — Tasks 2–5
- ✅ `traits` expanded to 6, all 16 — Tasks 2–5
- ✅ `tags` new field (8 items), all 16 — Tasks 2–5
- ✅ `description` not rendered — Task 6 (field kept in data, not used in JSX)
- ✅ Mobile: left column 90px, emoji 44px — Task 6
- ✅ `gameVisible` state removed — Task 6 (replaced by `tagsVisible`)
- ✅ Shape tests for new fields — Task 1

**No placeholders:** All code blocks are complete and ready to paste.

**Type consistency:** `result.tagline` (string), `result.traits` (string[], 6 items), `result.tags` (string[], 8 items) — used consistently across Tasks 2–6.
