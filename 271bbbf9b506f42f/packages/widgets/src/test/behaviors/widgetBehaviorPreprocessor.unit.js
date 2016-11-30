define(['lodash', 'testUtils', 'widgets/behaviors/widgetBehaviorPreprocessor'], function(_, testUtils, widgetBehaviorPreprocessor){
    'use strict';

    describe('widgetBehaviorPreprocessor', function(){
        it('should set targetId to be the current page id in case the action sourceId is a child of the current page id', function(){
            var pageId = 'myPageId';
            var siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                .addPageWithDefaults(pageId)
                .setCurrentPage(pageId);
            var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var compId = 'someCompId';
            var currentPageId = siteData.getCurrentUrlPageId();
            var mockBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode(compId, 'someFunc');
            var mockAction = testUtils.mockFactory.actionMocks.comp('click', compId);
            var compDataObj = {behaviors: JSON.stringify([{behavior: mockBehavior, action: mockAction}])};
            testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, compDataObj, false, compId);

            var result = widgetBehaviorPreprocessor(mockBehavior, mockAction, mockSiteAPI);

            expect(result.targetId).toEqual(currentPageId);
            expect(_.omit(result, 'targetId')).toEqual(_.omit(mockBehavior, 'targetId'));
        });

        it("should set targetId to be the current page id in case the action sourceId is a child of the masterPage", function () {
            var pageId = 'myPageId';
            var siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                .addPageWithDefaults(pageId)
                .setCurrentPage(pageId);
            var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var compId = 'someCompId';
            var currentPageId = siteData.getCurrentUrlPageId();
            var mockBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode(compId, 'someFunc');
            var mockAction = testUtils.mockFactory.actionMocks.comp('click', compId);
            var compDataObj = {behaviors: JSON.stringify([{behavior: mockBehavior, action: mockAction}])};
            testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', compDataObj, false, compId);

            var result = widgetBehaviorPreprocessor(mockBehavior, mockAction, mockSiteAPI);

            expect(result.targetId).toEqual(currentPageId);
            expect(_.omit(result, 'targetId')).toEqual(_.omit(mockBehavior, 'targetId'));
        });

        it('should set targetId to be the opened popup id in case the action sourceId is a child of the current opened popup id', function () {
            var popupId = 'myPopupId';
            var siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                .addPopupPageWithDefaults(popupId)
                .setCurrentPage(popupId);
            var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var compId = 'someCompId';
            var mockBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode(compId, 'someFunc');
            var mockAction = testUtils.mockFactory.actionMocks.comp('click', compId);
            var compDataObj = {behaviors: JSON.stringify([{behavior: mockBehavior, action: mockAction}])};
            testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, popupId, compDataObj, false, compId);

            var result = widgetBehaviorPreprocessor(mockBehavior, mockAction, mockSiteAPI);

            expect(result.targetId).toEqual(popupId);
            expect(_.omit(result, 'targetId')).toEqual(_.omit(mockBehavior, 'targetId'));
        });

        it('should set targetId to be null in case the action sourceId does not belong to any of the active roots', function () {
            var pageId = 'myPageId';
            var siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                .addPageWithDefaults(pageId);
            var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var compId = 'someCompId';
            var mockBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode(compId, 'someFunc');
            var mockAction = testUtils.mockFactory.actionMocks.comp('click', compId);
            var compDataObj = {behaviors: JSON.stringify([{behavior: mockBehavior, action: mockAction}])};
            testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, compDataObj, false, compId);

            var result = widgetBehaviorPreprocessor(mockBehavior, mockAction, mockSiteAPI);

            expect(result.targetId).toEqual(null);
            expect(_.omit(result, 'targetId')).toEqual(_.omit(mockBehavior, 'targetId'));
        });

        it('should set targetId to be the current page id if the action sourceId is the current id', function () {
            var pageId = 'myPageId';
            var siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                .addPageWithDefaults(pageId)
                .setCurrentPage(pageId);
            var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            var compId = 'someCompId';
            var mockBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode(compId, 'someFunc');
            var mockAction = testUtils.mockFactory.actionMocks.comp('click', compId);
            var compDataObj = {behaviors: JSON.stringify([{behavior: mockBehavior, action: mockAction}])};
            testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, compDataObj, false, compId);

            var result = widgetBehaviorPreprocessor(mockBehavior, mockAction, mockSiteAPI);

            expect(result.targetId).toEqual(pageId);
            expect(_.omit(result, 'targetId')).toEqual(_.omit(mockBehavior, 'targetId'));
        });
    });
});
