'use strict';

class NameFormatterDriver extends TurnerComponentDriver {

  render(name = '') {
    this.renderFromTemplate(`<name-formatter name="name"></name-formatter>`, {name});
  }

  getFormattedName() {
    return this.findByDataHook('name-container').text();
  }

  getOriginalName() {
    return this.getFormattedName().split('Name: ')[1];
  }
}

describe('Component: nameFormatter', () => {
  let driver: NameFormatterDriver;

  beforeEach(() => {
    angular.mock.module('turnerjsAppInternal');
    driver = new NameFormatterDriver();
  });

  afterEach(() => {
    driver.disconnectFromBody();
  });

  it('should display name', () => {
    driver.render('Carmel Cohen');
    expect(driver.getFormattedName()).toEqual('Name: Carmel Cohen');
  });
});
