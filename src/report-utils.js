export function calculateDetailedMetrics(value, passage, elapsedSeconds) {
  const typed = [...String(value || '')]
  const target = [...String(passage || '')]
  let correct = 0
  let errors = 0
  typed.forEach((char, index) => {
    if (char === target[index]) correct += 1
    else errors += 1
  })
  const minutes = Math.max(Number(elapsedSeconds || 0) / 60, 1 / 60)
  const grossWpm = Math.round((typed.length / 5) / minutes)
  const correctWpm = Math.round((correct / 5) / minutes)
  const errorPenalty = Math.round(errors / minutes)
  const netWpm = Math.max(0, grossWpm - errorPenalty)
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100
  const completion = target.length ? Math.min(100, Math.round((typed.length / target.length) * 100)) : 0
  const errorRate = typed.length ? Math.round((errors / typed.length) * 100) : 0
  return { typed: typed.length, correct, errors, grossWpm, correctWpm, netWpm, wpm: netWpm, accuracy, completion, errorRate }
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds || 0)))
  const minutes = Math.floor(total / 60)
  const remainder = total % 60
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`
}

export function getPerformanceBand(accuracy, netWpm) {
  if (accuracy >= 98 && netWpm >= 40) return 'Excellent'
  if (accuracy >= 95 && netWpm >= 30) return 'Very good'
  if (accuracy >= 90 && netWpm >= 20) return 'Good progress'
  if (accuracy >= 80) return 'Keep practising'
  return 'Accuracy first'
}


// Word-level scoring: a word counts as correct only after all its target characters were typed exactly.
export function analyzeWords(value, passage) {
  const typed = String(value || '')
  const target = String(passage || '')
  const matches = [...target.matchAll(/\S+/g)]
  const words = matches.map((match) => {
    const start = match.index
    const text = match[0]
    const end = start + text.length
    const completed = typed.length >= end
    const typedWord = typed.slice(start, Math.min(end, typed.length))
    const correct = completed && typedWord === text
    const attempted = typed.length > start
    return { text, start, end, completed, attempted, correct, incorrect: completed && !correct }
  })
  const completedWords = words.filter((word) => word.completed)
  return {
    words,
    totalWords: words.length,
    completedWords: completedWords.length,
    correctWords: completedWords.filter((word) => word.correct).length,
    incorrectWords: completedWords.filter((word) => word.incorrect).length,
    remainingWords: words.length - completedWords.length,
  }
}
