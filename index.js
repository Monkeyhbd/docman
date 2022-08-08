const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')
const showdown = require('showdown')


// Read DocMan's configuration.
var docConfigData = fs.readFileSync('./docman.config.json', 'utf8')
// DocMan's configuration object.
var docConfig = JSON.parse(docConfigData)

// Project's environment.
var environment = {
	// Directory that contains documents.
	inputDir: docConfig.inputDir,

	// Path to index.json.
	docIndex: undefined,

	// Directory that published on web server.
	outputDir: docConfig.outputDir
}
environment.docIndex = path.join(environment.inputDir, 'index.json')

console.log(environment)

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
var htmlTemplate = fs.readFileSync("./template/index.html", 'utf8')
// Initialize virtual dom.
var dom = new jsdom.JSDOM(htmlTemplate)

dom.window.document.getElementById('header-title-h1').innerHTML = docIndex.title

// Move assets from docs and template to dist. (STEP 1)
var tagNames = ['link', 'script', "img"]
var attrNames = ['src', 'href']
for (var idxT = 0; idxT < tagNames.length; idxT += 1) {
	var tagName = tagNames[idxT]
	var tagElements = dom.window.document.getElementsByTagName(tagName)
	for (var idxTE = 0; idxTE < tagElements.length; idxTE += 1) {
		var tagElement = tagElements[idxTE]
		for (var idxA = 0; idxA < attrNames.length; idxA += 1) {
			var attrName = attrNames[idxA]
			// console.log(tagElement[attrName])
			if (tagElement[attrName] != undefined) {
				var srcPath = path.join('./template', tagElement[attrName])
				var desPath = path.join(environment.outputDir, tagElement[attrName])
				var desDir = path.dirname(desPath)
				try {
					fs.accessSync(desDir)
				}
				catch (err) {
					fs.mkdirSync(desDir, {recursive: true})
				}
				console.log(`Copy ${srcPath} to ${desPath}.`)
				fs.copyFileSync(srcPath, desPath)
			}
		}
	}
}

// Will build md to html later.
// buildTask = [{mdPath: 'path-to-md', outputDir: 'dir-of-html' ... } ... ]
var buildTasks = []

// Append contents/sub-contents's <li> element to ulElement.
// And generate html build task to buildTasks.
function generateContents(ulElement, contentsList) {
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
				headTitle: contentsList[idx].title
			}
			task.htmlPath = path.join(task.outputDir, path.basename(task.mdPath, '.md') + '.html')
			if (contentsList[idx].rename != undefined) {
				task.htmlPath = path.join(task.outputDir, contentsList[idx].rename + '.html')
			}
			a.href = path.relative(environment.outputDir, task.htmlPath)
			buildTasks.push(task)
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
			generateContents(ul, contentsList[idx].list)
			li.appendChild(ul)
		}
		ulElement.appendChild(li)
	}
}

// Generate contents <ul>.
var ul = dom.window.document.createElement('ul')
generateContents(ul, docIndex.list)
dom.window.document.getElementById('contents').innerHTML = ul.outerHTML

// console.log(buildTasks)

// Build html file to outputDir.
function buildHTML(mdPath, outputDir, task) {
	// Read markdown file.
	var mdRaw = fs.readFileSync(mdPath, "utf8")
	// Convert markdown to html.
	var converter = new showdown.Converter({tables: true, strikethrough: true})
	var mdHtml = converter.makeHtml(mdRaw)
	// Insert html to virtual dom.
	var contentElement = dom.window.document.getElementById('markdown-container')
	contentElement.innerHTML = mdHtml

	// Additional jobs.
	// Set html head title.
	dom.window.document.title = task.headTitle
	// Set click <a> open a new tab.
	var aElements = contentElement.getElementsByTagName('a')
	for (var idx = 0; idx < aElements.length; idx += 1) {
		aElements[idx].target = '_blank'
	}
	// Move assets from docs and template to dist. (STEP 2)

	// Output to html dist.
	var htmlPath = task.htmlPath
	fs.writeFileSync(htmlPath, dom.serialize(), 'utf8')
	console.log(mdPath, '  -->  ', htmlPath)
}

// Operate task in buildTasks.
for (var idx = 0; idx < buildTasks.length; idx += 1) {
	buildHTML(buildTasks[idx].mdPath, buildTasks[idx].outputDir, buildTasks[idx])
}
