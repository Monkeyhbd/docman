const NodePath = require('node:path')
const NodeProcess = require('node:process')
const UtilsFile = require('../file/index')


var docmanConfig = undefined


/** Load DocMan config.
 *  - `path` : Path of `docman.config.json` .
 */
function load(path='./docman.config.json') {
	docmanConfig = UtilsFile.readJsonAsObject(path)
	if (docmanConfig.themeDir == 'builtin') {
		docmanConfig.themeDir = NodePath.join(UtilsFile.DOCMAN_PROGRAM, 'themes/docman-theme-classic')
	}
	return docmanConfig
}


function set(config) {
	docmanConfig = config
}


/** Get config item's value by its path. No such item will return `undefined`,
 *  path `.` will get whole config.
 *  - `item` : Path of item, like `developer.showJsonCode` .
 */
function getConfigItem(item, config=undefined) {
	var path = item.split('.')
	var current = config || docmanConfig
	for (var idx = 0; idx < path.length; idx += 1) {
		if (current == undefined) {
			return undefined
		}
		if (path[idx] == '') {
			continue
		}
		current = current[path[idx]]
	}
	return current
}


module.exports = {
	load: load,
	set: set,
	getConfigItem: getConfigItem
}
