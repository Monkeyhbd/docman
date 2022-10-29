const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')
const showdown = require('showdown')
const crypto = require('crypto')


// Determine the type of path. Type can be 'absolute', 'relative' or 'web'.
function pathType(pathString) {
	if (path.isAbsolute(pathString)) {
		return 'absolute'
	}
	else {
		if (pathString.length >= 7 && pathString.slice(0, 7) == "http://" || pathString.length >= 8 && pathString.slice(0, 8) == "https://") {
			return 'web'
		}
		else {
			return 'relative'
		}
	}
}


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
	// Read markdown file.
	var mdRaw = fs.readFileSync(task.mdPath, "utf8")
	// Convert markdown to html.
	var converter = new showdown.Converter({tables: true, strikethrough: true})
	var mdHtml = converter.makeHtml(mdRaw)
	// Insert html to virtual dom.
	var contentElement = hooks.markdown
	contentElement.innerHTML = mdHtml

	// Additional jobs.
	// Set html head title.
	dom.window.document.title = task.headTitleWithPostfix
	// Set click <a> open a new tab.
	var aElements = contentElement.getElementsByTagName('a')
	for (var idx = 0; idx < aElements.length; idx += 1) {
		aElements[idx].target = '_blank'
	}
	// Add 'current' to <a> classList.
	dom.window.document.getElementById(task.aId).classList.add('current')

	// Move assets from docs and template to dist. (STEP 2)
	var tagNames = ["img"]
	var attrNames = ['src', 'href']
	// moveAssets(contentElement, tagNames, attrNames, path.dirname(task.mdPath), environment.outputDir)
	copyAssets(contentElement, tagNames, attrNames,
	           environment.inputDir, path.relative(environment.inputDir, path.dirname(task.mdPath)),
	           environment.outputDir, path.relative(environment.outputDir, path.dirname(task.htmlPath)))

	// Set prev and next.
	if (taskIdx > 0) {
		if (hooks.prevText != undefined) {
			hooks.prevText.innerHTML = tasks[taskIdx-1].headTitle
		}
		if (hooks.prev != undefined) {
			hooks.prev.href = path.relative(tasks[taskIdx-1].outputDir, tasks[taskIdx-1].htmlPath)
		}
	}
	else {  // First
		if (hooks.prevText != undefined) {
			hooks.prevText.innerHTML = ''
		}
		if (hooks.prev != undefined) {
			hooks.prev.href = ''
		}
	}
	if (taskIdx < tasks.length - 1) {
		if (hooks.nextText != undefined) {
			hooks.nextText.innerHTML = tasks[taskIdx+1].headTitle
		}
		if (hooks.next != undefined) {
			hooks.next.href = path.relative(tasks[taskIdx+1].outputDir, tasks[taskIdx+1].htmlPath)
		}
	}
	else {  // Last
		if (hooks.nextText != undefined) {
			hooks.nextText.innerHTML = ''
		}
		if (hooks.next != undefined) {
			hooks.next.href = ''
		}
	}

	// Output to html dist.
	var htmlPath = task.htmlPath
	fs.writeFileSync(htmlPath, dom.serialize(), 'utf8')

	// Recover origin dom.
	dom.window.document.getElementById(task.aId).classList.remove('current')
}


// Copy the assets that included by domElement's chilren element to dist directory.
// tagNames such as ['link', 'script', 'img'].
// attrNames such as ['src', 'href'].
// inputDir is the directory of the document project.
// inputDirMdDir is the relative path from inputDir to the directory of the markdown file.
// outputDir is the dist directory.
// outputDirHtmlDir is the relative path from outputDir to the directory of the built html file.
function copyAssets(domElement, tagNames, attrNames, inputDir, inputDirMdDir, outputDir, outputDirHtmlDir) {
	for (var idxT = 0; idxT < tagNames.length; idxT += 1) {
		var tagName = tagNames[idxT]
		var tagElements = domElement.getElementsByTagName(tagName)
		for (var idxTE = 0; idxTE < tagElements.length; idxTE += 1) {
			var tagElement = tagElements[idxTE]
			for (var idxA = 0; idxA < attrNames.length; idxA += 1) {
				var attrName = attrNames[idxA]
				// console.log(tagElement[attrName])
				if (tagElement[attrName] != undefined && tagElement[attrName] != '') {
					var t = pathType(tagElement[attrName])
					if (t == 'relative') {
						var distAsset = copyRelativeAsset(inputDir, inputDirMdDir, tagElement[attrName], outputDir)
						distAsset = path.relative(outputDir, distAsset)
						tagElement[attrName] = path.relative(outputDirHtmlDir, distAsset)
					}
					else if (t == 'absolute') {
						var distAsset = copyAbsoluteAsset(tagElement[attrName], outputDir)
						distAsset = path.relative(outputDir, distAsset)
						tagElement[attrName] = path.relative(outputDirHtmlDir, distAsset)
					}
					else {}
				}
			}
		}
	}
}


