const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')

const AssetsUtils = require('./assets-utils')
const HooksUtils = require('./hooks/hooks-utils')
const Hooks = require('./hooks/index')
const GlobalVariable = require('./global/variable')


// Build html file to outputDir.
function buildHTML(dom, environment, tasks, taskIdx, hooks) {
	var task = tasks[taskIdx]
	console.log('Build:', task.mdPath, '  -->  ', task.htmlPath)

	///// docman-hook-contents /////
	Hooks.contents.feed(hooks.contents, task.aId)
	
	///// docman-hook-markdown /////
	Hooks.markdown(hooks.markdown, task.mdPath)

	Hooks.list(hooks.list, hooks.markdown)

	// Additional jobs.
	// Set html head title.
	dom.window.document.title = task.headTitleWithPostfix

	// Move assets included by document to dist.
	var tagNames = ["img"]
	var attrNames = ['src', 'href']
	AssetsUtils.copyAssets(hooks.markdown, tagNames, attrNames,
	           environment.inputDir, path.relative(environment.inputDir, path.dirname(task.mdPath)),
	           environment.outputDir, path.relative(environment.outputDir, path.dirname(task.htmlPath)))

	// Set prev and next.
	if (taskIdx > 0) {
		HooksUtils.feed(hooks.prevText, tasks[taskIdx-1].headTitle)
		HooksUtils.feed(hooks.prev, path.relative(tasks[taskIdx-1].outputDir, tasks[taskIdx-1].htmlPath), 'href')
	}
	else {  // First
		HooksUtils.feed(hooks.prevText, '')
		HooksUtils.feed(hooks.prev, '', 'href')
	}
	if (taskIdx < tasks.length - 1) {
		HooksUtils.feed(hooks.nextText, tasks[taskIdx+1].headTitle)
		HooksUtils.feed(hooks.next, path.relative(tasks[taskIdx+1].outputDir, tasks[taskIdx+1].htmlPath), 'href')
	}
	else {  // Last
		HooksUtils.feed(hooks.nextText, '')
		HooksUtils.feed(hooks.next, '', 'href')
	}

	// Output to html dist.
	var htmlPath = task.htmlPath
	fs.writeFileSync(htmlPath, dom.serialize(), 'utf8')
}


function launch(environment) {
	// Make sure output directory exist.
	try {
		fs.accessSync(environment.outputDir)
	}
	catch (err) {
		fs.mkdirSync(environment.outputDir, {recursive: true})
	}

	// Read document's index file.
	var docIndexData = fs.readFileSync(environment.docIndex)
	// Document's index object.
	var docIndex = JSON.parse(docIndexData)

	// Read template html.
	var htmlTemplate = fs.readFileSync(environment.themeHtml, 'utf8')
	// Initialize virtual dom.
	var dom = new jsdom.JSDOM(htmlTemplate)
	GlobalVariable.dom = dom
	var document = dom.window.document

	var hooks = {
		title: document.getElementById('docman-hook-title'),

		contents: document.getElementById('docman-hook-contents'),

		// Unorder list of h2 titles.
		list: document.getElementById('docman-hook-list'),

		markdown: document.getElementById('docman-hook-markdown'),

		author: document.getElementById('docman-hook-author'),

		prev: document.getElementById('docman-hook-prev'),

		next: document.getElementById('docman-hook-next'),

		prevText: document.getElementById('docman-hook-prev-text'),

		nextText: document.getElementById('docman-hook-next-text')
	}
	// console.log(hooks)

	// Set document title.
	if (docIndex.title != undefined) {
		HooksUtils.feed(hooks.title, docIndex.title)
	}

	// Set document author.
	if (docIndex.author != undefined) {
		HooksUtils.feed(hooks.author, docIndex.author)
	}
	
	// Move assets from template to dist.
	var tagNames = ['link', 'script', "img"]
	var attrNames = ['src', 'href']
	// ASSUME INDEX.HTML IN THEMEDIR'S ROOT AND DOC.HTML IN OUTDIR'S ROOT.
	AssetsUtils.copyAssets(dom.window.document, tagNames, attrNames, environment.themeDir, './', environment.outputDir, './')

	// Generate contents <ul>.
	var buildTasks = Hooks.contents.init(environment, docIndex, docIndex.list)
	console.log(buildTasks)
	// generateContents(dom, environment, ul, docIndex, docIndex.list, buildTasks)
	HooksUtils.feed(hooks.contents, Hooks.contents.contentsPrototype.outerHTML)

	// Operate task in buildTasks.
	for (var idx = 0; idx < buildTasks.length; idx += 1) {
		buildHTML(dom, environment, buildTasks, idx, hooks)
	}
}


module.exports = {
	launch: launch
}
