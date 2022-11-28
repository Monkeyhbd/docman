// Environment Object

const path = require('path')


class Environment {

	// Directory that contains documents.
	inputDir = undefined

	// Path to index.json.
	docIndex = undefined

	// Directory that published on web server.
	outputDir = undefined

	// Directory of the chosen theme.
	themeDir = undefined

	// Theme's index.html.
	themeHtml = undefined

	constructor(config={}) {
		this.assign(config)
	}

	assign(config) {
		this.inputDir = config.inputDir
		this.docIndex = path.join(config.inputDir, 'index.json')
		this.outputDir = config.outputDir
		this.themeDir = config.themeDir
		this.themeHtml = path.join(config.themeDir, 'index.html')
		this.print()
	}

	print() {
		console.log('----- DocMan Environment -----')
		console.log(`inputDir: ${this.inputDir}`)
		console.log(`outputDir: ${this.outputDir}`)
		console.log(`themeDir: ${this.themeDir}`)
	}
}

module.exports = Environment
