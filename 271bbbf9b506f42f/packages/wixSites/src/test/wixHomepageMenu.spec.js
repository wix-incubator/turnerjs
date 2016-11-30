/**
 * Tests the core logic of the WixHomepageMenu component.
 * @author yevhenp (Yevhen Pavliuk)
 */
define(['testUtils', 'utils', 'wixSites/components/wixHomepageMenu/wixHomepageMenu'], function (testUtils, utils, wixHomepageMenu) {
    'use strict';

    var cssUtils = utils.cssUtils;
    var testStyleId = 'testStyleId',
        testMenu;

    function createComponent() {
        var compProps = testUtils.mockFactory.mockProps(),
            siteData = compProps.siteData,
            wixHomepage = {},
            lang;

        compProps.setCompData({menuDataSource: 'topMenu'})
            .setCompProp({})
            .setSkin("wysiwyg.viewer.skins.wixhomepage.WixHomepageMenuSkin");

        compProps.styleId = testStyleId;
        compProps.structure.componentType = 'wysiwyg.viewer.components.wixhomepage.WixHomepageMenu';
        siteData.requestModel.cookie = "wixLanguage=en";
        siteData.currentUrl.host = 'wix.com';
        lang = utils.wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);
        wixHomepage[compProps.compData.menuDataSource] = {};
        testMenu = wixHomepage[compProps.compData.menuDataSource][lang] = [
            {label: 'Label1', link: '/href/1'},
            {label: 'Label2', link: '/href/2'},
            {label: 'label3', link: '/href/3'}
        ];

        siteData.wixHomepage = wixHomepage;

        return testUtils.getComponentFromDefinition(wixHomepageMenu, compProps);
    }

    describe('WixHomepageMenu component', function () {
        it('should have the expected initial state', function() {
            var wixHomePageMenuComp = createComponent();

            expect(wixHomePageMenuComp.getInitialState()).toEqual(jasmine.objectContaining({
                $menuType: wixHomePageMenuComp.props.compData.menuDataSource
            }));
        });

        describe('WixHomepageMenu skin properties', function(){
            var skinProps,
                currentClassName,
                expectedClassName;

            function checkClassName(el){
                currentClassName = el.props.className;
                return currentClassName !== expectedClassName;
            }

            beforeEach(function(){
                var wixHomePageMenuComp = createComponent();

                skinProps = wixHomePageMenuComp.getSkinProperties();
            });

            it('should create a line class name according to the current styleId', function(){
                var lines = skinProps.buttonsContainer.children;

                currentClassName = '';
                expectedClassName = testStyleId + 'buttonTemplate';

                lines.some(checkClassName);

                expect(currentClassName).toBe(expectedClassName);
            });

            it('should create an anchor class name according to the current styleId', function(){
                var lines = skinProps.buttonsContainer.children,
                    anchor;

                currentClassName = '';
                expectedClassName = cssUtils.concatenateStyleIdToClassName(testStyleId, 'buttonLink');

                lines.some(function(line){
                    anchor = line.props.children[0];
                    return checkClassName(anchor);
                });

                expect(currentClassName).toBe(expectedClassName);
            });

            it('should set an anchor href according to the siteData', function(){
                var lines = skinProps.buttonsContainer.children,
                    expectedLink = '/',
                    actualLink = '';

                lines.every(function(line, i){
                    actualLink = line.props.children[0].props.href;
                    expectedLink = testMenu[i].link;

                    return expectedLink === actualLink;
                });

                expect(actualLink).toEqual(expectedLink);
            });

            it('should set an anchor label according to the siteData', function(){
                var lines = skinProps.buttonsContainer.children,
                    expectedLabel = 'L',
                    actualLabel = '';

                lines.every(function(line, i){
                    actualLabel = line.props.children[0].props.children;
                    expectedLabel = testMenu[i].label;

                    return expectedLabel === actualLabel;
                });

                expect(actualLabel).toEqual(expectedLabel);
            });
        });
    });
});
