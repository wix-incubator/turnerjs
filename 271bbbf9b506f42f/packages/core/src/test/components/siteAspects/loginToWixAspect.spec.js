define(['react', 'lodash', 'utils', 'core/bi/events', 'definition!core/components/siteAspects/loginToWixAspect'],
    function (React, _, utils, events, aspectDef) {
    'use strict';

    var reactTestUtils = React.addons.TestUtils;

    describe('loginToWixAspect definition', function() {
        describe('registration', function() {
            it('should register the aspect', function() {
                var registerSiteAspect = jasmine.createSpy('registerSiteAspect');
                aspectDef(React, _, utils, {
                    registerSiteAspect: registerSiteAspect
                }, events);
                expect(registerSiteAspect).toHaveBeenCalledWith('LoginToWix', jasmine.any(Function));
            });
        });
    });

    describe('loginToWixAspect', function() {
        var Aspect;
        var registerSiteAspect = function(name, siteAspect) {
            Aspect = siteAspect;
        };
        function initializeAspect() {
            aspectDef(React, _, utils, {
                registerSiteAspect: registerSiteAspect
            }, events);
        }

        var isWixSite;
        var siteData;
        var siteApi;
        var aspect;
        beforeEach(function() {
            isWixSite = false;
            siteData = siteData || {
                isWixSite: function() { return isWixSite; },
                currentUrl: {
                    host: 'test'
                },
                requestModel: {
                    cookie: ''
                }
            };
            siteApi = siteApi || {
                getSiteAPI: function() { return this; },
                getSiteData: function() { return siteData; }
            };

            initializeAspect();
            aspect = new Aspect(siteApi);
        });

        it('initializes', function() {
            expect(aspect.aspectSiteApi).toBe(siteApi);
            expect(aspect.isLoginToWixShown).toBe(false);
            expect(aspect.registeredToMessage).toBe(false);
            expect(aspect.iframeFactory).toBe(null);
        });

        describe('getReactComponents', function() {
            it('When isLoginToWixShown is false', function() {
                var rc = aspect.getReactComponents();
                expect(rc).toBe(null);
            });

            it('When isLoginToWixShown is false, and not WixSite', function() {
                aspect.isLoginToWixShown = true;
                var rc = aspect.getReactComponents();
                expect(rc).toBe(null);
            });

            it('When isLoginToWixShown is false, and is WixSite', function() {
                isWixSite = true;
                aspect.isLoginToWixShown = true;
                var rc = aspect.getReactComponents();
                expect(_.isArray(rc)).toBe(true);
                expect(rc.length).toBe(1);
                var elem = rc[0];
                expect(reactTestUtils.isElement(elem)).toBe(true);
                var comp = reactTestUtils.renderIntoDocument(elem);
                expect(reactTestUtils.isCompositeComponent(comp)).toBe(true);
            });
        });

        it('isLoggedInToWix', function() {
            expect(aspect.isLoggedInToWix()).toBe(false);
        });
    });
});
