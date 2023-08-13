const NodePath = require('node:path')
const NodeFs = require('node:fs')


const DOCMAN_PROGRAM = NodePath.join(__dirname, '../..')


/** Determine the type of `path`. Type can be 'absolute', 'relative' or 'web'.
 */ 
function pathType(path) {
	if (NodePath.isAbsolute(path)) {
		return 'absolute'
	}
	else {
		if (path.length >= 7 && path.slice(0, 7) == "http://" || path.length >= 8 && path.slice(0, 8) == "https://") {
			return 'web'
		}
		else {
			return 'relative'
		}
	}
}


/** Write an object into a json file.
 * - `obj` : Object.
 * - `path` : Path to save file.
 */
function writeObjectAsJson(obj, path) {
	// Convert into json.
	var json = JSON.stringify(obj)
	// Make sure parent directory exist.
	mkdir(NodePath.dirname(path))
	// Write.
	NodeFs.writeFileSync(path, json)
}


/** Read an object from a json file.
 * - `path` : Path of json file.
 */
function readJsonAsObject(path) {
	// Read.
	var json = NodeFs.readFileSync(path)
	// Convert into object.
	var obj = JSON.parse(json)
	return obj
}


module.exports = {
	DOCMAN_PROGRAM: DOCMAN_PROGRAM,
	pathType: pathType,
	writeObjectAsJson: writeObjectAsJson,
	readJsonAsObject: readJsonAsObject
}
