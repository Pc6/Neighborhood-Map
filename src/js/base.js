var tap = document.querySelector('#nav-btn'),
	drawer = document.querySelector('#drawer');
tap.onclick = function() {
	drawer.classList.toggle('switch');
}