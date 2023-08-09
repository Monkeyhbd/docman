function render(global) {
	return global.title
}


module.exports = {
	name: 'docman-hook-title',
	scope: 'global',
	after: [],
	hook: {
		id: 'docman-hook-title',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['global']
}
