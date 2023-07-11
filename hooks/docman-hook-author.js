function render(global) {
	return global.author
}


module.exports = {
	name: 'docman-hook-author',
	scope: 'global',
	after: [],
	hook: {
		id: 'docman-hook-author',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['global']
}
