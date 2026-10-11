import handsGuideUrl from './hands-guide.png'
import { escapeHtml } from './text-utils.js'
import { renderKeyboard } from './keyboard-visual.js'
import { readLessonProgress, saveLessonResult, stageIsUnlocked, lessonCompletion } from './lesson-progress.js'

const BANKS = {
  home: {
    keys:['asdf jkl;','a s d f j k l ;','asdf fdsa jkl; ;lkj','fj dk sl a;'],
    words:['sad dad ask fall flask lass salad','all ask add fall lad flask dad','jaja; fafa; dada; sasa; lala;','ask dad; fall; salad; flask;'],
    sentences:['A sad lad asks dad.','All fall as a flask falls.','Dad asks a lad; a lad asks dad.','A flask falls, and all hands relax.'],
    paragraphs:['A small lad asks his dad. He falls, then stands tall. Keep your fingers on the home row and return after each reach.','Start with a slow rhythm. Press each key lightly, watch the screen, and keep your hands relaxed. Accuracy comes before speed.']
  },
  top: {
    keys:['qwert yuiop','q w e r t y u i o p','qq ww ee rr tt yy uu ii oo pp','qwer trew uiop poiu'],
    words:['type write quiet power tower quote upper','were wire tree try your route poet','query quite pure pour tire retire','yellow typewriter power query upper'],
    sentences:['We type quite well.','Write your own query.','Your upper row requires gentle reaches.','The quiet writer will type a proper quote.'],
    paragraphs:['Reach to the top row with the correct finger and return to the home row. Keep your wrist relaxed and avoid looking down at the keys.','We write quite well when we use the correct fingers. Read a little ahead, keep a steady rhythm, and focus on clean keystrokes.']
  },
  bottom: {
    keys:['zxcv bnm,','z x c v b n m','zx cv bn nm','zxcv vcxz bnm mnb'],
    words:['zoo zero zoom box civic cave move name minimum','van cabin brave next mix comma number','combine become maximum cinema zinc','move box; mix; name; brave;'],
    sentences:['Zack can move a box.','Come and mix the items.','Brave men move boxes carefully.','Use the bottom row, then return home.'],
    paragraphs:['Move one finger down to the bottom row, press the key, and return. Keep the other fingers relaxed near their home positions.','Zack can move a box and mix the items. Name each object as you type. Small, accurate movements help you build speed without tension.']
  },
  numbers: {
    keys:['12345 67890','1 2 3 4 5 6 7 8 9 0','1122 3344 5566 7788 9900','12 34 56 78 90'],
    words:['2026 12345 67890 25% $50 9:30','100 250 500 750 1000','12-08-2026 08:45 98.6','PIN 2048 total 1750'],
    sentences:['Room 4 is on floor 2.','Call at 9:30 and arrive by 10:15.','The score is 85% after 12 minutes.','Enter 24 correct answers and review 3 errors.'],
    paragraphs:['Numbers appear in dates, forms, scores, and reports. Keep your fingers anchored and use the correct reach for each number.','The practice score is 85% after 12 minutes. Enter 24 correct answers, review 3 errors, and try again at 9:30. Accuracy matters when typing figures.']
  },
  punctuation: {
    keys:['; : , . / ? !','shift capital letters','( ) - _ = +','"quotes" and apostrophe \''],
    words:['Practice daily, calm, ready, improve!','sentence; colon: comma, full stop.','question? exclaim! quote "text"','well-known re-enter user_name'],
    sentences:['Practice daily, stay calm, and improve.','Are you ready to begin?','Yes, I am; let us practise!','Use capitals, commas, and full stops correctly.'],
    paragraphs:['Use the opposite hand to press Shift when comfortable. Keep punctuation attached to the correct word, and type one space after sentence-ending punctuation.','Typing improves with daily practice. Read ahead, use capital letters and punctuation carefully, and maintain a comfortable rhythm.']
  },
  mixed: {
    keys:['the quick brown fox','asdf qwer zxcv','jkl; uiop bnm,','home row then top and bottom'],
    words:['the and you that have with from this','quick brown fox jumps lazy dog','typing practice accuracy rhythm control','screen hands fingers posture focus'],
    sentences:['The quick brown fox jumps over the lazy dog.','A steady pace helps me type with care.','Keep your eyes on the screen, not your hands.','Correct words first; speed will follow.'],
    paragraphs:['Good typing comes from accurate word groups rather than isolated key presses. Keep spaces consistent, look ahead, and practise the keys that cause repeated mistakes.','A steady pace helps me type with care. I focus on correct words, spaces, and punctuation instead of rushing. With regular practice, my accuracy becomes reliable and my speed improves naturally.']
  }
}

