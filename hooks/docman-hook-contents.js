function render(task, global) {
	// Remove old flags.
	var currents = global.contentElement.getElementsByClassName('current')
	for (var idx = currents.length - 1; idx > -1; idx -= 1) {
		var current = currents[idx]
		current.classList.remove('current')
	}
	// Add current flag.
	var current = global.contentElement.querySelector(`#${task.aId}`)
	current.classList.add('current')
	return global.contentElement.outerHTML
}


module.exports = {
	name: 'docman-hook-contents',
	scope: 'local',
	after: [],
	hook: {
		id: 'docman-hook-contents',
		attr: 'innerHTML'
	},
	render: render,
	parameters: ['task', 'global']
}
