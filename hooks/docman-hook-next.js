function render(nextTask) {
	if (nextTask != undefined) {
		return nextTask.outputDirHtmlPath
	}
	else {
		return ''
	}
}


module.exports = {
	name: 'docman-hook-next',
	scope: 'local',
	after: [],
	hook: {
		id: 'docman-hook-next',
		attr: 'href'
	},
	render: render,
	parameters: ['nextTask']
}
