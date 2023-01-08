const fs = require('fs')
const path = require('path')
const crypto = require('crypto')


// Determine the type of path. Type can be 'absolute', 'relative' or 'web'.
function pathType(pathString) {
	if (path.isAbsolute(pathString)) {
		return 'absolute'
	}
	else {
		if (pathString.length >= 7 && pathString.slice(0, 7) == "http://" || pathString.length >= 8 && pathString.slice(0, 8) == "https://") {
			return 'web'
		}
		else {
			return 'relative'
		}
	}
}


// Copy the assets that included by domElement's chilren element to dist directory.
// tagNames such as ['link', 'script', 'img'].
// attrNames such as ['src', 'href'].
// inputDir is the directory of the document project.
// inputDirMdDir is the relative path from inputDir to the directory of the markdown file.
// outputDir is the dist directory.
// outputDirHtmlDir is the relative path from outputDir to the directory of the built html file.
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
						distAsset = path.relative(outputDir, distAsset)
						tagElement[attrName] = path.relative(outputDirHtmlDir, distAsset)
					}
					else if (t == 'absolute') {
						var distAsset = copyAbsoluteAsset(tagElement[attrName], outputDir)
						distAsset = path.relative(outputDir, distAsset)
						tagElement[attrName] = path.relative(outputDirHtmlDir, distAsset)
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
	var inputDir2Asset = path.join(inputDir2MdDir, mdDir2Asset)
	var assetPath = path.join(inputDir, inputDir2Asset)
	if (inputDir2Asset.length >= 2 && inputDir2Asset.slice(0, 2) == '..') {  // Assset is out of inputDir.
		var fileRename = assetHashName(assetPath)
		var desPath = path.join(outputDir, './docman-assets', fileRename)
		return copyAsset(assetPath, desPath)
	}
	else {  // Asset is in inputDir.
		var desPath = path.join(outputDir, inputDir2Asset)
		return copyAsset(assetPath, desPath)
	}
}


function copyAbsoluteAsset(assetPath, outputDir) {
	var fileRename = assetHashName(assetPath)
	var desPath = path.join(outputDir, './docman-assets', fileRename)
	return copyAsset(assetPath, desPath)
}


// Rename asset by hash. Format: asset.123abc.ext
function assetHashName(assetPath) {
	var buffer = fs.readFileSync(assetPath)
	var fsHash = crypto.createHash('sha256')
	fsHash.update(buffer)
	var md5 = fsHash.digest('hex')
	var extname = path.extname(assetPath)
	var fileRename = path.basename(assetPath, extname) + '.' + md5.slice(0, 8) + extname
	return fileRename
}


// srcPath is the path of asset, can be relative path or absolute path.
// desPath is the path that asset copy to.
function copyAsset(srcPath, desPath) {
	// Make sure desDir exist.
	var desDir = path.dirname(desPath)
	try {
		fs.accessSync(desDir)
	}
	catch (err) {
		fs.mkdirSync(desDir, {recursive: true})
	}
	console.log(`Copy: ${srcPath}   -->   ${desPath}`)
	fs.copyFileSync(srcPath, desPath)
	return desPath
}


// srcPath is the path of folder, can be relative path or absolute path.
// desPath is the path that folder copy to.
function copyFolder(srcPath, desPath) {
	var tasks = [{from: srcPath, to: desPath}]
	while (tasks.length > 0) {
		var task = tasks.shift()
		var targets = fs.readdirSync(task.from)
		for (var idx = 0; idx < targets.length; idx += 1) {
			var target = targets[idx]
			var from = path.join(task.from, target)
			var to = path.join(task.to, target)
			if (fs.statSync(from).isFile()) {
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
