const NodePath = require('node:path')
const NodeFs = require('node:fs')
const NodeProcess = require('node:process')
const Jsdom = require('jsdom')
const UtilsConfig = require('../../info/config')
const UtilsFile = require('../../file/index')
const UtilsContent = require('../../info/content')
const UtilsHook = require('../../hook/index')
const UtilsServerColdBuild = require('./build')


function subLaunch() {
	var docmanVersion = UtilsFile.readJsonAsObject(NodePath.join(NodePath.dirname(NodeProcess.argv[1]), 'package.json')).version
	console.log(`===== DocMan v${docmanVersion} =====`)
	var outputDir = UtilsConfig.getConfigItem('outputDir')
	try {
		NodeFs.accessSync(outputDir)
	}
	catch (err) {
		NodeFs.mkdirSync(outputDir, {recursive: true})
	}
	// Read content index file from user's document project.
	var indexPath = NodePath.join(UtilsConfig.getConfigItem('inputDir'), 'index.json')
	var contentIndex = UtilsFile.readJsonAsObject(indexPath)
	// Read theme's template html.
	var templatePath = NodePath.join(UtilsConfig.getConfigItem('themeDir'), 'index.html')
	var templateData = NodeFs.readFileSync(templatePath)
	// Initialize virtual dom for template.
	var templateDom = new Jsdom.JSDOM(templateData)
	var templateDocument = templateDom.window.document

	var res = UtilsContent.analyse(contentIndex)
	// console.log(res)

	var builtinHooksDir = NodePath.join(NodePath.dirname(NodeProcess.argv[1]), 'hooks')
	var {pairs, hookElement} = UtilsHook.pair(templateDocument, [builtinHooksDir])
	// console.log(pairs)

	var env = {
		'global': res.global,
		'config': {
			'inputDir': UtilsConfig.getConfigItem('inputDir'),
			'outputDir': UtilsConfig.getConfigItem('outputDir'),
			'themeDir': UtilsConfig.getConfigItem('themeDir')
		}
	}
	UtilsServerColdBuild.buildAll(res.taskList, templateDom, pairs, hookElement, env)
}


function launch() {
	// Make sure output directory exist.
	UtilsConfig.load('./docman.config.json')
	subLaunch()

	var alsoDoList = UtilsConfig.getConfigItem('alsoDo')
	if (alsoDoList != undefined) {
		for (var idx = 0; idx < alsoDoList.length; idx += 1) {
			var alsoDo = alsoDoList[idx]
			UtilsConfig.set(alsoDo)
			subLaunch()
		}
	}
}


module.exports = {
	launch: launch
}
