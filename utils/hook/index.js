const NodeFs = require('node:fs')
const NodePath = require('node:path')


function scan(templateDocument, dirs=['hooks']) {
	var hooks = {}  // { name: {hook, flag, element}, ... }
	for (var idx = 0; idx < dirs.length; idx += 1) {
		var dir = dirs[idx]
		var files = NodeFs.readdirSync(dir, {withFileTypes: true})
		for (var idxF = 0; idxF < files.length; idxF += 1) {
			var file = files[idxF]
			if (file.isFile()) {
				var hook = require(NodePath.join(dir, file.name))
				hooks[hook.name] = {
					hook: hook,
					flag: false,
					element: templateDocument.getElementById(hook.hook.id)
				}
			}
		}
	}
	return hooks
}


function pair(templateDocument, hookDirs) {
	var hooks = scan(templateDocument, hookDirs)
	var pairs = {
		global: [],
		local: []
	}
	var hookElement = {}
	var hookNames = Object.keys(hooks)
	var flag = true  // Has change in last loop.
	while (flag) {
		flag = false
		for (var idx = 0; idx < hookNames.length; idx += 1) {
			var hookName = hookNames[idx]
			var hookContext = hooks[hookName]
			if (hookContext.element != undefined && hookContext.flag == false) {
				// Check is all depend hook rendered.
				var dependAdded = true
				for (var idxA = 0; idxA < hookContext.hook.after.length; idxA += 1) {
					var dependHookName = hookContext.hook.after[idxA]
					var dependHookContext = hooks[dependHookName]
					// Not declare in theme, but depend by other hook.
					if (dependHookContext.element == undefined) {  // Temporary fake node.
						dependHookContext.element = templateDocument.createElement('div')
					}
					// A depend hook has not rendered.
					if (dependHookContext.flag == false) {
						dependAdded = false
					}
				}
				// Wait until all depend hook rendered.
				if (dependAdded) {
					pairs[hookContext.hook.scope].push({
						element: hookContext.element,
						hook: hookContext.hook
					})
					hookElement[hookContext.hook.hook.id] = hookContext.element
					hookContext.flag = true  // Mark as rendered.
					flag = true
					// console.log(hookName)
				}
			}
		}
	}
	return {pairs, hookElement}
}


module.exports = {
	scan: scan,
	pair: pair
}
