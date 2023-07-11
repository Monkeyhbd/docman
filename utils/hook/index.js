const NodeFs = require('node:fs')
const NodePath = require('node:path')


function scan(dirs=['hooks']) {
	var hooks = {
		global: {},
		local: {}
	}
	for (var idx = 0; idx < dirs.length; idx += 1) {
		var dir = dirs[idx]
		var files = NodeFs.readdirSync(dir, {withFileTypes: true})
		for (var idxF = 0; idxF < files.length; idxF += 1) {
			var file = files[idxF]
			if (file.isFile()) {
				var hook = require(NodePath.join(dir, file.name))
				if (hook.scope == 'global') {
					hooks.global[hook.name] = {
						hook: hook,
						flag: false
					}
				}
				else if (hook.scope == 'local') {
					hooks.local[hook.name] = {
						hook: hook,
						flag: false
					}
				}
			}
		}
	}
	return hooks
}


function pair(templateDocument, hooks) {
	var pairs = {
		global: [],
		local: []
	}
	var hookNames = Object.keys(hooks.global)
	var flag = true
	while (flag) {
		flag = false
		for (var idx = 0; idx < hookNames.length; idx += 1) {
			var hook = hooks.global[hookNames[idx]].hook
			if (hooks.global[hookNames[idx]].flag == false) {
				var id = hook.hook.id
				var element = templateDocument.getElementById(id)
				if (element != undefined) {
					pairs.global.push({
						element: element,
						hook: hook
					})
					console.log(hook.name)
					hooks.global[hookNames[idx]].flag = true
					flag = true
				}
			}
		}
	}
	var hookNames = Object.keys(hooks.local)
	var flag = true
	while (flag) {
		flag = false
		for (var idx = 0; idx < hookNames.length; idx += 1) {
			var hook = hooks.local[hookNames[idx]].hook
			if (hooks.local[hookNames[idx]].flag == false) {
				var id = hook.hook.id
				var element = templateDocument.getElementById(id)
				if (element != undefined) {
					pairs.local.push({
						element: element,
						hook: hook
					})
					console.log(hook.name)
					hooks.local[hookNames[idx]].flag = true
					flag = true
				}
			}
		}
	}
	return pairs
}


module.exports = {
	scan: scan,
	pair: pair
}
