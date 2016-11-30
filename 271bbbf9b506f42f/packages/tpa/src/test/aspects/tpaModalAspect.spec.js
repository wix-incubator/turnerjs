define(['lodash', 'core', 'tpa/aspects/TPAModalAspect', 'testUtils'], function (_, core, TPAAspectConstructor, testUtils) {
    'use strict';



    var tpaAspect;

    describe('tpaModalAspect', function () {
        var isMobileView;
        beforeEach(function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();
            isMobileView = jasmine.createSpy();

            var aspectSiteApi = {
                forceUpdate: jasmine.createSpy(),
                setSiteRootHiddenState: jasmine.createSpy(),
                exitFullScreenMode: jasmine.createSpy(),
                enterFullScreenMode: jasmine.createSpy(),
                getSiteData: function () {
                    return {
                        isMobileView: isMobileView
                    };
                },
                getSiteAPI: function() {
                    return siteAPI;
                }
            };
            tpaAspect = new TPAAspectConstructor(aspectSiteApi);
        });

        it('should inject tpaModalAspect module', function () {
            expect(tpaAspect).toBeDefined();
        });

        it('should return no components by default', function () {
            expect(tpaAspect.getReactComponents({})).toBe(null);
        });

        it('should not return any component structure by default', function () {
            var comp = tpaAspect.getComponentStructures();
            expect(comp).toBe(null);
        });

        describe('showModal', function () {
            beforeEach(function () {
                isMobileView.and.returnValue(false);
            });

            it('should return modal after calling show modal', function () {
                var data = {
                    height: 100,
                    width: 101,
                    url: 'http://hx0r.com'
                };
                tpaAspect.showModal(data);
                var comp = tpaAspect.getReactComponents({});
                expect(comp).not.toBe(null);
            });

            it('should return tpaModal structure', function () {
                tpaAspect.showModal({});
                var comp = tpaAspect.getComponentStructures()[0];
                expect(comp.componentType).toBe('wysiwyg.viewer.components.tpapps.TPAModal');
                expect(comp.skin).toBe('wysiwyg.viewer.skins.TPAModalSkin');
            });

            it('should pass modal onCloseCallback to model component', function () {
                var data = {
                    height: 100,
                    width: 101,
                    url: 'http://hx0r.com'
                };
                var callback = function () {};
                tpaAspect.showModal(data, callback);

                var comp = tpaAspect.getReactComponents({})[0];
                expect(comp.props.onCloseCallback).toBe(callback);
            });

            it('should not deal with siteRootHiddenState & fullScreenMode', function () {
                var data = {
                    height: 100,
                    width: 101,
                    url: 'http://hx0r.com'
                };

                tpaAspect.showModal(data);
                tpaAspect.removeModal();
                expect(tpaAspect.aspectSiteApi.exitFullScreenMode).not.toHaveBeenCalled();
                expect(tpaAspect.aspectSiteApi.enterFullScreenMode).not.toHaveBeenCalled();
                expect(tpaAspect.aspectSiteApi.setSiteRootHiddenState).not.toHaveBeenCalled();
            });

            describe('on mobile', function () {
                beforeEach(function () {
                    isMobileView.and.returnValue(true);
                });

                it('should show siteRoot and enter fullScreenMode for non \'LIGHT_BOX\' theme', function () {
                    var data = {
                        height: 100,
                        width: 101,
                        url: 'http://hx0r.com'
                    };

                    tpaAspect.showModal(data);
                    expect(tpaAspect.aspectSiteApi.enterFullScreenMode).toHaveBeenCalled();
                    expect(tpaAspect.aspectSiteApi.setSiteRootHiddenState).toHaveBeenCalledWith(false);
                });

                it('should hide siteRoot and exit fullScreenMode if \'LIGHT_BOX\'', function () {
                    var data = {
                        height: 100,
                        width: 101,
                        url: 'http://hx0r.com',
                        theme: 'LIGHT_BOX'
                    };

                    tpaAspect.showModal(data);
                    expect(tpaAspect.aspectSiteApi.exitFullScreenMode).toHaveBeenCalled();
                    expect(tpaAspect.aspectSiteApi.setSiteRootHiddenState).toHaveBeenCalledWith(true);
                });
            });
        });

        describe('removeModal', function () {
            beforeEach(function () {
                isMobileView.and.returnValue(false);
            });

            it('should not deal with siteRootHiddenState & fullScreenMode', function () {
                var data = {
                    height: 100,
                    width: 101,
                    url: 'http://hx0r.com'
                };

                tpaAspect.showModal(data);
                tpaAspect.removeModal();
                expect(tpaAspect.aspectSiteApi.exitFullScreenMode).not.toHaveBeenCalled();
                expect(tpaAspect.aspectSiteApi.setSiteRootHiddenState).not.toHaveBeenCalledWith(false);
            });

            describe('on mobile', function () {
                beforeEach(function () {
                    isMobileView.and.returnValue(true);
                });

                it('should show siteRoot & exit fullScreenMode', function () {
                    var data = {
                        height: 100,
                        width: 101,
                        url: 'http://hx0r.com'
                    };

                    tpaAspect.showModal(data);
                    tpaAspect.removeModal();
                    expect(tpaAspect.aspectSiteApi.exitFullScreenMode).toHaveBeenCalled();
                    expect(tpaAspect.aspectSiteApi.setSiteRootHiddenState).toHaveBeenCalledWith(false);
                });
            });
        });

    });
});
