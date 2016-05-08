'use strict';
class InnerDriverExample extends TurnerComponentDriver {
  public child: InnerDriverExample;

  constructor(public item?, public index?) {
    super();
  }

  getContent(): string {
    return this.findByDataHook('inner-driver-example-content').text();
  }

  initChild() {
    this.child = this.defineChild(new InnerDriverExample(), '.inner-driver-example');
  }
}

class AppendedToBodyDriver extends InnerDriverExample {
  constructor() {
    super();
    this.appendedToBody = true;
  }
}

class ParentWithChildAppendedToBodyDriver extends TurnerComponentDriver {
  public childAppendedToBody: AppendedToBodyDriver;

  render() {
    this.renderFromTemplate(
      `<div data-hook="root-element">
        <div class="driver-part">
        </div>
      </div>`, {}, '.driver-part');
    this.childAppendedToBody = this.defineChild(new AppendedToBodyDriver(), byDataHook('child-driver'));
    let childElement = angular.element(`<div data-hook="child-driver"><div data-hook="inner-driver-example-content">Appended to body</div></div>`);
    this.$compile(childElement)(this.scope);
    this.body.append(childElement);
    this.applyChanges();
  }

  isChildFoundInDom(): boolean {
    return !!this.body[0].querySelectorAll(byDataHook('child-driver')).length;
  }
}

describe('Directive: turnerjs test base driver', () => {
  let driver: TurnerComponentDriver;
  beforeEach(() => {
    angular.mock.module('turnerjsAppInternal');
  });

  afterEach(() => {
    driver.disconnectFromBody();
  });

  describe('Turner Driver: errors', () => {
    let simpleSelectorsDriver: NameFormatterDriver;

    beforeEach(() => {
      simpleSelectorsDriver = driver = new NameFormatterDriver();
    });

    it('should throw an error when trying to connect to body before render is called', () => {
      expect(() => simpleSelectorsDriver.connectToBody()).toThrow();
    });

    it('should throw an error when trying to query an element before render is called', () => {
      expect(() => simpleSelectorsDriver.getFormattedName()).toThrow();
    });

    it('should throw when accessing element/scope before render', () => {
      expect(() => simpleSelectorsDriver.element).toThrow();
      expect(() => simpleSelectorsDriver.scope).toThrow();
    });
  });

  describe('Turner Driver: initialization of child drivers', () => {
    let listDriver: NameListDriver;

    beforeEach(() => {
      listDriver = driver = new NameListDriver();
    });

    it('should initialize the root element for child drivers and allow searching in it', () => {
      listDriver.render(['a', 'b']);
      expect(listDriver.nameDrivers[0].getFormattedName()).toContain('a');
    });

    it('should be able to call apply changes from child and parent driver', () => {
      listDriver.render(['a', 'b']);
      expect(() => listDriver.applyChanges()).not.toThrow();
      expect(() => listDriver.nameDrivers[0].applyChanges()).not.toThrow();
    });

    it('should initialize the scope for each driver member', () => {
      listDriver.render(['a', 'b']);
      listDriver.connectToBody();
      expect(angular.element(listDriver.element[0].querySelector('#name-number-0')).scope()).toEqual(listDriver.nameDrivers[0].scope.$parent);
    });

    it('should reinitialize a child driver when its element is re-added to the dom', () => {
      let names = ['a', 'b'];
      listDriver.render(names);
      let secondChildDriver = listDriver.nameDrivers[1];
      names.pop();
      driver.applyChanges();
      expect(() => secondChildDriver.scope).toThrow();
      names.push('c');
      driver.applyChanges();
      expect(() => secondChildDriver.scope).not.toThrow();
    });
  });

  describe('Usage Examples when there are drivers with nested drivers in multiple hierarchies', () => {
    let multiLevelsDriver: NamesAppDriver;

    beforeEach(() => {
      multiLevelsDriver = driver = new NamesAppDriver();
    });

    it('should support nested drivers', () => {
      multiLevelsDriver.render();
      multiLevelsDriver.addName('Test Name');
      expect(multiLevelsDriver.list.nameDrivers[0].getFormattedName()).toContain('Test Name');
    });

    it('should support nested drivers reinitialization', () => {
      multiLevelsDriver.render();
      multiLevelsDriver.toggleVisibility();
      multiLevelsDriver.addName('Test Name');
      expect(() => multiLevelsDriver.list.scope).toThrow();
      multiLevelsDriver.toggleVisibility();
      expect(multiLevelsDriver.list.nameDrivers[0].getFormattedName()).toContain('Test Name');
    });
  });

  describe('Usage Example when child is appended to body', () => {
    let parentWithAppendedToBodyDriver: ParentWithChildAppendedToBodyDriver;

    beforeEach(() => {
      parentWithAppendedToBodyDriver = driver = new ParentWithChildAppendedToBodyDriver();
    });

    afterEach(() => {
      parentWithAppendedToBodyDriver.childAppendedToBody.disconnectFromBody();
    });

    it('should be able to select a child which is appended to body', () => {
      parentWithAppendedToBodyDriver.render();
      expect(parentWithAppendedToBodyDriver.childAppendedToBody.getContent()).toBe('Appended to body');
    });

    it('should be able to remove from body when child is appended to body', () => {
      parentWithAppendedToBodyDriver.render();
      expect(parentWithAppendedToBodyDriver.isChildFoundInDom()).toBe(true);
      parentWithAppendedToBodyDriver.childAppendedToBody.disconnectFromBody();
      expect(parentWithAppendedToBodyDriver.isChildFoundInDom()).toBe(false);
    });
  });
});
