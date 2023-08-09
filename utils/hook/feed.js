function feed(hook, attr, food) {
	if (hook != undefined) {
		hook[attr] = food
	}
}


function operate(hook, attr, render, argv=[]) {
	feed(hook, attr, render.apply(render, argv))
}


module.exports = {
	feed: feed,
	operate, operate
}
