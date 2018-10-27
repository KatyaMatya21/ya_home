export default function initMenus() {
  const buttonMenu: HTMLElement | null = document.querySelector('.js-menu-button');
  const menu: HTMLElement | null = document.querySelector('.header-menu');
  const classString: string = 'header-menu--opened';

  function toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className);
  }

  if (buttonMenu && menu) {
    /**
     * EventListener on click menu button
     */
    buttonMenu.addEventListener('click', () => toggleClass(menu, classString));
  }
}
