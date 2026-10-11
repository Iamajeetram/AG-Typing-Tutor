import './style.css'
import './print.css'
import { calculateDetailedMetrics, formatDuration, getPerformanceBand, analyzeWords } from './report-utils.js'
import { lessons, renderLessons, bindLessonActions } from './learning-content.js'
import { renderGames, bindGameActions } from './typing-games.js'

const sections = [
  {
    id: 'learn',
    icon: '📘',
    title: 'Learn',
    description: 'Learn touch typing from beginner to advanced.',
    label: 'START LEARNING',
  },
  {
    id: 'practice',
    icon: '⌨️',
    title: 'Practice Typing',
    description: 'Practise words, sentences and paragraphs.',
    label: 'START PRACTICE',
  },
  {
    id: 'exams',
    icon: '🎯',
    title: 'Exam Typing Test',
    description: 'Prepare for competitive examination typing tests.',
    label: 'EXPLORE EXAMS',
  },
  {
    id: 'games',
    icon: '🎮',
    title: 'Typing Games',
    description: 'Improve your typing skills through games.',
    label: 'PLAY GAMES',
  },
  {
    id: 'speed',
    icon: '⚡',
    title: 'Speed Test',
    description: 'Measure your typing speed and accuracy.',
    label: 'TEST SPEED',
  },
  {
    id: 'performance',
    icon: '📊',
    title: 'My Performance',
    description: 'Track your progress, results and best scores.',
    label: 'VIEW PROGRESS',
  },
  {
    id: 'rules',
    icon: '📋',
    title: 'Exam Rules',
    description: 'Explore verified exam-specific typing rules.',
    label: 'VIEW RULES',
  },
  {
    id: 'settings',
    icon: '⚙️',
    title: 'Settings',
    description: 'Manage your typing practice preferences.',
    label: 'OPEN SETTINGS',
  },
]

const exams = [
  'SSC',
  'Railway',
  'Banking',
  'High Court',
  'Supreme Court',
  'KVS / NVS',
  'DSSSB',
  'EMRS',
  'RSSB LDC',
  'Other Exams',
]

const games = [
  { id: 'space-defender', icon: '🚀', title: 'Space Defender: Typing Odyssey', description: 'Lock on to asteroid words and blast them with laser fire.' },
  { id: 'cyberpunk-racer', icon: '🏎️', title: 'Cyberpunk Nitro Racer', description: 'Type glowing lane words to boost through a neon city.' },
  { id: 'undersea-bubble-blast', icon: '🫧', title: 'Undersea Bubble Blast', description: 'Pop rising word bubbles, collect oxygen pearls and chain blasts.' },
]

const app = document.querySelector('#app')

let currentSection = 'home'
let selectedExam = 'SSC'
let typingTimer = null
let typingStartedAt = null
let typingRemaining = 0
let typingDuration = 1
let typingFinished = false
let typingPassage = ''
let typingInputValue = ''
let typingBackspaces = 0

const typingPassages = [
  'Consistent practice is the key to improving typing speed and accuracy. Keep your fingers relaxed, look at the screen, and try to maintain a steady rhythm. Speed will improve naturally when correct typing becomes a habit.',
  'A good typist focuses on accuracy before speed. Sit comfortably, keep your wrists relaxed, and use the correct fingers for each key. Short daily sessions are more effective than one long session without breaks.',
  'Competitive examinations often require candidates to type a passage within a fixed time. Practise regularly, avoid unnecessary backspaces, and review your results after every test to identify areas that need improvement.',
]

const savedTheme = localStorage.getItem('ag-typing-theme')
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light'

function themeButton() {
  const dark = document.documentElement.dataset.theme === 'dark'
  return `<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to ${dark ? 'light' : 'dark'} theme"><span class="theme-toggle-icon">${dark ? '☀️' : '🌙'}</span><span class="theme-toggle-label">${dark ? 'Light mode' : 'Dark mode'}</span></button>`
}

