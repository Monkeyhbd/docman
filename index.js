const fs = require('fs')
const path = require('path')
const ServerCold = require('./docman_modules/server-cold')


// DocMan
console.log('DocMan version 0.1')
console.log('Website: https://docman.monkeyhbd.com')

// Read DocMan's configuration.
var docConfigData = fs.readFileSync('./docman.config.json', 'utf8')
// DocMan's configuration object.
var docConfig = JSON.parse(docConfigData)

function buildEnvironment(docConfig) {
	// Project's environment.
	var environment = {
		// Directory that contains documents.
		inputDir: docConfig.inputDir,

		// Path to index.json.
		docIndex: undefined,

		// Directory that published on web server.
		outputDir: docConfig.outputDir,

		// Directory of the chosen theme.
		themeDir: docConfig.themeDir,

		// Theme's index.html.
		themeHtml: undefined
	}
	environment.docIndex = path.join(environment.inputDir, 'index.json')
	environment.themeHtml = path.join(environment.themeDir, 'index.html')

	console.log('Environment:', environment)

	return environment
}

var environment = buildEnvironment(docConfig)

ServerCold.launch(environment)

if (docConfig.alsoDo != undefined) {
	for (var idx = 0; idx < docConfig.alsoDo.length; idx += 1) {
		var subDocConfig = docConfig.alsoDo[idx]
		var subEnvironment =buildEnvironment(subDocConfig)
		ServerCold.launch(subEnvironment)
	}
}
