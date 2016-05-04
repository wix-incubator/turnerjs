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

class SimpleSelectorsDriver extends TurnerComponentDriver {
  render() {
    this.renderFromTemplate(
      `<div data-hook="root-element">
        <div class="driver-part">
          <div data-hook="inner-element-multi">Multi1</div>
          <div data-hook="inner-element-multi">Multi2</div>
          <div data-hook="inner-element-singular">Single</div>
        </div>
      </div>`, {}, '.driver-part');
  }

  getSingleInnerElementText() {
    return this.findByDataHook('inner-element-singular').text();
  }

  getInnerElements() {
    return this.findAllByDataHook('inner-element-multi');
  }

  getInnerElementByIndex(index: number) {
    return angular.element(this.getInnerElements()[index]);
  }
}

class DomManipulationDriverExample extends TurnerComponentDriver {
  setChildPresenceInDom(exist: boolean, elementToSet: string = 'exist') {
    this.scope['ngIfIndication'][elementToSet] = exist;
    this.applyChanges();
  }
}

class MultiChildLevelDriversExample extends DomManipulationDriverExample {
  public innerDriverWithNesting: InnerDriverExample;

  constructor() {
    super();
    this.innerDriverWithNesting = this.defineChild(new InnerDriverExample(), '.inner-driver-example');
    this.innerDriverWithNesting.initChild();
    this.innerDriverWithNesting.child.initChild();
  }

  render() {
    this.renderFromTemplate(
      `<div data-hook="root-element">
        <div class="driver-part">
          <div class="inner-driver-example" ng-if="ngIfIndication.parent">
            <div data-hook="inner-driver-example-content">Root</div>
            <div class="inner-driver-example" ng-if="ngIfIndication.child">
              <div data-hook="inner-driver-example-content">Middle</div>
              <div class="inner-driver-example" ng-if="ngIfIndication.grandchild">
                <div data-hook="inner-driver-example-content">Last</div>
              </div>
            </div>
          </div>
        </div>
      </div>`, {ngIfIndication: {parent: true, child: true, grandchild: true}}, '.driver-part');
  }
}

class RepeatableChildDriversExample extends TurnerComponentDriver {
  public innerDriversByCss: Array<InnerDriverExample>;
  public innerDriversByDataHook: Array<InnerDriverExample>;

  constructor() {
    super();
    this.innerDriversByCss = this.defineChildren((item, index) => new InnerDriverExample(item, index), '.inner-driver-example');
    this.innerDriversByDataHook = this.defineChildren(() => new InnerDriverExample(), byDataHook('repeatable-child'));
  }

  render(items: {arr: Array<number>} = {arr: [1, 2, 3, 4]}) {
    this.renderFromTemplate(
      `<div data-hook="root-element">
        <div class="driver-part">
          <div class="title">I a the title of the list and under the same parent</div>
          <div ng-repeat="item in items.arr">
            <div class="item-title">I am the title of a single element</div>
            <div class="inner-driver-example" data-hook="repeatable-child">
              <div data-hook="inner-driver-example-content">text{{item}}</div>
            </div>
          </div>
        </div>
      </div>`, {items}, '.driver-part');
  }
}

class HeightChangedWrapperDriver extends DomManipulationDriverExample {
  public firstChild: InnerDriverExample;
  public secondChild: InnerDriverExample;

  constructor() {
    super();
    this.secondChild = this.defineChild(new InnerDriverExample(), '.first-directive');
    this.firstChild = this.defineChild(new InnerDriverExample(), '.second-directive');
  }