const lessonSpecs = [
  ['orientation','Keyboard & finger placement','Starter','Posture · Home row','A S D F · J K L ;','Learn posture, finger zones, and the home position before typing.','Sit upright, relax your shoulders, keep wrists neutral, feel the F/J bumps, and return each finger to its home key. / सीधे बैठें, कंधे ढीले रखें, F/J के उभार पहचानें और हर उँगली को अपनी होम की पर वापस लाएँ।','home'],
  ['home-keys','Home Row: Key Familiarity','Beginner','ASDF · JKL;','A S D F · J K L ;','Build muscle memory on the home row.','Left fingers rest on A S D F; right fingers on J K L ;. Feel the raised bumps on F and J.','home'],
  ['home-words','Home Row: Word Drills','Beginner','Home-row words','A S D F · J K L ;','Join home-row keys into accurate words.','Use a light touch and return fingers to home position after each reach.','home'],
  ['home-sentences','Home Row: Sentence Drills','Beginner','Home-row sentences','A S D F · J K L ;','Build a calm rhythm using home-row sentences.','Do not chase speed yet; aim for repeated clean attempts.','home'],
  ['top-keys','Top Row: Key Familiarity','Beginner','QWERTY · UIOP','Q W E R T · Y U I O P','Reach upward with the assigned finger.','Move only the finger needed, then return to the home row.','top'],
  ['top-words','Top Row: Word Drills','Beginner','Top-row words','Q W E R T · Y U I O P','Combine top-row keys into common words.','Keep your palms quiet; avoid lifting the whole hand.','top'],
  ['top-sentences','Top Row: Sentence Drills','Beginner','Top-row sentences','QWERTY · UIOP','Type connected sentences with steady rhythm.','Read a word ahead and keep your eyes on the passage.','top'],
  ['bottom-keys','Bottom Row: Key Familiarity','Beginner','ZXCV · BNM','Z X C V · B N M','Reach downward while maintaining hand position.','Move the assigned finger down and return immediately.','bottom'],
  ['bottom-words','Bottom Row: Word Drills','Beginner','Bottom-row words','Z X C V · B N M','Build accuracy on bottom-row word patterns.','Accuracy comes before speed; keep the other fingers relaxed.','bottom'],
  ['bottom-sentences','Bottom Row: Sentence Drills','Beginner','Bottom-row sentences','ZXCV · BNM','Use bottom-row keys in complete sentences.','Keep each movement small and controlled.','bottom'],
  ['number-row','Number Row & Symbols','Beginner+','Numbers · symbols','1 2 3 4 5 6 7 8 9 0','Practise digits, dates, and common symbols.','Use the correct finger for each number; use Shift for upper symbols.','numbers'],
  ['shift-punctuation','Shift & Punctuation','Beginner+','Capital letters · punctuation','Shift · . , ? ! : ;','Use capitals and punctuation reliably.','Use the opposite hand’s Shift key where comfortable.','punctuation'],
  ['mixed-keys','Mixed Key Patterns','Intermediate','All keyboard rows','Full keyboard','Switch between rows without losing rhythm.','Return to home position between reaches.','mixed'],
  ['common-words','Common Words & Spacing','Intermediate','Words · spacing','All letters · Space','Type common words as units and space consistently.','Do not add spaces before punctuation.','mixed'],
  ['sentence-flow','Sentence Flow','Intermediate','Sentence rhythm','Capital letters · punctuation','Maintain a steady pace across full sentences.','Avoid rushing the first few words and slowing down later.','mixed'],
  ['paragraphs','Paragraph Endurance','Intermediate+','Long-form typing','Full keyboard','Maintain accuracy across longer passages.','Relax shoulders, read ahead, and review recurring mistakes.','mixed'],
  ['numbers-data','Numbers & Data Entry','Intermediate+','Dates · amounts · decimals','Number row','Type structured numbers carefully.','Check separators, decimal points, and date order.','numbers'],
  ['punctuation-flow','Punctuation in Context','Intermediate+','Punctuation flow','Shift · punctuation','Use punctuation naturally inside paragraphs.','Keep commas, apostrophes, and sentence endings precise.','punctuation'],
  ['speed-control','Speed & Accuracy Control','Advanced','Fluency','Full keyboard · timed practice','Increase speed without losing accuracy.','Raise your target gradually after consistent accurate attempts.','mixed'],
  ['exam-practice','Exam-style Passage','Advanced','Exam readiness','Full keyboard','Practise longer passages under a steady pace.','Aim for consistent accuracy before attempting a timed exam.','mixed']
]

