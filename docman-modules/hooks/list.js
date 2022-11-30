// docman-hook-list
// Unorder list of h2 titles.

const jsdom = require('jsdom')

const HooksUtils = require('./hooks-utils')


var dom = new jsdom.JSDOM()
var document = dom.window.document


function feed(hook, hookMarkdown) {
	if (hook == undefined || hookMarkdown == undefined) {
		return undefined
	}

	var h2s = hookMarkdown.getElementsByTagName('h2')

	var maps = []
	for (var idx = 0; idx < h2s.length; idx += 1) {
		var h2 = h2s[idx]
		h2.id = h2.textContent.replace(/\s*/g, '')  // remove blank space
		maps.push({
			name: h2.textContent,
			href: `#${h2.id}`
		})
	}

	var ul = document.createElement('ul')
	for (var idx = 0; idx < maps.length; idx += 1) {
		var map = maps[idx]

		var li = document.createElement('li')
		var a = document.createElement('a')

		a.href = map.href
		a.innerHTML = map.name
		li.appendChild(a)
		ul.appendChild(li)
	}

	HooksUtils.feed(hook, ul.outerHTML)
}


module.exports = feed
