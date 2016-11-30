define(['fake!santaProps',
        'definition!core/components/siteAspects/MobileActionsMenuAspect',
        'core/core/siteAspectsRegistry',
        'siteUtils',
        'fake!core/siteRender/SiteAspectsSiteAPI'],
    function (fakeSantaProps, mobileActionsMenuAspectDef, /** core.siteAspectsRegistry */ siteAspectsRegistry, siteUtils, FakeSiteAspectsSiteAPI) {
        "use strict";

        describe('MobileActionsMenuAspect spec', function () {
            var mockAspectsSiteApi = new FakeSiteAspectsSiteAPI();
            var mockSiteData,
                mockSiteMetaData,
                mobileActionsMenuAspect;


            beforeEach(function () {
                mockAspectsSiteApi.getSiteData = function () {
                    return mockSiteData;
                };

                mockSiteMetaData = {
                    quickActions: {
                        configuration: {
                            quickActionsMenuEnabled: true
                        },
                        colorScheme: 'white'
                    }
                };

                mockSiteData = {
                    rendererModel: {
                        siteMetaData: mockSiteMetaData
                    },
                    renderFlags: {
                        renderMobileActionMenu: true
                    },
                    getSiteMetaData: jasmine.createSpy(),
                    isMobileDevice: jasmine.createSpy(),
                    isPageLandingPage: jasmine.createSpy()
                };

                mockSiteData.isPageLandingPage.and.returnValue(false);
                mockSiteData.isMobileDevice.and.returnValue(true);
                mockSiteData.getSiteMetaData.and.returnValue(mockSiteMetaData);
                spyOn(siteAspectsRegistry, 'registerSiteAspect').and.callFake(function (name, AspectConstructor) {
                    mobileActionsMenuAspect = new AspectConstructor(mockAspectsSiteApi);
                });
                spyOn(fakeSantaProps.componentPropsBuilder, 'getCompProps').and.callFake(function (structure) {
                    return structure;
                });
                spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(function (props) {
                    return props;
                });

                mobileActionsMenuAspectDef(fakeSantaProps, siteAspectsRegistry, siteUtils);
            });

            it('Should register the site aspect', function () {
                expect(siteAspectsRegistry.registerSiteAspect).toHaveBeenCalled();
                expect(siteAspectsRegistry.registerSiteAspect.calls.argsFor(0)[0]).toEqual('mobileActionsMenu');
            });

            it('Should return null as structure if quick actions is not enabled', function () {
                mockSiteMetaData.quickActions.configuration.quickActionsMenuEnabled = false;
                mockSiteData.isMobileDevice.and.returnValue(true);
                mockSiteData.renderFlags.renderMobileActionMenu = false;

                var createdProps = mobileActionsMenuAspect.getComponentStructures();

                expect(createdProps).toEqual(null);
            });

            it('Should return null as structure if not mobile device', function () {
                mockSiteMetaData.quickActions.configuration.quickActionsMenuEnabled = true;
                mockSiteData.isMobileDevice.and.returnValue(false);

                var createdProps = mobileActionsMenuAspect.getComponentStructures();

                expect(createdProps).toEqual(null);
            });

            it('Should create structure if mobile device and quick actions enabled', function () {
                var createdStructure = mobileActionsMenuAspect.getComponentStructures();
                createdStructure = createdStructure[0];

                expect(createdStructure.componentType).toEqual('wysiwyg.viewer.components.MobileActionsMenu');
                expect(createdStructure.layout.position).toEqual('static');
            });

            it('Should add the color scheme to comp props', function () {
                var createdProps = mobileActionsMenuAspect.getReactComponents();
                createdProps = createdProps[0];

                expect(createdProps.userColorScheme).toEqual(mockSiteMetaData.quickActions.colorScheme);
            });

            it('getReactComponents should return null when no structure', function () {
                mockSiteMetaData.quickActions.configuration.quickActionsMenuEnabled = false;

                var createdProps = mobileActionsMenuAspect.getReactComponents();

                expect(createdProps).toEqual(null);
            });
        });

    });