function attachThemeToggle() {
  document.querySelectorAll('#theme-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = nextTheme
      localStorage.setItem('ag-typing-theme', nextTheme)
      if (currentSection === 'home') renderHome()
      else renderSection(currentSection)
    })
  })
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char])
}

function getTypingHistory() {
  try { return JSON.parse(localStorage.getItem('ag-typing-history') || '[]') } catch { return [] }
}

function saveTypingResult(result) {
  const history = getTypingHistory()
  history.unshift(result)
  localStorage.setItem('ag-typing-history', JSON.stringify(history.slice(0, 50)))
}

function calculateTypingStats(value, elapsedSeconds) {
  return calculateDetailedMetrics(value, typingPassage, elapsedSeconds)
}

function renderTypingPassage(value) {
  const target = document.querySelector('#typing-passage')
  if (!target) return
  const wordAnalysis = analyzeWords(value, typingPassage)
  const tokens = [...typingPassage.matchAll(/\S+|\s+/g)]
  target.innerHTML = tokens.map((match) => {
    const token = match[0]
    const start = match.index
    if (/^\s+$/.test(token)) return escapeHtml(token).replace(/\n/g, '<br>')
    const end = start + token.length
    const typedPart = value.slice(start, Math.min(end, value.length))
    const wordIndex = wordAnalysis.words.findIndex((word) => word.start === start)
    const word = wordAnalysis.words[wordIndex]
    let wordClass = 'typing-word'
    if (value.length >= end) wordClass += word?.correct ? ' word-correct' : ' word-incorrect'
    else if (value.length > start) wordClass += ' word-in-progress'
    return `<span class="${wordClass}" title="${value.length >= end ? (word?.correct ? 'Correct word' : 'Incorrect word') : 'Word in progress'}">${[...token].map((char, offset) => {
      const index = start + offset
      let charClass = 'typing-char'
      if (index < value.length) charClass += value[index] === char ? ' correct' : ' incorrect'
      else if (index === value.length) charClass += ' current'
      return `<span class="${charClass}">${escapeHtml(char)}</span>`
    }).join('')}</span>`
  }).join('')
  const correctWords = document.querySelector('#typing-correct-words')
  const incorrectWords = document.querySelector('#typing-incorrect-words')
  if (correctWords) correctWords.textContent = String(wordAnalysis.correctWords)
  if (incorrectWords) incorrectWords.textContent = String(wordAnalysis.incorrectWords)
}

function stopTypingTimer() {
  if (typingTimer) clearInterval(typingTimer)
  typingTimer = null
}

function finishTypingTest() {
  if (typingFinished) return
  typingFinished = true
  stopTypingTimer()
  const input = document.querySelector('#typing-input')
  if (input) input.disabled = true
  const endedAt = new Date()
  const elapsed = Math.max(1, Math.round((Date.now() - (typingStartedAt || Date.now())) / 1000))
  const stats = calculateTypingStats(typingInputValue, elapsed)
  const wordStats = analyzeWords(typingInputValue, typingPassage)
  const result = {
    id: `typing-${Date.now()}`,
    date: endedAt.toLocaleDateString(),
    completedAt: endedAt.toLocaleString(),
    startedAt: typingStartedAt ? new Date(typingStartedAt).toLocaleString() : 'Not started',
    duration: typingDuration,
    elapsedSeconds: elapsed,
    mode: currentSection === 'speed' ? 'Speed Test' : 'Typing Practice',
    exam: currentSection === 'exams' || currentSection === 'rules' ? selectedExam : 'General Practice',
    wpm: stats.netWpm,
    grossWpm: stats.grossWpm,
    netWpm: stats.netWpm,
    accuracy: stats.accuracy,
    errors: stats.errors,
    correct: stats.correct,
    typed: typingInputValue.length,
    passageLength: typingPassage.length,
    completion: stats.completion,
    errorRate: stats.errorRate,
    correctWords: wordStats.correctWords,
    incorrectWords: wordStats.incorrectWords,
    totalWords: wordStats.totalWords,
    backspaces: typingBackspaces,
    passage: typingPassage,
    typedText: typingInputValue,
  }
  saveTypingResult(result)
  const resultBox = document.querySelector('#typing-result')
  if (resultBox) {
    resultBox.hidden = false
    resultBox.innerHTML = buildDetailedReportHTML(result, stats)
    document.querySelector('#typing-review')?.addEventListener('click', () => renderSection('performance'))
    document.querySelector('#typing-print')?.addEventListener('click', () => window.print())
  }
  const status = document.querySelector('#typing-status')
  if (status) status.textContent = 'Test complete. Your detailed report is saved in My Performance.'
}

