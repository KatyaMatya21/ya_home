import initMenus from './module/menu';

import Dispatcher from './../../node_modules/fluppik/src/dispatcher';
import Store from './../../node_modules/fluppik/src/store';

import EventsView from './views/events.view';
import VideoView from './views/video.view';

interface Idata {
  events: Ievent[];
}

interface Ievent {
  type: string;
  title: string;
  source: string;
  time: string;
  description: string;
  icon: string;
  data?: IeventData;
  size: string;
}

interface IeventData {
  type?: string;
  temperature?: number;
  humidity?: number;
  albumcover?: string;
  artist?: string;
  track?: Itrack;
  volume?: number;
  buttons?: string[];
}

interface Itrack {
  name: string;
  length: string;
}

initMenus();

let dataEvents: Idata;
const xhr = new XMLHttpRequest();
xhr.open('GET', '../events.json', false);
xhr.send();
if (xhr.status !== 200) {
  alert(xhr.status + ': ' + xhr.statusText);
} else {
  dataEvents = JSON.parse(xhr.responseText).events;
}

// Инициализация Dispatcher и Store
const dispatcher = new Dispatcher();
const store = new Store({
  currentTab: 'events',
  events: dataEvents,
});

store.connectDispatcher(dispatcher);

store.onAction('changeType', (tab, state) => {
  state.currentTab = tab;
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
