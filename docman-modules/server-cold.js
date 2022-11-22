const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')

const AssetsUtils = require('./assets-utils')
const HooksUtils = require('./hooks/hooks-utils')
const Hooks = require('./hooks/index')


// Append contents/sub-contents's <li> element to ulElement.
// And generate html build task to buildTasks.
function generateContents(dom, environment, ulElement, docIndex, contentsList, buildTasks) {
	// Will build md to html later.
	// buildTask = [{mdPath: 'path-to-md', outputDir: 'dir-of-html' ... } ... ]

	for (var idx = 0; idx < contentsList.length; idx += 1) {
		var li = dom.window.document.createElement('li')
		var a = dom.window.document.createElement('a')
		// If 'path' defined, write <a>'s href attribute.
		// And join this md file to build task list.
		if (contentsList[idx].path != undefined) {
			var task = {
				mdPath: path.join(environment.inputDir, contentsList[idx].path),
				outputDir: environment.outputDir,
				htmlPath: undefined,
				headTitle: contentsList[idx].title,
				headTitleWithPostfix: contentsList[idx].title + (docIndex.titlePostfix || ''),
				aId: undefined
			}
			task.htmlPath = path.join(task.outputDir, path.basename(task.mdPath, path.extname(task.mdPath)) + '.html')
			task.aId = `a-${buildTasks.length}`
			if (contentsList[idx].rename != undefined) {
				task.htmlPath = path.join(task.outputDir, contentsList[idx].rename + '.html')
			}
			a.href = path.relative(environment.outputDir, task.htmlPath)
			a.id = `a-${buildTasks.length}`
			buildTasks.push(task)
		}
		else {
			a.classList.add('nohover')
		}
		// The name 'title' must be defined.
		var div1 = dom.window.document.createElement('div')
		div1.classList.add('item-title')
		div1.innerHTML = contentsList[idx].title
		a.appendChild(div1)
		// If 'describe' defined, add describe text.
		if (contentsList[idx].describe != undefined) {
			var div2 = dom.window.document.createElement('div')
			div2.classList.add('item-describe')
			div2.innerHTML = contentsList[idx].describe
			a.appendChild(div2)
		}
		li.appendChild(a)
		// If 'list' defined, generate sub-contents.
		if (contentsList[idx].list != undefined) {
			var ul = dom.window.document.createElement('ul')
			generateContents(dom, environment, ul, docIndex, contentsList[idx].list, buildTasks)
			li.appendChild(ul)
		}
		ulElement.appendChild(li)
	}

	return buildTasks
}


// Build html file to outputDir.
function buildHTML(dom, environment, tasks, taskIdx, hooks) {
	var task = tasks[taskIdx]
	console.log('Build:', task.mdPath, '  -->  ', task.htmlPath)
	
	// < --- docman-hook-markdown --- >
	Hooks.markdown(hooks.markdown, task.mdPath)

	// Additional jobs.
	// Set html head title.
	dom.window.document.title = task.headTitleWithPostfix

	// Add 'current' to <a> classList.
	dom.window.document.getElementById(task.aId).classList.add('current')

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

	// Recover origin dom.
	dom.window.document.getElementById(task.aId).classList.remove('current')
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
	var document = dom.window.document

	var hooks = {
		title: document.getElementById('docman-hook-title'),

		contents: document.getElementById('docman-hook-contents'),

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
	
	// Move assets from docs and template to dist. (STEP 1)
	var tagNames = ['link', 'script', "img"]
	var attrNames = ['src', 'href']
	AssetsUtils.copyAssets(dom.window.document, tagNames, attrNames, environment.themeDir, './', environment.outputDir, './')
	// moveAssets(dom.window.document, tagNames, attrNames, environment.themeDir, environment.outputDir)

	// Generate contents <ul>.
	var ul = dom.window.document.createElement('ul')
	var buildTasks = []
	generateContents(dom, environment, ul, docIndex, docIndex.list, buildTasks)
	HooksUtils.feed(hooks.contents, ul.outerHTML)

	// Operate task in buildTasks.
	for (var idx = 0; idx < buildTasks.length; idx += 1) {
		buildHTML(dom, environment, buildTasks, idx, hooks)
	}
}


module.exports = {
	launch: launch
}
