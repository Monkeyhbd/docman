// Hooks operations


function feed(hook, food, attr='innerHTML') {
	if (hook != undefined) {
		hook[attr] = food;
	}
}


module.exports = {
	feed: feed
}
