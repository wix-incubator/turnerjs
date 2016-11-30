'use strict';

describe('index', function() {
  var proxyquire = require('proxyquire').noCallThru();

  it('should initialize a new WidgetsContextManager', function() {
    var widgetsContextManagerInstance = jasmine.createSpyObj('widgetsContextManagerInstance', ['initialize']);
    var WidgetsContextManager = jasmine.createSpy().and.returnValue(widgetsContextManagerInstance);

    proxyquire('../main/index', {
      './widgetsContextManager': WidgetsContextManager
    });

    expect(WidgetsContextManager).toHaveBeenCalled();
    expect(widgetsContextManagerInstance.initialize).toHaveBeenCalled();
  });
});
