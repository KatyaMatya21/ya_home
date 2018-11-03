/**
 * Video represents single video block
 * @constructor
 */
export default class Video {
  private item: HTMLElement;
  private video: HTMLVideoElement | null;
  private canvas: HTMLCanvasElement | null;
  private context: CanvasRenderingContext2D | null;
  private canvasAudio: HTMLCanvasElement | null;
  private contextAudio: CanvasRenderingContext2D | null;
  private analyser: AnalyserNode | null;
  private brightness: number;
  private contrast: number;
  private then: number;

  private bufferLength: number;
  private dataArray: Uint8Array;

  constructor(item: HTMLElement) {
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
  private init() {
    this.video = this.createVideo();
    this.initVideo(this.video, this.item.dataset.source);

    this.canvas = this.item.querySelector('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.item.querySelector('.video__player')
      .addEventListener('click', this.show.bind(this));
    this.item.querySelector('.video__control--brightness input')
      .addEventListener('change', this.changeBrightness.bind(this));
    this.item.querySelector('.video__control--contrast input')
      .addEventListener('change', this.changeContrast.bind(this));

    this.video.addEventListener('play', this.onPlay.bind(this));

    this.audioAnalyser();
  }

  /**
   * Initialization video
   * @param {HTMLVideoElement} video
   * @param {string} url
   */
  private initVideo(video: HTMLVideoElement, url: string): void {
    // @ts-ignore
    if (Hls.isSupported()) {
      // @ts-ignore
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      // @ts-ignore
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
      video.addEventListener('loadedmetadata', function() {
        video.play();
      });
    }
  }

  /**
   * Create video element
   * @returns {HTMLVideoElement}
   */
  private createVideo(): HTMLVideoElement {
    const video: HTMLVideoElement = document.createElement("video");

    // @ts-ignore
    video.autoPlay = true;
    video.loop = true;
    video.muted = true;
    video.preload = 'auto';

    return video;
  }

  /**
   * On play
   */
  private onPlay(): void {
    this.then = Date.now();
    requestAnimationFrame(this.drawVideo.bind(this));
  }

  /**
   * Draw video
   */
  private drawVideo(): void {
    const self: Video = this;

    const fps: number = 24;
    const interval: number = 1000 / fps;
    const now: number = Date.now();
    const delta: number = now - this.then;

    requestAnimationFrame(self.drawVideo.bind(self));

    if (!self.video.paused && !self.video.ended && delta > interval) {

      this.then = now - (delta % interval);

      self.canvas.width = self.canvas.clientWidth;
      self.canvas.height = self.canvas.clientHeight;

      const scale: number = Math.min(
        self.canvas.width / self.video.videoWidth,
        self.canvas.height / self.video.videoHeight) * 1.2;

      const vidH: number = self.video.videoHeight;
      const vidW: number = self.video.videoWidth;
      const top: number = self.canvas.height / 2 - (vidH / 2) * scale;
      const left: number = self.canvas.width / 2 - (vidW / 2) * scale;

      self.context.drawImage(self.video, left, top, vidW * scale, vidH * scale);

      const imageData: ImageData = self.context.getImageData(0, 0, self.canvas.width, self.canvas.height);
      const data: Uint8ClampedArray = imageData.data;

      self.applyBrightness(data, self.brightness);
      self.applyContrast(data, parseInt(self.contrast + '', 10));

      self.context.putImageData(imageData, 0, 0);
    }
  }

  /**
   * Make sure the value stay between 0 and 255
   * @param {number} value
   * @returns {number}
   */
  private truncateColor(value: number): number {
    if (value < 0) {
      value = 0;
    } else if (value > 255) {
      value = 255;
    }

    return value;
  }

  /**
   * Set brightness
   * @param {Uint8ClampedArray} data
   * @param {number} brightness
   */
  private applyBrightness(data: Uint8ClampedArray, brightness: number): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] += 255 * (brightness / 100);
      data[i + 1] += 255 * (brightness / 100);
      data[i + 2] += 255 * (brightness / 100);
    }
  }

  /**
   * Set contrast
   * @param {Uint8ClampedArray} data
   * @param {number} contrast
   */
  private applyContrast(data: Uint8ClampedArray, contrast: number): void {
    const factor: number = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.truncateColor(factor * (data[i] - 128) + 128);
      data[i + 1] = this.truncateColor(factor * (data[i + 1] - 128) + 128);
      data[i + 2] = this.truncateColor(factor * (data[i + 2] - 128) + 128);
    }
  }

  /**
   * Change brightness
   * @param {Event} event
   */
  private changeBrightness(event: Event): void {
    this.brightness = parseFloat((event.target as HTMLInputElement).value);
  }

  /**
   * Change contrast
   * @param {Event} event
   */
  private changeContrast(event: Event): void {
    this.contrast = parseFloat((event.target as HTMLInputElement).value);
  }

  /**
   * Audio analyzer
   */
  private audioAnalyser(): void {
    // @ts-ignore
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = audioCtx.createAnalyser();

    const source: MediaElementAudioSourceNode = audioCtx.createMediaElementSource(this.video);
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
  }

  /**
   * Draw histogram
   */
  private drawSound(): void {
    requestAnimationFrame(this.drawSound.bind(this));

    this.analyser.getByteFrequencyData(this.dataArray);

    this.contextAudio.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.contextAudio.fillRect(0, 0, this.canvasAudio.clientWidth, this.canvasAudio.clientHeight);
    const barWidth: number = (this.canvasAudio.clientWidth / this.bufferLength) * 2.5;
    let barHeight: number;
    let x: number = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i] / 2;

      this.contextAudio.fillStyle = 'rgb(' + '50, 50, ' + (barHeight + 100) + ')';
      this.contextAudio.fillRect(x, this.canvasAudio.clientHeight - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  /**
   * Open full video
   * @param {Event} event
   */
  private show(event: Event): boolean | void {
    const video: HTMLElement = (event.target as HTMLVideoElement).parentNode as HTMLElement;
    if (video.classList.contains('video--show')) {
      return false;
    }
    video.classList.add('video--show');

    this.video.muted = false;
    this.video.play();

    video.querySelector('.video__close').addEventListener('click', this.hide.bind(this));
  }

  /**
   * Close full video
   * @param {Event} event
   */
  private hide(event: Event): void {
    const video: HTMLElement = (event.target as HTMLVideoElement).parentNode.parentNode as HTMLElement;
    video.classList.remove('video--show');
    video.style.zIndex = '666';

    this.video.muted = true;

    setTimeout(function() {
      video.style.zIndex = '';
    }, 1000);
  }

}
