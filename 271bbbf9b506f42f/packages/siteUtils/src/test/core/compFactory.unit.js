define(['react', 'definition!siteUtils/core/compFactory', 'lodash'], function (React, compFactoryDef, _) {
    'use strict';

    var compFactory;
    var TestUtils = React.addons.TestUtils;

    describe('compFactory spec', function () {
        describe('extend', function () {
            var compName = 'CompA',
                compDef;

            beforeEach(function () {
                compFactory = compFactoryDef(React, _);
                compDef = {
                    fn1: jasmine.createSpy('fn1'),
                    render: React.DOM.div
                };
                compFactory.register(compName, compDef);
            });

            it('should return the class of the registered definition', function (done) {
	            var compReactClass = compFactory.getCompReactClass(compName);
                function onComponentReady(comp) {
                    expect(comp.fn1).toBeDefined();
                    done();
                }
                var factory = React.createFactory(compReactClass);
                TestUtils.renderIntoDocument(factory({ref: onComponentReady}));
            });

            it('should extend the comp definition with new functions', function () {
                var extension = jasmine.createSpyObj('extension', ['fn2', 'fn3']);

                compFactory.extend(compName, extension);

                var compClass = compFactory.getCompClass(compName);
                var comp = TestUtils.renderIntoDocument(compClass({}));

                comp.fn1(1);
                expect(compDef.fn1).toHaveBeenCalledWith(1);

                comp.fn2(2);
                expect(extension.fn2).toHaveBeenCalledWith(2);

                comp.fn3(3);
                expect(extension.fn3).toHaveBeenCalledWith(3);
            });

            it('should throw if a key in the extension already exists in the compDefinition', function () {
                var extension = {
                    fn1: function () {
                    }
                };

                compFactory.extend(compName, extension);

                expect(function () {
                    compFactory.getCompClass(compName);
                }).toThrow();
            });
        });
    });
});
