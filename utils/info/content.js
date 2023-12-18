const NodeFs = require('node:fs')
const NodePath = require('node:path')
const Jsdom = require('jsdom')
const UtilsFormulaTask = require('../formula/task')
const UtilsConfig = require('./config')
const UtilsConsoleWarn = require('../console/warn')
const UtilsFile = require('../file/index')


var dom = new Jsdom.JSDOM()
var document = dom.window.document


const INHERITABLE = ['autoRename', '__basePath']


function inherit(parent, child) {
	for (var idx = 0; idx < INHERITABLE.length; idx += 1) {
		var attr = INHERITABLE[idx]
		if (parent[attr] != undefined && child[attr] == undefined) {
			child[attr] = parent[attr]
		}
	}
}


/** cascade({a: 1, b: 2}, {b: 3, c: 4}) = {a: 1, b: 2, c: 4} */
function objectCascade(a, b) {
	return Object.assign(b, a)
}


function analyseCore(list, ul, taskList=[], global={}, outputDirHtmlPaths=[]) {
	for (var idx = 0; idx < list.length; idx += 1) {
		// Import sub content index file.
		if (list[idx].import != undefined) {
			var inputDirSubIndexPath = NodePath.join(list[idx]['__basePath'] || '.', list[idx].import)
			var subIndexPath = NodePath.join(UtilsConfig.getConfigItem('inputDir'), inputDirSubIndexPath)
			console.log(`Prepare: Import sub content index file from ${subIndexPath}.`)
			var child = UtilsFile.readJsonAsObject(subIndexPath)
			list[idx] = objectCascade(list[idx], child)
			var basePath = NodePath.dirname(inputDirSubIndexPath)
			list[idx]['__basePath'] = basePath
		}
		var li = document.createElement('li')
		var a = document.createElement('a')
		// Only if 'path' defined, write <a>'s href attribute.
		// And join this md file to task list.
		if (list[idx].path != undefined) {
			var task = UtilsFormulaTask.taskFormula(list[idx], global, {
				idx: taskList.length,
				aId: `a-${taskList.length}`
			})
			if (NodeFs.existsSync(NodePath.join(UtilsConfig.getConfigItem('inputDir'), task.inputDirMdPath))) {
				a.href = task.outputDirHtmlPath
				a.id = task.aId
				taskList.push(task)
				if (outputDirHtmlPaths.indexOf(task.outputDirHtmlPath) > -1) {
					// console.log(`Warn: ${task.inputDirMdPath} --> ${task.outputDirHtmlPath} overwrite previous built html. Consider set 'rename' attribute in index.json.`)
					UtilsConsoleWarn.print(`${task.inputDirMdPath} --> ${task.outputDirHtmlPath} overwrite previous built html. Consider set 'rename' attribute in index.json.`)
				}
				outputDirHtmlPaths.push(task.outputDirHtmlPath)
			}
			else {
				// console.log(`Warn: Input file ${task.inputDirMdPath} not exist. Skip.`)
				UtilsConsoleWarn.print(`Input file ${task.inputDirMdPath} not exist.`)
			}
		}
		else {
			a.classList.add('nohover')
		}
		// The name 'title' must be defined.
		var div1 = document.createElement('div')
		div1.classList.add('item-title')
		div1.innerHTML = list[idx].title
		a.appendChild(div1)
		// If 'describe' defined, add describe text.
		if (list[idx].describe != undefined) {
			var div2 = document.createElement('div')
			div2.classList.add('item-describe')
			div2.innerHTML = list[idx].describe
			a.appendChild(div2)
		}
		li.appendChild(a)
		// If 'list' defined, generate sub-contents.
		if (list[idx].list != undefined) {
			var ulSub = document.createElement('ul')
			// Inherit inheritable attribute.
			for (var idx_article = 0; idx_article < list[idx].list.length; idx_article += 1) {
				inherit(list[idx], list[idx].list[idx_article])
			}
			analyseCore(list[idx].list, ulSub, taskList, global, outputDirHtmlPaths)
			li.appendChild(ulSub)
		}
		ul.appendChild(li)
	}
}


/** Analyse content index, generate global environment and task lisk. */
function analyse(contentIndex) {
	console.log('Prepare: Analyse content index file.')
	var global = {
		titlePostfix: contentIndex.titlePostfix || '',
		author: contentIndex.author || '',
		title: contentIndex.title || ''
	}
	var ul = document.createElement('ul')
	var taskList = []
	// Inherit inheritable attribute.
	for (var idx_article = 0; idx_article < contentIndex.list.length; idx_article += 1) {
		inherit(contentIndex, contentIndex.list[idx_article])
	}
	analyseCore(contentIndex.list, ul, taskList, global, [])
	global.contentElement = ul
	return {
		global: global,
		taskList: taskList
	}
}


module.exports = {
	analyse: analyse
}