function buildDetailedReportHTML(result, stats) {
  const safe = escapeHtml
  return `
    <div class="report-heading">
      <div><span class="eyebrow">AG TYPING TUTOR · RESULT REPORT</span><h3>Typing test report</h3><p>${safe(result.completedAt)} · ${safe(result.mode)}</p></div>
      <span class="performance-band">${safe(getPerformanceBand(stats.accuracy, stats.netWpm))}</span>
    </div>
    <div class="result-metrics report-metrics">
      <span><strong>${stats.netWpm}</strong>Net WPM</span>
      <span><strong>${stats.grossWpm}</strong>Gross WPM</span>
      <span><strong>${stats.accuracy}%</strong>Accuracy</span>
      <span><strong>${stats.errors}</strong>Errors</span>
    </div>
    <div class="report-detail-grid">
      <div><span>Test duration</span><strong>${result.duration} minute(s)</strong></div>
      <div><span>Time used</span><strong>${formatDuration(result.elapsedSeconds)}</strong></div>
      <div><span>Characters typed</span><strong>${stats.typed}</strong></div>
      <div><span>Correct characters</span><strong>${stats.correct}</strong></div>
      <div><span>Incorrect characters</span><strong>${stats.errors}</strong></div>
      <div><span>Correct words</span><strong>${result.correctWords ?? analyzeWords(result.typedText, result.passage).correctWords}</strong></div>
      <div><span>Incorrect words</span><strong>${result.incorrectWords ?? analyzeWords(result.typedText, result.passage).incorrectWords}</strong></div>
      <div><span>Total passage words</span><strong>${result.totalWords ?? analyzeWords('', result.passage).totalWords}</strong></div>
      <div><span>Completion</span><strong>${stats.completion}%</strong></div>
      <div><span>Error rate</span><strong>${stats.errorRate}%</strong></div>
      <div><span>Backspaces</span><strong>${result.backspaces}</strong></div>
      <div><span>Exam/category</span><strong>${safe(result.exam)}</strong></div>
      <div><span>Session ID</span><strong>${safe(result.id)}</strong></div>
    </div>
    <div class="report-comparison"><h4>Passage review</h4><p class="report-passage">${safe(result.passage)}</p><p class="report-typed"><strong>Your typed text:</strong> ${safe(result.typedText || '(No text entered)')}</p><p class="helper-text">Word status: <span class="word-status-correct">green = correct</span>, <span class="word-status-incorrect">red = incorrect</span>. An unfinished word is not counted as correct.</p></div>
    <div class="report-actions screen-only"><button class="primary-button" id="typing-print" type="button">Print / Save as PDF</button><button class="secondary-button" id="typing-review" type="button">View Performance</button></div>
    <p class="report-footnote">WPM is based on five characters per word. Net WPM subtracts the uncorrected error rate from gross WPM. Results are stored locally in this browser.</p>
  `
}

