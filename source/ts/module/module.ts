var grid = document.querySelector('.grid');

var template = document.querySelector('#moduleTemplate');

var moduleTemplate = template.content.querySelector('.module');
var moduleStats = template.content.querySelector('.module__stats');
var moduleButtons = template.content.querySelector('.module__buttons');
var moduleGraph = template.content.querySelector('.module__graph');
var modulePlayer = template.content.querySelector('.player');
var modulePicture = template.content.querySelector('.module__picture');
var moduleDetails = template.content.querySelector('.module__cam-details');

var data;

var xhr = new XMLHttpRequest();
xhr.open('GET', 'events.json', false);
xhr.send();
if (xhr.status != 200) {
  alert( xhr.status + ': ' + xhr.statusText );
} else {
  data = JSON.parse(xhr.responseText);
}

var events = data.events;

/**
 * Creates element from html
 * @param htmlString
 * @returns {Node}
 */
function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

/**
 * Parses template and replaces parameters
 * @param template
 * @param variables
 * @returns {Node}
 */
function parseTemplate(template, variables) {
  var result = template.outerHTML;
  Object.keys(variables).forEach(function (key) {
    if (variables[key] === null) {
      variables[key] = '';
    }
    result = result.replace('{{ ' + key + ' }}', variables[key]);
  });
  return createElementFromHTML(result);
}

for (var i = 0; i < events.length; i++) {

  var module = moduleTemplate.cloneNode(true);
  module = parseTemplate(moduleTemplate, events[i]);

  if (events[i].description === '') {
    module.querySelector('.module__message').classList.add('module__message--disabled');
  }

  if ('data' in events[i]) {

    if (events[i].icon === 'stats') {
      var graph = moduleGraph.cloneNode(true);
      module.querySelector('.module__message').appendChild(graph);
    }

    if (events[i].icon === 'thermal') {
      var stats = moduleStats.cloneNode(true);
      stats = parseTemplate(moduleStats, events[i].data);
      module.querySelector('.module__message').appendChild(stats);
    }

    if (events[i].icon === 'music') {
      var player = modulePlayer.cloneNode(true);
      player = parseTemplate(modulePlayer, {
        albumcover: events[i].data.albumcover,
        artist: events[i].data.artist,
        name: events[i].data.track.name,
        length: events[i].data.track.length,
        volume: events[i].data.volume
      });
      module.querySelector('.module__message').appendChild(player);
    }

    if (events[i].icon === 'fridge') {
      var buttons = moduleButtons.cloneNode(true);
      var buttonsList = buttons.querySelectorAll('.button');

      for (var j = 0; j < buttonsList.length; j++) {
        buttonsList[j].textContent = events[i].data.buttons[j];
      }

      module.querySelector('.module__message').appendChild(buttons);
    }

    if (events[i].icon === 'cam') {
      var picture = modulePicture.cloneNode(true);
      var details = moduleDetails.cloneNode(true);
      module.querySelector('.module__message').appendChild(picture);
      module.querySelector('.module__message').appendChild(details);
    }

  }

  grid.appendChild(module);
}
