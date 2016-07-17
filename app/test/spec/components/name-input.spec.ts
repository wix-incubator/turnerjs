'use strict';

class NameInputDriver extends TurnerComponentDriver {
  list: NameListDriver;

  constructor() {
    super();
    this.list = this.defineChild(new NameListDriver(), 'name-list');
  }

  render(onNameAdded = name => null) {
    this.renderFromTemplate(`<name-input on-name-added="onNameAdded(name)"></name-input>`, {onNameAdded});
  }

  addName(name: string) {
    this.name = name;
    this.findByDataHook('add-name-button').triggerHandler('click');
    this.applyChanges();
  }

  get name(): string {
    return this.findByDataHook('name-input').val();
  }

  set name(name: string) {
    this.findByDataHook('name-input').val(name);
    this.findByDataHook('name-input').triggerHandler('change');
    this.applyChanges();
  }
}

describe('Component: namesApp', () => {
  let driver: NameInputDriver;

  beforeEach(() => {
    angular.mock.module('turnerjsAppInternal');
    driver = new NameInputDriver();
  });

  afterEach(() => {
    driver.disconnectFromBody();
  });

  it('Should initialize the name input as empty', () => {
    driver.render();
    expect(driver.name).toEqual('');
  });

  it('Should be able to add names', () => {
    const addNameSpy = jasmine.createSpy('addNameSpy');
    const nameToInput = 'Name 1';
    driver.render(addNameSpy);
    driver.addName(nameToInput);
    expect(addNameSpy).toHaveBeenCalledWith(nameToInput);
  });

  it('Should reflect new typed name', () => {
    const nameToInput = 'Name 1';
    driver.render();
    driver.name = nameToInput;
    expect(driver.name).toEqual(nameToInput);
  });

  it('Should clear name after name is added', () => {
    driver.render();
    driver.addName('some name');
    expect(driver.name).toEqual('');
  });
});
