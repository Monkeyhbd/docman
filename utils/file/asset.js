const NodePath = require('node:path')
const NodeFs = require('node:fs')
const { pathType } = require('./index')


/** Copy the assets that included under the domElement to dist directory.
 *  - `domElement` : Scope of elements.
 *  - `tagNames` : List of HTML tag name, such as `['link', 'script', 'img']` .
 *  - `attrNames` : List of HTML attribute name, such as `['src', 'href']` .
 *  - `inputDir` : Root directory of the document project.
 *  - `inputDirMdDir` : Relative path from inputDir to the directory of the markdown file.
 *  - `outputDir` : Root of dist directory.
 *  - `outputDirHtmlDir` : Relative path from outputDir to the directory of the built html file.
 */
function copyAssets(domElement, tagNames, attrNames, inputDir, inputDirMdDir, outputDir, outputDirHtmlDir) {
	for (var idxT = 0; idxT < tagNames.length; idxT += 1) {
		var tagName = tagNames[idxT]
		var tagElements = domElement.getElementsByTagName(tagName)
		for (var idxTE = 0; idxTE < tagElements.length; idxTE += 1) {
			var tagElement = tagElements[idxTE]
			for (var idxA = 0; idxA < attrNames.length; idxA += 1) {
				var attrName = attrNames[idxA]
				// console.log(tagElement[attrName])
				if (tagElement[attrName] != undefined && tagElement[attrName] != '') {
					var t = pathType(tagElement[attrName])
					if (t == 'relative') {
						var distAsset = copyRelativeAsset(inputDir, inputDirMdDir, tagElement[attrName], outputDir)
						distAsset = NodePath.relative(outputDir, distAsset)
						tagElement[attrName] = NodePath.relative(outputDirHtmlDir, distAsset)
					}
					else if (t == 'absolute') {
						var distAsset = copyAbsoluteAsset(tagElement[attrName], outputDir)
						distAsset = NodePath.relative(outputDir, distAsset)
						tagElement[attrName] = NodePath.relative(outputDirHtmlDir, distAsset)
					}
					else {}
				}
			}
		}
	}
}


// inputDir2MdDir is the path that the relative path of the asset relative from,
//     it must be a relative path relative to inputDir.
function copyRelativeAsset(inputDir, inputDir2MdDir, mdDir2Asset, outputDir) {
	var inputDir2Asset = NodePath.join(inputDir2MdDir, mdDir2Asset)
	var assetPath = NodePath.join(inputDir, inputDir2Asset)
	if (inputDir2Asset.length >= 2 && inputDir2Asset.slice(0, 2) == '..') {  // Assset is out of inputDir.
		var fileRename = assetHashName(assetPath)
		var desPath = NodePath.join(outputDir, './docman-assets', fileRename)
		return copyAsset(assetPath, desPath)
	}
	else {  // Asset is in inputDir.
		var desPath = NodePath.join(outputDir, inputDir2Asset)
		return copyAsset(assetPath, desPath)
	}
}


function copyAbsoluteAsset(assetPath, outputDir) {
	var fileRename = assetHashName(assetPath)
	var desPath = NodePath.join(outputDir, './docman-assets', fileRename)
	return copyAsset(assetPath, desPath)
}


// Rename asset by hash. Format: asset.123abc.ext
function assetHashName(assetPath) {
	var buffer = NodeFs.readFileSync(assetPath)
	var fsHash = crypto.createHash('sha256')
	fsHash.update(buffer)
	var md5 = fsHash.digest('hex')
	var extname = NodePath.extname(assetPath)
	var fileRename = NodePath.basename(assetPath, extname) + '.' + md5.slice(0, 8) + extname
	return fileRename
}


// srcPath is the path of asset, can be relative path or absolute path.
// desPath is the path that asset copy to.
function copyAsset(srcPath, desPath) {
	// Make sure desDir exist.
	var desDir = NodePath.dirname(desPath)
	try {
		NodeFs.accessSync(desDir)
	}
	catch (err) {
		NodeFs.mkdirSync(desDir, {recursive: true})
	}
	console.log(`Copy: ${srcPath}   -->   ${desPath}`)
	NodeFs.copyFileSync(srcPath, desPath)
	return desPath
}


/**
 * - `srcPath` : Path of folder.
 * - `desPath` : Path that folder copy to.
 */
function copyFolder(srcPath, desPath) {
	var tasks = [{from: srcPath, to: desPath}]
	// Level traversal.
	while (tasks.length > 0) {
		var task = tasks.shift()
		var targets = NodeFs.readdirSync(task.from)
		for (var idx = 0; idx < targets.length; idx += 1) {
			var target = targets[idx]
			var from = NodePath.join(task.from, target)
			var to = NodePath.join(task.to, target)
			if (NodeFs.statSync(from).isFile()) {
				copyAsset(from, to)
			}
			else {
				tasks.push({from: from, to: to})
			}
		}
	}
}


module.exports = {
	copyAssets: copyAssets,
	copyFolder: copyFolder
}
