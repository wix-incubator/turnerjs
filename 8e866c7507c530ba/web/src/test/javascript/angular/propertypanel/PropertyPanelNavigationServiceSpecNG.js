//beforeEach(inject(function (_redditService_, $httpBackend) {
//    redditService = _redditService_;
//    httpBackend = $httpBackend;
//}));
describe('Unit: PropertyPanelNavigationService', function () {
    'use strict';


    var propertyPanelNavigationProvider;
    var propertyPanelNavigation;
    var MYCOMP_URL = '/some/url';
    var URL_PREFIX = 'angular';

    beforeEach(module('propertyPanel', function ($provide, _propertyPanelNavigationProvider_) {

        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        propertyPanelNavigationProvider = _propertyPanelNavigationProvider_;
        propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.mycomp', MYCOMP_URL);
    }));


    beforeEach(inject(function (_propertyPanelNavigation_) {
        propertyPanelNavigation = _propertyPanelNavigation_;

    }));

    describe('General functionality', function () {
        it('retrieve the correct view path', function () {
            var result = propertyPanelNavigation.getPanelPath('wysiwyg.mycomp');
            expect(result.url).toBeDefined();
            //the url is wrapped as a trusted value for $SCE
            expect(result.url.$$unwrapTrustedValue()).toEqual(URL_PREFIX + MYCOMP_URL);
        });

        it('marks existing components as non-legacy', function () {
            //propertyPanelNavigationProvider.registerPropertyPanel('yoyoyo','bobobo');
            var result = propertyPanelNavigation.getPanelPath('wysiwyg.mycomp');
            expect(result.isLegacy).toBeFalsy();
        });

        it('marks non-existing components as legacy', function () {
            var result = propertyPanelNavigation.getPanelPath('does.not.exist');
            expect(result.isLegacy).toBeTruthy();
        });


    });

    describe('Provider functionality', function () {
        it('registers the path', function () {
            var result = propertyPanelNavigation.getPanelPath('wysiwyg.mycomp2');
            expect(result.isLegacy).toBeTruthy();

            propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.mycomp2', '/my/url/2');
            var result = propertyPanelNavigation.getPanelPath('wysiwyg.mycomp2');
            expect(result.isLegacy).toBeFalsy();

        });
    });

});