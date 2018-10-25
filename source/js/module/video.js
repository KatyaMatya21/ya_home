(function () {

  /**
   * Video represents single video block
   * @constructor
   */
  function Video(item) {
    this.item = item;
    this.video = null;
    this.canvas = null;
    this.context = null;

    this.canvasAudio = null;
    this.contextAudio = null;
    this.analyser = null;

    this.brightness = 0;
    this.contrast = 0;

    this.init();
  }

  /**
   * Start initialization
   */
  Video.prototype.init = function () {
    this.video = this.createVideo();
    this.initVideo(this.video, this.item.dataset.source);

    this.canvas = this.item.querySelector('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.item.querySelector('.video__player').addEventListener('click', this.show.bind(this));
    this.item.querySelector('.video__control--brightness input').addEventListener('change', this.changeBrightness.bind(this));
    this.item.querySelector('.video__control--contrast input').addEventListener('change', this.changeContrast.bind(this));

    this.video.addEventListener('play', this.onPlay.bind(this));

    this.audioAnalyser();
  };

  /**
   * Initialization video
   * @param video
   * @param url
   */
  Video.prototype.initVideo = function (video, url) {
    if (window.Hsl && window.Hsl.isSupported()) {
      var hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
      video.addEventListener('loadedmetadata', function () {
        video.play();
      });
    }
  };

  /**
   * Create video element
   * @returns {HTMLElement}
   */
  Video.prototype.createVideo = function () {
    var video = document.createElement("video");

    video.autoPlay = true;
    video.loop = true;
    video.muted = true;
    video.preload = 'auto';

    return video;
  };

  /**
   * On play
   */
  Video.prototype.onPlay = function () {
    this.then = Date.now();
    requestAnimationFrame(this.drawVideo.bind(this), this.canvas);
  };

  /**
   * Draw video
   */
  Video.prototype.drawVideo = function () {
    var self = this;

    var fps = 24;
    var interval = 1000 / fps;
    var now = Date.now();
    var delta = now - this.then;

    requestAnimationFrame(self.drawVideo.bind(self), self.canvas);

    if (!self.video.paused && !self.video.ended && delta > interval) {

      this.then = now - (delta % interval);

      self.canvas.width = self.canvas.clientWidth;
      self.canvas.height = self.canvas.clientHeight;

      var scale = Math.min(
        self.canvas.width / self.video.videoWidth,
        self.canvas.height / self.video.videoHeight) * 1.2;

      var vidH = self.video.videoHeight;
      var vidW = self.video.videoWidth;
      var top = self.canvas.height / 2 - (vidH / 2) * scale;
      var left = self.canvas.width / 2 - (vidW / 2) * scale;

      self.context.drawImage(self.video, left, top, vidW * scale, vidH * scale);

      var imageData = self.context.getImageData(0, 0, self.canvas.width, self.canvas.height);
      var data = imageData.data;

      self.applyBrightness(data, self.brightness);
      self.applyContrast(data, parseInt(self.contrast, 10));

      self.context.putImageData(imageData, 0, 0);
    }
  };

  /**
   * Make sure the value stay between 0 and 255
   * @param value
   * @returns {*}
   */
  Video.prototype.truncateColor = function (value) {
    if (value < 0) {
      value = 0;
    } else if (value > 255) {
      value = 255;
    }

    return value;
  };

  /**
   * Set brightness
   * @param data
   * @param brightness
   */
  Video.prototype.applyBrightness = function (data, brightness) {
    for (var i = 0; i < data.length; i += 4) {
      data[i] += 255 * (brightness / 100);
      data[i + 1] += 255 * (brightness / 100);
      data[i + 2] += 255 * (brightness / 100);
    }
  };

  /**
   * Set contrast
   * @param data
   * @param contrast
   */
  Video.prototype.applyContrast = function (data, contrast) {
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (var i = 0; i < data.length; i += 4) {
      data[i] = this.truncateColor(factor * (data[i] - 128) + 128);
      data[i + 1] = this.truncateColor(factor * (data[i + 1] - 128) + 128);
      data[i + 2] = this.truncateColor(factor * (data[i + 2] - 128) + 128);
    }
  };

  /**
   * Change brightness
   * @param event
   */
  Video.prototype.changeBrightness = function (event) {
    this.brightness = event.target.value;
  };

  /**
   * Change contrast
   * @param event
   */
  Video.prototype.changeContrast = function (event) {
    this.contrast = event.target.value;
  };

  /**
   * Audio analyzer
   */
  Video.prototype.audioAnalyser = function () {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = audioCtx.createAnalyser();

    var source = audioCtx.createMediaElementSource(this.video);
    source.connect(this.analyser);

    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.canvasAudio = this.item.querySelector('.video__audio');

    this.canvasAudio.width = this.canvasAudio.clientWidth;
    this.canvasAudio.height = this.canvasAudio.clientHeight;

    this.contextAudio = this.canvasAudio.getContext('2d');
    this.contextAudio.clearRect(0, 0, this.canvasAudio.clientWidth, this.canvasAudio.clientHeight);

    this.analyser.connect(audioCtx.destination);

    this.drawSound();
  };

  /**
   * Draw histogram
   */
  Video.prototype.drawSound = function () {
    requestAnimationFrame(this.drawSound.bind(this));

    this.analyser.getByteFrequencyData(this.dataArray);

    this.contextAudio.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.contextAudio.fillRect(0, 0, this.canvasAudio.clientWidth, this.canvasAudio.clientHeight);
    var barWidth = (this.canvasAudio.clientWidth / this.bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i] / 2;

      this.contextAudio.fillStyle = 'rgb(' + '50, 50, ' + (barHeight + 100) + ')';
      this.contextAudio.fillRect(x, this.canvasAudio.clientHeight - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  /**
   * Open full video
   * @param event
   */
  Video.prototype.show = function (event) {
    var video = event.target.parentNode;
    if (video.classList.contains('video--show')) {
      return false;
    }
    video.classList.add('video--show');

    this.video.muted = false;
    this.video.play();

    video.querySelector('.video__close').addEventListener('click', this.hide.bind(this));
  };

  /**
   * Close full video
   * @param event
   */
  Video.prototype.hide = function (event) {
    var video = event.target.parentNode.parentNode;
    video.classList.remove('video--show');
    video.style = 'z-index: 666;';

    this.video.muted = true;

    setTimeout(function () {
      video.style = '';
    }, 1000);
  };

  window.Video = Video;

}());
