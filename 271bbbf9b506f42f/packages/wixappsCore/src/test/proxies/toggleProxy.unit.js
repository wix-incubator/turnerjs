define(['testUtils'], function (/** testUtils */testUtils) {
    'use strict';
    describe('toggle proxy', function () {

        function getProps(initialState) {
            //create mocks - mock view definition and data
            var viewDef = {
                comp: {
                    name: 'Toggle',
                    templates: {
                        "on": {
                            "comp": {
                                "name": "VBox",
                                "items": []
                            }
                        },
                        "off": {
                            "comp": {
                                "name": "VBox",
                                "items": []
                            }
                        }
                    }
                }
            };

            if (initialState) {
                viewDef.comp.initialState = initialState;
            }

            var props = testUtils.proxyPropsBuilder(viewDef);
            props.skin = null;
            return props;
        }

        it('should create toggle component with default state off', function () {
            var props = getProps();
            var proxy = testUtils.proxyBuilder('Toggle', props);
            expect(proxy.refs.component.state.$default).toEqual('off');
        });

        it('should change the toggle component state to on when initialState is changed', function () {
            var props = getProps('on');
            var proxy = testUtils.proxyBuilder('Toggle', props);

            expect(proxy.refs.component.state.$default).toEqual('on');
        });
    });
});
