const { log } = console
const { readFileSync, writeFileSync, readFile } = require('fs')
const { arch } = require('os')

const kjv = readFileSync('kjv.txt', 'utf8')
let paragraphs = readFileSync('paras.txt', 'utf8').split('\r\n')
    .filter(x => x.includes('¶') && !x.includes('[')).map(x => x.split(' ', 3).join(' ').replace('¶', '').trim())
    
paragraphs = paragraphs.slice(0, paragraphs.length - 1) 

const verses = kjv.split('\r\n')
const hverses = readFileSync('WLC.txt', 'utf8').split('\r\n')
const gverses = readFileSync('STR.txt', 'utf8').split('\r\n')

const hverse = (book, chap, verse) => {
    let hverse = hverses.find(v => v.startsWith(`${book.toUpperCase()} ${chap}:${verse} `))
    if (!hverse) return ''
    return `<span class='h'>${hverse.replace(/^([\w\d]+) (\d+)\:(\d+) (.*)$/, '$4').trim()}</span>`
}

const gverse = (book, chap, verse) => {
    let gverse = gverses.find(v => v.startsWith(`${book.toUpperCase()} ${chap}:${verse} `))
    if (!gverse) return ''
    return `<span class='g'>${gverse.replace(/^([\w\d]+) (\d+)\:(\d+) (.*)$/, '$4').trim()}</span>`
}

const books = ['Ge', 'Joh']//, 'Ex', 'Le', 'Nu', 'De', 'Mt', 'Mr', 'Lu', 'Joh'] //, 'Re'] // [...new Set(verses.map(v => v.split(' ')[0].trim()))]


const titles = {
    Ge: ['Genesis', 'The First Book of Moses Called'],
    Ex: ['Exodus'],
    Le: ['Leviticus'],
    Nu: ['Numbers'],
    De: ['Deuteronomy'],
    Mt: ['Matthew', 'The Gospel According to'],
    Mr: ['Mark', 'The Gospel According to'],
    Lu: ['Luke', 'The Gospel According to'],
    Joh: ['John', 'The Gospel According to'],
}

const sectionHeadings = {
    Ge: {
        1: {
            1: 'First Day &ndash; Dark and Light',
            6: 'Second Day &ndash; The Firmament',
            9: 'Third Day &ndash; Sea and Land',
            14: 'Fourth Day &ndash; Sun, Moon and Stars',
            20: 'Fifth Day &ndash; Fish and Fowl',
            24: 'Sixth Day &ndash; Man and Beast'
        }
    },
    Ex: { 20: { 1: 'The Ten Commandments' } },
    Le: { 17: { 1: 'The Day of Atonement' } },
    De: { 28: { 1: 'Blessings and Curses' } },
    Mt: {
        4: { 1: 'The Wilderness Temptation' },
        5: { 3: 'The Beattitudes' }
    },
    Lu: { 3: { 1: 'Geneology of Jesus' } },
    Joh: {
        1: { 1: 'The Word in the Beginning' },
        3: { 1: 'Wedding in Cana' }
    }
}

const chapterTitles = {
    Ge: { 
        1: 'The Creation of the Universe',
        2: 'The Garden of Eden',
        3: 'The Fall of Man',
        4: 'Cain and Abel',
        5: 'The Generations of Adam',
        6: 'The Great Flood',
        28: "Jacob's Ladder"
    },
    Mt: { 1: 'Son of Abraham and David' },
    Jon: { 1: 'In the Beginning' }
}

const pics = {
    Ge: {
        1: 'https://assets.answersingenesis.org/img/cms/content/contentnode/header_image/days-of-creation-updated.jpg',
        6: 'https://wp-media.patheos.com/blogs/sites/582/2016/08/Dove_Sent_Forth_from_the_Ark.png',
    },
    Ex: { 20: 'https://media.swncdn.com/cms/BST/66419-moses-ten-commandments-gettyimages-zu09.1200w.tn.jpg' },
    Joh: { 1: 'https://www.enlightiumacademy.com/blog/images/easyblog_images/557/b2ap3_amp_Bible_Inspired_Word.png' }
}

const chapters = book => parseInt(verses.filter(v => v.startsWith(book + " ")).slice(-1)[0].split(' ')[1].trim())

const title = book => {
    const [name, lead] = titles[book] || [book, book]
    return `
        ${lead ? `<h4>${lead}</h4>` : ''}
        <h1 id='${book}' href='#top' title='${name}'>${name}</h1>
`
}

