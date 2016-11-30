define(['zepto', 'testUtils', 'lodash', 'definition!core/siteRender/siteAspectsMixin', 'core/siteRender/SiteAspectsSiteAPI', 'utils'
], function($, testUtils, _, siteAspectsMixinCons, SiteAspectsSiteAPI, utils){
    'use strict';

    describe("siteAspectsMixin", function(){
        /**
         *
         * @param aspectCostructors
         * @returns {core.siteAspectsMixin}
         */
        function getAspectsMixin(aspectCostructors){
            var mixin = siteAspectsMixinCons(_, $, {getAllAspectConstructors: function(){ return aspectCostructors; }}, SiteAspectsSiteAPI, utils);
            mixin.props = { };
            mixin.props.siteData = testUtils.mockFactory.mockSiteData();

            mixin.props.siteData.siteId = 'site1';
            mixin.siteAPI = testUtils.mockFactory.mockSiteAPI(mixin.props.siteData);
            mixin.getInitialState(mixin.props);
            mixin.componentWillMount();
            return mixin;
        }

        describe("getAllSiteAspects", function(){
            it("should return all registered aspects before first render", function(){
                var aspects = {
                    'aspect1': function(){},
                    'aspect2': function(){}
                };
                var aspectsMixin = getAspectsMixin(aspects);

                expect(_.keys(aspectsMixin.getAllSiteAspects())).toEqual(_.keys(aspects));
            });

            it("should return the aspects registered after the first render", function(){
                var aspects = {};
                var aspectsMixin = getAspectsMixin(aspects);

                aspects.aspect1 = function(){};
                expect(_.keys(aspectsMixin.getAllSiteAspects())).toEqual(_.keys(aspects));
            });

            it("should not override an already registered aspect", function(){
                var aspects = {
                    'aspect1': function(){this.a = 2;}
                };
                var aspectsMixin = getAspectsMixin(aspects);

                aspects.aspect1 = function(){ this.a = 5;};
                var aspectInstances = aspectsMixin.getAllSiteAspects();
                expect(aspectInstances.aspect1.a).toBe(2);
            });
        });

        describe("register aspect to event", function(){
            beforeEach(function(){
                /** @type core.siteAspectsMixin */
                this.mixin = getAspectsMixin({});
                this.callback = jasmine.createSpy('callback');
            });

            it("should be ok if no one is registered", function(){
                this.mixin.componentDidMount();
            });

            it("should notify the registered aspect about an event", function(){
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.mount, this.callback);

                this.mixin.componentDidMount();

                expect(this.callback).toHaveBeenCalled();
                expect(this.callback.calls.count()).toBe(1);
            });

            it("should notify multiple aspects about an event", function(){
                var callback1 = jasmine.createSpy('callback1');
                var callback2 = jasmine.createSpy('callback2');
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.mount, callback1);
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.mount, callback2);

                this.mixin.componentDidMount();

                expect(callback1).toHaveBeenCalled();
                expect(callback2).toHaveBeenCalled();
            });

            it("should allow to register the same method twice..", function(){
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.mount, this.callback);
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.mount, this.callback);

                this.mixin.componentDidMount();

                expect(this.callback.calls.count()).toBe(2);
            });

            xit("should notify about window post message with the event and data", function(){
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.message, this.callback);

                this.mixin.componentDidMount();
                $(window).trigger('message', 'message');

                expect(this.callback.calls.count()).toBe(1);
                var args = this.callback.calls.first().args;
                expect(args[0].target).toBe(window);
                expect(args[1]).toBe('message');
            });

            it("should notify about document visibility change with the event and data", function(){
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.visibilitychange, this.callback);

                this.mixin.componentDidMount();
                $(window.document).trigger('visibilitychange', 'visibilitychange');

                expect(this.callback.calls.count()).toBe(1);
                var args = this.callback.calls.first().args;
                expect(args[0].target).toBe(window.document);
                expect(args[1]).toBe('visibilitychange');
            });

            xit("should notify about window message once if site was rendered twice", function(){
                this.mixin.registerAspectToEvent(this.mixin.supportedEvents.message, this.callback);

                this.mixin.componentDidMount();
                this.mixin.componentDidMount();
                $(window).trigger('message', 'message');

                expect(this.callback.calls.count()).toBe(1);
            });

            describe("renderedRootsChanged", function(){
                beforeEach(function(){
                    this.siteData = this.mixin.props.siteData;
                    this.mixin.registerAspectToEvent(this.mixin.supportedEvents.renderedRootsChanged, this.callback);
                    this.mixin.props.siteData.addPageWithDefaults('page1')
                        .setCurrentPage('page1');

                    this.mixin.componentDidMount();
                });
                it("should notify about rendered roots change first time, all roots added", function(){
                    expect(this.callback).toHaveBeenCalledWith(['masterPage', 'page1'], []);
                    expect(this.callback.calls.count()).toBe(1);
                });

                it("should notify about rendered roots change, when opening popup", function(){
                    this.callback.calls.reset();
                    this.siteData.addPageWithData('popup1', {isPopup: true});
                    this.siteData.setRootNavigationInfo({pageId: 'popup1'});

                    this.mixin.componentDidUpdate();

                    expect(this.callback).toHaveBeenCalledWith(['popup1'], []);
                    expect(this.callback.calls.count()).toBe(1);
                });

                it("should notify about rendered roots change, when closing popup", function(){
                    this.siteData.addPageWithData('popup1', {isPopup: true});
                    this.siteData.setRootNavigationInfo({pageId: 'popup1'});
                    this.mixin.componentDidUpdate();
                    this.callback.calls.reset();
                    this.siteData.setRootNavigationInfo({pageId: 'page1'}, true);

                    this.mixin.componentDidUpdate();

                    expect(this.callback).toHaveBeenCalledWith([], ['popup1']);
                    expect(this.callback.calls.count()).toBe(1);
                });

                it("should notify about rendered roots change, when changing page", function(){
                    this.callback.calls.reset();
                    this.siteData.addPageWithDefaults('page2');
                    this.siteData.setCurrentPage('page2');

                    this.mixin.componentDidUpdate();

                    expect(this.callback).toHaveBeenCalledWith(['page2'], ['page1']);
                    expect(this.callback.calls.count()).toBe(1);
                });

                it("should NOT notify about rendered roots change, if nothing changed", function(){
                    this.callback.calls.reset();
                    this.mixin.componentDidUpdate();

                    expect(this.callback).not.toHaveBeenCalled();
                });
            });
        });

        function testConcatAspectAnswers(aspectMethodName, mixinMethodName){
            var Aspect1 = function () {
                this[aspectMethodName] = function () {
                    return ['a'];
                };
            };
            var Aspect2 = function () {
                this[aspectMethodName] = function () {
                    return ['b', 'c'];
                };
            };
            var mixin = getAspectsMixin([Aspect1, Aspect2]);
            var comps = mixin[mixinMethodName]();
            expect(comps).toEqual(['a', 'b', 'c']);
        }

        function testNullAspectAnswer(aspectMethodName, mixinMethodName) {
            var Aspect1 = function () {
                this[aspectMethodName] = function () {
                    return ['a'];
                };
            };
            var Aspect2 = function () {
                this[aspectMethodName] = function () {
                    return null;
                };
            };
            var mixin = getAspectsMixin([Aspect1, Aspect2]);
            var comps = mixin[mixinMethodName]();
            expect(comps).toEqual(['a']);
        }

        function testAspectMethodNotDefined(aspectMethodName, mixinMethodName){
            var Aspect1 = function () { };
            var Aspect2 = function () {
                this[aspectMethodName] = function () {
                    return ['a'];
                };
            };
            var mixin = getAspectsMixin([Aspect1, Aspect2]);
            var comps = mixin[mixinMethodName]();
            expect(comps).toEqual(['a']);
        }

        describe("getAspectsReactComponents", function () {
            it("should concat the components array", function(){
               testConcatAspectAnswers('getReactComponents', 'getAspectsReactComponents');
            });

            it("should ignore nulls", function () {
                testNullAspectAnswer('getReactComponents', 'getAspectsReactComponents');
            });

            it("should ignore aspects which didn't define the getReactComponents method", function(){
                testAspectMethodNotDefined('getReactComponents', 'getAspectsReactComponents');
            });

            it("should pass loaded styles to aspects", function(){
                var spy = jasmine.createSpy('getReactComponents');
                var Aspect = function () { };
                Aspect.prototype = {
                    getReactComponents: spy
                };
                var mixin = getAspectsMixin([Aspect]);
                mixin.loadedStyles = 'styles';

                mixin.getAspectsReactComponents();
                expect(spy).toHaveBeenCalledWith('styles');
            });
        });

        describe("getAspectsComponentStructures", function () {
            it("should concat the structures array", function(){
                testConcatAspectAnswers('getComponentStructures', 'getAspectsComponentStructures');
            });

            it("should ignore nulls", function () {
                testNullAspectAnswer('getComponentStructures', 'getAspectsComponentStructures');
            });

            it("should ignore aspects which didn't define the getComponentStructures method", function(){
                testAspectMethodNotDefined('getComponentStructures', 'getAspectsComponentStructures');
            });
        });

        describe("notifyAspects", function() {
            var mixin, eventName, spy1, spy2;

            beforeEach(function(){
                /** @type core.siteAspectsMixin */
                mixin = getAspectsMixin({});
                eventName = mixin.supportedEvents.urlPageChange;

                spy1 = jasmine.createSpy();
                spy2 = jasmine.createSpy();
                mixin.registerAspectToEvent(eventName, spy1);
                mixin.registerAspectToEvent(eventName, spy2);
            });

            it("should notify all registered aspects", function() {
                mixin.notifyAspects(eventName);
                expect(spy1).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
            });

            it("should pass parameters to the registered callbacks", function(){
                mixin.notifyAspects(eventName, 1, 2);
                expect(spy1).toHaveBeenCalledWith(1, 2);
                expect(spy2).toHaveBeenCalledWith(1, 2);
            });

            it("should notify all registered aspects, even if one unregistered during invokation", function() {
                spy1.and.callFake(function() {
                    mixin.unregisterAspectFromEvent(eventName, spy1);
                });
                mixin.notifyAspects(eventName);
                expect(spy1).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
            });

        });
    });


});
