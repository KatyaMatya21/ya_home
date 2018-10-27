import Video from './video';

export default class VideoController {

  /**
   * VideoController manages video vidgets
   * @constructor
   */
  constructor() {
    this.init();
  }

  /**
   * Start initialization
   */
  private init(): void {
    const videos: NodeList = document.querySelectorAll('.video');

    for (let k = 0; k < videos.length; k++) {
      // @ts-ignore
      const vv: Video = new Video(videos[k]);
    }
  }

}
