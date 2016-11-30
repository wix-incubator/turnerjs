define([
    'lodash',
    'experiment',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/hooks/componentHooks/popupPageHooks'
], function (_,
             experiment,
             testUtils,
             privateServicesHelper,
             actionsAndBehaviors,
             documentInfo,
             popupPageHooks) {
    'use strict';

    var mockFactory = testUtils.mockFactory;


    describe('popup pages hooks', function () {
        var ps, siteData, refs;
        var popupContainer = {
            id: 'popupContainer',
            componentType: 'wysiwyg.viewer.components.PopupContainer',
            skin: 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer',
            props: {
                type: 'PopupContainerProperties'
            }
        };

        beforeEach(function () {
            siteData = mockFactory.mockSiteData();
            siteData.addPopupPageWithDefaults('popup1', [popupContainer]);
            siteData.addPopupPageWithDefaults('popup2', []);
            siteData.addPageWithDefaults('page1', [{id: 'comp1', componentType: 'someType'}]);

            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

            var viewMode = documentInfo.getViewMode(ps);
            var currentPageId = siteData.getPrimaryPageId();

            refs = {
                masterPage: ps.pointers.components.getPage('masterPage', viewMode),
                currentPage: ps.pointers.components.getPage(currentPageId, viewMode),
                popup1: ps.pointers.components.getPage('popup1', viewMode),
                popup2: ps.pointers.components.getPage('popup2', viewMode),
                page1: ps.pointers.components.getPage('page1', viewMode)
            };
        });

        describe('removeDeadBehaviors', function () {
            var actions = {};
            var behaviors = {};

            beforeEach(function () {
                actions.load = testUtils.mockFactory.actionMocks.comp('load');
                actions.screenIn = testUtils.mockFactory.actionMocks.comp('screenIn');
                behaviors.openPopup = testUtils.mockFactory.behaviorMocks.site('openPopup');
                behaviors.fadeIn = testUtils.mockFactory.behaviorMocks.animation('FadeIn');
            });

            function getBehaviors() {
                return {
                    masterPage: actionsAndBehaviors.getBehaviors(ps, refs.masterPage),
                    currentPage: actionsAndBehaviors.getBehaviors(ps, refs.currentPage)
                };
            }

            describe('when there are multiple dead behaviors on the same page', function () {
                beforeEach(function () {
                    actionsAndBehaviors.updateBehavior(ps, refs.masterPage, actions.load, refs.popup1, behaviors.openPopup);
                    actionsAndBehaviors.updateBehavior(ps, refs.masterPage, actions.screenIn, refs.popup1, behaviors.fadeIn);
                });

                it('should remove them all', function () {
                    var existingBehaviors = getBehaviors();
                    popupPageHooks.removeDeadBehaviors(ps, refs.popup1);

                    var updatedBehaviors = getBehaviors();
                    expect(updatedBehaviors.masterPage).toEqual([]);
                    expect(updatedBehaviors.currentPage).toEqual(existingBehaviors.currentPage);
                });
            });

            describe('when dead behaviors are stored across several pages', function () {
                beforeEach(function () {
                    actionsAndBehaviors.updateBehavior(ps, refs.masterPage, actions.load, refs.popup1, behaviors.openPopup);
                    actionsAndBehaviors.updateBehavior(ps, refs.currentPage, actions.load, refs.popup1, behaviors.openPopup);
                });

                it('should remove them all', function () {
                    popupPageHooks.removeDeadBehaviors(ps, refs.popup1);

                    var updatedBehaviors = getBehaviors();
                    expect(updatedBehaviors.masterPage).toEqual([]);
                    expect(updatedBehaviors.currentPage).toEqual([]);
                });
            });

            describe('when there are other behaviors in the page along with dead ones', function () {
                beforeEach(function () {
                    actionsAndBehaviors.updateBehavior(ps, refs.currentPage, actions.load, refs.popup1, behaviors.openPopup);
                    actionsAndBehaviors.updateBehavior(ps, refs.currentPage, actions.load, refs.popup2, behaviors.openPopup);
                });

                it('should leave them as they are', function () {
                    var existingBehaviors = getBehaviors();
                    popupPageHooks.removeDeadBehaviors(ps, refs.popup1);

                    var updatedBehaviors = getBehaviors();
                    expect(updatedBehaviors.masterPage).toEqual(existingBehaviors.masterPage);
                    expect(updatedBehaviors.currentPage).toEqual(existingBehaviors.currentPage.slice(1));
                });
            });

            describe('when there are no behaviors targeting removed component', function () {
                beforeEach(function () {
                    actionsAndBehaviors.updateBehavior(ps, refs.masterPage, actions.load, refs.popup2, behaviors.openPopup);
                    actionsAndBehaviors.updateBehavior(ps, refs.currentPage, actions.load, refs.popup2, behaviors.openPopup);
                });

                it('should not change anything', function () {
                    var existingBehaviors = getBehaviors();
                    popupPageHooks.removeDeadBehaviors(ps, refs.popup1);

                    var updatedBehaviors = getBehaviors();
                    expect(updatedBehaviors).toEqual(existingBehaviors);
                });
            });
        });

        describe('getContainerToAddTo', function() {

            it('should return containerPointer if component is not a page', function() {
                var comp = ps.pointers.components.getComponent('comp1', refs.page1);

                expect(popupPageHooks.getContainerToAddTo(ps, comp)).toBe(comp);
            });

            it('should return containerPointer if component is a page but not a popup', function() {
                expect(popupPageHooks.getContainerToAddTo(ps, refs.page1)).toBe(refs.page1);
            });

            it('should return popupContainer if component is a popup', function() {
                siteData._currentPageIds.popupPage = refs.popup1.id;

                expect(popupPageHooks.getContainerToAddTo(ps, refs.popup1))
                    .toEqual(ps.pointers.components.getComponent('popupContainer', refs.popup1));
            });
        });
    });
});