function updateTypingStats() {
  const elapsed = typingStartedAt ? Math.max(1, Math.round((Date.now() - typingStartedAt) / 1000)) : 0
  const stats = calculateTypingStats(typingInputValue, elapsed || 1)
  const time = document.querySelector('#typing-time')
  const wpm = document.querySelector('#typing-wpm')
  const accuracy = document.querySelector('#typing-accuracy')
  const errors = document.querySelector('#typing-errors')
  const wordStats = analyzeWords(typingInputValue, typingPassage)
  if (time) time.textContent = `${Math.floor(typingRemaining / 60)}:${String(typingRemaining % 60).padStart(2, '0')}`
  if (wpm) wpm.textContent = String(stats.wpm)
  if (accuracy) accuracy.textContent = `${stats.accuracy}%`
  if (errors) errors.textContent = String(stats.errors)
  const correctWords = document.querySelector('#typing-correct-words')
  const incorrectWords = document.querySelector('#typing-incorrect-words')
  if (correctWords) correctWords.textContent = String(wordStats.correctWords)
  if (incorrectWords) incorrectWords.textContent = String(wordStats.incorrectWords)
}

function startTypingTest() {
  stopTypingTimer()
  typingDuration = Number(document.querySelector('[data-minutes].selected')?.dataset.minutes || typingDuration || 1)
  typingPassage = typingPassages[Math.floor(Math.random() * typingPassages.length)]
  typingInputValue = ''
  typingBackspaces = 0
  typingStartedAt = null
  typingRemaining = typingDuration * 60
  typingFinished = false
  const input = document.querySelector('#typing-input')
  const result = document.querySelector('#typing-result')
  const status = document.querySelector('#typing-status')
  if (input) { input.disabled = false; input.value = ''; input.focus() }
  if (result) { result.hidden = true; result.innerHTML = '' }
  if (status) status.textContent = 'Ready. The countdown begins with your first keystroke.'
  renderTypingPassage('')
  updateTypingStats()
}

function attachTypingEngine() {
  const start = document.querySelector('#typing-start')
  const input = document.querySelector('#typing-input')
  if (!start || !input) return
  start.addEventListener('click', startTypingTest)
  input.addEventListener('keydown', (event) => { if (event.key === 'Backspace') typingBackspaces += 1 })
  input.addEventListener('input', () => {
    if (typingFinished || !typingPassage) return
    typingInputValue = input.value.slice(0, typingPassage.length)
    if (!typingStartedAt && typingInputValue.length) {
      typingStartedAt = Date.now()
      typingTimer = setInterval(() => {
        typingRemaining -= 1
        updateTypingStats()
        if (typingRemaining <= 0) finishTypingTest()
      }, 1000)
    }
    renderTypingPassage(typingInputValue)
    updateTypingStats()
    if (typingInputValue.length >= typingPassage.length) finishTypingTest()
  })
  document.querySelectorAll('[data-minutes]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-minutes]').forEach((item) => item.classList.remove('selected'))
    button.classList.add('selected')
    typingDuration = Number(button.dataset.minutes)
    const status = document.querySelector('#typing-status')
    if (status) status.textContent = `${typingDuration}-minute test selected. Press Start Typing Test to begin.`
    updateTypingStats()
  }))
}

