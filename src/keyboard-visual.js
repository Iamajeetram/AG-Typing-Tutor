const rows = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','BACKSPACE'],
  ['TAB','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['CAPS','a','s','d','f','g','h','j','k','l',';',"'",'ENTER'],
  ['SHIFT','z','x','c','v','b','n','m',',','.','/','SHIFT'],
  ['CTRL','OPTION','COMMAND','SPACE','COMMAND','OPTION','←','↑','↓','→']
]
const fingerClass = {
  '`':'finger-pinky','1':'finger-pinky','2':'finger-ring','3':'finger-middle','4':'finger-index','5':'finger-index','6':'finger-index','7':'finger-index','8':'finger-middle','9':'finger-ring','0':'finger-pinky','-':'finger-pinky','=':'finger-pinky',
  q:'finger-pinky',a:'finger-pinky',z:'finger-pinky',w:'finger-ring',s:'finger-ring',x:'finger-ring',e:'finger-middle',d:'finger-middle',c:'finger-middle',r:'finger-index',f:'finger-index',v:'finger-index',t:'finger-index',g:'finger-index',b:'finger-index',y:'finger-index',h:'finger-index',n:'finger-index',u:'finger-index',j:'finger-index',m:'finger-index',i:'finger-middle',k:'finger-middle',o:'finger-ring',l:'finger-ring',p:'finger-pinky',';':'finger-pinky',"'":'finger-pinky',',':'finger-middle','.':'finger-ring','/':'finger-pinky'
}
export function renderKeyboard(active = '') {
  const key = String(active || '').toLowerCase()
  return `<div class="touch-keyboard" aria-label="On-screen keyboard">${rows.map((row, ri) => `<div class="keyboard-row row-${ri}">${row.map(k => {
    const normalized = k.toLowerCase()
    const cls = [fingerClass[normalized] || '', (normalized === key || normalized === String(key).toLowerCase() || (String(key).toUpperCase() === k) || (key === ' ' && k === 'SPACE')) ? 'key-active' : '', ['BACKSPACE','TAB','CAPS','ENTER','SHIFT','CTRL','OPTION','COMMAND','SPACE','←','↑','↓','→'].includes(k) ? 'key-wide' : ''].filter(Boolean).join(' ')
    const fingerNo = ({'finger-pinky':'5','finger-ring':'4','finger-middle':'3','finger-index':'2'})[fingerClass[normalized]] || (k === 'SPACE' ? '1' : ''); const fingerLabel = ({'finger-pinky':'Pinky / छोटी उँगली','finger-ring':'Ring / अनामिका','finger-middle':'Middle / मध्यमा','finger-index':'Index / तर्जनी'})[fingerClass[normalized]] || (k === 'SPACE' ? 'Thumb / अंगूठा' : 'Control key'); return `<span class="virtual-key ${cls}" data-key="${k === 'SPACE' ? ' ' : k}" title="${fingerLabel}"><span>${k === 'SPACE' ? 'Space' : k}</span>${fingerNo ? `<small class="key-finger-badge">${fingerNo}</small>` : ''}</span>`
  }).join('')}</div>`).join('')}<div class="keyboard-legend"><span><i class="legend-finger finger-pinky"></i>Pinky</span><span><i class="legend-finger finger-ring"></i>Ring</span><span><i class="legend-finger finger-middle"></i>Middle</span><span><i class="legend-finger finger-index"></i>Index</span></div></div>`
}
