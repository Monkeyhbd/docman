const NodePath = require('node:path')
const NodeFs = require('node:fs')
const UtilsHookFeed = require('../../hook/feed')
const UtilsAsset = require('../../file/asset')


function serve(pairs, env) {
	for (var idx = 0; idx < pairs.length; idx += 1) {
		var pair = pairs[idx]
		var elem = pair.element
		var attr = pair.hook.hook.attr
		var render = pair.hook.render
		var parameters = pair.hook.parameters
		var argv = []
		for (var idxP = 0; idxP < parameters.length; idxP += 1) {
			argv.push(env[parameters[idxP]])
		}
		UtilsHookFeed.operate(elem, attr, render, argv)
	}
}


function buildAll(taskList, templateDom, pairs, env) {
	// Serve for global hooks.
	serve(pairs.global, env)
	// Move assets from template to dist.
	var tagNames = ['link', 'script', "img"]
	var attrNames = ['src', 'href']
	UtilsAsset.copyAssets(templateDom.window.document, tagNames, attrNames,
		env['config']['themeDir'], './', env['config']['outputDir'], './')
	// Execute tasks.
	var outputPath = env['config']['outputDir']
	for (var idx = 0; idx < taskList.length; idx += 1) {
		// Serve for local hooks.
		var task = taskList[idx]
		env['task'] = task
		env['prevTask'] = taskList[idx-1]
		env['nextTask'] = taskList[idx+1]
		serve(pairs.local, env)
		// Output to html dist.
		var htmlPath = NodePath.join(outputPath, task.outputDirHtmlPath)
		NodeFs.writeFileSync(htmlPath, templateDom.serialize())
	}
}


module.exports = {
	buildAll: buildAll
}
