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