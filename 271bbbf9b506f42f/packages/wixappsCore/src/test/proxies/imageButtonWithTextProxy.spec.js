define([
    'lodash',
    'testUtils'
], function (
    _,
    testUtils
) {
    'use strict';

    describe('imageButtonWithTextProxy', function () {
        it('should render a component of type "wysiwyg.viewer.components.ImageButtonWithText"', function () {
            var component = this.createComponent();
            expect(component).toBeComponentOfType('wysiwyg.viewer.components.ImageButtonWithText');
        });

        it('should pass down type from comp props to compData', function () {
            var TYPE = 'type';

            var component = this.createComponent({
                compProps: {
                    type: TYPE
                }
            });

            expect(component.props.compData.type).toBe(TYPE);
        });

        it('should pass down icon source from comp props to compData', function () {
            var ICON_SOURCE = '//example.com/icon.svg';

            var component = this.createComponent({
                compProps: {
                    iconSource: ICON_SOURCE
                }
            });

            expect(component.props.compData.iconSource).toEqual(ICON_SOURCE);
        });

        it('should pass down label from comp props to compData', function () {
            var LABEL = 'Label';

            var component = this.createComponent({
                compProps: {
                    label: LABEL
                }
            });

            expect(component.props.compData.label).toBe(LABEL);
        });

        it('should pass down direction from view props to compProp', function () {
            var DIRECTION = 'ltr';

            var component = this.createComponent({
                proxyProps: {
                    viewProps: {
                        compProp: {
                            direction: DIRECTION
                        }
                    }
                }
            });

            expect(component.props.compProp.direction).toBe(DIRECTION);
        });

        it('should pass size from comp props to compProp', function () {
            var SIZE = 40;

            var component = this.createComponent({
                compProps: {
                    size: SIZE
                }
            });

            expect(component.props.compProp.size).toBe(SIZE);
        });

        beforeEach(function () {
            this.createComponent = function (options) {
                var proxyViewDef = {
                    comp: _.merge({name: 'ImageButtonWithText'}, _.get(options, 'compProps'))
                };
                var proxyProps = _.merge(testUtils.proxyPropsBuilder(proxyViewDef), _.get(options, 'proxyProps'));
                var proxy = testUtils.proxyBuilder(proxyViewDef.comp.name, proxyProps);
                return proxy.refs.component;
            };
        });
    });
});
