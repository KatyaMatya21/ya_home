import View from './../../../node_modules/fluppik/src/view';

/**
 * Class EventsView
 */
export default class EventsView extends View {
  /**
   * Draw
   */
  protected render(): string {

    const storeData = this.getStoreData();
    const tab: string = storeData.currentTab;
    const events = storeData.events;

    const template = this.createElementFromHTML( this.getTemplateContent() );
    const moduleTemplate: HTMLElement | null = template.querySelector('.module');
    const moduleStats: HTMLElement | null = template.querySelector('.module__stats');
    const moduleButtons: HTMLElement | null = template.querySelector('.module__buttons');
    const moduleGraph: HTMLElement | null = template.querySelector('.module__graph');
    const modulePlayer: HTMLElement | null = template.querySelector('.player');
    const modulePicture: HTMLElement | null = template.querySelector('.module__picture');
    const moduleDetails: HTMLElement | null = template.querySelector('.module__cam-details');

    let eventsHtml: string = '';

    for (let i = 0; i < events.length; i++) {

      let moduleElement: HTMLElement = moduleTemplate.cloneNode(true) as HTMLElement;
      moduleElement = this.parseTemplate(moduleTemplate.outerHTML, events[i]);

      if (events[i].description === '') {
        ((moduleElement.querySelector('.module__message')) as HTMLElement).classList.add('module__message--disabled');
      }

      if ('data' in events[i]) {

        if (events[i].icon === 'stats') {
          const graph: HTMLElement = moduleGraph.cloneNode(true) as HTMLElement;
          ((moduleElement.querySelector('.module__message')) as HTMLElement).appendChild(graph);
        }

        if (events[i].icon === 'thermal') {
          let stats: HTMLElement = moduleStats.cloneNode(true) as HTMLElement;
          stats = this.parseTemplate(moduleStats.outerHTML, events[i].data);
          ((moduleElement.querySelector('.module__message')) as HTMLElement).appendChild(stats);
        }

        if (events[i].icon === 'music') {
          let player: HTMLElement = modulePlayer.cloneNode(true) as HTMLElement;
          player = this.parseTemplate(modulePlayer.outerHTML, {
            albumcover: events[i].data.albumcover,
            artist: events[i].data.artist,
            name: events[i].data.track.name,
            length: events[i].data.track.length,
            volume: events[i].data.volume,
          });
          ((moduleElement.querySelector('.module__message')) as HTMLElement).appendChild(player);
        }

        if (events[i].icon === 'fridge') {
          const buttons: HTMLElement = moduleButtons.cloneNode(true) as HTMLElement;
          const buttonsList: NodeList = buttons.querySelectorAll('.button');

          for (let j = 0; j < buttonsList.length; j++) {
            buttonsList[j].textContent = events[i].data.buttons[j];
          }

          ((moduleElement.querySelector('.module__message')) as HTMLElement).appendChild(buttons);
        }

        if (events[i].icon === 'cam') {
          const picture: HTMLElement = modulePicture.cloneNode(true) as HTMLElement;
          const details: HTMLElement = moduleDetails.cloneNode(true) as HTMLElement;
          ((moduleElement.querySelector('.module__message')) as HTMLElement).appendChild(picture);
          ((moduleElement.querySelector('.module__message')) as HTMLElement).appendChild(details);
        }

      }

      eventsHtml += moduleElement.outerHTML;

    }

    const html = `
      <h2 class="page-content__title">События</h2>
      <div class="grid">${eventsHtml}</div>`;

    if ( tab === 'events' ) {
      return html;
    } else {
      return '';
    }
  }

  /**
   * Parses template and replaces parameters
   */
  private parseTemplate(template: string, variables: any): HTMLElement {
    let result = template;
    Object.keys(variables).forEach(function (key) {
      if (variables[key] === null) {
        variables[key] = '';
      }
      result = result.replace('{{ ' + key + ' }}', variables[key]);
    });
    return this.createElementFromHTML(result);
  }

