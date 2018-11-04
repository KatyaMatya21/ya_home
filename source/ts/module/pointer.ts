export default function initPointers() {

  const imageContainer: HTMLElement = document.querySelector('.module__picture');
  const image: HTMLElement = document.querySelector('.module__image');
  const imageIndicator: HTMLElement = document.querySelector('.module__indicator');
  const imageScale: HTMLElement = document.querySelector('.module__scale strong');
  const imageBrightness: HTMLElement = document.querySelector('.module__light strong');

  let imageWindow: number = imageContainer.offsetWidth;
  let imageWidth: number = image.offsetWidth;
  let imageIndicatorWidth: number = imageIndicator.offsetWidth;

  interface IPosition {
    x: number;
    y: number;
  }

  interface IPointer {
    id: number;
    startPosition: IPosition;
    currentPosition: IPosition;
    prevPosition: IPosition;
  }

  const pointerArray: IPointer[] = [];
  let distancePrev: number = 0;
  let currentScale: number = 1;
  let currentBrightness: number = 100;
  let prevAngleChange: number = 0;

  image.style.left = '0px';
  imageIndicator.style.left = '0px';

  image.style.transform = "scale(" + currentScale + ")";

  imageScale.innerHTML = currentScale * 100 + '%';
  imageBrightness.innerHTML = currentBrightness + '%';

  /**
   * Moves system to start position
   */
  const moveToStartPosition = function (): void {
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
   */
  const getDistance = function (p1: IPosition, p2: IPosition) {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
  };

  /**
   * Calculates angle
   */
  const getAngle = function (p1: IPosition, p2: IPosition) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x);
  };

  /**
   * Moves picture
   */
  const onMove = function (index: number, event: PointerEvent) {
    const startX: number = pointerArray[index].prevPosition.x;
    const x: number = event.x;
    const dx: number = x - startX;

    let left: number = parseFloat(image.style.left.replace('px', ''));
    let leftIndicator: number = parseFloat(imageIndicator.style.left.replace('px', ''));

    const dleft: number = (imageWindow - imageIndicatorWidth) / (imageWidth - imageWindow);

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
  const onPinch = function () {

    const pinchTreshold: number = 30;

    const distance: number = getDistance(pointerArray[0].currentPosition, pointerArray[1].currentPosition);
    const distanceStart: number = getDistance(pointerArray[0].startPosition, pointerArray[1].startPosition);

    if (Math.abs(distance - distanceStart) < pinchTreshold) {
      return;
    }

    if (distancePrev) {
      const scale = 0.03;

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
  const onRotate = function () {

    const rotateTreshold = 0.5;

    const startAngle: number = getAngle(pointerArray[0].startPosition, pointerArray[1].startPosition);
    const currentAngle: number = getAngle(pointerArray[0].currentPosition, pointerArray[1].currentPosition);
    let angleChange: number = (currentAngle - startAngle) * 180 / Math.PI;

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
  window.addEventListener('resize', () => moveToStartPosition());

  /**
   * EventListener on pointerdown
   */
  imageContainer.addEventListener('pointerdown', function (event: PointerEvent): void {
    imageContainer.setPointerCapture(event.pointerId);

    pointerArray.push({
      id: event.pointerId,
      startPosition: {
        x: event.x,
        y: event.y,
      },
      prevPosition: {
        x: event.x,
        y: event.y,
      },
      currentPosition: {
        x: event.x,
        y: event.y,
      },
    });
  });

  /**
   * EventListener on pointermove
   */
  imageContainer.addEventListener('pointermove', function (event: PointerEvent): void {
    if (pointerArray.length === 0) {
      return;
    }

    let index: number | null = null;
    for (let i = 0; i < pointerArray.length; i++) {
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

      onMove(index, event);

    }
  });

  /**
   * EventListener on pointerup
   */
  imageContainer.addEventListener('pointerup', function (event): void {
    let index = null;

    for (let i = 0; i < pointerArray.length; i++) {
      if (pointerArray[i].id === event.pointerId) {
        index = i;
      }
    }

    pointerArray.splice(index, 1);
  });

  /**
   * EventListener on pointercancel
   */
  imageContainer.addEventListener('pointercancel', moveToStartPosition);
}
