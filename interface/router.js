var map = {
	'build': function() { return require('./commands/build').execute }
}


function getExecuteFactory(subCommand) {
	return map[subCommand]
}


module.exports = {
	getExecuteFactory: getExecuteFactory
}
