define(["lodash", "wixappsCore/core/proxyFactory", "wixappsCore/proxies/listProxy", 'testUtils'], function (_, /** wixappsCore.proxyFactory */proxyFactory, listProxy, /** testUtils */testUtils) {
    'use strict';
    describe('listProxy', function () {
        var viewDef;
        var data;

        beforeEach(function () {
            var TestListProxy = {
                mixins: [listProxy],
                getChildAdditionalStyle: function () {
                    return {};
                },
                getAdditionalStyle: function () {
                    return {};
                }
            };

            proxyFactory.register('TestListProxy', TestListProxy);
            proxyFactory.register('StupidProxy', testUtils.stupidProxy);


            viewDef = {
                comp: {
                    "name": "TestListProxy",
                    "skin": "skins.core.InlineSkin",
                    "templates": {
                        "item": {
                            "comp": {
                                "name": "StupidProxy"
                            }
                        }
                    }
                }
            };

            data = [
                {"key": "photo"},
                {"key": "text"},
                {"key": "video"}
            ];
        });

        afterEach(function () {
            proxyFactory.invalidate('TestListProxy');
            proxyFactory.invalidate('StupidProxy');
        });

        it('should create a VerticalRepeater component + children with the correct data and viewDef', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TestListProxy', props);
            var component = proxy.refs.component;
            var proxyChildren = component.props.children;

            expect(proxyChildren.length).toBe(data.length);
            _.forEach(proxyChildren, function(child, index){
                expect(proxy.refs[index].proxyData).toEqual(data[index]);
                expect(proxy.refs[index].props.viewDef).toEqual(viewDef.comp.templates.item);
            });
        });

        it('should write position in parent vars on each child', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TestListProxy', props);
            var proxyChildren = proxy.refs.component.props.children;

            _.forEach(proxyChildren, function(child, index){
                var positionInParent = "first";
                if (index > 0){
                    positionInParent = index === data.length - 1 ? "last" : "middle";
                }

                var expected = {
                    indexInParent: index,
                    indexOneInParent: index + 1,
                    positionInParent: positionInParent,
                    isOddIndexInParent: index % 2 === 1
                };
                var ref = proxy.refs[index];
                _.forEach(expected, function(value, key){
                    expect(ref.props.viewContextMap.getVar(ref.contextPath, key)).toEqual(value);
                });
            });
        });

        it('should use the first template when there is only one item in the list', function () {
            viewDef.comp.templates.first = _.assign({}, viewDef.comp.templates.item, {layout: {width: '50px'}});
            data = _.take(data, 1);

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TestListProxy', props);

            var firstItem = proxy.refs[0];
            expect(firstItem.props.viewDef).toBe(viewDef.comp.templates.first);
        });

        it('should use the right template when rendering items in the list', function () {
            viewDef.comp.templates.first = _.assign({}, viewDef.comp.templates.item, {layout: {width: '50px'}});
            viewDef.comp.templates.last = _.assign({}, viewDef.comp.templates.item, {layout: {width: '60px'}});

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('TestListProxy', props);

            expect(proxy.refs[0].props.viewDef).toBe(viewDef.comp.templates.first);
            expect(proxy.refs[1].props.viewDef).toBe(viewDef.comp.templates.item);
            expect(proxy.refs[2].props.viewDef).toBe(viewDef.comp.templates.last);
        });
    });
});
