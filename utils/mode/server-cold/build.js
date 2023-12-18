const NodePath = require('node:path')
const NodeFs = require('node:fs')
const NodeProcess = require('node:process')
const UtilsHookFeed = require('../../hook/feed')
const UtilsAsset = require('../../file/asset')
const UtilsConfig = require('../../info/config')
const UtilsFile = require('../../file/index')


/** Serve for hooks in list.
 *  - `pairs` : A list of hook pairs `{elem, hook}[]`.
 */
function serve(pairs, hookElement, env) {
	for (var idx = 0; idx < pairs.length; idx += 1) {
		var pair = pairs[idx]
		var elem = pair.element
		var attr = pair.hook.hook.attr
		var render = pair.hook.render
		var parameters = pair.hook.parameters
		var argv = []
		for (var idxP = 0; idxP < parameters.length; idxP += 1) {
			var parameter = parameters[idxP]
			if (parameter.startsWith('config')) {
				argv.push(UtilsConfig.getConfigItem(parameter.slice('config'.length)))
			}
			else if (parameter.startsWith('docman-hook')) {
				argv.push(hookElement[parameter])
			}
			else {
				argv.push(env[parameters[idxP]])
			}
		}
		UtilsHookFeed.operate(elem, attr, render, argv)
	}
}


function buildAll(taskList, templateDom, pairs, hookElement, env) {
	console.log('Build: Start to build documentation.')
	var outputPath = env['config']['outputDir']
	// Move assets from template to dist.
	var tagNames = ['link', 'script', "img"]
	var attrNames = ['src', 'href']
	console.log('Copy: Theme resource')
	UtilsAsset.copyAssets(templateDom.window.document, tagNames, attrNames,
		env['config']['themeDir'], './', env['config']['outputDir'], './', {silence: true})
	// Serve for global hooks.
	serve(pairs.global, hookElement, env)
	// Copy katex resource.
	if (UtilsConfig.getConfigItem('latex') == true) {
		var src = NodePath.join(UtilsFile.DOCMAN_PROGRAM, 'static/docman-katex')
		var dest = NodePath.join(outputPath, 'docman-katex')
		console.log('Copy: Katex resource')
		UtilsAsset.copyFolder(src, dest, {silence: true})
		var link = templateDom.window.document.createElement('link')
		link.rel = 'stylesheet'
		link.type = 'text/css'
		link.href = './docman-katex/katex.css'
		templateDom.window.document.head.appendChild(link)
	}
	// Execute tasks.
	for (var idx = 0; idx < taskList.length; idx += 1) {
		var task = taskList[idx]
		console.log(`Build[${idx+1}/${taskList.length}]: <${task.title}> ${task.inputDirMdPath}   -->   ${task.outputDirHtmlPath}`)
		// Set HTML title.
		templateDom.window.document.title = task.headTitle
		// Serve for local hooks.
		env['task'] = task
		env['prevTask'] = taskList[idx-1]
		env['nextTask'] = taskList[idx+1]
		serve(pairs.local, hookElement, env)
		// Output to html dist.
		var htmlPath = NodePath.join(outputPath, task.outputDirHtmlPath)
		NodeFs.writeFileSync(htmlPath, templateDom.serialize())
	}
}


module.exports = {
	buildAll: buildAll
}
