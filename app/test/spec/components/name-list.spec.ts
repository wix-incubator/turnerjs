'use strict';

class NameListDriver extends TurnerComponentDriver {
  nameDrivers: NameFormatterDriver[];

  constructor() {
    super();
    this.nameDrivers = this.defineChildren(() => new NameFormatterDriver(), 'name-formatter');
  }

  render(names: Array<string>) {
    this.renderFromTemplate(`<name-list names="names"></name-list>`, {names});
  }
}

describe('Component: nameList', () => {
  let driver: NameListDriver;

  beforeEach(() => {
    angular.mock.module('turnerjsAppInternal');
    driver = new NameListDriver();
  });

  afterEach(() => {
    driver.disconnectFromBody();
  });

  it('should list all names', () => {
    driver.render(['Elyaniv Barda', 'Maor Melikson']);
    expect(driver.nameDrivers.length).toBe(2);
  });

  it('should format the names', () => {
    driver.render(['Elyaniv Barda', 'Maor Melikson']);
    expect(driver.nameDrivers[0].getOriginalName()).toEqual('Elyaniv Barda');
  });

  it('should respond to changes in the names array', () => {
    var names = ['Elyaniv Barda', 'Maor Melikson'];
    driver.render(names);
    names.push('Maor Buzaglo');
    driver.applyChanges();
    expect(driver.nameDrivers.length).toBe(3);
  });
});
