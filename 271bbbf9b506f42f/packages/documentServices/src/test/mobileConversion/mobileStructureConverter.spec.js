define([
    'lodash',
    'testUtils',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/mobileConversion/modules/mergeAggregator'
], function (_, testUtils, constants, privateServicesHelper, mobileConversion, mergeAggregator) {
    'use strict';


    describe('mobileConversion - convertMobileStructure', function () {

        function getMobileComponentById(ps, pageId, compId) {
            var mobilePagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE);
            var componentPointer = ps.pointers.components.getComponent(compId, mobilePagePointer);

            return ps.dal.get(componentPointer);
        }

        describe('Horizontally Docked To Screen components', function () {

            beforeEach(function() {
                this.pageId = 'page1';
                this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId);
                this.horizontallyDockedToScreenLayout = {
                    y: 100,
                    height: 50,
                    docked: {
                        left: {
                            vw: 0
                        },
                        right: {
                            vw: 0
                        }
                    }
                };
            });

            it('Should have a full width and start from x=0 --> single component', function () {
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.siteData, this.pageId);
                container.layout = this.horizontallyDockedToScreenLayout;
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                mergeAggregator.initialize(ps);
                mobileConversion.convertMobileStructure(ps);

                var mobileContainer = getMobileComponentById(ps, this.pageId, container.id);
                expect(mobileContainer.layout.width).toEqual(320);
                expect(mobileContainer.layout.x).toEqual(0);
            });

            it('Should have a full width and start from x=0 --> multiple component', function() {
                var button = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.siteData, this.pageId);
                button.layout = {
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 800
                };
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.siteData, this.pageId);
                container.layout = this.horizontallyDockedToScreenLayout;
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                mergeAggregator.initialize(ps);
                mobileConversion.convertMobileStructure(ps);

                var mobileContainer = getMobileComponentById(ps, this.pageId, container.id);
                expect(mobileContainer.layout.width).toEqual(320);
                expect(mobileContainer.layout.x).toEqual(0);
            });

            it('Should have a full width and start from x=0 --> last in page', function() {
                var button = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.siteData, this.pageId);
                button.layout = {
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 30
                };
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.siteData, this.pageId);
                container.layout = this.horizontallyDockedToScreenLayout;
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                mergeAggregator.initialize(ps);
                mobileConversion.convertMobileStructure(ps);

                var mobileContainer = getMobileComponentById(ps, this.pageId, container.id);
                expect(mobileContainer.layout.width).toEqual(320);
                expect(mobileContainer.layout.x).toEqual(0);
            });


            it('Should remove docked value to all components recursively', function() {
                var child = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.MatrixGallery');
                var container = testUtils.mockFactory.createStructure('mobile.core.components.Container', {components: [child]});

                testUtils.mockFactory.addCompToPage(this.siteData, this.pageId, container);
                container.layout = this.horizontallyDockedToScreenLayout;
                child.layout = this.horizontallyDockedToScreenLayout;
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                mergeAggregator.initialize(ps);
                mobileConversion.convertMobileStructure(ps);

                var mobileContainer = getMobileComponentById(ps, this.pageId, container.id);
                var mobileChild = getMobileComponentById(ps, this.pageId, child.id);

                expect(mobileContainer.layout.docked).not.toBeDefined();
                expect(mobileChild.layout.docked).not.toBeDefined();
            });

        });
    });
});
