'use strict';

describe('RemoteModelInterface', function() {

  var RemoteModelInterface, _;
  beforeEach(function() {
    RemoteModelInterface = require('../../../static/RMI/RemoteModelInterface');
    _ = require('../../../static/RMI/lodashUtils');
    this.RMIUpdateCallback = jasmine.createSpy('onUpdateCallback');
  });


  function generateMockModel() {
    return {
      components: {
        comp1: {
          parent: 'page1',
          state: {
            disabled: false
          },
          type: 'Button',
          data: {
            foo: 'bar'
          },
          design: {
            bar: 'foo'
          },
          props: { some: 'props' },
          layout: { x: 0, y: 0, width: 100, height: 100 },
          events: [{ onClick: 'click-btn1' }],
          isDisplayed: true,
          id: 'compName1'
        },
        comp2: {
          parent: 'container',
          state: {},
          type: 'Button',
          data: {
            foo: 'bar'
          },
          props: { some: 'props' },
          layout: { x: 0, y: 0, width: 100, height: 100 },
          events: [{
            onClick: 'click-btn2'
          }],
          isDisplayed: true,
          id: 'compName2'
        },
        container: {
          parent: 'page1',
          state: {},
          type: 'Container',
          data: {
            foo: 'bar'
          },
          props: { some: 'props' },
          layout: { x: 0, y: 0, width: 100, height: 100 },
          events: [{
            onClick: 'click-btn2'
          }],
          isDisplayed: true,
          id: 'containerName1'
        },
        page1: {
          parent: 'notPage1',
          state: {},
          type: 'Image',
          data: {
            foo: 'bar'
          },
          props: {},
          layout: {},
          events: [],
          isDisplayed: true,
          id: 'pageName1'
        }
      },
      pages: {},
      connections: {
        controllerId1: {
          role1: {
            comp1: { src: 'myPic1' },
            comp2: { src: 'myPic2' }
          }
        }
      },
      eventHandlers: {},
      EventTypes: {}
    };
  }

  describe('scopedRMI', function() {

    var scopedRMI;

    beforeEach(function() {
      var model = generateMockModel();
      this.RMI = new RemoteModelInterface(model, jasmine.createSpy('onUpdateCallback'));
      scopedRMI = this.RMI.getScopedRMI('controllerId1');
      spyOn(scopedRMI, 'getCompIdsFromType').and.callThrough();
      spyOn(scopedRMI, 'getCompIdsFromRole').and.callThrough();
      spyOn(scopedRMI, 'getConfig').and.callThrough();
    });

    it('should get scoped RMI', function() {
      expect(scopedRMI).not.toEqual(this.RMI);
      expect(scopedRMI._onUpdateCallback).toEqual(this.RMI._onUpdateCallback);
    });

    it('should get compIds from role', function() {
      var compIds = scopedRMI.getCompIdsFromRole('role1');
      expect(compIds).toEqual(['comp1', 'comp2']);
    });

    it('should get compIds from type', function() {
      var compIds = scopedRMI.getCompIdsFromType('Button');
      expect(compIds).toEqual(['comp1', 'comp2']);
    });

    it('should get config by role and compId', function() {
      var cfg = scopedRMI.getConfig('comp1', 'role1');
      expect(cfg).toEqual({ src: 'myPic1' });
    });
  });

  describe('creation', function() {
    it('should initialize RMI with empty container in case no model is supplied', function() {
      var RMI = new RemoteModelInterface();
      expect(RMI.toJson()).toEqual({
        components: {},
        connections: {},
        pages: {},
        eventHandlers: {},
        EventTypes: {}
      });
    });

    it('should initialize RMI by given model if one was given', function() {
      var model = generateMockModel();
      var RMI = new RemoteModelInterface(model);
      expect(RMI.toJson()).toEqual(model);
    });


    describe('addComponent', function() {
      it('should add component data', function() {
        var compDesc = {
          type: 'someType',
          props: {
            some: 'value'
          },
          id: 'compName'
        };
        var RMI = new RemoteModelInterface();
        RMI.addComponent('compfoo', compDesc);
        expect(RMI.toJson().components).toEqual({
          compfoo: {
            parent: undefined,
            state: {},
            type: compDesc.type,
            data: {},
            design: {},
            props: compDesc.props,
            layout: {},
            events: [],
            isDisplayed: false,
            id: compDesc.id
          }
        });
      });
    });
  });

  describe('getters', function() {
    beforeEach(function() {
      this.model = generateMockModel();
      this.RMI = new RemoteModelInterface(this.model);
    });

    it('should get the comp', function() {
      var compId = 'comp1';
      var comp = this.RMI.getComp(compId);
      expect(comp).toEqual(this.model.components[compId]);
    });

    it('should get the state of a component', function() {
      var data = this.RMI.getState('comp1');
      expect(data).toEqual(this.model.components.comp1.state);
    });

    it('should get data from compId', function() {
      var data = this.RMI.getData('comp1');
      expect(data).toEqual(this.model.components.comp1.data);
    });

    it('should get type from compId', function() {
      var data = this.RMI.getType('comp1');
      expect(data).toEqual(this.model.components.comp1.type);
    });

    it('should get props from compId', function() {
      var data = this.RMI.getProps('comp1');
      expect(data).toEqual(this.model.components.comp1.props);
    });

    it('should get events from compId', function() {
      var data = this.RMI.getEvents('comp1');
      expect(data).toEqual(this.model.components.comp1.events);
    });

    it('should get layout from compId', function() {
      var data = this.RMI.getLayout('comp1');
      expect(data).toEqual(this.model.components.comp1.layout);
    });

    it('should get id from compId', function() {
      var data = this.RMI.getId('comp1');
      expect(data).toEqual(this.model.components.comp1.id);
    });

    it('should get parentId from compId', function() {
      var data = this.RMI.getParent('comp1');
      expect(data).toEqual(this.model.components.comp1.parent);
    });

    it('should get children Ids from compId', function() {
      expect(this.RMI.getChildren('page1')).toEqual(['comp1', 'container']);
      expect(this.RMI.getChildren('container')).toEqual(['comp2']);
    });

    it('should return comps from given type', function() {
      var comps = this.RMI.getCompsFromType('Button');
      expect(comps).toEqual([this.RMI.getComp('comp1'), this.RMI.getComp('comp2')]);
    });

  });

  describe('behavior', function() {

    beforeEach(function() {
      var model = generateMockModel();
      this.RMI = new RemoteModelInterface(model, this.RMIUpdateCallback);
    });

    it('should update callback with behavior data upon RMI.executeCompBehavior', function() {
      var compId = 'comp-1';
      var behaviorName = 'someBehavior';
      var params = {};
      var callback = jasmine.createSpy('onCompleteCallback');

      this.RMI.executeCompBehavior(compId, behaviorName, params, callback);

      var expectedData = {
        type: 'comp',
        name: behaviorName,
        targetId: compId,
        params: params
      };
      expect(this.RMIUpdateCallback).toHaveBeenCalledWith(compId, 'behavior', expectedData, callback);
    });

    it('should update callback with behavior data upon RMI.executeAnimation', function() {
      var compId = 'comp-1';
      var behaviorName = 'someAnimation';
      var params = {};
      var callback = jasmine.createSpy('onCompleteCallback');

      this.RMI.executeAnimation(compId, behaviorName, params, callback);

      var expectedData = {
        type: 'animation',
        name: behaviorName,
        targetId: compId,
        params: params
      };
      expect(this.RMIUpdateCallback).toHaveBeenCalledWith(compId, 'behavior', expectedData, callback);
    });
  });

  describe('updateModel', function() {

    it('should apply partial updates for root components', function() {
      var model = generateMockModel();
      var rmi = new RemoteModelInterface(model);

      rmi.updateModel({
        comp1: {
          data: { dataKey1: 'new-dataValue1' },
          state: { stateKey2: 'new-stateValue2' }
        },
        comp2: {
          state: { stateKey1: 'new-stateValue1', stateKey3: 'new-stateValue3' }
        }
      });

      expect(rmi.getData('comp1')).toEqual({ foo: 'bar', dataKey1: 'new-dataValue1' });
      expect(rmi.getState('comp1')).toEqual({ disabled: false, stateKey2: 'new-stateValue2' });
      expect(rmi.getState('comp2')).toEqual({ stateKey1: 'new-stateValue1', stateKey3: 'new-stateValue3' });
    });
  });

  describe('events', function() {
    it('should store necessary event data', function() {
      var RMI = new RemoteModelInterface(generateMockModel(), function() {});
      var cb = jasmine.createSpy('onClickCallback');
      var COMP_ID = 'comp1';
      var EVENT_TYPE = 'onClick';
      var CONTEXT_ID = 'contextId';

      RMI.registerEvent(CONTEXT_ID, COMP_ID, EVENT_TYPE, cb);

      var compRegisteredEvents = RMI.getEvents(COMP_ID);
      var event = compRegisteredEvents[1];
      var compRegisteredCallback = RMI.getCallbackById(event.callbackId);
      expect(compRegisteredCallback).toEqual(cb);
      expect(event.contextId).toEqual(CONTEXT_ID);
      expect(event.eventType).toEqual(EVENT_TYPE);
    });
  });

  describe('unregisterAll', function() {
    it('removes all handlers for a certain event type', function() {
      var RMI = new RemoteModelInterface(generateMockModel(), function() {});

      RMI._model.components.comp1.events = [];

      var cb = jasmine.createSpy('onClickCallback');
      var COMP_ID = 'comp1';
      var EVENT_TYPE = 'onClick';
      var CONTEXT_ID = 'contextId';
      RMI.registerEvent(CONTEXT_ID, COMP_ID, EVENT_TYPE, cb);

      var cb2 = jasmine.createSpy('onNoMoreBeerCallback');
      var EVENT_TYPE_2 = 'onNoMoreBeer';
      RMI.registerEvent(CONTEXT_ID, COMP_ID, EVENT_TYPE_2, cb2);

      RMI.unregisterAll(COMP_ID, EVENT_TYPE);

      var compRegisteredEvents = RMI.getEvents(COMP_ID);
      expect(compRegisteredEvents.length).toEqual(1);
      var event = compRegisteredEvents[0];
      var compRegisteredCallback = RMI.getCallbackById(event.callbackId);
      expect(compRegisteredCallback).toEqual(cb2);
      expect(event.contextId).toEqual(CONTEXT_ID);
      expect(event.eventType).toEqual(EVENT_TYPE_2);
    });
  });

  describe('EventTypes', function() {
    it('should be an empty object if EventTypes were not added', function() {
      this.RMI = new RemoteModelInterface(generateMockModel(), this.RMIUpdateCallback);

      expect(this.RMI.getEventTypes()).toEqual({});
    });

    it('should override EventTypes if added more than once', function() {
      var EventTypesToAddOld = {
        OLD_TYPE: 'old_type'
      };

      var EventTypesToAddNew = {
        NEW_TYPE: 'new_type'
      };

      this.RMI = new RemoteModelInterface(generateMockModel(), this.RMIUpdateCallback);
      this.RMI.addEventTypes(_.clone(EventTypesToAddOld));
      this.RMI.addEventTypes(_.clone(EventTypesToAddNew));

      expect(this.RMI.getEventTypes()).toEqual(EventTypesToAddNew);
    });

    it('should be modifiable only through addEventTypes', function() {
      var EventTypesToAdd = {
        COOL_TYPE: 'cool_type',
        SHITTY_TYPE: 'shitty_type'
      };
      this.RMI = new RemoteModelInterface(generateMockModel(), this.RMIUpdateCallback);
      this.RMI.addEventTypes(_.clone(EventTypesToAdd));

      var EventTypes = this.RMI.getEventTypes();
      EventTypes.DYNAMIC_TYPE = 'dynamic_type';

      expect(this.RMI.getEventTypes()).toEqual(EventTypesToAdd);
    });
  });

  describe('setters', function() {


    beforeEach(function() {
      this.model = generateMockModel();
      this.RMI = new RemoteModelInterface(this.model, this.RMIUpdateCallback);
    });

    describe('- set data', function() {

      it('should not crash or set data in case no path was found', function() {
        this.RMI.setData('nonExistingId', { label: 'foo' });
        var newModel = this.RMI.toJson();
        expect(newModel).toEqual(this.model);
      });

      it('should update the data of a components', function() {
        this.RMI.setData('comp1', { more: 'data' });
        var data = this.RMI.getData('comp1');
        expect(data).toEqual({ foo: 'bar', more: 'data' });
      });

      it('should call onUpdate callback with compId, path, and changes', function() {
        this.RMI.setData('comp1', { more: 'data' });
        expect(this.RMIUpdateCallback).toHaveBeenCalledWith('comp1', 'data', { more: 'data' });
      });

    });

    describe('- set design', function() {
      it('should update the design of a component', function() {
        this.RMI.setDesign('comp1', { more: 'design' });
        var design = this.RMI.getDesign('comp1');
        expect(design).toEqual({ bar: 'foo', more: 'design' });
      });
    });

    describe('- set props', function() {

      it('should not crash or set props in case no path was found', function() {
        this.RMI.setProps('nonExistingId', { label: 'foo' });
        var newModel = this.RMI.toJson();
        expect(newModel).toEqual(this.model);
      });

      it('should update props of a components', function() {
        this.RMI.setProps('comp1', { other: 'props' });
        var props = this.RMI.getProps('comp1');
        expect(props).toEqual({ other: 'props', some: 'props' });
      });

      it('should call onUpdate callback with compId, path, and changes', function() {
        var cb = jasmine.createSpy();
        this.RMI.setProps('comp1', { other: 'props' }, cb);
        expect(this.RMIUpdateCallback).toHaveBeenCalledWith('comp1', 'props', { other: 'props' }, cb);
      });

    });

    describe('- set layout', function() {

      it('should not crash or set props in case no path was found', function() {
        this.RMI.setLayout('nonExistingId', { x: '12' });
        var newModel = this.RMI.toJson();
        expect(newModel).toEqual(this.model);
      });

      it('should update props of a components', function() {
        this.RMI.setLayout('comp1', { x: 12 });
        var props = this.RMI.getLayout('comp1');
        expect(props).toEqual({ x: 12, y: 0, width: 100, height: 100 });
      });

      it('should call onUpdate callback with compId, path, and changes', function() {
        this.RMI.setLayout('comp1', { x: 12 });
        expect(this.RMIUpdateCallback).toHaveBeenCalledWith('comp1', 'layout', { x: 12 });
      });

    });

    describe('- set publicAPI', function() {

      it('should have an undefined publicAPI before it was set', function() {
        var RMI = new RemoteModelInterface(generateMockModel());
        expect(RMI.getPublicAPI('comp1')).not.toBeDefined();
      });

      it('should not crash or set public API in case no path was found', function() {
        var model = generateMockModel();
        var RMI = new RemoteModelInterface(model);
        RMI.setPublicAPI('nonExistingId', { label: 'foo' });
        expect(RMI.toJson()).toEqual(model);
      });

      it('should add public API to the component with the given api', function() {
        var RMI = new RemoteModelInterface(generateMockModel());
        RMI.setPublicAPI('comp1', { label: 'testing' });
        expect(RMI.getPublicAPI('comp1')).toEqual({ label: 'testing' });
      });

      it('should replace the public API of the component with the new api', function() {
        var RMI = new RemoteModelInterface(generateMockModel());
        RMI.setPublicAPI('comp1', { should: 'not be in the expected result' });

        RMI.setPublicAPI('comp1', { label: 'testing' });
        expect(RMI.getPublicAPI('comp1')).toEqual({ label: 'testing' });
      });
    });
  });

});
