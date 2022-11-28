const fs = require('fs')

const Objects = require('./docman-modules/objects/index')
const ServerCold = require('./docman-modules/server-cold')


// DocMan
console.log('DocMan version 0.1')
console.log('Website: https://docman.monkeyhbd.com')

// Read DocMan's configuration.
var docConfigData = fs.readFileSync('./docman.config.json', 'utf8')
// DocMan's configuration object.
var docConfig = JSON.parse(docConfigData)

// var environment = buildEnvironment(docConfig)
var environment = new Objects.Environment(docConfig)

ServerCold.launch(environment)

if (docConfig.alsoDo != undefined) {
	for (var idx = 0; idx < docConfig.alsoDo.length; idx += 1) {
		var subDocConfig = docConfig.alsoDo[idx]
		var subEnvironment = new Objects.Environment(subDocConfig)
		ServerCold.launch(subEnvironment)
	}
}
