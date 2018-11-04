import View from './../../../node_modules/fluppik/src/view';

export default class EventsView extends View {
  protected render(): string {
    const storeData = this.getStoreData();
    const tab: string = storeData.currentTab;

    const html = `
      <h2 class="page-content__title">События</h2>

      <div class="grid"></div>`;

    if ( tab === 'events' ) {
      return html;
    } else {
      return '';
    }
  }
}
