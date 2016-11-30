define(['testUtils', 'wixappsCore/proxies/switchBoxProxy'], function (/** testUtils */testUtils) {
    'use strict';

    describe('SwitchBox proxy', function () {

        var viewDef;
        beforeEach(function () {
            viewDef = {
                id: 'switch',
                comp: {
                    name: 'SwitchBox',
                    cases: {
                        'default': [
                            {
                                value: 'default case',
                                comp: {
                                    name: 'Label'
                                },
                                id: 'defaultCase'
                            }
                        ],
                        'valid': [
                            {
                                value: 'true case',
                                comp: {
                                    name: 'Label'
                                },
                                id: 'validCase'
                            }
                        ],
                        'true': [
                            {
                                value: 'true case',
                                comp: {
                                    name: 'Label'
                                },
                                id: 'trueCase'
                            }
                        ]
                    }
                }
            };
        });

        it('should create a box proxy according to the orientation property', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, '');
            var proxy = testUtils.proxyBuilder('SwitchBox', props);

            var boxProxy = proxy.refs.switch_default;
            // Default should be VBox
            expect(boxProxy.props.viewDef.comp.name).toEqual('VBox');

            props.viewDef.comp.orientation = 'horizontal';
            proxy = testUtils.proxyBuilder('SwitchBox', props);
            boxProxy = proxy.refs.switch_default;
            expect(boxProxy.props.viewDef.comp.name).toEqual('HBox');

            props.viewDef.comp.orientation = 'vertical';
            proxy = testUtils.proxyBuilder('SwitchBox', props);
            boxProxy = proxy.refs.switch_default;
            expect(boxProxy.props.viewDef.comp.name).toEqual('VBox');
        });

        it('should use default case when no other cases are equal to its data', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, 'no case match');
            var proxy = testUtils.proxyBuilder('SwitchBox', props);

            var boxProxy = proxy.refs.switch_default;
            expect(boxProxy.props.viewDef.comp.name).toEqual('VBox');
            expect(boxProxy.props.viewDef.comp.items).toEqual(viewDef.comp.cases.default);
        });

        it("should use the data's value case when there is a case equal to it", function () {
            var props = testUtils.proxyPropsBuilder(viewDef, 'valid');
            var proxy = testUtils.proxyBuilder('SwitchBox', props);

            var boxProxy = proxy.refs.switch_valid;
            expect(boxProxy.props.viewDef.comp.items).toEqual(viewDef.comp.cases.valid);
        });

        it("should handle boolean cases", function () {
            var props = testUtils.proxyPropsBuilder(viewDef, true);
            var proxy = testUtils.proxyBuilder('SwitchBox', props);

            var boxProxy = proxy.refs.switch_true;
            expect(boxProxy.props.viewDef.comp.items).toEqual(viewDef.comp.cases.true);
        });

        it("children should have the same data context", function () {
            var data = {};
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('SwitchBox', props);

            var boxProxy = proxy.refs.switch_default;
            expect(boxProxy.refs[0].props.dataContext).toBe(proxy.props.dataContext);
        });
    });
});
