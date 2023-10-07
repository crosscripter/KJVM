window.addEventListener('load', () => {
    const $ = sel => Array.from(document.querySelectorAll(sel))

    $('q').forEach(x => x.title = 'Quotations added for clarity')
    $('q.r').forEach(x => x.title = 'Words of God in red in both testaments')
    $('em.y').forEach(x => x.title = 'YHVH the most holy name of God')
    $('em.g').forEach(x => x.title = 'Elohim the one true triune God')
    $('span i').forEach(x => x.title = 'Added words for translation clarity are shown in italics')
    // $('sub.a').forEach(x => x.title = 'And removed for readability')
    // $('sub.p').forEach(x => x.title = 'Plural in original language')

    const colors = [
        "AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "BlanchedAlmond", "Blue",
        "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk",
        "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki",
        "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue",
        "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey",
        "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod",
        "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender",
        "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow",
        "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray",
        "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine",
        "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise",
        "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive",
        "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed",
        "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown",
        "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue",
        "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet",
        "Wheat", "WhiteSmoke", "Yellow", "YellowGreen" 
    ]


    let state = { }

    const save = () => localStorage.setItem('kjvm-state', JSON.stringify(state))

    const load = () => {
        let item = localStorage.getItem('kjvm-state') 
        state = JSON.parse(item ? item : JSON.stringify({
            int: false,
            quotes: true,
            red: true,
            modern: true,
            tetra: true,
            para: true,
            verses: false,
            keys: false,
            ands: true,
            dark: true,
            read: true,
            audio: true,
            full: false
        }))

        state.audio = true
        state.read = true
        return state
    }

    window.load = load
    window.save = save
    state = load()
    console.log('state', state)

    const loading = f => {
        let body = $('body')[0]
        body.style.cursor = 'progress'
        body.style.opacity = 0.3

        setTimeout(() => {
            f()
            body.style.opacity = 1
            body.style.cursor = 'default'
        }, 0)
    }

    const toggleInterlinear = e => {
        $('span.g, span.h').forEach(x => x.style.display = state.int ? 'block' : 'none')
    }

    let quotes = $('q')[0] && $('q')[0].style && $('q')[0].style.quotes || ''
    const toggleQuotes = e => {
        $('q').forEach(x => {
            x.classList[state.quotes ? 'add' : 'remove']('b') 
            x.style.quotes = state.quotes ? quotes : '"" "" "" ""'
        })
    }
  
    // let el = $('q.r')[0]
    // let red = el && el.style && el.style.color || 'unset' 
    const toggleRedLetters = e => {
        $('q.r').forEach(x => x.style.color = state.red ? '#800000' : 'unset')
    }

    const toggleModernize = e => {
        $('a.u[title]').forEach(x => {
            let temp = x.innerText
            x.innerText = x.title
            x.title = temp
        })
    }

    const toggleTetra = e => {
        $('em.y').forEach(x => x.classList[state.tetra ? 'add' : 'remove']('y'))
        if (state.tetra) {
            $('em').forEach(x => x.classList[x.innerText === 'LORD' ? 'add' : 'remove']('y'))
        }
    }

    let indent = $('p')[0].style.textIndent
    const toggleParagraphs = e => {
        $('span.v').forEach(x => x.style.display = state.para ? 'inline' : 'block')
        $('p').forEach(x => {
            x.style.display = state.para ? 'block' : 'inline'
            x.style.textIndent = state.para ? indent : 0
        })
    }

    const toggleVerseNums = e => {
        $('sup.v').forEach(x => x.style.display = state.verses ? 'inline' : 'none')
    }

    const toggleAnds = e => {
        $('sub.a').forEach(x => {
            x.innerText = state.ands ?  x.innerText.replace(/^And /, '').trim() : 'And ' + x.innerText
            // $('sub').forEach(x => x.classList[e.target.innerText.startsWith('And ') ? 'add' : 'remove']('a'))
        })
    }

    const toggleDark = e => {
        $('html')[0].classList.toggle('dark')
    }

    const getAudio = (book, index, chap) => {
        index = ('00'+index).slice(-2)
        let chapter = ('000'+chap).slice(-3)
        return `http://server.firefighters.org/kjv/projects/firefighters/kjv_web/${index}_${book}/${index}${book}${chapter}.mp3` 
    }

    let player = $('#player')[0]

    const toggleAudio = e => {
        player.classList.toggle('playing')
        let book = player.dataset.book
        let chapter = window.location.hash.split('_')[1] || 1
        let index = parseInt(player.dataset.index, 10)
        player.src = getAudio(book, index, chapter)
        player.onloadedmetadata = function() {

            console.log(`loading audio for ${book} chapter ${chapter}`, player.src)
            let options = player.parentElement
            options.style.height = (state.audio ? 34 : 100) + 'px'

            let dimmer, scroller
            let dim = () => dimmer = setTimeout(() => options.style.opacity = !state.audio ? 0.1 : 1, 3000)
            let undim = e => options.style.opacity = 1

            clearTimeout(dimmer)
            clearInterval(scroller)
            options.removeEventListener('mouseleave', dim)
            options.removeEventListener('mouseenter', undim)

            if (!state.audio) {
                options.addEventListener('mouseleave', dim)
                options.addEventListener('mouseenter', undim)
            }

            let delay = 1000 
            let verses = parseInt($('span.v:last-of-type')[0].id.split('_').slice(-1)[0], 10)
            let duration = player.duration || verses 
            let timeout = duration / verses 
            console.log('delay', delay, 'verses', verses, 'duration', duration, 'timeout', timeout)

            if (!state.audio) {
                player.play() 
                let bk = getBook()
                let chapter = window.location.hash.split('_')[1] || 1

                setTimeout(() => {
                    let offset = 0.1;
                    let fv = $(`#${bk}_${chapter}`)[0]
                    fv.scrollIntoView({ behavior: 'smooth', block: 'end' }) 
                    let pos = fv.offsetTop / 2
                    console.log('pos', pos)

                    scroller = setInterval(() => {
                        if (state.audio) clearInterval(scroller)
                        window.scrollTo({ top: pos += offset })
                        // console.log('pos', pos)
                       if (player.currentTime === player.duration) clearInterval(scroller)
                    }, timeout)
                }, delay)
            }
            else {
                clearInterval(scroller)
                player.pause()
            }
        }
    }

    const doc = document.documentElement;

    const openFullscreen = () => {
        if (doc.active && doc.requestFullscreen) {
            doc.requestFullscreen();
        } else if (doc.webkitRequestFullscreen) { 
            doc.webkitRequestFullscreen();
        } else if (doc.msRequestFullscreen) { 
            doc.msRequestFullscreen();
        }
    }

    const closeFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { 
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    const toggleFullscreen = e => {
        if (state.full) {
            document.body.style.width = '70ch';
            closeFullscreen();
        } else {
            openFullscreen();
            document.body.style.width = '70%';
        }
    }


    const read = e => {
        console.log('initializing speech engine...')
        document.body.style.cursor = 'progress' 
        $('#readBtn')[0].disabled = true

        $('span.v').slice(0, 3).forEach((x, i, xs) => {
            const msg = new SpeechSynthesisUtterance();

            let rateValue = parseFloat($('#rate')[0].value || 1)
            console.log('selected rate', rateValue) 
            msg.rate = rateValue 

            let pitches = ['low', 'normal', 'high']
            let pitch = pitches.indexOf($('#pitch')[0].value || 'normal')
            msg.pitch = pitch 
            console.log('selected pitch', pitch) 

            let voiceIndex = parseInt($('#voice')[0].value, 10)
            msg.voice = voices[voiceIndex || 0]
            console.log('selected voice', voiceIndex)

            msg.text = x.innerText.replace('\n', ' ').replace(/^\#\d+/g, '').trim().replace(/^\d+/g, '')
            console.log('selected text: "' + msg.text + '"')

            msg.onstart = () => {
                document.body.style.cursor = 'default' 
                console.log('speaking:', msg.text)

                $('.selected').forEach(x => x.classList.remove('selected'))
                console.log('selecting verse', x.id)
                $(`#${x.id}, #${x.id} q`).forEach(v => v.classList.add('selected'))
                x.scrollIntoView({ behavior: 'smooth', block: 'center' })//  inline: 'center' })
                
                if (i === xs.length - 1) {
                    msg.onend = () => {
                        $('.selected').forEach(x => x.classList.remove('selected'))
                        $('#readBtn')[0].disabled = false 
                    }
                }
            }

            window.speechSynthesis.speak(msg)
        })
    }

    let voices = []
    const loadVoices = () => {
        let wait = setInterval(() => {
            if (voices.length > 0) {
                clearInterval(wait)
                console.log(voices.length, 'voice(s) available')
                $('#voice')[0].innerHTML = voices.map((v, i) => `<option ${i === 0 ? 'selected' : ''} value="${i}">${v.name}</option>`)
                $('#readBtn')[0].disabled = false  
           }
        else voices = window.speechSynthesis.getVoices();
        }, 2000)
    }
    loadVoices()

    $('#readBtn')[0].addEventListener('click', e => {
        if (!state.read) read()
    })

    const toggleRead = e => { 
        options.style.height = (state.read ? 34 : 100) + 'px'
        $("#readers")[0].classList.toggle('reading')
    }

    const toggleKeys = e => {
        $('span.v').forEach(x => {
            if (state.keys) {
                state.quotes = true
                $('#quotes')[0].click()
                state.int = true
                $('#int')[0].click()
            }

            let rank = parseInt(x.dataset.rank, 10)
            let els = $(`#${x.id}, #${x.id} q`)
            const percentage = (partialValue, totalValue) => (100 * partialValue) / totalValue;

            if (rank) {
                let op = 1.0 - (percentage(rank, 9989) / 10)
                op = op < 0 ? 0.1 : op
                els.forEach(e => {
                    e.style.opacity = state.keys ? op : 1
                    let i = Math.floor(Math.random() * colors.length);    
                    let icon = `<i title='#${rank}' class='fas fa-key icon' style="${/_1$/.test(x.id) ? "margin-right:1rem;" : ""}display:${state.keys ? "inline" : 'none'}></i>`
                    e.innerHTML = `${state.keys ? `${icon}${rank <= 100 ? `<mark style="text-shadow:0px 0px 10px ${colors[i]}">` : ''}${e.innerHTML.replace(icon, '')}${rank <= 100 ? '</mark>' : ''}` : e.innerHTML}`
                })
            } else {
                if (state.keys) {
                    x.style.filter = 'blur(1px)'
                    x.style.opacity = 0.1
                } else {
                    x.style.filter = 'none'
                    x.style.opacity = 1.0
                }
            }
        })
    }

    const handlers = {
        int: toggleInterlinear,
        quotes: toggleQuotes,
        red: toggleRedLetters,
        modern: toggleModernize,
        tetra: toggleTetra,
        para: toggleParagraphs,
        verses: toggleVerseNums,
        keys: toggleKeys, 
        ands: toggleAnds,
        dark: toggleDark,
        read: toggleRead,
        audio: toggleAudio,
        full: toggleFullscreen,
    }

    Object.entries(handlers).forEach(([k, v]) => {
        const toggle = (flip=true) => {
            if (flip) state[k] = !state[k]
            loading(v)
            $(`#${k}`)[0].style.opacity = state[k] ? 1 : 0.1
            save()
        }
       
        if (!state[k]) toggle(false) 
        $('#' + k)[0].addEventListener('click', e => toggle())
     })

    $('#options')[0].style.visibility = 'visible' 

    // Smooth scrolling anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault()
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' })
        })
    })

    $(".listButton").forEach(el => el.addEventListener('click', (e) => {
        e.target.parentElement.classList.toggle('collapsed')
    }))

    const getBook = () => 
        window.location.pathname.replace(window.location.hash, '')
            .split('/').slice(-1)[0]
            .replace('.html', '').trim()

    let chapterSelect = false
    let selector = $('.selector')[0]
    let html = selector.innerHTML

    const chapters = (book, count) => {
        let html = ''
        for (let i = 1; i <= count; i++) html += `<a href='#${book}_${i}'>${i}</a>`
        return html
    }

    window.addEventListener('hashchange', e => {
        let book = getBook()
        let hashBook = window.location.hash.split('_')[0].replace(/^\#/g, '').trim()

        if (book !== hashBook) {
            console.log('book', book, 'clicked book', hashBook)
            window.location.href = `${hashBook}.html${window.location.hash}`
        }
    })

    const selectClick = e => {
        if (chapterSelect) {
            chapterSelect = false
            $('.selector a').forEach(x => x.removeEventListener('click', selectClick))
            selector.innerHTML = html 
            $('.selector a').forEach(x => x.addEventListener('click', selectClick))

       } else {
            e.preventDefault()
            chapterSelect = true
            $('.selector a').forEach(x => x.removeEventListener('click', selectClick))
            selector.innerHTML = chapters(e.target.innerText, parseInt(e.target.dataset.chapters, 10))
            $('.selector a').forEach(x => x.addEventListener('click', selectClick))
        }
    }

    $('.selector a').forEach(x => x.addEventListener('click', selectClick))

    $('span.h, span.g').forEach(x => {
        x.addEventListener('mouseenter', e => {
            let [book, chap, verse] = x.id.split('_', 3)
            let tbl = $(`#${book}_${chap}_${verse}_t`)[0]
            if (!tbl) return
            let disp = tbl.style.display
            tbl.style.display = disp === 'none' ? 'table' : 'none'
        })

        x.addEventListener('mouseleave', e => {
            let [book, chap, verse] = x.id.split('_', 3)
            let tbl = $(`#${book}_${chap}_${verse}_t`)[0]
            tbl.style.display = 'none' 
        })
    })

    $("span.v").forEach(x => x.addEventListener('dblclick', e => {
        if (!state.int) $('span.h, span.g').forEach(x => x.style.display = 'none')
        let heb = $(`#${x.id}_h`)[0]
        let grk = $(`#${x.id}_g`)[0]
        if (!heb && !grk) return
        if (heb) heb.style.display = heb.style.display === 'block' ? 'none' : 'block'
        if (grk) grk.style.display = grk.style.display === 'block' ? 'none' : 'block'
    }))

    $("span.h, span.g").forEach(x => x.addEventListener('dblclick', e => {
        if (!state.int) $('span.h, span.g').forEach(x => x.style.display = 'none')
    }))

    $('span.v').forEach(x => {
        state.quotes = true
        $('#quotes')[0].click()
        let rank = parseInt(x.dataset.rank, 10)
        let els = $(`#${x.id}, #${x.id} q`)
        const percentage = (partialValue, totalValue) => (100 * partialValue) / totalValue;

        if (rank) {
            let op = 1.0 - (percentage(rank, 9989) / 10)
            op = op < 0 ? 0.1 : op
            els.forEach(e => {
                e.style.opacity = op
                let i = Math.floor(Math.random() * colors.length);     // returns a random integer from 0 to 9
                e.innerHTML = `<i title='#${rank}' class='fas fa-key icon' style="${/_1$/.test(x.id) ? "margin-right:1rem;" : ""}"></i>${rank <= 100 ? `<mark style="text-shadow:0px 0px 10px ${colors[i]}">` : ''}${e.innerHTML}${rank <= 100 ? '</mark>' : ''}`
            })
        } else {
            x.style.filter = 'blur(1px)'
            x.style.opacity = 0.1
        }
    })
})

