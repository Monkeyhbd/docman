const NodeFs = require('node:fs')
const NodePath = require('node:path')
const Showdown = require('showdown')
const Jsdom = require('jsdom')
const UtilsAsset = require('../utils/file/asset')


const converter = new Showdown.Converter({tables: true, strikethrough: true, noHeaderId: true})
const dom = new Jsdom.JSDOM()
const elem = dom.window.document.createElement('div')


function render(task, config) {
	// Read Markdown file.
	var mdPath = NodePath.join(config.inputDir, task.inputDirMdPath)
	var mdData = NodeFs.readFileSync(mdPath, 'utf-8')
	var html = converter.makeHtml(mdData)
	elem.innerHTML = html
	// Move assets included by document to dist.
	var tagNames = ["img"]
	var attrNames = ['src', 'href']
	UtilsAsset.copyAssets(elem, tagNames, attrNames,
		config.inputDir, NodePath.dirname(task.inputDirMdPath),
		config.outputDir, NodePath.dirname(task.outputDirHtmlPath))
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
	parameters: ['task', 'config']
}
