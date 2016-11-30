define(['lodash', 'core', 'tpa/aspects/TPAPopupAspect', 'testUtils'], function (_, core, TPAAspectConstructor, testUtils) {
    'use strict';

    var tpaAspect;

    describe('tpaPopupAspect', function () {
        beforeEach(function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();
            var aspectSiteApi = {
                forceUpdate: jasmine.createSpy(),
                getSiteAPI: function () {
                    return siteAPI;
                },
                registerToUrlPageChange: jasmine.createSpy("registerToUrlPageChange")
            };
            tpaAspect = new TPAAspectConstructor(aspectSiteApi);
        });

        it('should inject tpaPopupAspect module', function () {
            expect(tpaAspect).toBeDefined();
        });

        it('should return no components by default', function () {
            expect(tpaAspect.getReactComponents({})).toBe(null);
        });

        it('should not return any component structure by default', function () {
            var comp = tpaAspect.getComponentStructures();
            expect(comp).toBe(null);
        });

        it('should return tpaPopup structure', function () {
            tpaAspect.showPopup({});
            var comp = tpaAspect.getComponentStructures()[0];
            expect(comp.componentType).toBe('wysiwyg.viewer.components.tpapps.TPAPopup');
            expect(comp.skin).toBe('wysiwyg.viewer.skins.TPAPopupSkin');
        });

        it('should allow creation of more than one tpaPopup', function () {

            tpaAspect.showPopup({});
            var comp = tpaAspect.getComponentStructures()[0];
            expect(comp.componentType).toBe('wysiwyg.viewer.components.tpapps.TPAPopup');
            expect(comp.skin).toBe('wysiwyg.viewer.skins.TPAPopupSkin');
            tpaAspect.getReactComponents({});

            tpaAspect.showPopup({});
            comp = tpaAspect.getComponentStructures()[0];
            expect(comp.componentType).toBe('wysiwyg.viewer.components.tpapps.TPAPopup');
            expect(comp.skin).toBe('wysiwyg.viewer.skins.TPAPopupSkin');
        });

        it('should return popups array in getReactComponents', function () {
            tpaAspect.showPopup({});
            expect(_.size(tpaAspect.getReactComponents({}))).toBe(1);

            tpaAspect.showPopup({});
            tpaAspect.getReactComponents({});
            tpaAspect.showPopup({});
            tpaAspect.getReactComponents({});
            tpaAspect.showPopup({});

            expect(_.size(tpaAspect.getReactComponents({}))).toBe(4);
        });

        it('should pass popup onCloseCallback to popup component', function () {
            var data = {
                height: 100,
                width: 101,
                url: 'http://hx0r.com'
            };
            var callback = function () {};
            tpaAspect.showPopup(data, callback);

            var comp = tpaAspect.getReactComponents({})[0];
            expect(comp.props.onCloseCallback).toBe(callback);
        });
    });
});