function renderHome() {
  app.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <a class="brand" href="#" data-page="home">
          <span class="brand-logo">AG</span>
          <span class="brand-text">
            <strong>AG Typing Tutor</strong>
            <small>by Xtreme AG Apps</small>
          </span>
        </a>

        <div class="sidebar-heading">MAIN MENU</div>

        <nav class="navigation">
          ${sections
            .map(
              (item) => `
                <button class="nav-button ${
                  currentSection === item.id ? 'active' : ''
                }" data-page="${item.id}">
                  <span>${item.icon}</span>
                  ${item.title}
                </button>
              `,
            )
            .join('')}
        </nav>

        <div class="sidebar-bottom">
          <div class="online-indicator"></div>
          <div>
            <strong>English Typing</strong>
            <small>Learning edition</small>
          </div>
        </div>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <div>
            <span class="eyebrow">YOUR PERSONAL TYPING STUDIO</span>
            <h1>Welcome to AG Typing Tutor</h1>
          </div>
          <div class="topbar-actions">${themeButton()}<span class="edition-badge">ENGLISH EDITION</span></div>
        </header>

        <section class="hero">
          <div class="hero-content">
            <span class="hero-label">LEARN · PRACTISE · IMPROVE</span>
            <h2>Your journey to<br />better typing starts here.</h2>
            <p>
              Build confidence, improve accuracy and develop
              your typing speed, one lesson at a time.
            </p>
            <button class="primary-button" data-page="learn">
              Start Learning <span>→</span>
            </button>
          </div>

          <div class="hero-art" aria-hidden="true">
            <div class="art-orbit orbit-one"></div>
            <div class="art-orbit orbit-two"></div>
            <div class="keyboard-card">
              <div class="keyboard-top">
                <span></span><span></span><span></span>
              </div>
              <div class="keyboard-keys">
                ${'QWERTYUIOPASDFGHJKLZXCVBNM'
                  .split('')
                  .map((letter, index) => `
                    <span class="${index % 7 === 0 ? 'key-highlight' : ''}">
                      ${letter}
                    </span>
                  `)
                  .join('')}
              </div>
              <div class="space-key"></div>
            </div>
            <div class="floating-badge">⌨ Type smarter</div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-title">
            <div>
              <span class="eyebrow">YOUR WORKSPACE</span>
              <h2>What would you like to do?</h2>
              <p>Choose an activity to get started.</p>
            </div>
          </div>

          <div class="feature-grid">
            ${sections
              .map(
                (item) => `
                  <button class="feature-card" data-page="${item.id}">
                    <span class="feature-icon icon-${item.id}">
                      ${item.icon}
                    </span>
                    <span class="feature-title">${item.title}</span>
                    <span class="feature-description">
                      ${item.description}
                    </span>
                    <span class="feature-link">
                      ${item.label} <span>→</span>
                    </span>
                  </button>
                `,
              )
              .join('')}
          </div>
        </section>

        <footer class="app-footer">
          <span>AG Typing Tutor</span>
          <span>A product by Xtreme AG Apps</span>
        </footer>
      </main>
    </div>
  `

  attachNavigation()
  attachThemeToggle()
}

function renderSection(page) {
  currentSection = page

  if (page === 'home') {
    renderHome()
    return
  }

  const section = sections.find((item) => item.id === page)

  if (!section) {
    renderHome()
    return
  }

  let content = ''

  if (page === 'learn') {
    content = renderLessons()
  } else if (page === 'practice' || page === 'speed') {
    content = `
      <div class="typing-workspace">
        <div class="typing-setup notice-card">
          <span class="large-icon">${page === 'speed' ? '⚡' : '⌨️'}</span>
          <h3>${page === 'speed' ? 'Typing Speed Test' : 'Typing Practice'}</h3>
          <p>${page === 'speed' ? 'Choose a test duration, then start typing the passage.' : 'Practise a passage and watch your speed and accuracy update.'}</p>
          <div class="duration-options">
            ${[1, 3, 5, 10].map((minutes) => `
              <button class="duration-button ${typingDuration === minutes ? 'selected' : ''}" data-minutes="${minutes}">${minutes} min</button>
            `).join('')}
          </div>
          <button class="primary-button typing-start" id="typing-start">${typingFinished ? 'Try Again' : 'Start Typing Test'} <span>→</span></button>
          <p class="helper-text" id="typing-status">The timer starts when you type your first character. Use the passage below.</p>
        </div>
        <div class="typing-stats" aria-live="polite">
          <div class="typing-stat"><span>Time left</span><strong id="typing-time">${typingDuration}:00</strong></div>
          <div class="typing-stat"><span>WPM</span><strong id="typing-wpm">0</strong></div>
          <div class="typing-stat"><span>Accuracy</span><strong id="typing-accuracy">100%</strong></div>
          <div class="typing-stat"><span>Errors</span><strong id="typing-errors">0</strong></div>
          <div class="typing-stat word-stat"><span>Correct words</span><strong id="typing-correct-words">0</strong></div>
          <div class="typing-stat word-stat"><span>Incorrect words</span><strong id="typing-incorrect-words">0</strong></div>
        </div>
        <div class="word-legend"><span><i class="legend-dot correct-dot"></i> Correct word</span><span><i class="legend-dot incorrect-dot"></i> Incorrect word</span><span><i class="legend-dot progress-dot"></i> In progress</span></div>
        <div class="typing-test-card">
          <div class="typing-card-heading"><h3>Type the passage</h3><span>English · Practice</span></div>
          <div class="typing-passage" id="typing-passage">${escapeHtml(typingPassage || 'Press “Start Typing Test” to load a passage. The passage will appear here, and you can begin typing in the box below.')}</div>
          <textarea id="typing-input" class="typing-input" rows="5" placeholder="Click Start Typing Test, then type the passage here…" ${!typingPassage || typingFinished ? 'disabled' : ''} spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
          <div id="typing-result" class="typing-result" ${typingFinished ? '' : 'hidden'}></div>
        </div>
      </div>
    `
  } else if (page === 'exams' || page === 'rules') {
    content = `
      <div class="exam-picker">
        <label for="exam-select">Select examination category</label>
        <select id="exam-select">
          ${exams
            .map(
              (exam) => `
                <option value="${exam}" ${
                  exam === selectedExam ? 'selected' : ''
                }>${exam}</option>
              `,
            )
            .join('')}
        </select>

        <div class="notice-card exam-detail">
          <span class="large-icon">${page === 'rules' ? '📋' : '🎯'}</span>
          <h3 id="selected-exam-title">${selectedExam}</h3>
          <p id="selected-exam-description">
            ${page === 'rules'
              ? 'Only officially verified rules will be marked as confirmed.'
              : 'Select the applicable post and test format after checking its official notification.'}
          </p>
          <span class="verification-label">
            OFFICIAL RULE VERIFICATION REQUIRED
          </span>
        </div>
      </div>
    `
  } else if (page === 'games') {
    content = renderGames()
  } else if (page === 'performance') {
    const history = getTypingHistory()
    const bestWpm = history.length ? Math.max(...history.map((item) => item.wpm)) : 0
    const averageAccuracy = history.length ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / history.length) : 0
    let gameHistory = []
    try { gameHistory = JSON.parse(localStorage.getItem('ag-typing-game-history') || '[]') } catch { gameHistory = [] }
    content = `
      <div class="performance-summary">
        <div class="typing-stat"><span>Completed tests</span><strong>${history.length}</strong></div>
        <div class="typing-stat"><span>Best WPM</span><strong>${bestWpm}</strong></div>
        <div class="typing-stat"><span>Average accuracy</span><strong>${history.length ? averageAccuracy + '%' : '—'}</strong></div>
      </div>
      <section class="typing-test-card game-history-card"><div class="typing-card-heading"><div><h3>Arcade mission history</h3><p class="helper-text">All three arcade game results are saved on this device.</p></div><button class="text-button" id="clear-game-history" ${gameHistory.length ? '' : 'disabled'}>Clear games</button></div>${gameHistory.length ? `<div class="game-history-grid">${gameHistory.slice(0,10).map((g) => `<article class="game-history-item"><div><strong>${escapeHtml(g.game || 'Typing game')}</strong><small>${escapeHtml(g.date || '')}</small></div><div class="game-history-metrics"><span><b>${Number(g.score)||0}</b> score</span><span><b>${Number(g.destroyed)||0}</b> destroyed</span><span><b>${Number(g.wpm)||0}</b> WPM</span><span><b>${Number(g.accuracy)||0}%</b> accuracy</span></div></article>`).join('')}</div>` : `<p class="helper-text">Your first result will appear here after playing any of the three arcade games.</p>`}</section>
      ${history.length ? `<div class="typing-test-card"><div class="typing-card-heading"><h3>Recent results</h3><button class="text-button" id="clear-history">Clear history</button></div><div class="history-table"><div class="history-row history-head"><span>Date</span><span>Duration</span><span>Net WPM</span><span>Accuracy</span><span>Details</span></div>${history.slice(0, 20).map((item) => `<div class="history-row"><span>${escapeHtml(item.date)}</span><span>${item.duration} min</span><span>${item.netWpm ?? item.wpm}</span><span>${item.accuracy}%</span><button class="text-button" data-report-id="${escapeHtml(item.id || '')}">View / Print</button></div>`).join('')}</div><p class="helper-text">Select View / Print to reopen a saved detailed report.</p><div id="saved-report"></div></div>` : `<div class="notice-card"><span class="large-icon">📊</span><h3>Your progress starts here</h3><p>Complete a typing session to save your first result. Your test history stays in this browser on this device.</p><button class="primary-button" data-page="practice">Start Practice <span>→</span></button></div>`}
    `
  } else {
    content = `
      <div class="notice-card">
        <span class="large-icon">⚙️</span>
        <h3>Application preferences</h3>
        <p>More settings will be added as the typing engine develops.</p>
      </div>
    `
  }

  app.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <a class="brand" href="#" data-page="home">
          <span class="brand-logo">AG</span>
          <span class="brand-text">
            <strong>AG Typing Tutor</strong>
            <small>by Xtreme AG Apps</small>
          </span>
        </a>

        <div class="sidebar-heading">MAIN MENU</div>

        <nav class="navigation">
          <button class="nav-button" data-page="home">
            <span>⌂</span> Home
          </button>
          ${sections
            .map(
              (item) => `
                <button class="nav-button ${
                  page === item.id ? 'active' : ''
                }" data-page="${item.id}">
                  <span>${item.icon}</span>
                  ${item.title}
                </button>
              `,
            )
            .join('')}
        </nav>

        <div class="sidebar-bottom">
          <div class="online-indicator"></div>
          <div>
            <strong>English Typing</strong>
            <small>Learning edition</small>
          </div>
        </div>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <div>
            <button class="back-button" data-page="home">← Home</button>
            <h1>${section.title}</h1>
            <p>${section.description}</p>
          </div>
          <div class="topbar-actions">${themeButton()}<span class="edition-badge">AG TYPING TUTOR</span></div>
        </header>

        <section class="section-page">
          ${content}
        </section>

        <footer class="app-footer">
          <span>AG Typing Tutor</span>
          <span>A product by Xtreme AG Apps</span>
        </footer>
      </main>
    </div>
  `

  attachNavigation()
  attachThemeToggle()
  attachSectionActions()
}