function buildExerciseSet(bankName, stageId, source, lessonIndex) {
  const rowPatterns = {
    home: ['asdf jkl;', 'a s d f j k l ;', 'asdf fdsa jkl; ;lkj', 'fj dk sl a;', 'as df jk l;', 'a s d f ; l k j', 'asdf jkl; asdf jkl;', 'a;s d;f j;k l;'],
    top: ['qwer uiop', 'q w e r u i o p', 'qwer trew uiop poiu', 't y t y g h', 'r t y u f g h j', 'qwer asdf uiop jkl;', 'qwert yuiop', 'tftf yjyj g h'],
    bottom: ['zxcv bnm', 'z x c v b n m', 'zx cv bn nm', 'v b n m c x z', 'zxcv asdf bnm jkl;', 'b n b n v c', 'zxcv vcxz bnm mnb', 'b n g h'],
    numbers: ['12345 67890', '1 2 3 4 5 6 7 8 9 0', '12 34 56 78 90', '1122 3344 5566 7788 9900'],
    punctuation: ['; : , . / ?', 'shift capital letters', '( ) - _ = +', '"quotes" and apostrophe \''],
    mixed: ['asdf qwer zxcv', 'jkl; uiop bnm,', 'the quick brown fox', 'home row then top and bottom']
  }
  const homeWords = ['sad dad ask fall flask lass salad', 'all ask add fall lad flask dad', 'as ask alas salad flask', 'a sad lad asks dad', 'fall ask; dad; flask;', 'jaja fafa dada sasa lala', 'add all; ask dad; fall;', 'as sad as dad;']
  const rowWordSets = {
    home: homeWords,
    top: ['type write quiet power tower quote upper', 'were wire tree try your route poet', 'query quite pure pour tire retire', 'try yet quite write type', 'we were quite quiet', 'your query is quite pure'],
    bottom: ['zoo zero zoom box civic cave move name minimum', 'van cabin brave next mix comma number', 'combine become maximum cinema zinc', 'move box mix name brave', 'cab can ban man van', 'zinc zone maze box'],
    numbers: ['2026 12345 67890 25% $50 9:30', '100 250 500 750 1000', '12-08-2026 08:45 98.6', 'PIN 2048 total 1750'],
    punctuation: ['Practice daily, calm, ready, improve!', 'sentence; colon: comma, full stop.', 'question? exclaim! quote "text"', 'well-known re-enter user_name'],
    mixed: ['the and you that have with from this', 'quick brown fox jumps over lazy dog', 'typing practice accuracy rhythm control', 'screen hands fingers posture focus']
  }
  const patterns = rowPatterns[bankName] || rowPatterns.mixed
  const words = rowWordSets[bankName] || rowWordSets.mixed
  let base = stageId === 'keys' ? patterns : stageId === 'words' ? words : source
  if (stageId === 'sentences') base = source.length ? source : ['Type slowly and accurately.']
  if (stageId === 'paragraph') base = source.length ? source : ['Practise with care and keep your fingers in the correct position.']
  const exercises = []
  for (let i = 0; i < 24; i++) {
    let text = base[(i + lessonIndex) % base.length]
    if (stageId === 'keys' && bankName === 'home') {
      const patternsHome = ['asdf jkl;', 'as df jk l;', 'asdf fdsa', 'jkl; ;lkj', 'a s d f j k l ;', 'asdf jkl; asdf', 'fj dk sl a;', 'asjk l;as l;df', 'fdsa jkl; asdf', 'a s d f ; l k j', 'gh gh gh', 'f g h j', 'd g h k', 'g h g h', 'asdf gh jkl;', 't y b n', 't y t y b n b n', 'f g h j t y b n', 'asdf qwer jkl; uiop', 'zxcv bnm,', 'asdf gh; jkl;', 'qwer asdf zxcv', 'tgyh bnhy', 'asdf jkl; gh ty bn']
      text = patternsHome[i]
    } else if (stageId === 'keys' && bankName === 'top') {
      const top = ['qwer uiop', 't y t y', 'r t y u', 'f g h j', 't y g h', 'qwert yuiop', 'q w e r t y u i o p', 'tftf yjyj', 'rtyu fghj', 'asdf qwer jkl; uiop', 'gh ty bn', 't y b n', 'tgb yhn', 'qwer asdf uiop jkl;', 'qaz wsx edc rfv', 'ft gy hy ju', 'qwert asdf zxcv', 'yuiop jkl; bnm,', 'f g h j t y', 't y t y g h g h', 'qwer trew uiop poiu', 'asdfgh jkl;', 'qwerty uiop', 'the quick type']
      text = top[i]
    } else if (stageId === 'keys' && bankName === 'bottom') {
      const bottom = ['zxcv bnm', 'z x c v b n m', 'b n b n', 'v b n m', 'zxcv asdf bnm jkl;', 'b n g h', 'zxcv vcxz bnm mnb', 'b n b n v c', 'asdf gh jkl;', 'qwer asdf zxcv', 't y b n', 'b n b n', 'z x c v m n', 'zxcv bnm,', 'cvbn mnbv', 'zxcv asdf qwer', 'gh ty bn', 'f g h j b n', 'z x c v b n m ,', 'v f b j n m', 'bottom row then home', 'zxcv bnm, zxcv', 'b n m b n m', 'all rows: asdf qwer zxcv']
      text = bottom[i]
    } else if (['words', 'sentences', 'paragraph'].includes(stageId)) {
      text = base[(i + lessonIndex * 2) % base.length]
      if (stageId === 'words' && i % 3 === 0) text = text + ' ' + base[(i + 1) % base.length]
    }
    exercises.push(text)
  }
  return exercises
}

