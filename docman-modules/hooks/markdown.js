// Name: docman-hook-markdown

const fs = require('fs')
const path = require('path')
const showdown = require('showdown')
const katex = require('katex')

const AssetsUtils = require('../assets-utils')
const HooksUtils = require('./hooks-utils')
const GlobalDocmanConfig = require('../global/docman-config')
const GlobalVariable = require('../global/variable')


/**
 * docman-hook-markdown
 * - `hook` : docman-hook-markdown
 * - `mdPath` : Path of the markdown file.
 */
function feed(hook, mdPath) {
	if (hook == undefined) {
		return undefined
	}

	// Read markdown file.
	var mdRaw = fs.readFileSync(mdPath, "utf8")
	// Pre-render Latex.
	if (GlobalDocmanConfig.config.latex == true) {
		if (GlobalVariable.dist2DocmanKatexCss == '') {
			// Copy katex's static CSS folder.
			var from = './docman-modules/static/docman-katex'
			var to = path.join(GlobalDocmanConfig.config.outputDir, 'docman-katex')
			AssetsUtils.copyFolder(from, to)
			GlobalVariable.dist2DocmanKatexCss = './docman-katex/katex.css'
			// Import outside CSS in HTML's <head>.
			var document = GlobalVariable.dom.window.document
			var link = document.createElement('link')
			link.rel = 'stylesheet'
			link.type = 'text/css'
			link.href = GlobalVariable.dist2DocmanKatexCss
			document.head.appendChild(link)
		}
		console.log('Pre-render Latex...')
		// Pre-render Latex in $$...$$.
		mdRaw = mdRaw.replace(/\$\$[\s\S]*?\$\$/gm, function(match) {
			return katex.renderToString(match.slice(3, -3), {
				output: 'html'
			})
		})
		// Pre-render Latex in $...$.
		mdRaw = mdRaw.replace(/\$[\s\S]*?\$/gm, function(match) {
			return katex.renderToString(match.slice(1, -1), {
				output: 'html'
			})
		})
	}
	// Convert markdown to html.
	var converter = new showdown.Converter({tables: true, strikethrough: true, noHeaderId: true})
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
