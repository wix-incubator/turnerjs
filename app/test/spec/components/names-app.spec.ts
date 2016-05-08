'use strict';

class NamesAppDriver extends TurnerComponentDriver {
  list: NameListDriver;

  constructor() {
    super();
    this.list = this.defineChild(new NameListDriver(), 'name-list');
  }

  render() {
    this.renderFromTemplate(`<names-app></names-app>`);
  }

  addName(name: string) {
    this.findByDataHook('name-input').val(name);
    this.findByDataHook('name-input').triggerHandler('change');
    this.findByDataHook('add-name-button').triggerHandler('click');
    this.applyChanges();
  }

  toggleVisibility() {
    var controller = this.scope['$ctrl'];
    controller.showNames = !controller.showNames;
    this.applyChanges();
  }

  isNamesPresented(): boolean {
    return !!this.findByDataHook('name-list').length;
  }
}

describe('Component: namesApp', () => {
  let driver: NamesAppDriver;

  beforeEach(() => {
    angular.mock.module('turnerjsAppInternal');
    driver = new NamesAppDriver();
  });

  afterEach(() => {
    driver.disconnectFromBody();
  });

  it('Should initialize the names list as an empty list', () => {
    driver.render();
    expect(driver.list.nameDrivers.length).toBe(0);
  });

  it('Should be able to add names', () => {
    driver.render();
    driver.addName('Name 1');
    expect(driver.list.nameDrivers.length).toBe(1);
  });

  it('Should show the names by default', () => {
    driver.render();
    expect(driver.isNamesPresented()).toBe(true);
  });

  it('Should be able to hide the names list', () => {
    driver.render();
    driver.toggleVisibility();
    expect(driver.isNamesPresented()).toBe(false);
  });
});
