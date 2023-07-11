const NodePath = require('node:path')


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
		inputDirMdPath: article.path,
		outputDirHtmlPath: (article.rename
		|| NodePath.basename(article.path, NodePath.extname(article.path))) + '.html',
		aId: local.aId
	}
}


module.exports = {
	taskFormula: taskFormula
}
