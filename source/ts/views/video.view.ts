import View from './../../../node_modules/fluppik/src/view';

export default class VideoView extends View {
  protected render(): string {
    const storeData = this.getStoreData();
    const tab: string = storeData.currentTab;

    const html = `
      <h2 class="page-content__title">Видеонаблюдение</h2>

      <div class="grid-video"></div>`;

    if (tab === 'video') {
      return html;
    } else {
      return '';
    }
  }
}
