var buttonMenu = document.querySelector('.js-menu-button');
var menu = document.querySelector('.header-menu');

/**
 * EventListener on click menu button
 */
buttonMenu.addEventListener('click', function () {
  menu.classList.toggle('header-menu--opened');
});
