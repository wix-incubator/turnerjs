require(['siteUtils', 'react', 'testUtils', 'lodash'], function (siteUtils, React, testUtils, _) {
  'use strict';

  function isComponentOfType(type, comp) {
    if (React.addons.TestUtils.isDOMComponent(comp)) {
        return comp.tagName === type.toUpperCase();
    }
    var compClass = siteUtils.compFactory.getCompReactClass(type);

    return React.addons.TestUtils.isCompositeComponentWithType(comp, compClass);
  }

  beforeEach(function () { //eslint-disable-line santa/no-jasmine-outside-describe

      jasmine.addMatchers({
          toContainComponentOfType: function() {
              return {
                  compare: function(actual, expected) {
                      var actualComponentsOfType =
                          React.addons.TestUtils.findAllInRenderedTree(actual, isComponentOfType.bind(null, expected));

                      var passed = actualComponentsOfType.length > 0;

                      return {
                          pass: passed,
                          message: 'Expected component ' + (passed ? 'not ' : '') + ' to contain a component of type ' + expected
                      };
                  }
              };
          },
          toBeComponentOfType: function () {
              return {
                  compare: function (actual, expected) {
                      var actualName = actual && (actual.tagName || actual.props.structure.componentType);
                      var passed = isComponentOfType(expected, actual);
                      return {
                          pass: passed,
                          message: 'Expected ' + actualName + (passed ? 'not ' : '') + ' to be a component of type ' + expected
                      };
                  }
              };
          },
        toEndWithString: function () {
          return {
            compare: function (actual, expected) {
              return {pass: _.endsWith(actual, expected)};
            }
          };
        },
        toBeEmptyString: function () {
          return {
            compare : function (actual) {
              return {pass: _.isEmpty(actual)};
            }
          };
        },
        toDeepEqual: function () {
          return {
            compare : function (actual, expected) {
              return {pass: _.isEqual(actual, expected)};
            }
          };
        }
      });
  });
});
