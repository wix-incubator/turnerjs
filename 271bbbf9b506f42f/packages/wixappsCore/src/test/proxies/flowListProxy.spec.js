define(['lodash', 'testUtils', 'reactDOM'], function(_, /** testUtils */testUtils, ReactDOM) {
    'use strict';

    describe('flowListProxy', function () {

        var viewDef, data;
        beforeEach(function () {
            viewDef = {
                comp: {
                    "name": "FlowList",
                    "templates": {
                        "item": {
                            "comp": {
                                "name": "Label"
                            }
                        }
                    }
                }
            };
            data = [{"key": "photo"}, {"key": "text"}, {"key": "video"}];
        });

        it('Should create a verticalRepeater component with the default skin', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('FlowList', props);
            var component = proxy.refs.component;

            // Validate default component is used
            expect(component).toBeComponentOfType('wysiwyg.viewer.components.VerticalRepeater');

            // Validate default skin
            expect(component.props.skin).toEqual('skins.core.InlineSkin');
        });

        it("should set display block and white-space to the component", function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('FlowList', props);
            var component = proxy.refs.component;

            expect(component.props.style.display).toEqual('block');
            expect(component.props.style.whiteSpace).toEqual('normal');
        });

        it("should set display inline-block for children elements", function(){
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('FlowList', props);

            for (var i = 0; i < data.length; i++) {
                var child = proxy.refs[i];
                expect(ReactDOM.findDOMNode(child).style.display).toEqual('inline-block');
                expect(ReactDOM.findDOMNode(child).style.width).toEqual('auto');
            }
        });
    });
});