const stageNames = [['keys','Keys & Patterns'],['words','Words'],['sentences','Sentences'],['paragraph','Paragraph']]
export const lessons = lessonSpecs.map(([id,title,level,row,keys,goal,tip,bankName], idx) => {
  const bank = BANKS[bankName]
  const stages = stageNames.map(([sid,label], stageIdx) => {
    const source = bank[sid] || (sid === 'paragraph' ? bank.paragraphs : bank.sentences) || bank.sentences
    const exercises = buildExerciseSet(bankName, sid, source, idx)
    return { id:sid, label:`${stageIdx+1}. ${label}`, type:label, exercises, target:exercises[0] }
  })
  return {id,title,level,row,keys,goal,tip,stages}
})

export const totalExercises = lessons.reduce((sum,l)=>sum+l.stages.reduce((n,s)=>n+s.exercises.length,0),0)
let activeLesson = lessons[0].id
let activeStage = 'keys'
let exerciseIndex = 0
let startedAt = 0
let soundEnabled = localStorage.getItem('ag-learn-sound') !== 'off'
let tickHandle = null
let audioCtx = null
function currentLesson(){return lessons.find(l=>l.id===activeLesson)||lessons[0]}
function currentStage(lesson=currentLesson()){return lesson.stages.find(s=>s.id===activeStage)||lesson.stages[0]}
function currentDrill(){const s=currentStage();return s.exercises[exerciseIndex%s.exercises.length]}
function currentTarget(){const drill=currentDrill();return Array.from({length:40},(_,i)=>drill).join(' ')}
function sound(kind='key'){
  if(!soundEnabled)return
  try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended')audioCtx.resume(); const osc=audioCtx.createOscillator(), gain=audioCtx.createGain(); const now=audioCtx.currentTime; osc.type='sine'; osc.frequency.value=kind==='error'?180:kind==='complete'?880:kind==='correct'?620:340; gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(kind==='key'?.025:.06,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+(kind==='error'?.12:.075));osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.14)}catch{}
}
function stageResult(target,typed,elapsedMs){let correct=0,errors=0;for(let i=0;i<typed.length;i++){if(typed[i]===target[i])correct++;else errors++}const minutes=Math.max(elapsedMs/60000,1/60);const words=typed.trim()?typed.trim().split(/\s+/).length:0;return{correct,errors,wpm:Math.round(words/minutes),accuracy:typed.length?Math.round(correct/typed.length*100):100,completed:typed.length>=target.length,elapsedMs,words}}
function stagePassed(result,target){return result.completed&&result.accuracy>=90&&target.length>0}
function showLearnCompletionModal(result, lesson, stage, exerciseIndex) {
  let modal = document.querySelector('#learn-completion-modal')
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'learn-completion-modal'
    modal.className = 'learn-completion-modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('aria-labelledby', 'learn-completion-title')
    document.body.appendChild(modal)
  }
  const stages = lesson.stages
  const stageIndex = stages.findIndex(s => s.id === stage.id)
  const lastExercise = exerciseIndex >= stage.exercises.length - 1
  const lastStage = stageIndex >= stages.length - 1
  const lessonIndex = lessons.findIndex(l => l.id === lesson.id)
  const lastLesson = lessonIndex >= lessons.length - 1
  const lessonFinished = lastExercise && lastStage
  const nextLabel = !lastExercise ? 'Next Exercise →' : !lastStage ? 'Next Practice Type →' : !lastLesson ? 'Next Lesson →' : 'Finish Course'
  modal.innerHTML = `<div class="learn-completion-card"><div class="learn-completion-symbol">${result.accuracy >= 90 ? '✓' : '↻'}</div><h2 id="learn-completion-title">${result.accuracy >= 90 ? (lessonFinished ? 'Lesson Complete!' : 'Exercise Complete!') : 'Practice Result'}</h2><p class="learn-completion-subtitle">${escapeHtml(lesson.title)} · ${escapeHtml(stage.title || stage.type || 'Practice')}</p><div class="learn-completion-metrics"><div><small>Gross WPM</small><strong>${result.wpm}</strong></div><div><small>Accuracy</small><strong>${result.accuracy}%</strong></div><div><small>Correct</small><strong>${result.correct}</strong></div><div><small>Errors</small><strong>${result.errors}</strong></div><div><small>Words</small><strong>${result.words}</strong></div><div><small>Time</small><strong>${(result.elapsedMs / 1000).toFixed(1)}s</strong></div></div><p class="learn-completion-note">${result.accuracy >= 90 ? (lessonFinished ? 'All exercises in this lesson are complete.' : 'Your result has been recorded for this attempt.') : 'You can retry this exercise to improve accuracy, or continue to the next exercise. Results below 90% will not count as a passed stage.'}</p><div class="learn-completion-actions"><button type="button" class="secondary-button" id="learn-completion-retry">Retry Exercise</button><button type="button" class="primary-button" id="learn-completion-next">${nextLabel}</button></div></div>`
  modal.hidden = false
  document.body.classList.add('learn-modal-open')
  modal.querySelector('#learn-completion-retry')?.addEventListener('click', () => {
    modal.hidden = true
    document.body.classList.remove('learn-modal-open')
    document.querySelector('#learn-reset')?.click()
  }, { once: true })
  modal.querySelector('#learn-completion-next')?.addEventListener('click', () => {
    modal.hidden = true
    document.body.classList.remove('learn-modal-open')
    document.querySelector('#learn-check')?.click()
  }, { once: true })
}
function progressMarkup(lesson,progress){const c=lessonCompletion(lesson,progress);return `<div class="learn-progress-track"><span style="width:${c.percent}%"></span></div><div class="learn-progress-label"><span>${c.done}/${c.total} stages passed</span><strong>${c.percent}%</strong></div>`}
export function renderLessons(){
 const progress=readLessonProgress(), overallDone=lessons.reduce((n,l)=>n+lessonCompletion(l,progress).done,0), totalStages=lessons.reduce((n,l)=>n+l.stages.length,0), lesson=currentLesson(), stage=currentStage(lesson), stageIndex=lesson.stages.findIndex(s=>s.id===stage.id), unlocked=stageIsUnlocked(lesson,stageIndex,progress), target=currentTarget(), completion=progress[lesson.id]?.stages?.[stage.id], lessonIndex=lessons.findIndex(l=>l.id===lesson.id)
 const stageLabels=['1 Key','Patterns','Words','Sentences']
 return `<div class="learn-hub learn-focus-mode learn-reference-layout">
 <aside class="learn-curriculum"><div class="learn-brand"><span class="learn-brand-mark">T</span><strong>AG Typing Tutor</strong></div><button class="learn-home-link" id="learn-home-button">⌂ <span>Home</span></button><h2>Learn</h2><div class="learn-course-list">${lessons.map((l,i)=>{const c=lessonCompletion(l,progress);return `<button class="learn-course-item ${l.id===lesson.id?'selected':''}" data-course-lesson="${l.id}"><span class="learn-course-number">${c.percent===100?'✓':'○'}</span><span class="learn-course-copy"><strong>${escapeHtml(l.title)}</strong><small>${escapeHtml(l.row)}</small></span><span class="learn-course-chevron">${c.done}/${c.total}</span></button>`}).join('')}</div><div class="learn-overall-progress"><div class="learn-progress-label"><span>Course Progress</span><strong>${Math.round(overallDone/totalStages*100)}%</strong></div><div class="learn-progress-track"><span style="width:${Math.round(overallDone/totalStages*100)}%"></span></div><small>${overallDone} of ${totalStages} lessons completed</small></div></aside>
 <main class="learn-reference-main"><header class="learn-reference-topbar"><div class="learn-breadcrumb"><strong>${escapeHtml(lesson.title)}</strong><span>›</span><span>Exercise ${exerciseIndex+1}</span></div><div class="learn-stage-tabs">${lesson.stages.map((s,i)=>{const done=Boolean(progress[lesson.id]?.stages?.[s.id]?.completed),can=stageIsUnlocked(lesson,i,progress);return `<button class="learn-stage-tab ${s.id===stage.id?'active':''} ${done?'passed':''}" data-course-stage="${s.id}" ${can?'':'disabled'}><span>${done?'✓':i+1}</span><strong>${escapeHtml(stageLabels[i]||s.type)}</strong></button>`}).join('')}</div><button class="learn-focus-button" id="learn-focus-toggle" title="Focus mode">⛶</button></header>
 <div class="learn-reference-body"><section class="learn-reference-practice"><div class="learn-passage learn-direct-typing" id="learn-passage" role="textbox" tabindex="0" aria-label="Typing practice line. Click here and type directly on the highlighted text">${escapeHtml(target)}</div><textarea class="learn-typing-input learn-typing-input-proxy" id="learn-typing-input" maxlength="${target.length}" rows="1" aria-label="Typing input proxy" spellcheck="false" autocapitalize="off" autocomplete="off" ${unlocked?'':'disabled'}></textarea><div class="learn-header-keyboard"><div id="learn-keyboard">${renderKeyboard(target[0]||'')}</div></div><div class="learn-finger-illustration" aria-label="Hands and next finger guide"><div class="learn-hand-image-wrap"><img class="learn-real-hands" src="${handsGuideUrl}" alt="Both hands for touch typing"><span class="learn-finger-marker" id="learn-finger-marker" aria-label="Next finger"></span></div></div><div class="learn-result-message" id="learn-result-message" aria-live="polite"></div><div class="learn-exercise-actions"><button class="secondary-button" id="learn-reset">Reset</button><button class="primary-button" id="learn-check" disabled>Next Exercise →</button></div><div class="learn-stage-history" id="learn-stage-history">${completion?.completed?`Best result: ${completion.bestWpm} WPM · ${completion.bestAccuracy}% accuracy`:'Ready to practise'}</div></section>
 <aside class="learn-reference-stats"><section class="learn-stat-card learn-time-card"><div class="learn-stat-title">◷ <span>Time</span></div><strong id="learn-time">00:00</strong><button id="learn-pause" title="Pause timer" aria-label="Pause timer">Ⅱ</button></section><div class="learn-stat-pair"><section class="learn-stat-card"><div class="learn-stat-title green">◉ <span>WPM</span></div><strong id="learn-wpm">0</strong></section><section class="learn-stat-card"><div class="learn-stat-title red">◎ <span>Accuracy</span></div><strong id="learn-accuracy">100%</strong></section></div><section class="learn-stat-card"><div class="learn-stat-title blue">▤ <span>Words</span></div><strong><span id="learn-word-count">0</span> / <span id="learn-target-word-count">${target.trim().split(/\s+/).length}</span></strong></section><section class="learn-stat-card"><div class="learn-stat-title blue">⌨ <span>Characters</span></div><strong><span id="learn-progress-count">0</span> / ${target.length}</strong></section><section class="learn-stat-card learn-progress-card"><div class="learn-progress-track"><span id="learn-live-progress" style="width:0%"></span></div><strong id="learn-progress-percent">0%</strong></section><section class="learn-stat-card learn-errors-card"><div class="learn-stat-title red">Errors</div><strong id="learn-errors">0</strong></section></aside></div></main></div>`
}
export function bindLessonActions(onRerender = () => {}) {
  const input = document.querySelector('#learn-typing-input')
  if (!input) return
  document.querySelector('#learn-home-button')?.addEventListener('click', () => { document.querySelector('[data-page="home"]')?.click() })
  let started = false
  let lastResult = null
  const lesson = currentLesson()
  const stage = currentStage(lesson)
  const target = currentTarget()
  input.setAttribute('maxlength', String(target.length))
  input.setAttribute('rows', '1')
  input.placeholder = ''
  const passageSurface = document.querySelector('#learn-passage')
  passageSurface?.addEventListener('click', () => input.focus({ preventScroll: true }))
  passageSurface?.addEventListener('keydown', event => { if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') { input.focus({ preventScroll: true }) } })
  input.setAttribute('aria-hidden', 'true')
  input.setAttribute('tabindex', '-1')
  // The visible passage is the typing surface; this invisible textarea captures keyboard input for reliable cross-browser typing.
  document.querySelector('#learn-keyboard')?.addEventListener('click', event => {
    const keyEl = event.target.closest('.virtual-key')
    if (!keyEl || input.disabled || timerPaused || autoSubmitted) return
    const key = keyEl.dataset.key
    if (key === 'BACKSPACE') { input.value = input.value.slice(0, -1); input.dispatchEvent(new Event('input', { bubbles: true })); return }
    if (key === ' ' || (typeof key === 'string' && key.length === 1 && !['TAB','CAPS','ENTER','SHIFT','CTRL','OPTION','COMMAND'].includes(key.toUpperCase()))) {
      if (input.value.length < target.length) { input.value += key; input.dispatchEvent(new Event('input', { bubbles: true })) }
    }
    input.focus({ preventScroll: true })
  })

  const fingerFor = key => {
    const map = {
      q:'Left pinky',a:'Left pinky',z:'Left pinky',w:'Left ring',s:'Left ring',x:'Left ring',e:'Left middle',d:'Left middle',c:'Left middle',r:'Left index',f:'Left index',v:'Left index',t:'Left index',g:'Left index',b:'Left index',
      y:'Right index',h:'Right index',n:'Right index',u:'Right index',j:'Right index',m:'Right index',i:'Right middle',k:'Right middle',o:'Right ring',l:'Right ring',p:'Right pinky',';':'Right pinky',',':'Right middle','.':'Right ring','/':'Right pinky',' ':'Thumb / अंगूठा'
    }
    return map[String(key || ' ').toLowerCase()] || 'Assigned finger / सही उँगली'
  }
  // Render the target characters once, then update only the changed character classes.
  // Rebuilding hundreds of spans on every keypress caused lag for fast typists.
  let passageNodes = null
  const renderPassage = typed => {
    const el = document.querySelector('#learn-passage')
    if (!el) return
    if (!passageNodes || passageNodes.length !== target.length || passageNodes[0]?.parentElement !== el) {
      el.innerHTML = Array.from(target, ch => `<span>${escapeHtml(ch === '\n' ? '↵' : ch)}</span>`).join('')
      passageNodes = Array.from(el.children)
      el.dataset.renderedLength = String(target.length)
    }
    const currentIndex = Math.min(typed.length, target.length - 1)
    const previousIndex = currentIndex - 1
    // Update the previous and current characters, not the entire passage.
    for (const i of [previousIndex, currentIndex]) {
      if (i < 0 || i >= passageNodes.length) continue
      const node = passageNodes[i]
      node.className = i < typed.length ? (typed[i] === target[i] ? 'char-correct' : 'char-incorrect') : (i === typed.length ? 'char-current' : '')
    }
    // Correctness can change on deletion; keep any visible typed range in sync.
    if (typed.length < (el.dataset.lastTypedLength || 0)) {
      for (let i = typed.length; i < Math.min(Number(el.dataset.lastTypedLength), passageNodes.length); i++) {
        passageNodes[i].className = i === typed.length ? 'char-current' : ''
      }
    }
    el.dataset.lastTypedLength = String(typed.length)
    const current = passageNodes[currentIndex]
    if (current) {
      const desired = current.offsetLeft + current.offsetWidth / 2 - el.clientWidth / 2
      el.scrollLeft = Math.max(0, desired)
    }
  }
  let lastKeyboardKey = null
  const update = () => {
    const typed = input.value
    const elapsed = started ? Date.now() - startedAt : 0
    const result = stageResult(target, typed, elapsed)
    document.querySelector('#learn-wpm').textContent = result.wpm
    document.querySelector('#learn-accuracy').textContent = `${result.accuracy}%`
    document.querySelector('#learn-errors').textContent = result.errors
    document.querySelector('#learn-progress-count').textContent = Math.min(typed.length, target.length)
    const wordCount = typed.trim() ? typed.trim().split(/\s+/).length : 0
    const targetWordCount = target.trim() ? target.trim().split(/\s+/).length : 0
    const wordCountEl = document.querySelector('#learn-word-count'); if (wordCountEl) wordCountEl.textContent = wordCount
    const targetWordCountEl = document.querySelector('#learn-target-word-count'); if (targetWordCountEl) targetWordCountEl.textContent = targetWordCount
    const pct = Math.round(Math.min(typed.length, target.length) / target.length * 100)
    const liveProgress = document.querySelector('#learn-live-progress'); if (liveProgress) liveProgress.style.width = `${pct}%`
    const livePct = document.querySelector('#learn-progress-percent'); if (livePct) livePct.textContent = `${pct}%`
    const timeEl = document.querySelector('#learn-time'); if (timeEl) { const seconds = Math.floor(elapsed / 1000); timeEl.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` }
    const nextKey = target[typed.length] || ' '
    const finger = fingerFor(nextKey)
    const marker = document.querySelector('#learn-finger-marker')
    const fingerPositions = {
      'Left pinky': [9.5, 25], 'Left ring': [18.5, 12], 'Left middle': [26.5, 4], 'Left index': [35.5, 11],
      'Thumb / अंगूठा': [54, 56], 'Right index': [64.5, 11], 'Right middle': [73.5, 4], 'Right ring': [82, 12], 'Right pinky': [91, 25]
    }
    const markerPosition = fingerPositions[finger] || fingerPositions['Left index']
    if (marker) { marker.style.left = `${markerPosition[0]}%`; marker.style.top = `${markerPosition[1]}%`; marker.title = `Next finger: ${finger}`; marker.setAttribute('aria-label', `Next finger: ${finger}`) }
    const keyToHighlight = nextKey === '\n' ? 'ENTER' : nextKey === ' ' ? ' ' : nextKey
    const keyboard = document.querySelector('#learn-keyboard')
    if (keyboard && keyToHighlight !== lastKeyboardKey) {
      keyboard.innerHTML = renderKeyboard(keyToHighlight)
      lastKeyboardKey = keyToHighlight
    }
    renderPassage(typed)
    // Keep the caret and the text being entered visible around the centre of the typing field.
    const fontSize = parseFloat(getComputedStyle(input).fontSize) || 20
    const charWidth = fontSize * 0.61
    input.scrollLeft = Math.max(0, typed.length * charWidth - input.clientWidth / 2 + charWidth / 2)
    const check = document.querySelector('#learn-check')
    if (check) { check.disabled = !result.completed; check.textContent = result.completed ? 'Next Exercise →' : 'Next Exercise →' }
    const msg = document.querySelector('#learn-result-message')
    if (result.completed) msg.textContent = result.accuracy >= 90 ? `Complete! ${result.accuracy}% accuracy. Click Finish drill to move on. / पूरा! अब आगे बढ़ें।` : `Accuracy is ${result.accuracy}%. Reset and try again; target is 90%. / शुद्धता 90% से कम है, फिर प्रयास करें।`
    else if (result.errors) msg.textContent = `${result.errors} character error(s). Keep going; correct the line by resetting if needed. / ${result.errors} गलत अक्षर। अभ्यास जारी रखें।`
    else msg.textContent = ''
    lastResult = result
  }
  let autoSubmitted = false
  let timerPaused = false
  let pausedAt = 0
  document.querySelector('#learn-pause')?.addEventListener('click', () => {
    timerPaused = !timerPaused
    const btn = document.querySelector('#learn-pause')
    if (timerPaused) { pausedAt = Date.now(); input.readOnly = true; btn.textContent = '▶'; btn.title = 'Resume timer' }
    else { if (started && pausedAt) startedAt += Date.now() - pausedAt; pausedAt = 0; input.readOnly = false; btn.textContent = 'Ⅱ'; btn.title = 'Pause timer'; input.focus() }
  })
  input.addEventListener('input', () => {
    if (timerPaused) return
    if (!started) { started = true; startedAt = Date.now() }
    update()
    const pos = input.value.length - 1
    sound(pos >= 0 && input.value[pos] === target[pos] ? 'correct' : 'error')
    if (input.value.length >= target.length && !autoSubmitted) {
      autoSubmitted = true
      const result = stageResult(target, input.value, Date.now() - startedAt)
      const msg = document.querySelector('#learn-result-message')
      if (msg) msg.innerHTML = `<strong>${result.accuracy >= 90 ? 'Exercise complete / अभ्यास पूरा' : 'Practice result / अभ्यास परिणाम'}</strong> · ${result.wpm} WPM · ${result.accuracy}% accuracy · ${result.correct} correct · ${result.errors} errors · ${(result.elapsedMs / 1000).toFixed(1)}s`
      const check = document.querySelector('#learn-check')
      if (check) { check.disabled = false; check.textContent = 'Continue →' }
      if (result.accuracy >= 90) saveLessonResult(lesson.id, stage.id, { ...result, passed: true, repetitions: 40 })
      showLearnCompletionModal(result, lesson, stage, exerciseIndex)
      sound('complete')
    }
  })
  document.querySelector('#learn-reset')?.addEventListener('click', () => {
    input.value = ''; started = false; startedAt = 0; lastResult = null; autoSubmitted = false; passageNodes = null; lastKeyboardKey = null; update(); input.focus()
  })
  document.querySelector('#learn-sound-toggle')?.addEventListener('click', e => {
    soundEnabled = !soundEnabled
    localStorage.setItem('ag-learn-sound', soundEnabled ? 'on' : 'off')
    e.currentTarget.textContent = soundEnabled ? '🔊 Sound on' : '🔇 Sound off'
    e.currentTarget.setAttribute('aria-pressed', String(soundEnabled))
    if (soundEnabled) sound('correct')
  })
  document.querySelector('#learn-check')?.addEventListener('click', () => {
    if (!lastResult?.completed) return
    const isLast = exerciseIndex >= stage.exercises.length - 1
    if (!isLast) {
      exerciseIndex++
      onRerender()
      return
    }
    if (lastResult.accuracy >= 90) saveLessonResult(lesson.id, stage.id, { ...lastResult, passed: true, repetitions: 40 })
    const stageIndex = lesson.stages.findIndex(s => s.id === stage.id)
    if (stageIndex < lesson.stages.length - 1) {
      activeStage = lesson.stages[stageIndex + 1].id
      exerciseIndex = 0
      onRerender()
      return
    }
    const lessonIndex = lessons.findIndex(l => l.id === activeLesson)
    if (lessonIndex < lessons.length - 1) {
      activeLesson = lessons[lessonIndex + 1].id
      activeStage = 'keys'
      exerciseIndex = 0
      onRerender()
    } else {
      document.querySelector('#learn-result-message').textContent = 'Course section complete! Excellent work. / यह कोर्स सेक्शन पूरा हुआ!'
      document.querySelector('#learn-check').disabled = true
    }
  })
  document.querySelector('#learn-focus-toggle')?.addEventListener('click', () => {
    document.querySelector('.learn-hub')?.classList.toggle('learn-focus-mode')
    const active = document.querySelector('.learn-hub')?.classList.contains('learn-focus-mode')
    document.querySelector('#learn-focus-toggle').textContent = active ? '⤢ Exit focus mode / बाहर निकलें' : '⛶ Full-screen practice / पूर्ण स्क्रीन'
    if (active) input.focus()
  })
  document.querySelectorAll('[data-course-lesson]').forEach(button => button.addEventListener('click', () => {
    activeLesson = button.dataset.courseLesson; activeStage = 'keys'; exerciseIndex = 0; onRerender()
  }))
  document.querySelectorAll('[data-course-stage]').forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return
    activeStage = button.dataset.courseStage; exerciseIndex = 0; onRerender()
  }))
  document.querySelector('#learn-prev-lesson')?.addEventListener('click', () => {
    const i = lessons.findIndex(l => l.id === activeLesson)
    if (i > 0) { activeLesson = lessons[i - 1].id; activeStage = 'keys'; exerciseIndex = 0; onRerender() }
  })
  document.querySelector('#learn-next-lesson')?.addEventListener('click', () => {
    const i = lessons.findIndex(l => l.id === activeLesson)
    if (i < lessons.length - 1) { activeLesson = lessons[i + 1].id; activeStage = 'keys'; exerciseIndex = 0; onRerender() }
  })
  update()
  if (!input.disabled) input.focus({ preventScroll: true })
  if (tickHandle) clearInterval(tickHandle)
  tickHandle = setInterval(() => { if (started && !timerPaused) update() }, 500)
}
