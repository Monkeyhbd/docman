const UtilsFile = require('../file/index')


var docmanConfig = undefined


/** Load DocMan config.
 *  - `path` : Path of `docman.config.json` .
 */
function load(path='./docman.config.json') {
	docmanConfig = UtilsFile.readJsonAsObject(path)
	return docmanConfig
}


/** Get config item's value by its path.
 *  - `item` : Path of item, like `developer.showJsonCode` .
 */
function getConfigItem(item) {
	var path = item.split('.')
	var current = docmanConfig
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
	getConfigItem: getConfigItem
}
