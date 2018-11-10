import initMenus from './module/menu';

import Dispatcher from './../../node_modules/fluppik/src/dispatcher';
import Store from './../../node_modules/fluppik/src/store';

import EventsView from './views/events.view';
import VideoView from './views/video.view';

initMenus();

let storageState: any = {
  currentTab: 'events',
  events: [],
};

const savedStateString: string | null = localStorage.getItem('home_app_state');
if (savedStateString) {
  storageState = JSON.parse(savedStateString);
} else {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '../events.json', false);
  xhr.send();
  if (xhr.status !== 200) {
    alert(xhr.status + ': ' + xhr.statusText);
  } else {
    storageState.events = JSON.parse(xhr.responseText).events;
  }
}

// Инициализация Dispatcher и Store
const dispatcher = new Dispatcher();
const store = new Store(storageState);

store.connectDispatcher(dispatcher);

store.onAction('changeType', (tab, state) => {
  state.currentTab = tab;
  localStorage.setItem('home_app_state', JSON.stringify(state));
});

// Переключатели
const tabs = document.querySelectorAll('.header-menu__link[data-tab]');

function onTabClick(event: Event): void {
  event.preventDefault();
  const tab: string = (event.target as HTMLElement).dataset.tab;
  if (tab) {
    dispatcher.dispatch('changeType', tab);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', (event) => {
    onTabClick(event);
  });
});

const containerEvents: HTMLElement = document.querySelector('.view-events');
const containerVideo: HTMLElement = document.querySelector('.view-video');

// View Events
const events: EventsView = new EventsView(containerEvents);
events.connectDispatcher(dispatcher);
events.connectStore(store);
events.updateState();

// View Video
const video: VideoView = new VideoView(containerVideo);
video.connectDispatcher(dispatcher);
video.connectStore(store);
video.updateState();
