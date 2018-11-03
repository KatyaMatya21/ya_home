export default function initModules() {

  const grid: HTMLElement | null = document.querySelector('.grid');
  const template: HTMLTemplateElement | null = document.querySelector('#moduleTemplate');

  const moduleTemplate: HTMLElement | null = template.content.querySelector('.module');
  const moduleStats: HTMLElement | null = template.content.querySelector('.module__stats');
  const moduleButtons: HTMLElement | null = template.content.querySelector('.module__buttons');
  const moduleGraph: HTMLElement | null = template.content.querySelector('.module__graph');
  const modulePlayer: HTMLElement | null = template.content.querySelector('.player');
  const modulePicture: HTMLElement | null = template.content.querySelector('.module__picture');
  const moduleDetails: HTMLElement | null = template.content.querySelector('.module__cam-details');

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

  let data: Idata;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'events.json', false);
  xhr.send();
  if (xhr.status !== 200) {
    alert(xhr.status + ': ' + xhr.statusText);
  } else {
    data = JSON.parse(xhr.responseText);
  }

  const events = data.events;

  /**
   * Creates element from html
   * @param {string} htmlString
   * @returns {HTMLElement}
   */
  function createElementFromHTML(htmlString: string): HTMLElement {
    const div: HTMLElement = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild as HTMLElement;
  }

  /**
   * Parses template and replaces parameters
   * @param {HTMLElement} templateElement
   * @param {object} variables
   * @returns {Node}
   */
  function parseTemplate(templateElement: HTMLElement, variables: any): HTMLElement {
    let result = templateElement.outerHTML;
    Object.keys(variables).forEach(function (key) {
      if (variables[key] === null) {
        variables[key] = '';
      }
      result = result.replace('{{ ' + key + ' }}', variables[key]);
    });
    return createElementFromHTML(result);
  }

  for (let i = 0; i < events.length; i++) {

    let module: HTMLElement = moduleTemplate.cloneNode(true) as HTMLElement;
    module = parseTemplate(moduleTemplate, events[i]);

    if (events[i].description === '') {
      ((module.querySelector('.module__message')) as HTMLElement).classList.add('module__message--disabled');
    }

    if ('data' in events[i]) {

      if (events[i].icon === 'stats') {
        const graph: HTMLElement = moduleGraph.cloneNode(true) as HTMLElement;
        ((module.querySelector('.module__message')) as HTMLElement).appendChild(graph);
      }

      if (events[i].icon === 'thermal') {
        let stats: HTMLElement = moduleStats.cloneNode(true) as HTMLElement;
        stats = parseTemplate(moduleStats, events[i].data);
        ((module.querySelector('.module__message')) as HTMLElement).appendChild(stats);
      }

      if (events[i].icon === 'music') {
        let player: HTMLElement = modulePlayer.cloneNode(true) as HTMLElement;
        player = parseTemplate(modulePlayer, {
          albumcover: events[i].data.albumcover,
          artist: events[i].data.artist,
          name: events[i].data.track.name,
          length: events[i].data.track.length,
          volume: events[i].data.volume,
        });
        ((module.querySelector('.module__message')) as HTMLElement).appendChild(player);
      }

      if (events[i].icon === 'fridge') {
        const buttons: HTMLElement = moduleButtons.cloneNode(true) as HTMLElement;
        const buttonsList: NodeList = buttons.querySelectorAll('.button');

        for (let j = 0; j < buttonsList.length; j++) {
          buttonsList[j].textContent = events[i].data.buttons[j];
        }

        ((module.querySelector('.module__message')) as HTMLElement).appendChild(buttons);
      }

      if (events[i].icon === 'cam') {
        const picture: HTMLElement = modulePicture.cloneNode(true) as HTMLElement;
        const details: HTMLElement = moduleDetails.cloneNode(true) as HTMLElement;
        ((module.querySelector('.module__message')) as HTMLElement).appendChild(picture);
        ((module.querySelector('.module__message')) as HTMLElement).appendChild(details);
      }

    }

    if (grid) {
      grid.appendChild(module);
    }
  }

}
