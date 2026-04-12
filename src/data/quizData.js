// Game Night Personality Quiz — branching narrative with compound scoring.
//
// Design principles (from psychometric research):
//   1. Compound scoring — each option hits 2-3 MBTI dimensions, never just one.
//   2. Situational framing — dimensions are embedded in natural story decisions,
//      not "do you prefer X or Y" questions.
//   3. Genuine narrative branching — Q1 fans out into 4 distinct scenes with
//      different settings, characters, and micro-stories.
//   4. Dynamic result — final MBTI is computed from accumulated scores, so
//      players can't reverse-engineer a target type.
//
// Scene graph:
//   intro → q1 (4 opts) → q2_{a,b,c,d} (4 scenes, 3 opts each)
//         → q3_{a,b,c,d} (4 scenes, 3 opts each)
//         → q4 (shared, 3 opts) → q5 (shared, 4 opts) → result (dynamic)

export const scenes = {
  intro: { type: 'intro', progress: 0, next: 'q1' },

  // ─── Q1 — The Arrival ──────────────────────────────────────
  q1: {
    type: 'question',
    chapter: 'The Arrival',
    progress: 10,
    narrative:
      "It's Friday night. Your phone buzzes — \"Game night at my place. Be there at 8.\" You show up to a house already humming. Music, laughter, the smell of something in the oven. You step inside.",
    question: 'Who are you drawn to first?',
    options: [
      {
        text: 'The fireplace crew — loud laughter, a story already in progress',
        scores: { E: 2, S: 1, F: 1 },
        next: 'q2_a',
      },
      {
        text: 'The kitchen — wine being poured, a quieter clump of people',
        scores: { I: 1, S: 1, F: 2 },
        next: 'q2_b',
      },
      {
        text: 'The game shelf — you want to see what they\'ve got',
        scores: { I: 2, N: 1, T: 1 },
        next: 'q2_c',
      },
      {
        text: 'The host — they look a little frazzled, and you can help',
        scores: { E: 1, S: 1, F: 1, J: 2 },
        next: 'q2_d',
      },
    ],
  },

  // ─── Q2_A — The Fireplace ──────────────────────────────────
  q2_a: {
    type: 'question',
    chapter: 'The Fireplace',
    progress: 20,
    narrative:
      "Marcus is mid-story — something about a camping trip that's escalating into a full-on performance. The crew is howling. He turns to you with that look: your move. The room is watching.",
    question: 'What do you do?',
    options: [
      {
        text: 'Match his energy — top the story, make them laugh harder',
        scores: { E: 2, S: 1, P: 1 },
        next: 'q3_a',
      },
      {
        text: 'Ask the question that cracks the story open — "wait, what were you actually feeling?"',
        scores: { N: 2, F: 1, I: 1 },
        next: 'q3_a',
      },
      {
        text: 'Grin, raise your glass, let him have the moment — you don\'t need the spotlight',
        scores: { I: 1, F: 2, P: 1 },
        next: 'q3_a',
      },
    ],
  },

  // ─── Q2_B — The Kitchen ────────────────────────────────────
  q2_b: {
    type: 'question',
    chapter: 'The Kitchen',
    progress: 20,
    narrative:
      "You drift into the kitchen. Sam is leaning against the counter with a glass of wine, and when they see you, something in their face shifts — relief, maybe. \"Oh good, you're here. Can I tell you something?\"",
    question: 'How do you respond?',
    options: [
      {
        text: '"Of course. Tell me everything." — settle in, give them your full attention',
        scores: { I: 1, F: 2, J: 1 },
        next: 'q3_b',
      },
      {
        text: '"Hit me." — bright, direct, ready to help them work it out',
        scores: { E: 1, T: 1, J: 1, S: 1 },
        next: 'q3_b',
      },
      {
        text: '"Always — but let\'s grab a quieter spot" — move to where they can really talk',
        scores: { I: 2, F: 1, N: 1 },
        next: 'q3_b',
      },
    ],
  },

  // ─── Q2_C — The Game Shelf ─────────────────────────────────
  q2_c: {
    type: 'question',
    chapter: 'The Game Shelf',
    progress: 20,
    narrative:
      "The shelf is better than you expected — a mix of old classics and strange indie titles you've never heard of. You're halfway through reading a box when someone else wanders over and starts browsing too.",
    question: 'What catches your eye?',
    options: [
      {
        text: 'The weird one with the cryptic cover — you need to know what this is',
        scores: { N: 2, P: 1, T: 1 },
        next: 'q3_c',
      },
      {
        text: 'The classic you\'ve played a hundred times — you know exactly how it plays out',
        scores: { S: 2, J: 2 },
        next: 'q3_c',
      },
      {
        text: 'The one with the best art — you judge games by their covers, honestly',
        scores: { N: 1, F: 1, P: 2 },
        next: 'q3_c',
      },
    ],
  },

  // ─── Q2_D — Helping the Host ───────────────────────────────
  q2_d: {
    type: 'question',
    chapter: 'Backstage',
    progress: 20,
    narrative:
      "The host is in triage mode — timer buzzing, glass running low, a question about allergies floating around. They shoot you a grateful look. \"Thank god. Grab anything, do anything.\"",
    question: 'Where do you plug in?',
    options: [
      {
        text: 'Take the kitchen — rescue the food, plate it up, own the timeline',
        scores: { S: 2, T: 1, J: 1 },
        next: 'q3_d',
      },
      {
        text: 'Work the room — refill drinks, introduce strangers, keep the energy up',
        scores: { E: 2, F: 1, J: 1 },
        next: 'q3_d',
      },
      {
        text: 'Find the host and get them out of the weeds — they need a minute to breathe',
        scores: { I: 1, F: 2, N: 1 },
        next: 'q3_d',
      },
    ],
  },

  // ─── Q3_A — The Argument ───────────────────────────────────
  q3_a: {
    type: 'question',
    chapter: 'The Argument',
    progress: 30,
    narrative:
      "The story spirals into something bigger — two people at the fireplace are suddenly arguing. Not angry, exactly, but loud. A real debate about something neither will let go of. Everyone else leans back and watches.",
    question: 'What do you do?',
    options: [
      {
        text: 'Jump in — pick a side, sharpen the argument, make it a real debate',
        scores: { E: 1, T: 2, N: 1 },
        next: 'q4_dynamic',
      },
      {
        text: 'Mediate — find the thing they actually agree on and name it out loud',
        scores: { F: 2, J: 1, N: 1 },
        next: 'q4_dynamic',
      },
      {
        text: 'Stay quiet, watch the shape of it — you\'ll have your own opinion later',
        scores: { I: 2, T: 1, P: 1 },
        next: 'q4_dynamic',
      },
    ],
  },

  // ─── Q3_B — The Confession ─────────────────────────────────
  q3_b: {
    type: 'question',
    chapter: 'The Confession',
    progress: 30,
    narrative:
      "Sam tells you something real. Not gossip — something heavy they've been carrying. They look at you, waiting. The rest of the party feels very far away.",
    question: 'How do you hold this?',
    options: [
      {
        text: 'Just listen. Reflect back what you\'re hearing. Don\'t try to fix it',
        scores: { I: 1, F: 2, N: 1, P: 1 },
        next: 'q4_dynamic',
      },
      {
        text: 'Share your own story — the time you felt something similar — so they don\'t feel alone',
        scores: { E: 1, F: 1, N: 1, S: 1 },
        next: 'q4_dynamic',
      },
      {
        text: 'Help them think it through — ask the questions that will untangle it',
        scores: { T: 2, J: 1, N: 1 },
        next: 'q4_dynamic',
      },
    ],
  },

  // ─── Q3_C — The Pick ───────────────────────────────────────
  q3_c: {
    type: 'question',
    chapter: 'The Pick',
    progress: 30,
    narrative:
      "The game you chose becomes the game for the night — everyone gathers around. You realize you're the one who knows the rules best. Someone hands you the rulebook. It's your table now.",
    question: 'How do you run it?',
    options: [
      {
        text: 'Explain every rule properly before starting — do it right the first time',
        scores: { S: 2, J: 2 },
        next: 'q4_dynamic',
      },
      {
        text: 'Cover the basics, start playing, handle edge cases as they come up',
        scores: { N: 1, P: 2, T: 1 },
        next: 'q4_dynamic',
      },
      {
        text: 'Skim the rules aloud — make it part of the fun, not a lecture',
        scores: { E: 1, F: 1, P: 1, N: 1 },
        next: 'q4_dynamic',
      },
    ],
  },

  // ─── Q3_D — The Mishap ─────────────────────────────────────
  q3_d: {
    type: 'question',
    chapter: 'The Mishap',
    progress: 30,
    narrative:
      "Something goes wrong. A glass shatters, a dish goes sideways, a pet knocks over something it shouldn't have. Everyone looks up. The host looks like they might cry.",
    question: 'What\'s your move?',
    options: [
      {
        text: 'Spring into action — fix it in thirty seconds, no big deal, no drama',
        scores: { S: 1, T: 1, J: 2 },
        next: 'q4_dynamic',
      },
      {
        text: 'Crack a joke — defuse the tension, make the whole room laugh about it',
        scores: { E: 1, P: 2, F: 1 },
        next: 'q4_dynamic',
      },
      {
        text: 'Improvise — turn the disaster into a story, rescue the moment with style',
        scores: { N: 2, P: 1, E: 1 },
        next: 'q4_dynamic',
      },
    ],
  },

  // ─── Q4_AB — The First Move (AB track: F ≥ T) ─────────────────
  // Target: S/N — F-path framing accidentally scores N; need a direct
  // concrete-vs-abstract probe to separate ISFx from INFx users.
  q4_ab: {
    type: 'question',
    chapter: 'The First Move',
    progress: 40,
    narrative:
      "The game is underway. Pieces placed, first moves made. It's almost your turn. You find yourself already in your head.",
    question: 'What are you actually thinking about?',
    options: [
      {
        text: 'The exact state of the board — what\'s been played, what\'s left, what you know for certain',
        scores: { S: 2, J: 1 },
        next: 'q5_ab',
      },
      {
        text: 'The shape of it — how this could unfold, what patterns you\'re already reading',
        scores: { N: 2, I: 1 },
        next: 'q5_ab',
      },
      {
        text: 'The other players — you\'re watching people more than the board',
        scores: { F: 2, E: 1 },
        next: 'q5_ab',
      },
    ],
  },

  // ─── Q5_AB — The Break (AB track) ─────────────────────────────
  // Target: E/I — kitchen path accumulates I:4+ by Q3 with no E signal.
  // This discriminates ENFP from INFP, ESFJ from ISFJ.
  q5_ab: {
    type: 'question',
    chapter: 'The Break',
    progress: 50,
    narrative:
      "Someone calls a pause — drinks need refilling, a timer needs resetting. The game stops for a moment. The room breathes.",
    question: 'Where do you go?',
    options: [
      {
        text: 'Back into the group — you want to be in the middle of whatever conversation starts up',
        scores: { E: 2, F: 1 },
        next: 'q6_ab',
      },
      {
        text: 'You stay put, running the last few rounds through your head',
        scores: { I: 2, N: 1 },
        next: 'q6_ab',
      },
      {
        text: 'You find one person and have an actual conversation — not the whole room, just one',
        scores: { I: 1, F: 2 },
        next: 'q6_ab',
      },
    ],
  },

  // ─── Q6_AB — The Call (AB track) ──────────────────────────────
  // Target: T/F — even F-dominant paths can tie on T/F if one
  // analytical answer slipped in. This reinforces or corrects.
  q6_ab: {
    type: 'question',
    chapter: 'The Call',
    progress: 60,
    narrative:
      "Something ambiguous happens — a move that might be bending the rules. It changes the outcome. No one's sure if it was legal. Eyes go to you.",
    question: 'What matters most to you right now?',
    options: [
      {
        text: 'Getting it right — you look up the rule, you play it straight, fair is fair',
        scores: { T: 2, J: 1 },
        next: 'q7_ab',
      },
      {
        text: 'Keeping the energy — it\'s close enough, let it go, not worth the friction',
        scores: { F: 1, P: 2 },
        next: 'q7_ab',
      },
      {
        text: 'Being honest — you say something quietly to the person, give them the chance to call it themselves',
        scores: { F: 2, I: 1 },
        next: 'q7_ab',
      },
    ],
  },

  // ─── Q7_AB — Last Round (AB track) ────────────────────────────
  // Target: J/P — least-covered axis on AB paths before the shared questions.
  q7_ab: {
    type: 'question',
    chapter: 'Last Round',
    progress: 70,
    narrative:
      "The game wraps up. Someone immediately suggests one more. It's late, but there's still something in the air.",
    question: 'What do you do?',
    options: [
      {
        text: 'Call it — you know when something is done, and you\'re good at endings',
        scores: { J: 2, I: 1 },
        next: 'q8',
      },
      {
        text: 'Say yes without thinking — you don\'t want this to be over',
        scores: { P: 2, E: 1 },
        next: 'q8',
      },
      {
        text: 'Read the room first — you\'ll match whatever the group actually needs',
        scores: { F: 2, P: 1 },
        next: 'q8',
      },
    ],
  },

  // ─── Q4_CD — The Opponent (CD track: T > F) ───────────────────
  // Target: T/F — both CD paths score T heavily but rarely probe F.
  // Need a logic-vs-values moment to separate T from F on this track.
  q4_cd: {
    type: 'question',
    chapter: 'The Opponent',
    progress: 40,
    narrative:
      "One player at the table has locked in — clearly the strongest, methodically one move ahead of everyone else. They're playing to win. For real.",
    question: 'How do you respond?',
    options: [
      {
        text: 'You lock in too. This is exactly what you came for — a real game',
        scores: { T: 2, E: 1 },
        next: 'q5_cd',
      },
      {
        text: 'You start rooting for the underdog — someone should push back against them',
        scores: { F: 2, E: 1 },
        next: 'q5_cd',
      },
      {
        text: 'You find yourself more interested in watching their strategy than beating them',
        scores: { N: 2, I: 1 },
        next: 'q5_cd',
      },
    ],
  },

  // ─── Q5_CD — The Pivot (CD track) ─────────────────────────────
  // Target: S/N — path C is NTP-heavy, path D is STJ-heavy.
  // After merging at q4_cd, this confirms or corrects the S/N call.
  q5_cd: {
    type: 'question',
    chapter: 'The Pivot',
    progress: 50,
    narrative:
      "You have to make a move. You've been tracking this game carefully. The moment is here.",
    question: 'What do you trust?',
    options: [
      {
        text: 'The data — what\'s actually happened, what you know for certain is still in play',
        scores: { N: 2, T: 1 },
        next: 'q6_cd',
      },
      {
        text: 'The pattern — you\'ve been reading how the table plays, and you trust that read',
        scores: { N: 2, I: 1 },
        next: 'q6_cd',
      },
      {
        text: 'Your instinct — something about this specific moment is telling you',
        scores: { N: 1, P: 2 },
        next: 'q6_cd',
      },
    ],
  },

  // ─── Q6_CD — Between Rounds (CD track) ────────────────────────
  // Target: E/I — path C scores I:2 upfront; path D scores E:1.
  // After 5+ questions together, need a direct E/I probe to separate them.
  q6_cd: {
    type: 'question',
    chapter: 'Between Rounds',
    progress: 60,
    narrative:
      "The first game ends. People stretch, argue about what just happened. The room gets loud.",
    question: 'Where are you in this?',
    options: [
      {
        text: 'In it — you\'re replaying the key moments out loud with anyone who\'ll engage',
        scores: { E: 2, N: 1 },
        next: 'q7_cd',
      },
      {
        text: 'Elsewhere — you\'re already mentally preparing for the next game',
        scores: { I: 2, N: 1 },
        next: 'q7_cd',
      },
      {
        text: 'Watching — you\'re curious how other people experienced it differently',
        scores: { I: 1, F: 2 },
        next: 'q7_cd',
      },
    ],
  },

  // ─── Q7_CD — The Endgame (CD track) ───────────────────────────
  // Target: J/P — path D starts with J:2 head start; path C can land
  // anywhere. Need a direct discriminator before shared final questions.
  q7_cd: {
    type: 'question',
    chapter: 'The Endgame',
    progress: 70,
    narrative:
      "Three moves from now, this game is decided. You can see it clearly. You know exactly what you need to do.",
    question: 'What do you actually do?',
    options: [
      {
        text: 'Execute — you mapped it out, you follow through without second-guessing',
        scores: { J: 2, T: 1 },
        next: 'q8',
      },
      {
        text: 'Adapt — something shifted and the better play is different from your plan',
        scores: { P: 2, N: 1 },
        next: 'q8',
      },
      {
        text: 'Go for the unexpected move — risky, probably brilliant, definitely memorable',
        scores: { N: 2, P: 1 },
        next: 'q8',
      },
    ],
  },

  // ─── Q4 — The Final Game (shared) ──────────────────────────
  // All four Q3 branches (q3_a through q3_d) converge HERE. By this point, the
  // quiz has enough signal on the user's personality from 3 branched questions.
  // A shared Q4 simplifies balancing (one set of options to tune, not four) and
  // makes the narrative feel like it's coming back together after diverging.
  q8: {
    type: 'question',
    chapter: 'The Final Game',
    progress: 80,
    narrative:
      "Somehow it's midnight. The group has landed on one last game — the one everyone's going to remember. Someone half-jokes, \"Loser has to make breakfast.\" The table tightens up. It's on.",
    question: 'How do you play?',
    options: [
      {
        text: 'To win. Read the table, exploit the weak spots, be ruthless about it',
        scores: { T: 2, J: 1, S: 1 },
        next: 'q9',
      },
      {
        text: 'For the bit. It\'s about the stories we\'ll tell tomorrow, not the score',
        scores: { F: 1, P: 2, E: 1 },
        next: 'q9',
      },
      {
        text: 'Unpredictably. Go for the play nobody sees coming. High risk, high reward',
        scores: { N: 2, P: 1, E: 1 },
        next: 'q9',
      },
    ],
  },

  // ─── Q5 — The End of the Night (shared) ────────────────────
  q9: {
    type: 'question',
    chapter: 'The End of the Night',
    progress: 90,
    narrative:
      "It's late. People are stretching, yawning, starting to gather their things. The night is ending, and you feel that particular game-night feeling — full, tired, weirdly happy.",
    question: 'How do you leave?',
    options: [
      {
        text: 'You\'re the first to call it — you know when the night is over, and you\'re good at leaving',
        scores: { J: 2, I: 1, T: 1 },
        next: 'result',
      },
      {
        text: 'You stay until the very last person — you don\'t want it to end',
        scores: { E: 2, F: 1, P: 1 },
        next: 'result',
      },
      {
        text: 'You linger with one or two people, sitting on the porch, talking about something real',
        scores: { I: 1, N: 2, F: 1 },
        next: 'result',
      },
      {
        text: 'You bounce at some point nobody noticed — you\'re already onto whatever\'s next',
        scores: { P: 2, S: 1, T: 1 },
        next: 'result',
      },
    ],
  },

  // ─── RESULT ────────────────────────────────────────────────
  // Computed dynamically in Quiz.jsx from accumulated option.scores.
  result: { type: 'result' },
}

