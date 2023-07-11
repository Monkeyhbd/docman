function render(nextTask) {
	if (nextTask != undefined) {
		return nextTask.title
	}
	else {
		return ''
	}
}


module.exports = {
	name: 'docman-hook-next-text',
	scope: 'local',
	after: [],
	hook: {
		id: 'docman-hook-next-text',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['nextTask']
}
