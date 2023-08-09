function render(prevTask) {
	if (prevTask != undefined) {
		return prevTask.outputDirHtmlPath
	}
	else {
		return ''
	}
}


module.exports = {
	name: 'docman-hook-prev',
	scope: 'local',
	after: [],
	hook: {
		id: 'docman-hook-prev',
		attr: 'href'
	},
	render: render,
	parameters: ['prevTask']
}