const header = book => `
<!doctype html>
<head>
    <title>KJVM - ${book}</title>
    <meta charset='utf8'/>
    <link href='style.css' rel='stylesheet' />
    <script src='script.js'></script>
</head>
<body>
    <main id='top'>
`

const update = (text, find, replace) => 
    text.replace(new RegExp(`\\b(${find}\\b)`, 'gi'), 
    (_, $1) => `<a title='${$1}'>${$1[0] === find[0].toUpperCase() ? replace[0].toUpperCase() : replace[0].toLowerCase()}${replace.slice(1)}</a>`)

const format = text => {
    text = text.replace(/\[(.*?)\]/g, `<i>$1</i>`)
    text = text.replace(/\b(Son of )?God\b/g, ($0) => `<em\tclass='${$0.includes('Son') ? '' : 'g'}'>${$0}</em>`)
    text = text.replace(/\bFather\b/g, "<em\tclass='f'>Father</em>")
    text = text.replace(/\b(the Lord|LORD)\b/g, ($0) => `${$0.toLowerCase().includes('the') ? 'the ' : ' '}<em\tclass='y'>${$0.replace(/the/g, '').trim()}</em>`)
    text = text.replace(/\bJEHOVAH\b/g, "<em\tclass='y'>Jehovah</em>")
    text = text.replace(/\b(Holy)? (Spirit|Ghost)\b/g, ($0) => `<em\tclass='s'>${$0}</em>`)
    text = text.replace(/\b(Jesus|JESUS)(Christ)?\b/g, ($0) => `<em\tclass='j'>${$0}</em>`)
    return text
}

// const words = [...new Set(verses.map(v => v.replace(/^[\w\d]+ \d+\:\d+ (.*)$/, '$1').replace(/[^ \w]/g, '').split(' ').map(x => x)).flat())]
// writeFileSync('words.txt', words.join(' '), 'utf8')

const words = readFileSync('words.txt', 'utf8').split(' ') 
const archaics = words.filter(w => /e(st|th)$/i.test(w))
const blacklist = ['youngest']

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
    let updates = {
        'th(?:ee|ou)': 'you',
        'unto': 'to',

        'thy': 'your',
        'thine': 'your',
        'mine': 'my',
        'thyself': 'yourself',

        'wast': 'were',
        'art': 'are',
        'hast': 'have',
        'hath': 'has',
        'wilt': 'will',
        'shal[lt]': 'will',
        'dost': 'do',
        'doth': 'does',
        'aileth': 'ails',
        'saith': 'says',
        'didst': 'did',
        'doest': 'do',
        'goest': 'go',
        'saidst': 'said',
        'blasphemeth': 'blasphemes',
        'dureth': 'endures',
        'hideth': 'hides',
        'buyeth': 'buys',
        
        'yea': 'yes',
        'nay': 'no',
        'midst': 'middle',
        'peradventure': 'perhaps', 
        'wroth': 'angry',
        'countenance': 'face',
        'raiment': 'clothing',
        'kine': 'cattle',
        'wot': 'know',
        'hence': 'here',
        'hither': 'here',
        'wither': 'where',
        'whence': 'where',
        'thence': 'there',
        'thither': 'there',
        'to day': 'today',
        'wherefore': 'for what reason',
        'yesternight': 'last night',
        'whosoever': 'whoever',
        'whoso': 'whoever',
        'whomsoever': 'whoever',
        'corn': 'grain',
        'an hungred': 'hungry',
        'Esaias': 'Isaiah',
        'brethren': 'brothers',
        'anon': 'soon',
        'by and by': 'soon',

        'whiles': 'while',
        'twain': 'two',
        'wherewithal': 'with what',
        'not where': 'nowhere',
        'hewn': 'cut',
        'whithersoever': 'wherever',
        'rent': 'tear',
        'bridegroom': 'groom',
        'bridechamber': 'wedding party',
        'oft': 'often',
        'whatsoever': 'whatever',
        'verily': 'truly',
        'whereunto': 'to what',

        'salute': 'greet',
        'shew': 'show',
        'shewed': 'showed',
        'hearken': 'listen',
        'hearkened': 'listened',
        'builded': 'built',
        'slay': 'kill',
        'slain': 'killed',
        'slew': 'killed',
        'spake': 'spoke',
        'forgat': 'forgot',
        'begat': 'begot'
   }

    Object.entries(updates).forEach(([old, new_]) => text = update(text, old, new_))

    // Modernize verb forms -eth -est etc.
    let twords = text.replace(/[^ \w]/gi, '').split(' ')
    twords.forEach(w => archaics.includes(w) ? text = update(text, w, dearchaicize(w)) : null) 

   return text
}

