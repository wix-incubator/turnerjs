define(['testUtils', 'core', "utils", 'components/core/mediaRichTextStylesCollector'], function (testUtils, /** core */ core, utils) {
    'use strict';

    describe("", function() {
        beforeEach(function() {
            this.siteData = testUtils.mockFactory.mockSiteData();
            spyOn(utils.dataUtils, "getChildrenData").and.returnValue({});
        });

        it("should run", function () {
            spyOn(this.siteData, 'getDataByQuery').and.callFake(function (query) {
                expect(query).toEqual('#text_id');
                return {
                    text: '<img src="innercomp.png" style="margin: 10px 0px 10px 1%; max-width: 100%; width: 24%; float: right;" ' +
                        'wix-comp="{&quot;id&quot;:&quot;innercomp_1&quot;,&quot;dataQuery&quot;:&quot;txtMediaxt3&quot;,&quot;propertyQuery&quot;:&quot;txtMediaxt3&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhoto&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.NoSkinPhoto&quot;,&quot;marginLeft&quot;:&quot;1%&quot;,&quot;marginRight&quot;:&quot;0px&quot;,&quot;dimsRatio&quot;:1.2,&quot;defaultWidth&quot;:205,&quot;width&quot;:0.24,&quot;floatValue&quot;:&quot;right&quot;}">">' +
                        '<img src="innerComp2.png" style="margin: 10px auto; max-width: 100%; clear: both; display: block; outline: rgb(0, 153, 255) solid 2px;" ' +
                        'wix-comp="{&quot;id&quot;:&quot;innercomp_txtMediac8y&quot;,&quot;dataQuery&quot;:&quot;txtMediac8y&quot;,&quot;propertyQuery&quot;:&quot;txtMediac8y&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhoto&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.NoSkinPhoto&quot;,&quot;marginLeft&quot;:&quot;auto&quot;,&quot;marginRight&quot;:&quot;auto&quot;,&quot;dimsRatio&quot;:1.2,&quot;defaultWidth&quot;:205,&quot;display&quot;:&quot;block&quot;}">' +
                        '<img src="http://img.youtube.com/vi/83nu4yXFcYU/0.jpg" style="display: block; clear: both; margin: 10px auto; max-width: 100%; min-width: 240px; width: 100%;" ' +
                        'wix-comp="{&quot;id&quot;:&quot;innercomp_txtMedia16gi&quot;,&quot;dataQuery&quot;:&quot;txtMedia16gi&quot;,&quot;propertyQuery&quot;:&quot;txtMedia16gi&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.Video&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.VideoSkin&quot;,&quot;src&quot;:&quot;&quot;,&quot;minWidth&quot;:&quot;240px&quot;,&quot;minHeight&quot;:&quot;180px&quot;,&quot;videoId&quot;:&quot;83nu4yXFcYU&quot;,&quot;videoType&quot;:&quot;YOUTUBE&quot;,&quot;width&quot;:1,&quot;display&quot;:&quot;block&quot;,&quot;marginLeft&quot;:&quot;auto&quot;,&quot;marginRight&quot;:&quot;auto&quot;,&quot;dimsRatio&quot;:0.7485714285714286,&quot;defaultWidth&quot;:350}">'
                };
            });

            var loadedStyles = {};
            var structureInfo = {
                componentType: "wysiwyg.viewer.components.MediaRichText",
                dataQuery: '#text_id'
            };

            core.styleCollector.collectStyleIdsFromStructure(structureInfo, {}, this.siteData, loadedStyles);

            var expectedResult = {
                "wysiwyg.viewer.skins.photo.NoSkinPhoto": 's0',
                "wysiwyg.viewer.skins.VideoSkin": 's1'
            };
            expect(loadedStyles).toEqual(expectedResult);
        });
    });
});
