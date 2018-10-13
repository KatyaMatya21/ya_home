(function () {

  /**
   * Video controller
   * @constructor
   */
  function VideoController() {
    this.init();
  }

  /**
   * Initialization
   */
  VideoController.prototype.init = function () {
    var videos = document.querySelectorAll('.video');

    for (var k = 0; k < videos.length; k++) {
      new Video(videos[k]);
    }
  };

  window.VideoController = VideoController;

}());

new window.VideoController();