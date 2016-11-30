define(['lodash', 'testUtils', 'wixappsBuilder'], function (_, /** testUtils */testUtils) {
    'use strict';

    var viewDef;

    function getProps(viewDefinition, orientation) {
        var props = testUtils.proxyPropsBuilder(viewDefinition);
        props.parentProps = {layout: {}};
        props.orientation = orientation;
        return props;
    }

    describe('FieldBox proxy', function () {

        beforeEach(function () {
            viewDef = {
                "comp": {
                    "name": "FieldBox",
                    "orientation": "vertical",
                    "pack": "center",
                    "items": [
                        {
                            "comp": {
                                "name": "VBox",
                                "width": "100",
                                "width-mode": "manual",
                                "items": [],
                                "spacers": {"before": 1, "after": 2, "xax-before": 3, "xax-after": 4}}}
                    ]
                },
                "layout": {}
            };
        });

        it('FieldBox orientation is horizontal - child proxy is HBox and its css.width is auto', function () {
            viewDef.comp.orientation = "horizontal";

            var props = getProps(viewDef, 'vertical');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.name).toEqual('HBox');
            expect(childViewDef.comp.css.width).toEqual('auto');
            expect(childViewDef.comp.items).toEqual(viewDef.comp.items);
        });

        it('FieldBox orientation is vertical - child proxy is VBox', function () {
            var props = getProps(viewDef, 'vertical');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.name).toEqual('VBox');
            expect(childViewDef.comp.pack).toEqual("center");
            expect(childViewDef.comp.css.width).toEqual('auto');
            expect(childViewDef.comp.items).toEqual(viewDef.comp.items);
        });

        it('FieldBox orientation is vertical - child proxy is VBox', function () {
            var props = getProps(viewDef, 'vertical');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.name).toEqual('VBox');
            expect(childViewDef.comp.pack).toEqual("center");
            expect(childViewDef.comp.css.width).toEqual('auto');
            expect(childViewDef.comp.items).toEqual(viewDef.comp.items);
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in layout,' +
            'has children which are not Spacers and they have manual width - css.width is computed from max(width + spacers)', function () {
            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual(107);
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in  layout,' +
            'all children which are not Spacers are hidden and they have manual width - css.width is auto', function () {
            viewDef.comp.items[0].comp.hidden = true;
            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual('auto');
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in layout,' +
            'all children which are not Spacers are hidden and they have manual width - css.width is max(visible component width + spacers)', function () {
            var newChild = _.cloneDeep(viewDef.comp.items[0]);
            newChild.comp.width = 60;
            viewDef.comp.items.push(newChild);
            viewDef.comp.items[0].comp.hidden = true;
            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual(67);
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in layout,' +
            'has children which are not Spacers and they have manual width - css.width is computed from max(width + spacers)', function () {
            var anotherFieldBoxChild = _.cloneDeep(viewDef.comp.items[0]);
            anotherFieldBoxChild.comp.width = 350;
            viewDef.comp.items.push(anotherFieldBoxChild);

            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual(357);
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in  layout,' +
            'has children which are not Spacers and they have auto width-mode - css.width is 200', function () {
            viewDef.comp.items[0].comp["width-mode"] = 'auto';

            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual(200);
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in layout,' +
            'has children which are not Spacers and they have no width-mode but has width - css.width is computed from max(width + spacers)', function () {
            delete viewDef.comp.items[0].comp["width-mode"];

            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual(107);
        });

        it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in layout,' +
            'has children which are not Spacers and they have no width-mode and no width - css.width is 200', function () {
            delete viewDef.comp.items[0].comp["width-mode"];
            delete viewDef.comp.items[0].comp.width;

            var props = getProps(viewDef, 'horizontal');
            var proxy = testUtils.proxyBuilder('FieldBox', props);

            var childViewDef = proxy.refs[0].props.viewDef;
            expect(childViewDef.comp.css.width).toEqual(200);
        });

        _.forEach(['VSpacer', 'HSpacer'], function (spacer) {
            it('FieldBox orientation is vertical, orientation is horizontal, no width/box-flex/flex in layout,' +
                'has children which are only Spacers and they have manual width - css.width is auto', function () {
                viewDef.comp.items[0].comp.name = spacer;
                var props = getProps(viewDef, 'horizontal');
                var proxy = testUtils.proxyBuilder('FieldBox', props);

                var childViewDef = proxy.refs[0].props.viewDef;
                expect(childViewDef.comp.css.width).toEqual('auto');
            });
        });

        _.forEach(['width', 'box-flex', 'flex'], function (laoutProp) {
            it('FieldBox orientation is vertical, orientation is horizontal, has width/box-flex/flex in layout,' +
                'has children which are not Spacers and they have manual width - css.width is auto', function () {
                var props = getProps(viewDef, 'horizontal');
                viewDef.layout[laoutProp] = 'no one gives a fuck';
                var proxy = testUtils.proxyBuilder('FieldBox', props);

                var childViewDef = proxy.refs[0].props.viewDef;
                expect(childViewDef.comp.css.width).toEqual('auto');
            });
        });
    });
});
