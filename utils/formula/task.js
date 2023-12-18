const NodePath = require('node:path')


function htmlName(article) {
	if (article.rename != undefined) {
		return article.rename + '.html'
	}
	else if (article.autoRename == 'by-path') {
		var pathParse = NodePath.parse(NodePath.join(article['__basePath'] || '.', article.path))
		var parts = pathParse.dir.split(/[\/\\]/)  // ['a', 'b', 'c']
		parts.push(pathParse.name)
		if (parts[0] == '.') {
			parts = parts.slice(1)
		}
		var str = parts.join('-')
		return str + '.html'
	}
	return NodePath.basename(article.path, NodePath.extname(article.path)) + '.html'
}


/** Task formula. Each task object guide one buid.
 * 
 *  Parameters:
 *  - `article` : Origin article object in content index file.
 *  - `global` : Global environment of whole document project.
 *  - `local` : Local environment of a single article.
 * 
 *  Task formula:
 *  - `title` : Article's title without prefix and postfix.
 *  - `headTitle` : Article's title with prefix and postfix.
 *  - `inputDirMdPath` : Relative path from input dir to markdown file.
 *  - `outputDirHtmlPath` : Relative path from output dir to html file.
 *  - `aId` : Article's `a#id` in docman-hook-contents.
 */
function taskFormula(article, global={}, local={}) {
	return {
		idx: local.idx,
		title: article.title,
		headTitle: article.title + (global.titlePostfix || ''),
		inputDirMdPath: NodePath.join(article['__basePath'] || '.', article.path),
		outputDirHtmlPath: htmlName(article),
		aId: local.aId
	}
}


module.exports = {
	taskFormula: taskFormula
}
