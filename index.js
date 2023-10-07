(async () => {

const { log } = console
const axios = require('axios')
const cheerio = require('cheerio')
const { readFileSync, writeFileSync } = require('fs')

/* Constants */
let hindex = 0
const encoding = 'utf8'
const hebletters = 'אבגדהוזחטיכלמנסעפצקרשת' 

/* Data Files */
const load = name => readFileSync(`text/${name}.txt`, encoding).replace(/\r\n/g, '\n').split('\n')

let { books, pics, titles, blacklist, 
    paragraphs, archaics, words, nums, updates } = require('./data') 

words = words.split(' ')
archaics = archaics.split(' ')
paragraphs = paragraphs.split(',')

const verses = load('KJV') 
const defs = load('SC') 
const ranked = load('TVS') 
const tskes = load('TSKE') 

/* Generators */
const section = book => {
    let i = books.indexOf(book) || 0
    if (i <= 4) return 'law'
    if (i > 4 && i <= 16) return 'history'
    if (i >= 17 && i < 22) return 'wisdom'
    if (i >= 22 && i < 27) return 'major'
    if (i >= 27 && i < 39) return 'minor'
    if (i > 38 && i <= 42) return 'gospel'
    if (i === 43) return 'acts'
    if (i > 43 && i <= 56) return 'pauline'
    if (i > 56 && i < 65) return 'general'
    if (i == 65) return 'rev'
}

const selector = () => {
    return `
    <div class="selector tooltiptext">
        ${books.map((book, i) => {
            let cls = []
            cls.push(i < 39 ? 'ot' : 'nt')
            cls.push(section(book))
            return `<a href='${book}.html' data-chapters="${chapters(book)}" class="${i < 39 ? 'ot' : 'nt'} ${section(book)}" title='${titles[book][0]}'>
                ${book.slice(0,3)}
            </a>`}).join('')}
    </div>
   `
}

const options = (book) => {
return `
    <div id='options' style="visibility:hidden;">
        <i class="fas fa-book tooltip" id="book" title='Select passage'>${selector()}</i>
        <i class="fas fa-stream" id="int" title='Interlinear'></i>
        <i class="fas fa-quote-left" id="quotes" title='Quotes'></i>
        <i class="fas fa-list-ol" id="verses" title='Verse numbers'></i>
        <i class="fas fa-key" id="keys" title='Key verses only'></i>
        <i class="fas fa-font" id="ands" title='Hide Ands'></i>
        <i class="fas fa-paragraph" id="para" title="Paragraph view"></i>
        <i class="fas fa-poll-h" id="red" title="Red letters"></i>
        <i class="fas fa-magic" id="modern" title="Modernize"></i>
        <i class="fas fa-star-of-david" id="tetra" title='Show Tetragrammaton'></i>
        <i class="fas fa-play-circle" id="audio" title="Audio bible"></i>
        <i class="fas fa-head-side-cough" id="read" title="Read"></i>
        <i class="fas fa-adjust" id="dark" title='Dark mode'></i>
        <i class="fas fa-expand" id="full" title='Full screen'></i>
        <audio id='player' data-book="${titles[book] && titles[book][0].slice(0, 3)}" data-index="${books.indexOf(book) + 1}" controls></audio>
        <div id="readers">
            <label for='voice'>Voice</label>
            <select id='voice'>Loading...</select>
            <label for='rate'>Rate</label>
            <input type="range" id="rate" value='1' min="0.1" max="10" />
            <label for='pitch'>Pitch</label>
            <input type='radio' id='pitch' name="pitch" value='low' />Low
            <input type='radio' id='pitch' name="pitch" checked value='normal' />Normal
            <input type='radio' id='pitch' name="pitch" value='high' />High
            <input type='button' id='readBtn' value='Read' disabled />
        </div>
    </div>
` 
}

/* Book Generators */
const header = book => `
<!doctype html>
<head>
    <title>KJVM - ${book}</title>
    <meta charset='utf8'/>
    <link href='style.css' rel='stylesheet' />
    <script src="https://kit.fontawesome.com/f0a71f9dee.js" crossorigin="anonymous"></script>
    <script id='kjvm' src='script.js'></script>
</head>
<body>
    ${options(book)}
   <main id='top'>
`

const summary = book => {
    let summaries = readFileSync('text/summaries.txt', 'utf8').split('\n')
    let sum = summaries.find(s => s.startsWith(`${book}: `)) || ''
    return sum.replace(/^(.*): (.*)$/, '$2').replace(/•/g, '<br/><br/>•')
        .replace(/\((\d+):(\d+)\)/g, ($0, $1, $2) => `<a href="#${book}_${$1}_${$2}">${$0}</a>`)
}

const heading = (book, chap, verse) => {
    let sections = readFileSync('text/outline.txt', 'utf8').split('\r\n\r\n\r\n')
    let title = titles[book][0]
    let section = sections.find(s => s.startsWith(title + '\r\n'))
    let headings = section && section.split('\r\n').slice(1).map(x => x.trim()) || []
    let chapters = headings.filter(h => h.startsWith(chap + ':'))
    let line
    if (!verse) {
        line = chapters[0]
    } else {
        line = chapters.find(c => c !== chapters[0] && c.startsWith(`${chap}:${verse}⁠–`))
    }
    if (!line) return ''
    let text = line.split(/[a-z\d]\.\s+/).slice(-1)
    return text[0]
}

const outline = book => {
    let ohtml = readFileSync(`text/outlines/${book}.html`, 'utf8')
    ohtml = ohtml.replace(/(\d+):(\d+)/g, ($0, $1, $2) => `<a href='#${book}_${$1}_${$2}'>${$0}</a>`)
    return ohtml
}

const title = book => {
    const [name, lead] = titles[book] || [book, book]
    return `${lead ? `<h4>${lead}</h4>` : ''}
            <h1 id='${book}' href='#top' title='${name}'>${name}</h1>
`
}

/* Formatters */
const update = (text, find, replace) => 
    text.replace(new RegExp(`\\b(${find}\\b)`, 'gi'), 
    (_, $1) => `<a\tclass='u'\ttitle='${$1}'>${$1[0] === find[0].toUpperCase() ? replace[0].toUpperCase() : replace[0].toLowerCase()}${replace.slice(1)}</a>`)

const format = text => {
    text = text.replace(/\[(.*?)\]/g, `<i>$1</i>`)
    text = text.replace(/\b(Son of )?God\b/g, ($0) => `<em\tclass='${$0.includes('Son') ? '' : 'g'}'>${$0}</em>`)
    text = text.replace(/\bFather\b/g, "<em\tclass='f'>Father</em>")
    text = text.replace(/\bWord\b/g, "<em\tclass='w'>Word</em>")
    text = text.replace(/\b(the Lord|LORD)\b/g, ($0) => `${$0.toLowerCase().includes('the') ? 'the ' : ' '}<em\tclass='y'>${$0.replace(/the/g, '').trim()}</em>`)
    text = text.replace(/\bJEHOVAH\b/g, "<em\tclass='y'>Jehovah</em>")
    text = text.replace(/\b(Holy)? (Spirit|Ghost)\b/g, ($0) => `<em\tclass='s'>${$0}</em>`)
    text = text.replace(/\b(Jesus|JESUS) (Christ)?\b/g, ($0) => `<em\tclass='j'>${$0}</em>`)
    return text
}

const dearchaicize = word => {
    let case_ = word[0].toLowerCase() === word[0] ? 'lower' : 'upper'
    let oword = word
    word = word.toLowerCase()
    if (blacklist.includes(word)) return oword
    if (!archaics.includes(word)) return oword 
    if (word.endsWith('tieth')) return oword

    let root = word
    let base = word.replace(/e(st|th)/gi, '')
    if (base.length <= 1) return oword
    const lwords = words.map(w => w.toLowerCase())
    if (lwords.includes(base)) root = base
    else if (lwords.includes(base + 'e')) root = base + 'e'
    else if (base.endsWith('i') && lwords.includes(base.slice(0, -1) + 'y')) root = base.slice(0, -1) + 'y'
    else if (base.slice(-1, 1) === base.slice(-2, 1) && lwords.includes(base.slice(0, -1))) root = base.slice(0, -1)
    let suffix = ''
    if (word.endsWith('eth')) {
        suffix = 's'
        if (/[aouh]$/.test(root)) suffix = 'es'
        else if (root.endsWith('y') && !root.endsWith('ay')) {
            root = root.slice(0, -1)
            suffix = 'ies'
        }
    } 
    return root !== word ? (case_ === 'upper' ? root[0].toUpperCase() + root.slice(1) : root) + suffix : oword
}

const modernize = text => {
    // Indicate plurals
    text = text.replace(/\b(y(?:e|ou))\b/gi, (_, $1) => `<sub class='p'>${$1[0]}ou</sub>`)
    text = text.replace(/\b(your)\b/gi, (_, $1) => `<sub class='p'>your</sub>`)

    // Updates to persons, possessives, verb forms etc.
    Object.entries(updates).forEach(([old, new_]) => text = update(text, old, new_))

    // Modernize verb forms -eth -est etc.
    let twords = text.replace(/[^ \w]/gi, '').split(' ')
    twords.forEach(w => archaics.includes(w) ? text = update(text, w, dearchaicize(w)) : null) 
    return text
}

const numericize = text => {
    Object.entries(nums).forEach(([k, v]) => text = text.replace(new RegExp(`\\b(${k})\\b`, 'gi'), v))
    
    text = text.replace(/ (0+)/g, '$1')
    text = text.replace(/\ban(0+)\b/gi, '1$1')

    text = text.replace(/\b(\d+) and (\d+)\b/ig, (_, $1, $2) => _ == '2 and 2' ? _ : eval(`${$1}+${$2}`))

    text = text.replace(/\b(\d+) (\d+)\b/g, (_, $1, $2) => {
        const value = eval(`${$1}+${$2}`)
        return `<a\ttitle='Numeric words replaced for clarity'>${value}</a>`
    })

    text = text.replace(/\b1\b/gi, 'one')
    text = text.replace(/\b2\b/gi, 'two')
    text = text.replace(/\b2\b/gi, 'three')
    return text
}

const deandize = text => text.replace(/^and (.*)$/i, 
    (_, $1) => `<sub\tclass='a'>${$1[0].toUpperCase()}${$1.slice(1)}</sub>`)

const names = words.filter(w => /^[A-Z][a-z]/.test(w) && words.filter(x => x === w.toLowerCase()).length === 0).sort()

const quote = text => 
    text.replace(/\, ((?:\[[A-Z]|[A-Z]).*)(\<|\W)/g, 
        ($0, $1, $2) => {
            let wog = (/\b(LORD God|LORD|God|Jesus)(.*)(sa(?:id|ys|ying)|sp[oa]ke|answer(s|ed|ing)|called)\b/.test(text) 
                || /\bI \[?am\]? the LORD\b/.test($1)) 
                && !text.includes('hath God said') 
                && !text.includes('God hath said,')

            let block = $0.length > 50
            let tagged = $2.startsWith('<')
            // if ($1.split(' ').length === 1) return $0
            let after = $1.split(',')[0].trim()
            if (names.find(n => n === after)) return $0
            let classes = `${block ? 'b' : ''} ${wog ? 'r' : ''}`
           return `, <q\tclass='${classes}'>${$1}${tagged ? '' : $2}</q>${tagged ? $2 : ''}`
    })

const diefy = text => /God|LORD|Lord|Jesus|Christ|Son|Holy|Spirit|Father/.test(text) ? 
    text.replace(/\bh(e|is|im|imself)\b/g, ($0, $1) => `<a\tclass='u'\ttitle='${$0}'>H${$1}</a>`) 
    : text


const bquote = text => text.replace(/(it is written, )(.*)/gi, 
    (_, $1, $2) => `${$1}<blockquote>${$2.replace(/<q.*?>(.*?)<\/q>/gi, '$1')}</blockquote>`)

const sectionHeading = (book, chap, verse) => {
    let head = heading(book, chap, verse)
    if (!head) return ''
    return `<h3>${head}</h3>`
}

const language = book => books.indexOf(book) < 39 ? 'Hebrew' : 'Greek' 
const prefix = (book, chap, verse) => `${book.toUpperCase()} ${chap}:${verse} `
const refClass = (book, chap, verse) => `${book}_${chap}${verse ? `_${verse}` : ''}`
const verseText = verse => verse.replace(/^([\w\d]+) (\d+)\:(\d+) (.*)$/, '$4').trim()

const originalVerse = (book, chap, verse, text) => {
    let lang = language(book)
    let cls = lang[0].toLowerCase()
    let verses = load(lang === 'Hebrew' ? 'WLC' : 'STR')
    let overse = verses.find(v => v.startsWith(prefix(book, chap, verse)))
    if (!overse) return ''

    let info = orig(lang, book, chap, verse, text)

    let tbl = `<table id='${refClass(book, chap, verse)}_t' style="display:none;">
        <tr>${Object.keys(info && info[0] || {}).map(k => `<th>${k}</th>`).join('')}</tr>
        ${info.map((t, i) => `<tr>
                ${Object.entries(t).map(([k, v]) => `<td title='${k === 'Definition' ? v : ''}'>
                    ${k === 'Definition' ? `${v}...` : v}
                </td>`).join('')}
            </tr>`
        ).join('')}
    </table>`

    return `<span class='${cls}' id='${refClass(book, chap, verse)}_${cls}'>${verseText(overse)}${tbl}</span>`
}

const dropcap = text => {
    const [first, ...rest] = text.split(' ')
    return `<big>${first[0]}</big>${first.slice(1)} ${rest.join(' ')}`
}

const strongs = num => {
    let record = defs.find(d => d.startsWith(`"${num}"`))
    if (!record) return ''
    return record.split(',"', 5).join(' ').replace(/[\'\"\[\]]/g, '').trim() 
}

const orig = (type, book, chap, verse, text) => {
    try {
        let verses = load(`${type}/${book}`) 
        let record = verses.find(v => v.startsWith(`${book} ${chap}:${verse} `)) 
        if (!record) return text
        let info = eval(record.replace(`${book} ${chap}:${verse} `, '').trim())
        
        info.forEach(x => {
            let snum = `${type[0].toUpperCase()}${x.Strongs}`
            x.English = x.English.replace(/\[(.*?)\]/, '<i>$1</i>')
            let def = strongs(snum)
            x.Strongs = `<a class='tooltip'>${snum}<span class='tooltiptext strongs'><b>${x[type]}</b> &nbsp;&nbsp;(${x.Morphology})<hr/>${def}</span></a>`
        })

        return info 
    } catch (e) {
        return null
    }
}

const alephbet = text => {
    return text.replace(/([A-Z]{2,})\./g, ($0, $1) => $1 !== 'LORD' ? `<h5\tclass='heb'>${$1}</h5><strong>${hebletters[hindex++] || ''}</strong>` : $1)
}

const rank = (book, chapter, verse) => {
    let title = titles[book][0]
    let prefix = `${title} ${chapter}:${verse}`
    let index = ranked.findIndex(r => r === prefix)
    if (!index === undefined) return 0
    return index + 1
}

const xref = (book, chap, num) => {
    const index = books.indexOf(book) + 1
    const prefix = `${index}\t${chap}\t${num}\t`
    const recs = tskes.filter(t => t.trim().startsWith(prefix))
    if (!recs || recs.length === 0) return null 

    return Object.fromEntries(recs.map(r => {
        let [b, c, n, o, word, refs] = r.split('\t')
        return [word, refs.split(';')]
    }))
}

const bookName = r => {
    let title
    r = r.replace(/\t/g, '').trim()
    let name = r.replace(/^(\d)?([a-z]+)$/i, ($0, $1, $2) => `${$1||''}${$2[0].toUpperCase()}${$2.slice(1)}`)

    if (name.toLowerCase().trim() === 'sos') {
        name = 'Song'
        title = titles[name][0]
    } else if (books.includes(name)) {
        title = titles[name][0]
    } else {
        let book = Object.entries(titles).map(([k, v]) => ({k, v: v[0]})).find(({k, v}) => v.startsWith(name))?.k
        if (!book) return null
        name = book
        title = titles[book][0]       
    }

    return { name, title }
}

const xrefs = (book, chapter, num, text) => {
    let info = xref(book, chapter, num)
    if (!info) return text

    return Object.fromEntries(Object.entries(info).map(([phrase, refs]) => {
        return [phrase, refs.map(r => {
            let noInfo = [r.split(' ')[0].trim(), '']
            try {
                let bookInfo = bookName(r.split(' ')[0].trim())
                let { name, title } = bookInfo
                let [ch, vrs] = r.split(' ')[1].split(':')
                let startVerse = vrs.split('-')[0].split(',')[0].trim()
                let reftext = verse(name, ch, startVerse, true)
                return [`<span class='reftext'><a href="${name}.html#${ch}_${startVerse}">${name} ${ch}:${vrs}</a>`, `${reftext}</span>`]
            } catch (e) {
                return noInfo
            }
        }).join('\n')]
    }))
}

const stripHtml = html => html.replace(/<[^>]*>/g, '').trim()

const counts = (text) => { 
    let characters = text.length
    let words = text.split(/\b\s\b/g).length
    let alpha = text.replace(/\W/g, '').split('')
    let letters = alpha.length
    let vowels = alpha.filter(l => /[aeiou]/i.test(l)).length
    let consonants = alpha.filter(l => /[^aeiou]/i.test(l)).length
    return { characters, words, letters, vowels, consonants }
}

// "knew not" =>  "did not know"
// "think not" => "do not think"
// "saith ye not" => "do you not say"
// "ye would not" => "you would not"
// "we be not" => "we are not"
// "shall not the potter" => "will not the potter"
// "and is not" => "and is not"
const revneg = text => {
    return text.replace(/(\w+) not/gi, ($0, $1) => {
        let result = `not ${$1}`
        // if (/(was|were|is|are|be)/i.test($1)) result = `${$1} ${$2} ${$3}`
        // if (/(will|shall|can)/i.test($1)) result = `${$1} not ${$3}`
        // result = /s$/.test($1) ? `does not ${$1}` : `do not ${$1} ${$3}`
        return `<a style="color:#050000;" title="${$0}">${result}</a>`
    })
}

const verse = (book, chapter, num, textOnly=false) => {
    let text = verses.find(v => v.startsWith(`${book} ${chapter}:${num} `))
    if (!text) return ''
    text = text.replace(`${book} ${chapter}:${num} `, '').trim()
    let plainText = text.replace(/\[(.*?)\]/, '$1').trim()

    if (book === 'Ps' && chapter === 119) text = alephbet(text)
    
    text = quote(text)
    text = format(text)
    text = modernize(text)
    text = revneg(text)
    text = numericize(text)
    if (chapter !== 119 && num === 1) text = dropcap(text)
    text = deandize(text)
    text = diefy(text)

    if (textOnly) return stripHtml(text)

    let ranking = rank(book, chapter, num)
    let overse = originalVerse(book, chapter, num) 
    let countstr = Object.entries(counts(plainText)).map(([k, v]) => `${v} ${k}`).join(', ')
    let lit = stripHtml(orig(language(book), book, chapter, num, plainText).map(x => x.English).join(' '))
    let refs = Object.entries(xrefs(book, chapter, num) || {}).map(([phrase, refs]) => `\n<i>"${phrase}"</i>\n${refs.split(',').join(': ')}`).join('\n')
    
    let title = `<i class="fas fa-info-circle info"></i><b style="text-align:center;font-size:1rem;">${titles[book][0]} ${chapter}:${num}</b>
<u class='h'>Stats</u>${ranking ? `\n<b>Rank</b>: #${ranking} / 31,102 Verses (by popularity)` : ''}
<b>Counts</b>: ${countstr}
<u class='h'>Translation</u> 
<b>${language(book)}</b>: <span class='heb'>${stripHtml(overse).split('\n')[0].trim()}</span>

<b>Lit</b>: ${lit}

<b>KJV</b>: ${plainText}
${refs.length > 0 ? `<u class='h'>References</u>
<div class='refs'>${refs}</div>` : ''}
`.replace(/\n/g, '<br/>')

    let hasPara = paragraphs.includes(`${book} ${chapter}:${num}`)

    return `                ${sectionHeading(book, chapter, num)}${hasPara ? '</p><p>' : ''}
                            ${overse}
                            <span\tclass='v tooltip' data-rank='${ranking}' id='${refClass(book, chapter, num)}'><sup\tclass='v'\t>${num}</sup>
                            ${/it is written,/.test(text) ? bquote(text) : text}<span class='tooltiptext versetip'>${title}</span></span>
`
}

const chapters = book => parseInt(verses.filter(v => v.startsWith(book + " ")).slice(-1)[0].split(' ')[1].trim())

const chapter = (book, num) => {
    // if (num !== 1) return ''
    let cverses = verses.filter(v => v.startsWith(`${book} ${num}:`))
    let pic = pics[book] && pics[book][num] || ''
    let chapterTitle = heading(book, num)

    return `
        <a href='#${book}' title='Go back to ${book}'><h2 id='${book}_${num}' title='Chapter ${num}'>${num}</h2></a>
        <article id='art_${book}_${num}'>
            ${pic ? `<div style='background-image: url("${pic}")' class='bg'></div>` : ''}
            ${chapterTitle ? `<h5>${chapterTitle}</h5>` : ''}
            <p>
${cverses.map((v, i) => verse(book, num, (i + 1))).join('')}
            </p>
        </article>
    `
}

const footer = () => `
    </main>
</body>
</html>
`

let fullHtml = header('Bible')
fullHtml = fullHtml.replace(/<link(.*)>/gi, `<style>${readFileSync('html/style.css', 'utf8')}</style>`)
fullHtml = fullHtml.replace(/<script id='kjvm'(.*)><\/script>/gi, `<script>${readFileSync('html/script.js', 'utf8')}</script>`)

for (const book of books.slice(books.indexOf('Song'))) {
    log(`Writing ${book}...`)

    let head = header(book)
    let html = head 
    html += title(book) 

    const chapterCount = chapters(book)
    html += `<h6><a class='listButton' id="summary">Summary</a>${summary(book)}</h6>`
    html += outline(book)

    for (let chap = 1; chap <= chapterCount; chap++) {
        log(`\rWriting ${book} ${chap}...`)
        html += chapter(book, chap)
    }

    fullHtml += html.replace(head, '')
    html += footer()
    writeFileSync(`html/${book}.html`, html, 'utf8')
}

fullHtml += footer()
writeFileSync(`html/kjvm.html`, fullHtml, 'utf8')
log('Done')

})()
