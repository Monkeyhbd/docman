function render(prevTask) {
	if (prevTask != undefined) {
		return prevTask.title
	}
	else {
		return ''
	}
}


module.exports = {
	name: 'docman-hook-prev-text',
	scope: 'local',
	after: [],
	hook: {
		id: 'docman-hook-prev-text',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['prevTask']
}
