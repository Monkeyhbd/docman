const router = require('./router')


HELP_MESSAGE = `
DocMan program instance.
USAGE:
  > doc --help
  > doc build
`


function execute(argv=['--help']) {
	console.log(argv)
	if (argv.length <= 2 || argv[2] == '--help' || argv[2] == '-h') {
		console.log(HELP_MESSAGE)
		return 0
	}
	// Match subcommand.
	var subExecuteFactory = router.getExecuteFactory(argv[2])
	if (subExecuteFactory == undefined) {
		console.log(`Command ${argv[2]} is invalid.`)
		return -1
	}
	// Get subcommand's execute function.
	var subExecute = subExecuteFactory()
	return subExecute(argv.slice(2))
}


module.exports = {
	execute: execute
}
