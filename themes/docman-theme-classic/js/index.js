function toggleMainLeft() {
	var mainLeft = document.getElementsByClassName('main-left')[0];
	if (mainLeft.classList.contains('open')) {
		mainLeft.classList.add('close');
		mainLeft.classList.remove('open');
	}
	else {
		mainLeft.classList.add('open');
		mainLeft.classList.remove('close');
	}
}


function contentScrollPositionRemember(elem) {
	sessionStorage.setItem('contentScrollTop', elem.scrollTop)
}


function contentScrollPositionRestore() {
	var elem = document.getElementsByClassName('main-left')[0]
	var scrollTop = sessionStorage.getItem('contentScrollTop')
	elem.scrollTop = scrollTop
}
