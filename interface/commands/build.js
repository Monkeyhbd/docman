const UtilsModeServerCold = require('../../utils/mode/server-cold/main')


function execute(argv=['build']) {
	UtilsModeServerCold.launch()
}


module.exports = {
	execute: execute
}