function attachNavigation() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      renderSection(button.dataset.page)
    })
  })
}

function attachSectionActions() {
  document.querySelector('#clear-game-history')?.addEventListener('click', () => { localStorage.removeItem('ag-typing-game-history'); renderSection('performance') })
  attachTypingEngine()
  bindLessonActions(() => renderSection('learn'))
  bindGameActions()

  const examSelect = document.querySelector('#exam-select')

  if (examSelect) {
    examSelect.addEventListener('change', () => {
      selectedExam = examSelect.value

      const title = document.querySelector('#selected-exam-title')
      const description = document.querySelector('#selected-exam-description')

      title.textContent = selectedExam

      description.textContent =
        currentSection === 'rules'
          ? 'Official rules must be verified for the relevant post and notification.'
          : 'Select the applicable post and test format after checking its official notification.'
    })
  }

  document.querySelector('#clear-history')?.addEventListener('click', () => {
    localStorage.removeItem('ag-typing-history')
    renderSection('performance')
  })

  document.querySelectorAll('[data-report-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const result = getTypingHistory().find((item) => item.id === button.dataset.reportId)
      const target = document.querySelector('#saved-report')
      if (!result || !target) return
      const stats = {
        netWpm: result.netWpm ?? result.wpm ?? 0,
        grossWpm: result.grossWpm ?? result.wpm ?? 0,
        accuracy: result.accuracy ?? 0,
        errors: result.errors ?? 0,
        correct: result.correct ?? 0,
        typed: result.typed ?? 0,
        completion: result.completion ?? 0,
        errorRate: result.errorRate ?? 0,
      }
      target.innerHTML = `<div class="typing-result saved-report">${buildDetailedReportHTML(result, stats)}</div>`
      target.querySelector('#typing-print')?.addEventListener('click', () => window.print())
    })
  })

}

renderHome()