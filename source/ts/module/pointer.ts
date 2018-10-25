var imageContainer = document.querySelector('.module__picture');
var image = document.querySelector('.module__image');
var imageIndicator = document.querySelector('.module__indicator');
var imageScale = document.querySelector('.module__scale strong');
var imageBrightness = document.querySelector('.module__light strong');

var imageWindow = imageContainer.offsetWidth;
var imageWidth = image.offsetWidth;
var imageIndicatorWidth = imageIndicator.offsetWidth;

var pointerArray = [];
var distancePrev = 0;
var currentScale = 1;
var currentBrightness = 100;
var prevAngleChange = 0;

image.style.left = '0px';
imageIndicator.style.left = '0px';

image.style.transform = "scale(" + currentScale + ")";

imageScale.innerHTML = currentScale * 100 + '%';
imageBrightness.innerHTML = currentBrightness + '%';

/**
 * Moves system to start position
 */
var moveToStartPosition = function () {
  imageWindow = imageContainer.offsetWidth;
  imageWidth = image.offsetWidth;
  imageIndicatorWidth = imageIndicator.offsetWidth;

  image.style.left = '0px';
  imageIndicator.style.left = '0px';

  image.style.transform = "scale(" + 1 + ")";

  imageBrightness.innerHTML = '100%';
  imageScale.innerHTML = '100%';
};

/**
 * Calculates distance
 * @param p1
 * @param p2
 * @returns {number}
 */
var getDistance = function (p1, p2) {
  return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
};

/**
 * Calculates angle
 * @param p1
 * @param p2
 * @returns {number}
 */
var getAngle = function (p1, p2) {
  return Math.atan2(p1.y - p2.y, p1.x - p2.x);
};

/**
 * Moves picture
 * @param index
 */
var onMove = function (index) {
  var startX = pointerArray[index].prevPosition.x;
  var x = event.x;
  var dx = x - startX;

  var left = image.style.left.replace('px', '') * 1;
  var leftIndicator = imageIndicator.style.left.replace('px', '') * 1;

  var dleft = (imageWindow - imageIndicatorWidth) / (imageWidth - imageWindow);

  dx > 0 ? left += Math.abs(dx) : left -= Math.abs(dx);
  dx > 0 ? leftIndicator -= Math.abs(dx) * dleft : leftIndicator += Math.abs(dx) * dleft;

  if (left > 0) {
    left = 0;
    leftIndicator = 0;
  }

  if (left < imageWindow - imageWidth) {
    left = imageWindow - imageWidth;
    leftIndicator = imageWindow - imageIndicatorWidth;
  }

  image.style.left = left + 'px';
  pointerArray[index].prevPosition.x = x;

  imageIndicator.style.left = leftIndicator + 'px';
};

/**
 * Pinches zoom
 */
var onPinch = function () {

  var pinchTreshold = 30;

  var distance = getDistance(pointerArray[0].currentPosition, pointerArray[1].currentPosition);
  var distanceStart = getDistance(pointerArray[0].startPosition, pointerArray[1].startPosition);

  if (Math.abs(distance - distanceStart) < pinchTreshold) {
    return;
  }

  if (distancePrev) {
    var scale = 0.03;

    if (distance > distancePrev) {
      currentScale += scale;
    } else {
      currentScale -= scale;
      if (currentScale <= 1) {
        currentScale = 1;
      }
    }

    image.style.transform = "scale(" + currentScale + ")";
    imageScale.innerHTML = Math.ceil(currentScale * 100) + '%';
  }

  distancePrev = distance;
};

/**
 * Rotates brightness
 */
var onRotate = function () {

  var rotateTreshold = 0.5;

  var startAngle = getAngle(pointerArray[0].startPosition, pointerArray[1].startPosition);
  var currentAngle = getAngle(pointerArray[0].currentPosition, pointerArray[1].currentPosition);
  var angleChange = (currentAngle - startAngle) * 180 / Math.PI;

  if (prevAngleChange) {
    if (Math.abs(startAngle - currentAngle) < rotateTreshold) {
      return;
    }

    if (angleChange < 0) {
      angleChange += 360;
    }

    if (prevAngleChange < angleChange) {
      currentBrightness += 1;
    } else {
      currentBrightness -= 1;
    }

    if (currentBrightness > 100) {
      currentBrightness = 100;
    }

    if (currentBrightness < 0) {
      currentBrightness = 0;
    }

    image.style.filter = 'brightness(' + currentBrightness + '%)';
    imageBrightness.innerHTML = Math.ceil(currentBrightness) + '%';

  }

  prevAngleChange = angleChange;

};

/**
 * EventListener on window resize
 */
window.addEventListener('resize', function () {
  moveToStartPosition();
});

/**
 * EventListener on pointerdown
 */
imageContainer.addEventListener('pointerdown', function (event) {
  imageContainer.setPointerCapture(event.pointerId);

  pointerArray.push({
    id: event.pointerId,
    startPosition: {
      x: event.x,
      y: event.y
    },
    prevPosition: {
      x: event.x,
      y: event.y
    },
    currentPosition: {
      x: event.x,
      y: event.y
    }
  });
});

/**
 * EventListener on pointermove
 */
imageContainer.addEventListener('pointermove', function (event) {
  if (pointerArray.length === 0) {
    return
  }

  var index = null;
  for (var i = 0; i < pointerArray.length; i++) {
    if (pointerArray[i].id === event.pointerId) {
      index = i;
      break;
    }
  }

  pointerArray[index].currentPosition.x = event.x;
  pointerArray[index].currentPosition.y = event.y;

  if (pointerArray.length > 1) {

    onPinch();

    onRotate();

  } else {

    onMove(index);

  }
});

/**
 * EventListener on pointerup
 */
imageContainer.addEventListener('pointerup', function (event) {
  var index = null;

  for (var i = 0; i < pointerArray.length; i++) {
    if (pointerArray[i].id === event.pointerId) {
      index = i;
    }
  }

  pointerArray.splice(pointerArray[index], 1);
});

/**
 * EventListener on pointercancel
 */
imageContainer.addEventListener('pointercancel', moveToStartPosition);
