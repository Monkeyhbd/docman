function render() {
	//
}


module.exports = {
	name: 'docman-hook-list',
	scope: 'local',
	after: ['docman-hook-markdown'],
	hook: {
		id: 'docman-hook-list',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['task', 'global']
}