const nums = { 
    zero: 0, one: 1, two: 2, three: 3, four: 4,
    five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, 
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, 
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, 
    thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, 
    ninety: 90, hundred: '00', thousand: '000'
}

const numericize = text => {
    Object.entries(nums).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\b(${k})\\b`, 'gi'), v)
    })
    
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

const deandize = text => {
    return text.replace(/^and (.*)$/i, (_, $1) => 
        `<sub\tclass='a'>${$1[0].toUpperCase()}${$1.slice(1)}</sub>`)
}

const quote = text => text.replace(/\, ([A-Z].*?)(\:\s*|\.|\?)/g, ($0, $1, $2) => 
    $1.includes(' ') ?
    `, <q\tclass='b ${/[Vv]erily(.*)|I say to you(.*)|(saith)?(.*)(Angel of the LORD|LORD God|LORD|Jesus|JESUS|God)(.*)(answered|says|said|spoke|saying)/.test(text) ? 'r' : ''}'>${$1}${$2}</q>` 
    : $0)

const diefy = text => /God|LORD|Lord/.test(text) ? 
    text.replace(/\bh(e|is|im|imself)\b/g, `<a\ttitle='Pronouns of Diety capitalized'>H$1</a>`) 
    : text

// const revneg = text => text.replace(/\b(\w+) not\b/gi, (_, $1) => `not ${$1}`)

const bquote = text => {
    return text.replace(/(it is written, )(.*)/gi, (_, $1, $2) => `${$1}<blockquote>${$2.replace(/<q.*?>(.*?)<\/q>/gi, '$1')}</blockquote>`)
}

const sectionHeading = (book, chap, verse) => {
    let heading = sectionHeadings[book] && sectionHeadings[book][chap] && sectionHeadings[book][chap][verse]
    if (!heading) return ''
    return `<h3>${heading}</h3>`
}

const verse = (book, chapter, num) => {
    let text = verses.find(v => v.startsWith(`${book} ${chapter}:${num} `))
    text = text.replace(`${book} ${chapter}:${num} `, '').trim()
    let orig = text

    // text = revneg(text)
    text = quote(text)
    text = format(text)
    text = modernize(text)
    text = numericize(text)

    // Drop Caps
    if (num === 1) {
        const [first, ...rest] = text.split(' ')
        text = `<big>${first[0]}</big>${first.slice(1)} ${rest.join(' ')}`
    }

    text = deandize(text)
    text = diefy(text)

    let hasPara = paragraphs.includes(`${book} ${chapter}:${num}`)
    return `                ${sectionHeading(book, chapter, num)}${hasPara ? '</p><p>' : ''}
                            ${['Ge'].includes(book) ? hverse(book, chapter, num) : ''}
                            ${['Joh'].includes(book) ? gverse(book, chapter, num) : ''}
                            <span><sup id='${book}_${chapter}_${num}'>${num}</sup>${/it is written,/.test(text) ? bquote(text) : text}</span>
`
}

const chapter = (book, num) => {
    let cverses = verses.filter(v => v.startsWith(`${book} ${num}:`))
    let pic = pics[book] && pics[book][num] || ''
    let chapterTitle = chapterTitles[book] && chapterTitles[book][num] || ''

    return `
        <a href='#${book}' title='Go back to ${book}'><h2 id='${book}_${num}' title='Chapter ${num}'>${num}</h2></a>
        <article>
            <ol class='h'>
            ${pic ? `<div style='background-image: url("${pic}")' class='bg'></div>` : ''}
            ${chapterTitle ? `<h5>${chapterTitle}</h5>` : ''}
            <p>
${cverses.map((v, i) => verse(book, num, (i + 1))).join('')}
            </p>
            </ol>
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
fullHtml = fullHtml.replace(/<script(.*)><\/script>/gi, `<script>${readFileSync('html/script.js', 'utf8')}</script>`)
fullHtml += '<h2>Contents</h2><ul>'

for (const book of books) 
    fullHtml += `<li class='c'><a href='#${book}' title='${book}'>${titles[book][0]}</a></li>`
fullHtml += "</ul>"

for (const book of books) {
    log(`Writing ${book}...`)
    let head = header(book)
    let html = head 
    html += title(book) 

    const chapterCount = chapters(book)

    html += '<ul style="display: inline-block">'
    for (let chap = 1; chap <= chapterCount; chap++) 
        html += `<li><a href='#${book}_${chap}' title='${book} ${chap}'>${chap}</a></li>`
    html += '</ul>'

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
