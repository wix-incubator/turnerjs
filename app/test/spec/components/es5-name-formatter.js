'use strict';

/* globals TurnerComponentDriver */
function ES5NameFormatterDriver() {
  TurnerComponentDriver.call(arguments);
}

ES5NameFormatterDriver.prototype = new TurnerComponentDriver();
ES5NameFormatterDriver.constructor = ES5NameFormatterDriver;

ES5NameFormatterDriver.prototype.render = function (name) {
  name = name || '';
  this.renderFromTemplate('<name-formatter name="name"></name-formatter>', {name: name});
};

ES5NameFormatterDriver.prototype.getFormattedName = function () {
  return this.findByDataHook('name-container').text();
};

describe('Component: nameFormatter', function () {
  var driver;
  beforeEach(function () {
    angular.mock.module('turnerjsAppInternal');
    driver = new ES5NameFormatterDriver();
  });
  afterEach(function () {
    driver.disconnectFromBody();
  });
  it('should display name', function () {
    driver.render('Carmel Cohen');
    expect(driver.getFormattedName()).toEqual('Name: Carmel Cohen');
  });
});
