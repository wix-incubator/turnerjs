define(['lodash', 'wixappsCore', 'testUtils', 'wixappsBuilder/proxies/mixins/baseFieldProxy', 'wixappsBuilder/util/fieldProxyUtils'], function (_, /** wixappsCore */wixapps, /** testUtils */testUtils, baseFieldProxy, fieldProxyUtils) {
    'use strict';

    var viewDef;
    var proxyData = {"_type": "wix:Image", "title": "", "src": "images/items/faq.png", "width": 100, "height": 100, "alt": ""};

    function getProps(imageLink) {
        var props = testUtils.proxyPropsBuilder(viewDef, proxyData);

        props.orientation = 'vertical';

        spyOn(props.viewProps, 'getDataByPath').and.callFake(function (contextPath, path) {
            if (path === 'links.image') {
                return imageLink;
            }
        });

        return props;
    }

    function getProxy(props, methodImplementations) {
        var TestFieldProxy = _.defaults(methodImplementations || {}, {
            mixins: [baseFieldProxy],

            shouldHide: function () {
                return false;
            },

            getItemLayout: function () {
                return {};
            }
        });

        wixapps.proxyFactory.register('TestField', TestFieldProxy);

        var proxy = testUtils.proxyBuilder('TestField', props);

        wixapps.proxyFactory.invalidate('TestField');

        return proxy;
    }

    describe('BaseField proxy', function () {
        beforeEach(function () {
            viewDef = {
                "comp": {
                    "name": "TestField",
                    "items": [
                        {
                            "comp": {
                                "name": "VBox"
                            }
                        }
                    ]}
            };
        });

        describe('renderProxy', function () {
            describe('No items', function () {
                it('No items 1 - throws', function () {
                    viewDef.comp.items = [];
                    var props = getProps();
                    var errMsg = 'Field proxy accepts exactly one child';
                    expect(getProxy.bind(undefined, props)).toThrow(errMsg);
                });

                it('No items 2 - throws', function () {
                    delete viewDef.comp.items;
                    var props = getProps();
                    var errMsg = 'Field proxy accepts exactly one child';
                    expect(getProxy.bind(undefined, props)).toThrow(errMsg);
                });
            });

            //We are now using box-align on all proxies
            xdescribe('alignment', function () {
                it('Orientation is vertical and no box align - alignment is set by start and vertical', function () {
                    spyOn(fieldProxyUtils, 'getBoxAlignment').and.callFake(function (boxAlign, isVertical) {
                            if (boxAlign === 'start' && isVertical === true) {
                                return {yetAnotherAlignment: 'some alignment'};
                            }
                        }
                    );

                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.yetAnotherAlignment).toEqual('some alignment');
                });

                it('Has vertical orientation for field and has box align - alignment is set by start and vertical', function () {
                    spyOn(fieldProxyUtils, 'getBoxAlignment').and.callFake(function (boxAlign, isVertical) {
                            if (boxAlign === 'end' && isVertical === true) {
                                return {yetAnotherAlignment: 'some alignment'};
                            }
                        }
                    );

                    var props = getProps();
                    viewDef.comp['box-align'] = 'end';
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.yetAnotherAlignment).toEqual('some alignment');
                });

                it('Has horizontal orientation for field and has box align - alignment is set by start and vertical', function () {
                    spyOn(fieldProxyUtils, 'getBoxAlignment').and.callFake(function (boxAlign, isVertical) {
                            if (boxAlign === 'end' && isVertical === false) {
                                return {yetAnotherAlignment: 'some alignment'};
                            }
                        }
                    );

                    var props = getProps();
                    props.orientation = 'horizontal';
                    viewDef.comp['box-align'] = 'end';
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.yetAnotherAlignment).toEqual('some alignment');
                });
            });

            describe('Child proxy hidden', function () {
                xit('Not hidden by comp def, but hidden by this.shouldHide method - should be hidden', function () {
                    viewDef.comp.hidden = 'false';
                    var props = getProps();
                    var proxy = getProxy(props, {shouldHide: function () {
                        return true;
                    }});

                    expect(proxy.refs[0].refs.hidden).toBeDefined();
                });

                it('Not hidden by comp def and not by this.shouldHide method - should NOT be hidden', function () {
                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.name).toEqual('VBox');
                });
            });

            describe('Child proxy name', function () {
                it('No orientation - VBox', function () {
                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.name).toEqual('VBox');
                });

                it('Vertical orientation - VBox', function () {
                    viewDef.comp.orientation = 'vertical';
                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.name).toEqual('VBox');
                });

                it('Horizontal orientation - HBox', function () {
                    var props = getProps();
                    props.orientation = 'horizontal';
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.name).toEqual('HBox');
                });
            });

            describe('Links', function () {
                it('No links - single item inside the childViewDef is the original', function () {
                    spyOn(fieldProxyUtils, 'getLinkViewDef').and.callFake(function (pageLink, itemLink) {
                            expect(pageLink).toBeUndefined();
                            expect(itemLink).toBeUndefined();
                        }
                    );
                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.comp.items[0]).toEqual(viewDef.comp.items[0]);
                });

                it('Has page link on the comp - wrap the single item with link proxy', function () {
                    spyOn(fieldProxyUtils, 'getLinkViewDef').and.callFake(function (pageLink, itemLink) {
                            expect(pageLink).toEqual('mega link');
                            expect(itemLink).toBeUndefined();
                            return {
                                comp: {
                                    name: "VBox",
                                    items: []
                                }};
                        }
                    );
                    viewDef.comp.pageLink = 'mega link';
                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    var expected = {
                        comp: {
                            name: "VBox",
                            items: viewDef.comp.items
                        },
                        layout: _.cloneDeep(viewDef.comp.items[0].layout)
                    };

                    expect(childViewDef.comp.items[0]).toEqual(expected);
                });

                it('Has link on the single item - wrap it with link proxy', function () {
                    viewDef.comp.items[0].link = 'mega link';
                    spyOn(fieldProxyUtils, 'getLinkViewDef').and.callFake(function (pageLink, itemLink) {
                            expect(pageLink).toBeUndefined();
                            expect(itemLink).toEqual('mega link');
                            return {
                                comp: {
                                    name: "VBox",
                                    items: []
                                }};
                        }
                    );
                    var props = getProps();
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    var expected = {
                        comp: {
                            name: "VBox",
                            items: viewDef.comp.items
                        },
                        layout: _.cloneDeep(viewDef.comp.items[0].layout)
                    };

                    expect(childViewDef.comp.items[0]).toEqual(expected);
                });

                it('No link on the single item but resolved by getDataByPath, data path is on the Field viewDef - wrap it with link proxy', function () {
                    viewDef.data = 'image';
                    var link = "mega mega link";
                    spyOn(fieldProxyUtils, 'getLinkViewDef').and.callFake(function (pageLink, itemLink) {
                            expect(pageLink).toBeUndefined();
                            expect(itemLink).toEqual(link);
                            return {
                                comp: {
                                    name: "VBox",
                                    items: []
                                }};
                        }
                    );
                    var props = getProps(link);
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    var expected = {
                        comp: {
                            name: "VBox",
                            items: viewDef.comp.items
                        },
                        layout: _.cloneDeep(viewDef.comp.items[0].layout)
                    };

                    expect(childViewDef.comp.items[0]).toEqual(expected);
                });

                it('No link on the single item but resolved by getDataByPath, data path is on the item viewDef - wrap it with link proxy', function () {
                    viewDef.comp.items[0].data = 'image';
                    var link = "mega mega link";
                    spyOn(fieldProxyUtils, 'getLinkViewDef').and.callFake(function (pageLink, itemLink) {
                            expect(pageLink).toBeUndefined();
                            expect(itemLink).toEqual(link);
                            return {
                                comp: {
                                    name: "VBox",
                                    items: []
                                }};
                        }
                    );
                    var props = getProps(link);
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    var expected = {
                        comp: {
                            name: "VBox",
                            items: viewDef.comp.items
                        },
                        layout: _.cloneDeep(viewDef.comp.items[0].layout)
                    };

                    expect(childViewDef.comp.items[0]).toEqual(expected);
                });
            });

            describe('Spacers', function () {
                function testSpacers(translatedSpacers) {
                    viewDef.comp.spacers = {x1: 1, x2: 2};
                    spyOn(fieldProxyUtils, 'getSpacers').and.callFake(function (fieldOrientation, compDefSpacers, direction) {
                            expect(fieldOrientation).toEqual('horizontal');
                            expect(compDefSpacers).toEqual(viewDef.comp.spacers);
                            expect(direction).toEqual('partDirection');
                            return translatedSpacers;
                        }
                    );
                    var props = getProps();
                    props.orientation = 'horizontal';
                    spyOn(props.viewContextMap, 'getVar').and.returnValue('partDirection');
                    var proxy = getProxy(props);
                    var childViewDef = proxy.refs[0].props.viewDef;

                    expect(childViewDef.layout).toEqual(jasmine.objectContaining(translatedSpacers));
                }

                it('Has spacers - spacers are on the childViewDef layout', function () {
                    testSpacers({before: 3, after: 5});
                });

                it('Empty spacers - spacers are on the childViewDef layout', function () {
                    testSpacers({});
                });
            });

            describe('layout', function () {
                describe('Item layout', function () {
                    it('No link - layout is attached to the single item', function () {
                        var layout = {prop1: 1};
                        var props = getProps();
                        var proxy = getProxy(props, {
                            getItemLayout: function () {
                                return layout;
                            }
                        });
                        var childViewDef = proxy.refs[0].props.viewDef;

                        var expected = _.merge(viewDef.comp.items[0], {layout: layout});

                        expect(childViewDef.comp.items[0]).toEqual(expected);
                    });

                    it('Has link on the single item - layout is on the original item', function () {
                        viewDef.comp.items[0].link = 'mega link';
                        var layout = {prop1: 1};
                        var props = getProps();
                        var proxy = getProxy(props, {
                            getItemLayout: function () {
                                return layout;
                            }
                        });
                        var childViewDef = proxy.refs[0].props.viewDef;

                        var expected = {
                            value: 'mega link',
                            comp: {
                                name: "Link",
                                items: [_.merge(viewDef.comp.items[0], {layout: layout})]
                            },
                            layout: _.cloneDeep(viewDef.comp.items[0].layout)
                        };

                        expect(childViewDef.comp.items[0]).toEqual(expected);
                    });
                });
            });
            describe('adjustViewDefs', function () {
                it('Ensure that adjustViewDefs gets the viewDef and the single item viewDef', function () {
                    var props = getProps();
                    getProxy(props, {
                        adjustViewDefs: function (viewDefToAdjust, itemViewDef) {
                            expect(viewDefToAdjust).toEqual(viewDef);
                            expect(itemViewDef).toEqual(viewDef.comp.items[0]);
                        }});
                });
            });
        });
    });
});
