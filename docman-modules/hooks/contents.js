// docman-hook-contents

const path = require('path')
const jsdom = require('jsdom')

const HooksUtils = require('./hooks-utils')


var dom = new jsdom.JSDOM()
var document = dom.window.document
var contentsPrototype = document.createElement('ul')


function init(environment, docIndex, contentsList, buildTasks=[]) {
	return initCore(environment, docIndex, contentsList, buildTasks, contentsPrototype)
}


// Append contents/sub-contents's <li> element to ulElement.
// And generate html build task to buildTasks.
function initCore(environment, docIndex, contentsList, buildTasks=[], ul) {
	// Will build md to html later.
	// buildTask = [{mdPath: 'path-to-md', outputDir: 'dir-of-html' ... } ... ]

	for (var idx = 0; idx < contentsList.length; idx += 1) {
		var li = document.createElement('li')
		var a = document.createElement('a')
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
		var div1 = document.createElement('div')
		div1.classList.add('item-title')
		div1.innerHTML = contentsList[idx].title
		a.appendChild(div1)
		// If 'describe' defined, add describe text.
		if (contentsList[idx].describe != undefined) {
			var div2 = document.createElement('div')
			div2.classList.add('item-describe')
			div2.innerHTML = contentsList[idx].describe
			a.appendChild(div2)
		}
		li.appendChild(a)
		// If 'list' defined, generate sub-contents.
		if (contentsList[idx].list != undefined) {
			var ulSub = document.createElement('ul')
			initCore(environment, docIndex, contentsList[idx].list, buildTasks, ulSub)
			li.appendChild(ulSub)
		}
		ul.appendChild(li)
	}

	return buildTasks
}


function feed(hook, aId) {
	if (hook == undefined) {
		return undefined
	}

	// Add 'current' to <a> classList.
	contentsPrototype.querySelector(`#${aId}`).classList.add('current')

	HooksUtils.feed(hook, contentsPrototype.outerHTML)

	// Recover origin dom.
	contentsPrototype.querySelector(`#${aId}`).classList.remove('current')
}


module.exports = {
	contentsPrototype: contentsPrototype,
	init: init,
	feed: feed
}