export function computeMBTI(scores, history = []) {
  const pick = (a, b) => {
    const sa = scores[a] || 0
    const sb = scores[b] || 0
    if (sa !== sb) return sa > sb ? a : b
    // True tie: winner is whichever dimension appeared in more questions
    const countA = history.filter(s => (s[a] || 0) > 0).length
    const countB = history.filter(s => (s[b] || 0) > 0).length
    if (countA !== countB) return countA > countB ? a : b
    // Still tied: fall back to statistically common pole (E, S, T, J)
    return a
  }
  return pick('E', 'I') + pick('S', 'N') + pick('T', 'F') + pick('J', 'P')
}

// 16 MBTI personality types, each paired with a matching board game.
// Type descriptions are drawn from standard MBTI profiles (16personalities conventions).
export const results = {
  // ─── Analysts (NT) ─────────────────────────────────────────
  INTJ: {
    type: 'INTJ',
    title: 'The Architect',
    description:
      "Imaginative, strategic, and always playing the long game. You see systems where others see chaos, and you can't help but optimize everything. Independent and fiercely analytical, you move quietly — then surprise everyone with a move they never saw coming.",
    traits: ['Strategic', 'Independent', 'Analytical', 'Decisive'],
    color: '#a78bfa',
    image: null,
    game: {
      name: 'Chess',
      emoji: '\u265f\ufe0f',
      reason:
        "Like Chess, you think ten moves ahead. Every piece, every move, part of a larger plan only you can see. Patience and precision are your weapons.",
    },
  },
  INTP: {
    type: 'INTP',
    title: 'The Logician',
    description:
      "An innovative thinker with an unquenchable thirst for knowledge. You love abstract ideas, logical puzzles, and asking \"what if?\" — and you'd rather be right than popular. Your mind is a playground of theories and possibilities.",
    traits: ['Curious', 'Theoretical', 'Analytical', 'Flexible'],
    color: '#7dd3fc',
    image: null,
    game: {
      name: 'Trivial Pursuit',
      emoji: '\ud83e\udde0',
      reason:
        "Your mind is a sprawling library of facts, theories, and random knowledge. Trivial Pursuit is your playground — the broader and weirder the question, the better.",
    },
  },
  ENTJ: {
    type: 'ENTJ',
    title: 'The Commander',
    description:
      "Bold, decisive, and strategic. You see the path forward and you're already leading the way — people naturally follow. You're charismatic, efficient, and you don't just play to win, you play to dominate.",
    traits: ['Decisive', 'Strategic', 'Charismatic', 'Efficient'],
    color: '#ec4899',
    image: null,
    game: {
      name: 'Risk',
      emoji: '\ud83c\udf0d',
      reason:
        "Like Risk, you're built for bold conquest. You plan, you execute, you dominate. The world is yours to shape — one calculated strike at a time.",
    },
  },
  ENTP: {
    type: 'ENTP',
    title: 'The Debater',
    description:
      "Quick-witted and clever. You love intellectual sparring, creative problem-solving, and playing devil's advocate just for fun. You're the person who finds the brilliant, unexpected angle everyone else missed.",
    traits: ['Quick-witted', 'Clever', 'Resourceful', 'Original'],
    color: '#38bdf8',
    image: null,
    game: {
      name: 'Scrabble',
      emoji: '\ud83d\udcdd',
      reason:
        "Words are your weapon. Like Scrabble, you find the brilliant, unexpected play that makes everyone groan in admiration. You live for the clever move.",
    },
  },

  // ─── Diplomats (NF) ────────────────────────────────────────
  INFJ: {
    type: 'INFJ',
    title: 'The Advocate',
    description:
      "Quiet, insightful, and deeply idealistic. You see the world's potential and feel a calling to help bring it to life. You're rare — mystical, empathetic, and driven by a profound sense of purpose that guides everything you do.",
    traits: ['Insightful', 'Idealistic', 'Compassionate', 'Determined'],
    color: '#818cf8',
    image: null,
    game: {
      name: 'Pandemic',
      emoji: '\ud83e\uddec',
      reason:
        "In a crisis, you're the calm, caring leader. Like Pandemic, you play to save everyone — winning together is the only real win. The world needs people like you.",
    },
  },
  INFP: {
    type: 'INFP',
    title: 'The Mediator',
    description:
      "Poetic, kind, and deeply imaginative. You live in a world of rich inner dreams, and you bring that creativity everywhere. You're a quiet idealist who sees meaning in the small things and beauty in the overlooked.",
    traits: ['Imaginative', 'Empathetic', 'Creative', 'Idealistic'],
    color: '#c084fc',
    image: null,
    game: {
      name: 'Dungeons & Dragons',
      emoji: '\ud83d\udc09',
      reason:
        "Your imagination is infinite. Like D&D, you don't play games — you build worlds where anything is possible, and every story matters.",
    },
  },
  ENFJ: {
    type: 'ENFJ',
    title: 'The Protagonist',
    description:
      "Charismatic and inspiring. You have a gift for bringing out the best in others — people feel seen, heard, and motivated around you. You're a natural leader who leads by caring, not commanding.",
    traits: ['Charismatic', 'Altruistic', 'Inspiring', 'Warm'],
    color: '#14b8a6',
    image: null,
    game: {
      name: 'Settlers of Catan',
      emoji: '\ud83c\udf3e',
      reason:
        "You're the ultimate community builder. Like Catan, you win by bringing people together, brokering deals, and building something lasting — together.",
    },
  },
  ENFP: {
    type: 'ENFP',
    title: 'The Campaigner',
    description:
      "Enthusiastic, creative, and sociable. You find possibility everywhere and bring infectious energy to every room you enter. Life is a story, and you're writing the most colorful chapter.",
    traits: ['Enthusiastic', 'Creative', 'Sociable', 'Curious'],
    color: '#e879f9',
    image: null,
    game: {
      name: 'Pictionary',
      emoji: '\ud83c\udfa8',
      reason:
        "You're a born performer. Like Pictionary, you turn every game into a creative, expressive spectacle — and everyone loves being in your orbit.",
    },
  },

  // ─── Sentinels (SJ) ────────────────────────────────────────
  ISTJ: {
    type: 'ISTJ',
    title: 'The Logistician',
    description:
      "Practical, fact-minded, and reliable. You value order, tradition, and doing things the right way — and you deliver, every time. When you say something will be done, it will be done. Quietly, correctly, without drama.",
    traits: ['Responsible', 'Methodical', 'Loyal', 'Traditional'],
    color: '#4ade80',
    image: null,
    game: {
      name: 'Clue',
      emoji: '\ud83d\udd0d',
      reason:
        "You solve problems through careful deduction and methodical observation. Like Clue, nothing escapes your attention — and nothing beats a methodical process.",
    },
  },
  ISFJ: {
    type: 'ISFJ',
    title: 'The Defender',
    description:
      "Dedicated, warm, and quietly observant. You take care of the people you love without needing to be asked — you just notice what's needed. Your strength is your steadiness, and your love shows up as action.",
    traits: ['Supportive', 'Reliable', 'Patient', 'Observant'],
    color: '#fb7185',
    image: null,
    game: {
      name: 'Ticket to Ride',
      emoji: '\ud83d\ude82',
      reason:
        "You build steady, quiet success. Like Ticket to Ride, while everyone else is making noise, you're methodically winning the long game — one careful connection at a time.",
    },
  },
  ESTJ: {
    type: 'ESTJ',
    title: 'The Executive',
    description:
      "Organized, direct, and dependable. You get things done — you see what needs to happen and you make it happen, no excuses. People count on you because you always deliver. You don't do chaos.",
    traits: ['Organized', 'Direct', 'Decisive', 'Dependable'],
    color: '#f87171',
    image: null,
    game: {
      name: 'Monopoly',
      emoji: '\ud83c\udfe0',
      reason:
        "You're a natural executive. Like Monopoly, you understand the rules, work the system, and build your empire one deal at a time. Winning is the point.",
    },
  },
  ESFJ: {
    type: 'ESFJ',
    title: 'The Consul',
    description:
      "Caring, social, and endlessly supportive. You're the heart of every group — the one who remembers birthdays, checks in on people, and makes everyone feel welcome. Your superpower is making others feel at home.",
    traits: ['Caring', 'Social', 'Loyal', 'Harmonious'],
    color: '#facc15',
    image: null,
    game: {
      name: 'Apples to Apples',
      emoji: '\ud83c\udf4e',
      reason:
        "You bring people together. Like Apples to Apples, you thrive in social games where everyone gets to share, laugh, and connect. The group having fun IS the win.",
    },
  },

  // ─── Explorers (SP) ────────────────────────────────────────
  ISTP: {
    type: 'ISTP',
    title: 'The Virtuoso',
    description:
      "Bold, practical, and endlessly curious about how things work. You're a hands-on experimenter who loves figuring things out by doing. You stay cool under pressure because you trust your instincts and your skill.",
    traits: ['Bold', 'Practical', 'Observant', 'Independent'],
    color: '#f59e0b',
    image: null,
    game: {
      name: 'Jenga',
      emoji: '\ud83e\uddf1',
      reason:
        "Cool, precise, fearless. Like Jenga, you thrive in high-stakes moments — steady hands, sharp eyes, and the nerve to make the move nobody else would dare.",
    },
  },
  ISFP: {
    type: 'ISFP',
    title: 'The Adventurer',
    description:
      "Flexible, charming, and quietly creative. You follow your passions wherever they lead, and you're always up for trying something new. Life is a canvas, and you paint it your own way — no fuss, no plan, all soul.",
    traits: ['Flexible', 'Sensitive', 'Creative', 'Spontaneous'],
    color: '#34d399',
    image: null,
    game: {
      name: 'The Game of Life',
      emoji: '\ud83d\ude97',
      reason:
        "You're here for the ride, not the win. Like The Game of Life, you embrace whatever comes next — good, bad, or totally unexpected. It's all part of the journey.",
    },
  },
  ESTP: {
    type: 'ESTP',
    title: 'The Entrepreneur',
    description:
      "Energetic, perceptive, and action-oriented. You live for the moment and thrive when you have to think on your feet. You read people, read rooms, and move fast — while everyone else is still weighing options.",
    traits: ['Energetic', 'Perceptive', 'Spontaneous', 'Bold'],
    color: '#94a3b8',
    image: null,
    game: {
      name: 'Battleship',
      emoji: '\u2693',
      reason:
        "Fast, focused, tactical. Like Battleship, you read your opponents, strike with precision, and thrive on the thrill of the hunt. You don't overthink — you just win.",
    },
  },
  ESFP: {
    type: 'ESFP',
    title: 'The Entertainer',
    description:
      "Spontaneous, enthusiastic, and playful. Life is never boring around you — you bring energy, humor, and joy wherever you go. You're the reason people remember the night. The spotlight was made for you.",
    traits: ['Playful', 'Enthusiastic', 'Spontaneous', 'Friendly'],
    color: '#fb923c',
    image: null,
    game: {
      name: 'Cards Against Humanity',
      emoji: '\ud83c\udccf',
      reason:
        "You live for the laugh. Like Cards Against Humanity, you're irreverent, hilarious, and the reason everyone remembers game night. You are the party.",
    },
  },
}
