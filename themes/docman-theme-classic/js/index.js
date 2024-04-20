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
  sessionStorage.setItem('contentScrollTop', elem.scrollTop);
}


function contentScrollPositionRestore() {
  var elem = document.getElementsByClassName('main-left')[0];
  var scrollTop = sessionStorage.getItem('contentScrollTop');
  elem.scrollTop = scrollTop;
}


function setDarkMode(status='on') {
  localStorage.setItem('darkMode', status);
}


function getDarkMode() {
  return localStorage.getItem('darkMode');
}


function toggleDarkMode() {
  var html = document.documentElement;
  if ('on' == getDarkMode()) {
    html.classList.remove('dark-mode');
    setDarkMode('off');
  }
  else {
    html.classList.add('dark-mode');
    setDarkMode('on');
  }
}


function reloadDarkMode() {
  var html = document.documentElement;
  if ('on' == getDarkMode()) {
    html.classList.add('dark-mode');
  }
  else {
    html.classList.remove('dark-mode');
  }
}
