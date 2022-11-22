// docman-hook-markdown

const fs = require('fs')
const showdown = require('showdown')

const HooksUtils = require('./hooks-utils')


function feed(hook, mdPath) {
	if (hook == undefined) {
		return undefined
	}

	// Read markdown file.
	var mdRaw = fs.readFileSync(mdPath, "utf8")
	// Convert markdown to html.
	var converter = new showdown.Converter({tables: true, strikethrough: true})
	var mdHtml = converter.makeHtml(mdRaw)
	// Insert html to virtual dom.
	HooksUtils.feed(hook, mdHtml)

	// Set click <a> open a new tab.
	var aElements = hook.getElementsByTagName('a')
	for (var idx = 0; idx < aElements.length; idx += 1) {
		aElements[idx].target = '_blank'
	}
}


module.exports = feed