// inputDir2MdDir is the path that the relative path of the asset relative from,
//     it must be a relative path relative to inputDir.
function copyRelativeAsset(inputDir, inputDir2MdDir, mdDir2Asset, outputDir) {
	var inputDir2Asset = path.join(inputDir2MdDir, mdDir2Asset)
	var assetPath = path.join(inputDir, inputDir2Asset)
	if (inputDir2Asset.length >= 2 && inputDir2Asset.slice(0, 2) == '..') {  // Assset is out of inputDir.
		var fileRename = assetHashName(assetPath)
		var desPath = path.join(outputDir, './docman-assets', fileRename)
		return copyAsset(assetPath, desPath)
	}
	else {  // Asset is in inputDir.
		var desPath = path.join(outputDir, inputDir2Asset)
		return copyAsset(assetPath, desPath)
	}
}


function copyAbsoluteAsset(assetPath, outputDir) {
	var fileRename = assetHashName(assetPath)
	var desPath = path.join(outputDir, './docman-assets', fileRename)
	return copyAsset(assetPath, desPath)
}


// Rename asset by hash. Format: asset.123abc.ext
function assetHashName(assetPath) {
	var buffer = fs.readFileSync(assetPath)
	var fsHash = crypto.createHash('sha256')
	fsHash.update(buffer)
	var md5 = fsHash.digest('hex')
	var extname = path.extname(assetPath)
	var fileRename = path.basename(assetPath, extname) + '.' + md5.slice(0, 8) + extname
	return fileRename
}


// srcPath is the path of asset, can be relative path or absolute path.
// desPath is the path that asset copy to.
function copyAsset(srcPath, desPath) {
	// Make sure desDir exist.
	var desDir = path.dirname(desPath)
	try {s
		fs.accessSync(desDir)
	}
	catch (err) {
		fs.mkdirSync(desDir, {recursive: true})
	}
	console.log(`Copy: ${srcPath}   -->   ${desPath}.`)
	fs.copyFileSync(srcPath, desPath)
	return desPath
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

	var hooks = {
		title: dom.window.document.getElementById('docman-hook-title'),

		contents: dom.window.document.getElementById('docman-hook-contents'),

		markdown: dom.window.document.getElementById('docman-hook-markdown'),

		author: dom.window.document.getElementById('docman-hook-author'),

		prev: dom.window.document.getElementById('docman-hook-prev'),

		next: dom.window.document.getElementById('docman-hook-next'),

		prevText: dom.window.document.getElementById('docman-hook-prev-text'),

		nextText: dom.window.document.getElementById('docman-hook-next-text')
	}
	// console.log(hooks)

	// Set document title.
	hooks.title.innerHTML = docIndex.title

	// Set document author.
	if (hooks.author != null && docIndex.author != undefined) {
		hooks.author.innerHTML = docIndex.author
	}
	
	// Move assets from docs and template to dist. (STEP 1)
	var tagNames = ['link', 'script', "img"]
	var attrNames = ['src', 'href']
	copyAssets(dom.window.document, tagNames, attrNames, environment.themeDir, './', environment.outputDir, './')
	// moveAssets(dom.window.document, tagNames, attrNames, environment.themeDir, environment.outputDir)

	// Generate contents <ul>.
	var ul = dom.window.document.createElement('ul')
	var buildTasks = []
	generateContents(dom, environment, ul, docIndex, docIndex.list, buildTasks)
	hooks.contents.innerHTML = ul.outerHTML

	// Operate task in buildTasks.
	for (var idx = 0; idx < buildTasks.length; idx += 1) {
		buildHTML(dom, environment, buildTasks, idx, hooks)
	}
}


module.exports = {
	launch: launch
}
