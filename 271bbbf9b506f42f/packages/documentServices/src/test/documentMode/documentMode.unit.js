define([
    'lodash', 'testUtils',
    'documentServices/documentMode/documentMode',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/hooks/hooks'
], function (
    _, testUtils,
    documentMode,
    constants,
    privateServicesHelper,
    hooks
) {
    'use strict';

    describe('documentMode', function () {

        beforeEach(function(){
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.privateServicesMock = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData, {siteData: [{path: ['runtime'], optional: true}]});
        });

        describe('getViewMode', function () {
            it("should return desktop when siteData's isMobileView is falsy", function () {
                spyOn(this.privateServicesMock.siteAPI, 'isMobileView').and.returnValue(false);
                expect(documentMode.getViewMode(this.privateServicesMock)).toEqual(constants.VIEW_MODES.DESKTOP);
            });

            it("should return mobile when siteData's isMobileView is truthy", function () {
                spyOn(this.privateServicesMock.siteAPI, 'isMobileView').and.returnValue(true);
                expect(documentMode.getViewMode(this.privateServicesMock)).toEqual(constants.VIEW_MODES.MOBILE);
            });
        });

        describe('setViewMode', function () {
            var mobileConverterSpy;

            beforeEach(function(){
                mobileConverterSpy = spyOn(hooks, 'executeHook');
            });

            it("should switch to desktop mode from mobile mode", function () {
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.MOBILE);
                expect(documentMode.getViewMode(this.privateServicesMock)).toBe(constants.VIEW_MODES.MOBILE);
                mobileConverterSpy.calls.reset();
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.DESKTOP);
                expect(documentMode.getViewMode(this.privateServicesMock)).toBe(constants.VIEW_MODES.DESKTOP);
                expect(mobileConverterSpy).not.toHaveBeenCalled();
            });

            it("should do nothing if the viewMode is already desktop", function () {
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.DESKTOP);
                expect(documentMode.getViewMode(this.privateServicesMock)).toBe(constants.VIEW_MODES.DESKTOP);
                expect(mobileConverterSpy).not.toHaveBeenCalled();
            });

            it("should switch to mobile mode from desktop mode and call the mobile conversion module", function () {
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.MOBILE);
                expect(documentMode.getViewMode(this.privateServicesMock)).toBe(constants.VIEW_MODES.MOBILE);
                expect(mobileConverterSpy).toHaveBeenCalledWith(hooks.HOOKS.SWITCH_VIEW_MODE.MOBILE);
            });

            it("should do nothing if the viewMode is already mobile", function () {
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.MOBILE);
                mobileConverterSpy.calls.reset();
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.MOBILE);
                expect(mobileConverterSpy).not.toHaveBeenCalled();
            });

            it('should clear the runtime store when changing viewMode', function () {
                var runtimePointer = this.privateServicesMock.pointers.general.getRuntimePointer();
                this.privateServicesMock.dal.set(runtimePointer, {});

                this.siteData.runtime = {test: 'existing runtime data that was set directly on the json without using the dal'};

                spyOn(this.privateServicesMock.siteAPI, 'isMobileView').and.returnValue(false);
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.MOBILE);

                var actual = this.privateServicesMock.dal.get(runtimePointer);
                expect(actual).toEqual({components: {}});
            });

            it('should NOT clear the runtime store when not changing viewMode', function () {
                var runtimePointer = this.privateServicesMock.pointers.general.getRuntimePointer();
                var expected = {runtime: 'data'};
                this.privateServicesMock.dal.set(runtimePointer, expected);

                spyOn(this.privateServicesMock.siteAPI, 'isMobileView').and.returnValue(true);
                documentMode.setViewMode(this.privateServicesMock, constants.VIEW_MODES.MOBILE);

                var actual = this.privateServicesMock.dal.get(runtimePointer);
                expect(actual).toEqual(expected);
            });
        });

        it('allowPlaying should set the isPlayingAllowed flag and update the site', function() {
            this.siteData.renderFlags = {isPlayingAllowed: false};

            documentMode.enablePlaying(this.privateServicesMock, true);

            expect(this.siteData.renderFlags.isPlayingAllowed).toBe(true);
        });

        it('allowZoom should set the isZoomAllowed flag', function() {
            this.siteData.renderFlags = {isZoomAllowed: false};

            documentMode.enableZoom(this.privateServicesMock, true);

            expect(this.siteData.renderFlags.isZoomAllowed).toBe(true);
        });

        it('allowSocialInteraction should set the isSocialInteractionAllowed flag', function() {
            this.siteData.renderFlags = {isSocialInteractionAllowed: false};

            documentMode.enableSocialInteraction(this.privateServicesMock, true);

            expect(this.siteData.renderFlags.isSocialInteractionAllowed).toBe(true);
        });

        it('allowExternalNavigation should set the isExternalNavigationAllowed flag', function() {
            this.siteData.renderFlags = {isExternalNavigationAllowed: false};

            documentMode.enableExternalNavigation(this.privateServicesMock, true);

            expect(this.siteData.renderFlags.isExternalNavigationAllowed).toBe(true);
        });

        it('enableRenderFixedPositionContainers should set the renderFixedPositionContainers flag', function() {
            this.siteData.renderFlags = {renderFixedPositionContainers: false};

            documentMode.enableRenderFixedPositionContainers(this.privateServicesMock, true);

            expect(this.siteData.renderFlags.renderFixedPositionContainers).toBe(true);
        });

        it('enableTinyMenuOpening should set the isTinyMenuOpenAllowed flag', function() {
            this.siteData.renderFlags = {isTinyMenuOpenAllowed: false};

            documentMode.enableTinyMenuOpening(this.privateServicesMock, true);

            expect(this.siteData.renderFlags.isTinyMenuOpenAllowed).toBe(true);
        });

        it('setComponentPreviewState should set the componentPreviewStates render flag', function() {
            this.siteData.renderFlags = {componentPreviewStates: {}};

            documentMode.setComponentPreviewState(this.privateServicesMock, 'compId', 'open');

            expect(this.siteData.renderFlags.componentPreviewStates.compId).toEqual('open');
        });

        it('allowShowingHiddenComponents should set showHiddenComponents flag', function(){
            _.set(this.siteData, 'renderFlags.showHiddenComponents', false);

            documentMode.showHiddenComponents(this.privateServicesMock, true);

            expect(_.get(this.siteData, 'renderFlags.showHiddenComponents')).toBe(true);
        });

        _.forEach([true, false], function (val) {
            it('isHiddenComponentsEnabled should reflect what showHiddenComponents: ' + false, function () {
                documentMode.showHiddenComponents(this.privateServicesMock, val);

                expect(documentMode.isHiddenComponentsEnabled(this.privateServicesMock)).toBe(val);
            });
        });

        it('ignoreComponentsHiddenProperty should set ignoreComponentsHiddenProperty flag', function(){
            _.set(this.siteData, 'renderFlags.ignoreComponentsHiddenProperty', []);
            var compIds = ['compIdA', 'compIdB'];

            documentMode.ignoreComponentsHiddenProperty(this.privateServicesMock, compIds);

            expect(_.get(this.siteData, 'renderFlags.ignoreComponentsHiddenProperty')).toEqual(compIds);
        });

        it('ignoreComponentsHiddenProperty should override the previous components that were shown as ghosts', function(){
            _.set(this.siteData, 'renderFlags.ignoreComponentsHiddenProperty', []);
            var compIdsRoundA = ['compIdA', 'compIdB'];
            var compIdsRoundB = ['compIdC'];

            documentMode.ignoreComponentsHiddenProperty(this.privateServicesMock, compIdsRoundA);
            documentMode.ignoreComponentsHiddenProperty(this.privateServicesMock, compIdsRoundB);

            expect(_.get(this.siteData, 'renderFlags.ignoreComponentsHiddenProperty')).toEqual(compIdsRoundB);
        });

        it('allowWixCodeInitialization should set initWixCode flag', function(){
            _.set(this.siteData, 'renderFlags.initWixCode', false);

            documentMode.allowWixCodeInitialization(this.privateServicesMock, true);

            expect(_.get(this.siteData, 'renderFlags.initWixCode')).toBe(true);
        });

        it('showControllers should set showControllers flag', function(){
            _.set(this.siteData, 'renderFlags.showControllers', false);

            documentMode.showControllers(this.privateServicesMock, true);

            expect(_.get(this.siteData, 'renderFlags.showControllers')).toBe(true);
        });

        _.forEach([true, false], function (val) {
            it('isControllersVisiblityEnabled should reflect showControllers: ' + val, function () {
                documentMode.showControllers(this.privateServicesMock, val);

                expect(documentMode.isControllersVisibilityEnabled(this.privateServicesMock)).toBe(val);
            });
        });
    });
});
