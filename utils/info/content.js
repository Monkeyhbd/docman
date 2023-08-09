const Jsdom = require('jsdom')
const UtilsFormulaTask = require('../formula/task')


var dom = new Jsdom.JSDOM()
var document = dom.window.document


function analyseCore(list, ul, taskList=[], global={}) {
	for (var idx = 0; idx < list.length; idx += 1) {
		var li = document.createElement('li')
		var a = document.createElement('a')
		// Only if 'path' defined, write <a>'s href attribute.
		// And join this md file to task list.
		if (list[idx].path != undefined) {
			var task = UtilsFormulaTask.taskFormula(list[idx], global, {
				idx: taskList.length,
				aId: `a-${taskList.length}`
			})
			a.href = task.outputDirHtmlPath
			a.id = task.aId
			taskList.push(task)
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
			analyseCore(list[idx].list, ulSub, taskList, global)
			li.appendChild(ulSub)
		}
		ul.appendChild(li)
	}
}


/** Analyse content index, generate global environment and task lisk. */
function analyse(contentIndex) {
	var global = {
		titlePostfix: contentIndex.titlePostfix || '',
		author: contentIndex.author || '',
		title: contentIndex.title || ''
	}
	var ul = document.createElement('ul')
	var taskList = []
	analyseCore(contentIndex.list, ul, taskList, global)
	global.contentElement = ul
	return {
		global: global,
		taskList: taskList
	}
}


module.exports = {
	analyse: analyse
}
