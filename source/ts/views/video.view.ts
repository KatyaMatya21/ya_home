import View from './../../../node_modules/fluppik/src/view';
import Video from './../module/video';

/**
 * Class VideoView
 */
export default class VideoView extends View {
  private videoInstances: Video[] = [];

  /**
   * Update state
   */
  public updateState() {

    if ( this.videoInstances.length ) {
      this.videoInstances.forEach((video) => {
        video.destroy();
      });
    }

    super.updateState();

    this.videoInstances = [];

    const videos: NodeList = this.element.querySelectorAll('.video');

    for (let k = 0; k < videos.length; k++) {
      // @ts-ignore
      const vv: Video = new Video(videos[k]);
      this.videoInstances.push(vv);
    }
  }

  /**
   * Draw
   */
  protected render(): string {
    const storeData = this.getStoreData();
    const tab: string = storeData.currentTab;

    const html = `
    <div class="grid-video">
      <ul class="grid-video__list">

        <li class="grid-video__cell">
          <div class="video" data-source="http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8">
            <canvas class="video__player"></canvas>
            <div class="video__controls">
              <label class="video__control video__control--brightness">
                Яркость
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <label class="video__control video__control--contrast">
                Контрастность
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <canvas class="video__audio"></canvas>
              <button class="video__close button button--yellow" type="button">Все камеры</button>
            </div>
          </div>
        </li>
  
        <li class="grid-video__cell">
          <div class="video" data-source="http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8">
            <canvas class="video__player"></canvas>
            <div class="video__controls">
              <label class="video__control video__control--brightness">
                Яркость
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <label class="video__control video__control--contrast">
                Контрастность
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <canvas class="video__audio"></canvas>
              <button class="video__close button button--yellow" type="button">Все камеры</button>
            </div>
          </div>
        </li>
  
        <li class="grid-video__cell">
          <div class="video" data-source="http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8">
            <canvas class="video__player"></canvas>
            <div class="video__controls">
              <label class="video__control video__control--brightness">
                Яркость
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <label class="video__control video__control--contrast">
                Контрастность
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <canvas class="video__audio"></canvas>
              <button class="video__close button button--yellow" type="button">Все камеры</button>
            </div>
          </div>
        </li>
  
        <li class="grid-video__cell">
          <div class="video" data-source="http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8">
            <canvas class="video__player"></canvas>
            <div class="video__controls">
              <label class="video__control video__control--brightness">
                Яркость
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <label class="video__control video__control--contrast">
                Контрастность
                <input class="video__input" type="range" value="0" min="-100" max="100">
              </label>
              <canvas class="video__audio"></canvas>
              <button class="video__close button button--yellow" type="button">Все камеры</button>
            </div>
          </div>
        </li>

      </ul>
    </div>`;

    if (tab === 'video') {
      return html;
    } else {
      return '';
    }
  }
}
