const NodeFs = require('node:fs')
const NodePath = require('node:path')
const Showdown = require('showdown')
const Jsdom = require('jsdom')
const Katex = require('katex')
const UtilsAsset = require('../utils/file/asset')


const converter = new Showdown.Converter({tables: true, strikethrough: true, noHeaderId: true})
const dom = new Jsdom.JSDOM()
const elem = dom.window.document.createElement('div')


function preRenderLatex(mdData) {
	// console.log('Pre-render Latex...')
	// Pre-render Latex in $$...$$.
	mdData = mdData.replace(/\$\$[\s\S]*?\$\$/gm, function(match) {
		return Katex.renderToString(match.slice(3, -3), {
			output: 'html',
			displayMode: true,  // to pass integrate test (same with previous), will enable later.
			strict: 'ignore'
		})
	})
	// Pre-render Latex in $...$.
	mdData = mdData.replace(/\$[\s\S]*?\$/gm, function(match) {
		return Katex.renderToString(match.slice(1, -1), {
			output: 'html',
			displayMode: false,
			strict: 'ignore'
		})
	})
	return mdData
}


function render(task, inputDir, outputDir, latex) {
	// Read Markdown file.
	var mdPath = NodePath.join(inputDir, task.inputDirMdPath)
	var mdData = NodeFs.readFileSync(mdPath, 'utf-8')
	// Pre-render Latex.
	if (latex == true) {
		mdData = preRenderLatex(mdData)
	}
	// Convert into HTML.
	var html = converter.makeHtml(mdData)
	elem.innerHTML = html
	// Move assets included by document to dist.
	var tagNames = ["img"]
	var attrNames = ['src', 'href']
	UtilsAsset.copyAssets(elem, tagNames, attrNames,
		inputDir, NodePath.dirname(task.inputDirMdPath),
		outputDir, NodePath.dirname(task.outputDirHtmlPath))
	// Set click <a> open a new tab.
	var aElements = elem.getElementsByTagName('a')
	for (var idx = 0; idx < aElements.length; idx += 1) {
		aElements[idx].target = '_blank'
	}
	return elem.innerHTML
}


module.exports = {
	name: 'docman-hook-markdown',
	scope: 'local',
	after: [],
	hook: {
		id: 'docman-hook-markdown',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['task', 'config.inputDir', 'config.outputDir', 'config.latex']
}
