const Jsdom = require('jsdom')


const dom = new Jsdom.JSDOM()
const document = dom.window.document


function getLiUl(li) {
	var ul = li.querySelector('ul')
	if (ul == undefined) {
		ul = document.createElement('ul')
		li.appendChild(ul)
	}
	return ul
}


function createLi(text=undefined, href=undefined) {
	var li = document.createElement('li')
	if (text != undefined) {
		var a = document.createElement('a')
		a.innerHTML = text
		a.href = href
		li.appendChild(a)
	}
	return li
}


function render(markdown) {
	var hs = markdown.querySelectorAll('h1,h2,h3,h4,h5,h6')
	var level = {'H1': 0, 'H2': 1, 'H3': 2, 'H4': 3, 'H5': 4, 'H6': 5}
	var lis = [document.createElement('li'), undefined, undefined, undefined, undefined, undefined]
	var lastLevel = -1
	var cnt = 0
	for (var idx = 0; idx < hs.length; idx += 1) {
		var h = hs[idx]
		var currentLevel = level[h.tagName]
		if (currentLevel < lastLevel) {
			var ul = getLiUl(lis[currentLevel])
			var text = h.textContent
			var href = `#h-${cnt}`
			h.id = `h-${cnt}`
			var li = createLi(text, href)
			ul.appendChild(li)
			lis[currentLevel+1] = li
		}
		else if (currentLevel == lastLevel) {
			var ul = getLiUl(lis[currentLevel])
			var text = h.textContent
			var href = `#h-${cnt}`
			h.id = `h-${cnt}`
			var li = createLi(text, href)
			ul.appendChild(li)
			lis[currentLevel+1] = li
		}
		else if (currentLevel > lastLevel) {
			for (var lev = lastLevel + 1; lev < currentLevel; lev += 1) {
				var ul = getLiUl(lis[lev])
				var li = createLi()
				ul.appendChild(li)
				lis[lev+1] = li
			}
			var ul = getLiUl(lis[currentLevel])
			var text = h.textContent
			var href = `#h-${cnt}`
			h.id = `h-${cnt}`
			var li = createLi(text, href)
			ul.appendChild(li)
			lis[currentLevel+1] = li
		}
		cnt += 1
		lastLevel = currentLevel
	}
	return getLiUl(lis[0]).outerHTML
}


module.exports = {
	name: 'docman-hook-list',
	scope: 'local',
	after: ['docman-hook-markdown'],
	hook: {
		id: 'docman-hook-list',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['docman-hook-markdown']
}