  /**
   * Creates element from html
   */
  private createElementFromHTML(htmlString: string): HTMLElement {
    const div: HTMLElement = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild as HTMLElement;
  }

  /**
   * Gets module template
   */
  private getTemplateContent() {
    return `
    <div>
      <article class="module module--{{ type }} grid__cell grid__cell--{{ size }}" tabindex="0">
      <div class="module__top">
        <h3 class="module__title">
          <span class="module__name">{{ title }}</span>
          <span class="module__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <use xlink:href="#{{ icon }}"></use>
            </svg>
          </span>
        </h3>
        <p class="module__details">
          <span class="module__type">{{ source }}</span>
          <span class="module__date">{{ time }}</span>
        </p>
      </div>
      <div class="module__message">{{ description }}</div>
      <button class="module__close" type="button">
        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <use xlink:href="#cross"></use>
        </svg>
        <span class="visually-hidden">Понятно!</span>
      </button>
      <button class="module__next" type="button">
        <svg width="10" height="16" viewBox="0 0 10 16" xmlns="http://www.w3.org/2000/svg">
          <use xlink:href="#next"></use>
        </svg>
        <span class="visually-hidden">Дальше!</span>
      </button>
    </article>
  
    <img class="module__graph" src="images/data.svg" alt="Еженедельный отчет по расходам ресурсов">
  
    <p class="module__stats">
      <span class="module__degree">
        Температура: <strong>{{ temperature }} C</strong>
      </span>
      <span class="module__humidity">
        Влажность: <strong>{{ humidity }}%</strong>
      </span>
    </p>
  
    <div class="player">
      <div class="player__song">
        <img class="player__image" src="{{ albumcover }}" width="53" height="52" alt="Обложка альбома">
        <div class="player__right">
          <div class="player__name-wrap">
            <p class="player__name">{{ artist }} – {{ name }}</p>
          </div>
          <div class="player__line">
            <button class="player__button"><span class="visually-hidden">Перемотка</span></button>
          </div>
          <span class="player__num">{{ length }}</span>
        </div>
      </div>
      <div class="player__controls">
        <p class="player__controls-wrap">
          <button class="player__control player__control--prev" type="button"><span class="visually-hidden">Перемотай назад</span></button>
          <button class="player__control player__control--next" type="button"><span class="visually-hidden">Перемотай вперёд</span></button>
        </p>
        <div class="player__right">
          <div class="player__line">
            <button class="player__button"><span class="visually-hidden">Громкость</span></button>
          </div>
          <span class="player__num">{{ volume }}%</span>
        </div>
      </div>
    </div>
  
    <p class="module__buttons">
      <button class="button button--yellow" type="button"></button>
      <button class="button button--gray" type="button"></button>
    </p>
  
    <div class="module__picture">
      <picture>
        <source srcset="images/robot-cleaner@2x.webp 1x, images/robot-cleaner@3x.webp 2x" media="(min-width: 1440px)" type="image/webp">
        <source srcset="images/robot-cleaner@2x.jpg 1x, images/robot-cleaner@3x.jpg 2x" media="(min-width: 1440px)">
        <source srcset="images/robot-cleaner@1x.webp 1x, images/robot-cleaner@2x.webp 2x" type="image/webp">
        <img class="module__image" src="images/robot-cleaner@1x.jpg" srcset="images/robot-cleaner@1x.jpg 1x, images/robot-cleaner@2x.jpg 2x" alt="Вид с камеры в гостиной">
      </picture>
      <span class="module__indicator"><span class="visually-hidden">Я ползунок!</span></span>
    </div>
    <div class="module__cam-details">
      <span class="module__scale">Приближение: <strong>78%</strong></span>
      <span class="module__light">Яркость: <strong>50%</strong></span>
    </div>
  </div>
    `;
  }
}
