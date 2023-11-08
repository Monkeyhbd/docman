var warnLines = []


/** Clear warnings cache. */
function clearCache() {
	warnLines.length = 0
}


/** Print a single line warning. */
function print(message) {
	var line = `\x1B[33mWarn: ${message}\x1B[39m`
	console.warn(line)
	warnLines.push(line)
}


/** Print warnings in cache again. */
function summary() {
	if (warnLines.length <= 0) {
		return undefined
	}
	console.log()
	for (var idx = 0; idx < warnLines.length; idx += 1) {
		console.warn(warnLines[idx])
	}
	console.log()
}


module.exports = {
	clearCache: clearCache,
	print: print,
	summary: summary
}