  render(callback) {
    this.renderFromTemplate(
      `<div data-hook="root-element">
        <div class="driver-part">
          <div ng-if="ngIfIndication.exist" data-hook="ng-if-container">
            <div class="first-directive">
              <div data-hook="inner-driver-example-content">TPA</div>
            </div>
          </div>
          <div class="second-directive">
            <div data-hook="inner-driver-example-content">REGULAR</div>
          </div>
        </div>
      </div>`, {callback, ngIfIndication: {exist: true}}, '.driver-part');
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

  afterEach(() => {
    driver.disconnectFromBody();
  });

  describe('Usage Examples for a simple driver with selectors', () => {
    let simpleSelectorsDriver: SimpleSelectorsDriver;

    beforeEach(() => {
      simpleSelectorsDriver = driver = new SimpleSelectorsDriver();
    });

    it('should allow querying multiple inner elements', () => {
      simpleSelectorsDriver.render();
      expect(simpleSelectorsDriver.getInnerElements().length).toBe(2);
      expect(simpleSelectorsDriver.getInnerElementByIndex(0).text()).toBe('Multi1');
      expect(simpleSelectorsDriver.getInnerElementByIndex(1).text()).toBe('Multi2');
      expect(simpleSelectorsDriver.getSingleInnerElementText()).toBe('Single');
    });

    it('should throw an error when trying to connect to body before render is called', () => {
      expect(() => simpleSelectorsDriver.connectToBody()).toThrow();
    });

    it('should throw an error when trying to query an element to body before render is called', () => {
      expect(() => simpleSelectorsDriver.getInnerElements()).toThrow();
    });

    it('should throw when accessing element/scope before render', () => {
      expect(() => simpleSelectorsDriver.element).toThrow();
      expect(() => simpleSelectorsDriver.scope).toThrow();
    });
  });

  describe('Usage Examples when there are drivers with nested drivers defined elsewhere', () => {
    let heightDriver: HeightChangedWrapperDriver;
    let callback: jasmine.Spy;

    beforeEach(() => {
      heightDriver = driver = new HeightChangedWrapperDriver();
      callback = jasmine.createSpy('callback');
    });

    it('should initialize the root element for child drivers and allow searching in it', () => {
      heightDriver.render(callback);
      heightDriver.connectToBody();
      expect(heightDriver.firstChild.getContent()).toEqual('REGULAR');
      expect(heightDriver.secondChild.getContent()).toEqual('TPA');
    });

    it('should be able to call apply changes from child driver', () => {
      heightDriver.render(callback);
      expect(() => heightDriver.firstChild.applyChanges()).not.toThrow();
    });

    it('should initialize the scope for each driver member', () => {
      heightDriver.render(callback);
      heightDriver.connectToBody();
      expect(angular.element(heightDriver.element[0].querySelector('.second-directive')).scope()).toEqual(heightDriver.firstChild.scope);
      expect(angular.element(heightDriver.element[0].querySelector('.first-directive')).scope()).toEqual(heightDriver.secondChild.scope);
    });

    it('should reinitialize a child driver when its element is re-added to the dom', () => {
      heightDriver.render(callback);
      heightDriver.setChildPresenceInDom(false);
      expect(() => heightDriver.secondChild.scope).toThrow();
      heightDriver.setChildPresenceInDom(true);
      expect(() => heightDriver.secondChild.scope).not.toThrow();
    });
  });

  describe('Usage Examples when there are drivers with nested drivers defined elsewhere', () => {
    let multiLevelsDriver: MultiChildLevelDriversExample;

    beforeEach(() => {
      multiLevelsDriver = driver = new MultiChildLevelDriversExample();
    });

    it('should support nested drivers', () => {
      multiLevelsDriver.render();
      expect(multiLevelsDriver.innerDriverWithNesting.child.child.getContent()).toBe('Last');
    });

    it('should support nested drivers reinitialization', () => {
      multiLevelsDriver.render();
      multiLevelsDriver.setChildPresenceInDom(false, 'parent');
      multiLevelsDriver.setChildPresenceInDom(false, 'grandchild');
      expect(() => multiLevelsDriver.innerDriverWithNesting.child.child.getContent()).toThrow();
      multiLevelsDriver.setChildPresenceInDom(true, 'parent');
      expect(multiLevelsDriver.innerDriverWithNesting.getContent()).toBe('Root');
      expect(multiLevelsDriver.innerDriverWithNesting.child.getContent()).toBe('Middle');
      expect(() => multiLevelsDriver.innerDriverWithNesting.child.child.getContent()).toThrow();
      multiLevelsDriver.setChildPresenceInDom(true, 'grandchild');
      expect(multiLevelsDriver.innerDriverWithNesting.child.child.getContent()).toBe('Last');
    });
  });

  describe('Usage Examples when there are repeatable drivers', () => {
    let driverWithRepeat: RepeatableChildDriversExample;

    beforeEach(() => {
      driverWithRepeat = driver = new RepeatableChildDriversExample();
    });

    it('should support selecting children by css selector', () => {
      driverWithRepeat.render();
      let children = driverWithRepeat.innerDriversByCss;
      expect(children.length).toBe(4);
      expect(children[0].getContent()).toBe('text1');
      expect(children[2].index).toBe(2);
    });

    it('should support selecting children by data-hook selector', () => {
      driverWithRepeat.render();
      let children = driverWithRepeat.innerDriversByDataHook;
      expect(children.length).toBe(4);
      expect(children[3].getContent()).toBe('text4');
    });

    it('should respond to changes in the repeatable array', () => {
      let items = {
        arr: [1, 2, 3, 4]
      };
      driverWithRepeat.render(items);
      let children = driverWithRepeat.innerDriversByCss;
      expect(children.length).toBe(4);
      items.arr.push(5);
      driver.applyChanges();
      expect(children.length).toBe(5);
      expect(children[4].getContent()).toBe('text5');
      items.arr.pop();
      items.arr.pop();
      driver.applyChanges();
      expect(children.length).toBe(3);
      expect(children[2].getContent()).toBe('text3');
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
