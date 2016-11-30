define(['wixappsCore/core/proxyFactory', 'react', 'testUtils', 'wixappsCore/proxies/mixins/boxProxy', 'lodash'],
    function (proxyFactory, React, /** testUtils */testUtils, boxProxy, _) {
        'use strict';
        describe('Box Proxy', function () {

            var verticalSpacerDef = {
                id: jasmine.any(String),
                comp: {
                    name: 'VSpacer',
                    size: '*'
                }
            };

            var horizontalSpacerDef = {
                id: jasmine.any(String),
                comp: {
                    name: 'HSpacer',
                    size: '*'
                }
            };


            beforeAll(function () {
                /** @extends proxies.mixins.boxProxy */
                var MockBoxProxy = {
                    mixins: [boxProxy],
                    getChildrenOrientation: function () {
                        return 'vertical';
                    },
                    getReactClass: function () {
                        return React.DOM.span;
                    }
                };

                proxyFactory.register('MockBox', MockBoxProxy);
            });

            afterAll(function () {
                proxyFactory.invalidate('MockBox');
            });

            beforeEach(function () {
                this.viewDef = {
                    comp: {
                        name: "MockBox",
                        items: [
                            {
                                value: 'child proxy',
                                comp: {
                                    name: "MockBox",
                                    items: [],
                                    css: {

                                    }
                                },
                                layout: {

                                }
                            }
                        ]
                    }
                };
            });

            function getProxy(props, orientation) {
                orientation = orientation || 'vertical';

                var proxy = testUtils.proxyBuilder('MockBox', props);
                spyOn(proxy, 'renderChildProxy').and.callThrough();
                spyOn(proxy, 'getChildrenOrientation').and.returnValue(orientation);
                proxy.forceUpdate();

                return proxy;
            }

            describe('spacers', function () {
                it('should create child with no spacers by default', function () {
                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    var childViewDef = this.viewDef.comp.items[0];
                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(childViewDef, 0);

                    expect(proxy.refs.spacer_before_0).toBeUndefined();
                    expect(proxy.refs.spacer_after_0).toBeUndefined();
                });

                it('should create child with flex spacer before', function () {
                    this.viewDef.comp.items[0].layout = {'spacerBefore': '*'};
                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(2);
                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(verticalSpacerDef, 'spacer_before_0');
                    expect(proxy.refs.spacer_after_0).toBeUndefined();

                    proxy = getProxy(props, 'horizontal');

                    expect(proxy.refs.component.children.length).toEqual(2);
                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(horizontalSpacerDef, 'spacer_before_0');
                    expect(proxy.refs.spacer_after_0).toBeUndefined();
                });

                it('should create child with flex spacer after', function () {
                    this.viewDef.comp.items[0].layout = {'spacerAfter': '*'};
                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(2);
                    expect(proxy.refs.spacer_before_0).toBeUndefined();
                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(verticalSpacerDef, 'spacer_after_0');

                    proxy = getProxy(props, 'horizontal');
                    expect(proxy.refs.component.children.length).toEqual(2);
                    expect(proxy.refs.spacer_before_0).toBeUndefined();
                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(horizontalSpacerDef, 'spacer_after_0');
                });

                it('should create child with flex spacer before and after', function () {
                    this.viewDef.comp.items[0].layout = {'spacer': '*'};
                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(3);

                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(verticalSpacerDef, 'spacer_before_0');
                    expect(proxy.renderChildProxy).toHaveBeenCalledWith(verticalSpacerDef, 'spacer_after_0');
                });
            });

            // PhantomJS2
            describe('packing', function () {
                it('should add justify-content when pack equals start', function () {
                    this.viewDef.comp.pack = 'start';

                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    spyOn(props.viewContextMap, 'getVar').and.returnValue(undefined); // mock viewContext
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    expect(proxy.refs.component.style.justifyContent).toEqual('flex-start');
                });

                it('should add justify-content when pack equals end', function () {
                    this.viewDef.comp.pack = 'end';

                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    spyOn(props.viewContextMap, 'getVar').and.returnValue(undefined); // mock viewContext
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    expect(proxy.refs.component.style.WebkitJustifyContent).toEqual('flex-end');
                });

                it('should add justify-content when pack equals center', function () {
                    this.viewDef.comp.pack = 'center';

                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    spyOn(props.viewContextMap, 'getVar').and.returnValue(undefined); // mock viewContext
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    expect(proxy.refs.component.style.WebkitJustifyContent).toEqual('center');
                });
            });

            // PhantomJS2
            describe('box-align', function () {
                it('should add -webkit-align-items when box-align equals start', function () {
                    this.viewDef.comp['box-align'] = 'start';

                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    expect(proxy.refs.component.style.alignItems).toEqual('flex-start');
                });

                it('should add -webkit-align-items when box-align equals end', function () {
                    this.viewDef.comp['box-align'] = 'end';

                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    expect(proxy.refs.component.style.WebkitAlignItems).toEqual('flex-end');
                });

                it('should add -webkit-align-items when box-align equals center', function () {
                    this.viewDef.comp['box-align'] = 'center';

                    var props = testUtils.proxyPropsBuilder(this.viewDef);
                    var proxy = getProxy(props);

                    expect(proxy.refs.component.children.length).toEqual(1);
                    expect(proxy.refs.component.style.WebkitAlignItems).toEqual('center');
                });
            });

            describe('deflexush', function () {

                describe('child has display:flex', function(){

                    it('should display:flex when child has flex display layout', function () {

                        this.viewDef.comp.items[0].layout = {'box-flex': '1'};

                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                    });

                    it('should display:flex when child has flex display css', function () {

                        this.viewDef.comp.items[0].comp.css = {'box-flex': '1'};

                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                    });

                    it('should display:flex when first child has no flex and second child has flex layout', function () {

                        var secondChild = _.cloneDeep(this.viewDef.comp.items[0]);
                        secondChild.layout = {'box-flex': '1'};

                        this.viewDef.comp.items.push(secondChild);
                        this.viewDef.comp.items[0].layout = {'display': 'block'};

                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(proxy.refs.component.children.length).toEqual(2);
                        expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                    });

                    it('should display:flex when first child has no flex and second child has flex css', function () {

                        var secondChild = _.cloneDeep(this.viewDef.comp.items[0]);
                        secondChild.comp.css = {'box-flex': '1'};

                        this.viewDef.comp.items.push(secondChild);
                        this.viewDef.comp.items[0].comp.css = {'display': 'block'};

                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(proxy.refs.component.children.length).toEqual(2);
                        expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                    });

                });
                describe('child has spacers', function (){

                    it('should display:flex child has flexed spacers layout', function () {

                        _.forEach([
                            {spacer: '*'},
                            {spacerBefore: '*'},
                            {spacerAfter: '*'}
                        ], function(testCase){
                            this.viewDef.comp.items[0].layout = testCase;
                            var props = testUtils.proxyPropsBuilder(this.viewDef);
                            var proxy = getProxy(props);
                            expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                        }, this);
                    });

                    it('should display:block child has fixed spacers layout', function () {

                        _.forEach([
                            {spacer: '5'},
                            {spacerBefore: '5'},
                            {spacerAfter: '5'}
                        ], function(testCase) {
                            this.viewDef.comp.items[0].layout = testCase;
                            var props = testUtils.proxyPropsBuilder(this.viewDef);
                            var proxy = getProxy(props);
                            expect(proxy.refs.component.style.display).toEqual('block');
                        }, this);
                    });

                    it('should display:flex child has flexed spacers css', function () {

                        _.forEach([
                            {spacer: '*'},
                            {spacerBefore: '*'},
                            {spacerAfter: '*'}
                        ], function(testCase){
                            this.viewDef.comp.items[0].comp.css = testCase;
                            var props = testUtils.proxyPropsBuilder(this.viewDef);
                            var proxy = getProxy(props);
                            expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                        }, this);
                    });

                    it('should display:block child has fixed spacers css', function () {

                        _.forEach([
                            {spacer: '5'},
                            {spacerBefore: '5'},
                            {spacerAfter: '5'}
                        ], function(testCase){
                            this.viewDef.comp.items[0].comp.css = testCase;
                            var props = testUtils.proxyPropsBuilder(this.viewDef);
                            var proxy = getProxy(props);
                            expect(proxy.refs.component.style.display).toEqual('block');
                        }, this);
                    });
                });
                describe('child is a spacer', function (){

                    it('should display:flex when it has flexed horizontal spacer child', function () {
                        this.viewDef.comp.items.push(horizontalSpacerDef);
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);
                        expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                    });

                    it('should display:block when it has a horizontal spacer child with fixed size', function () {
                        horizontalSpacerDef.size = 20;
                        this.viewDef.comp.items.push(_.defaultsDeep({comp: {size: '5'}}, horizontalSpacerDef));
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);
                        expect(proxy.refs.component.style.display).toEqual('block');
                    });

                    it('should display:flex when it has flexed vertical spacer child', function () {
                        this.viewDef.comp.items.push(verticalSpacerDef);
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);
                        expect(_.toArray(proxy.refs.component.classList)).toContain('flex_display');
                    });

                    it('should display:block when it has a vertical spacer child with fixed size', function () {
                        verticalSpacerDef.size = 20;
                        this.viewDef.comp.items.push(_.defaultsDeep({comp: {size: '5'}}, verticalSpacerDef));
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);
                        expect(proxy.refs.component.style.display).toEqual('block');
                    });

                });
                // PhantomJS2
                describe('child has box-flex key', function (){

                    it('should display:flex when child has flex key layout', function () {

                        this.viewDef.comp.items[0].layout = {'box-flex': '1'};
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(_.toArray(_.toArray(proxy.refs.component.classList))).toContain('flex_display');
                    });

                    it('should display:flex when child has flex key css', function () {

                        this.viewDef.comp.items[0].comp.css = {'box-flex': '1'};
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(_.toArray(_.toArray(proxy.refs.component.classList))).toContain('flex_display');
                    });

                    it('should display:flex when first child has no flex properties and second child does have flex key layout', function () {

                        var secondChild = _.cloneDeep(this.viewDef.comp.items[0]);
                        secondChild.layout = {'box-flex': '1'};

                        this.viewDef.comp.items.push(secondChild);
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(proxy.refs.component.children.length).toEqual(2);
                        expect(_.toArray(_.toArray(proxy.refs.component.classList))).toContain('flex_display');
                    });

                    it('should display:flex when first child has no flex properties and second child does have flex key css', function () {

                        var secondChild = _.cloneDeep(this.viewDef.comp.items[0]);
                        secondChild.comp.css = {'box-flex': '1'};

                        this.viewDef.comp.items.push(secondChild);
                        var props = testUtils.proxyPropsBuilder(this.viewDef);
                        var proxy = getProxy(props);

                        expect(proxy.refs.component.children.length).toEqual(2);
                        expect(_.toArray(_.toArray(proxy.refs.component.classList))).toContain('flex_display');
                    });

                });
                xdescribe('alignment', function (){
                    it('should align text according to box-align', function () {
                        _.forEach([
                            {boxAlign: 'start', textAlign: 'left'},
                            {boxAlign: 'center', textAlign: 'center'},
                            {boxAlign: 'end', textAlign: 'right'}
                        ], function (testCase) {

                            this.viewDef.comp['box-align'] = testCase.boxAlign;

                            var props = testUtils.proxyPropsBuilder(this.viewDef);
                            var proxy = getProxy(props);

                            expect(proxy.refs.component.style.textAlign).toEqual(testCase.textAlign);
                        }, this);
                    });
                });

            });
        });
    });
