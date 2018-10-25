var menu = document.querySelector('.header-menu');
var buttonMenu = document.querySelector('.js-menu-button');

/**
 * EventListener on click menu button
 */
if (buttonMenu) {
  buttonMenu.addEventListener('click', function () {
    if (menu) {
      menu.classList.toggle('header-menu--opened');
    }
  });
}
