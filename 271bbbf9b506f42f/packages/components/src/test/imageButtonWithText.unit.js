define([
    'components/components/imageButtonWithText/imageButtonWithText',
    'lodash',
    'testUtils'
], function (
    definition,
    _,
    testUtils
) {
    'use strict';

    describe('ImageButtonWithText skin property', function () {
        describe('"button"', function () {
            it('should have a class for a type in compData', function () {
                var TYPE = 'facebook';

                this.instantiateComponent({
                    compData: {
                        type: TYPE
                    }
                });

                expect(this.getButtonClassNames()).toContain('type-' + TYPE);
            });

            it('should have a class for a direction in compProp', function () {
                var DIRECTION = 'ltr';

                this.instantiateComponent({
                    compProp: {
                        direction: DIRECTION
                    }
                });

                expect(this.getButtonClassNames()).toContain('direction-' + DIRECTION);
            });

            it('should have a class for a size in compProp', function () {
                var SIZE = 40;

                this.instantiateComponent({
                    compProp: {
                        size: SIZE
                    }
                });

                expect(this.getButtonClassNames()).toContain('size-' + SIZE);
            });

            it('should have a class "label-empty" if a label in compData is empty', function () {
                this.instantiateComponent({
                    compData: {
                        label: ''
                    }
                });

                expect(this.getButtonClassNames()).toContain('label-empty');
            });

            it('should not have a class "label-empty" if a label in compData is nonempty', function () {
                this.instantiateComponent({
                    compData: {
                        label: 'Label'
                    }
                });

                expect(this.getButtonClassNames()).not.toContain('label-empty');
            });
        });

        describe('"buttonLabel"', function () {
            it('should have children equal to a label in compData', function () {
                var LABEL = 'Label';

                this.instantiateComponent({
                    compData: {
                        label: LABEL
                    }
                });

                expect(this.getSkinProperty('buttonLabel')).toEqual(jasmine.objectContaining({
                    children: LABEL
                }));
            });
        });

        describe('"buttonIcon"', function () {
            it('should have source equal to an icon source in compData', function () {
                var ICON_SOURCE = '//example.com/icon.svg';

                this.instantiateComponent({
                    compData: {
                        iconSource: ICON_SOURCE
                    }
                });

                expect(this.getSkinProperty('buttonIcon')).toEqual(jasmine.objectContaining({
                    src: ICON_SOURCE
                }));
            });
        });

        beforeEach(function () {
            var component;

            this.instantiateComponent = function (options) {
                var props = testUtils.mockFactory
                    .mockProps(testUtils.mockFactory.mockSiteData())
                    .setCompData(options.compData || {})
                    .setCompProp(options.compProp || {});
                props.structure.componentType = 'wysiwyg.viewer.components.ImageButtonWithText';

                component = testUtils.getComponentFromDefinition(definition, props);
                component.classSet = _.identity;
            };

            this.getButtonClassNames = function () {
                var classSet = _.get(this.getSkinProperty('button'), 'className');
                var classNames = [];
                _.forEach(classSet, function (enabled, className) {
                    if (enabled) {
                        classNames.push(className);
                    }
                });
                return classNames;
            };

            this.getSkinProperty = function(name) {
                return component.getSkinProperties()[name];
            };
        });
    });
});
