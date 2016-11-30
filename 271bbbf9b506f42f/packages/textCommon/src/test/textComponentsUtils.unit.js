define(['utils', 'lodash', 'textCommon/utils/textComponentsUtils', 'testUtils'], function(utils, _, textComponentsUtils, testUtils) {
    'use strict';

    function createElement(htmlText) {
        var docfrag = window.document.createDocumentFragment();
        var container = docfrag.appendChild(window.document.createElement('div'));
        container.innerHTML = htmlText;
        return container.children[0];
    }

    describe("mobileTextTransformIfNeeded tests", function() {

        beforeEach(function() {
            this.fontGetter = function() {
                return 'normal normal normal 120px/1.4em Open+Sans {color_14}';
            };
        });

        it("Should fix the text for mobile when in mobile view", function() {
            var text = '<div><p class="font_8"><a href="http://www.google.com" target="_blank"><span>sdfgsdfgsdfgsdfg</span></a></p><p class="font_8">&nbsp;</p><p class="font_8"><a href="http://noamsi.wix.com/mrtext"><span>asdfasdf</span></a></p></div>';
            var isMobileView = true;
            var scale = '1.0';

            var result = textComponentsUtils.mobileTextTransformIfNeeded(text, {isMobileView: isMobileView, scale: scale, fontGetter: this.fontGetter});
            var resultElement = createElement(result);
            expect(_.some(resultElement.getElementsByTagName('p'), function(span){
                return span.style.fontSize !== '50px';
            })).toBeFalsy();
        });

        it("Should not change the text when not in mobile view", function() {
            var text = '<p class="font_8"><a href="http://www.google.com" target="_blank"><u>sdfgsdfgsdfgsdfg</u></a></p><p class="font_8">&nbsp;</p><p class="font_8"><a href="http://noamsi.wix.com/mrtext"><u>asdfasdf</u></a></p>';
            var isMobileView = false;
            var scale = '1.0';

            var result = textComponentsUtils.mobileTextTransformIfNeeded(text, {isMobileView: isMobileView, scale: scale, fontGetter: this.fontGetter});

            expect(result).toEqual(text);
        });

        describe("convertDataQueryLinksIntoHtmlAnchors", function() {

            it("Should convert the data query link into html regular link (anchor) ", function() {
                var textWithLinks = '<p class="font_8"><a dataquery="#1p8p"><u>sdfgsdfgsdfgsdfg</u></a></p><p class="font_8">&nbsp;</p><p class="font_8"><a dataquery="#qn5"><u>asdfasdf</u></a></p>';
                var mockSiteData = testUtils.mockFactory.mockSiteData({
                    publicModel: {
                        externalBaseUrl: 'http://noamsi.wix.com/mrtext'
                    }
                });
                var linkList = {
                    '1p8p': testUtils.mockFactory.dataMocks.externalLinkData({id: '1p8p', url: 'http://www.google.com'}),
                    'qn5': testUtils.mockFactory.dataMocks.pageLinkData({id: 'qn5', pageId: 'mainPage'})
                };
                var rootNavigationInfo = mockSiteData.getExistingRootNavigationInfo(mockSiteData.getFocusedRootId());

                var result = textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(textWithLinks, linkList, _.partialRight(utils.linkRenderer.renderLink, mockSiteData, rootNavigationInfo));

                var expectedResult = '<p class="font_8"><a href="http://www.google.com" target="_blank" data-content="http://www.google.com" data-type="external"><u>sdfgsdfgsdfgsdfg</u></a></p><p class="font_8">&nbsp;</p><p class="font_8"><a href="http://noamsi.wix.com/mrtext" target="_self"><u>asdfasdf</u></a></p>';
                expect(result).toEqual(expectedResult);
            });

            it("Should convert the data query with extra attribute after the data query", function() {
                var textWithLinks = '<a dataquery="#1p8p" style="color: rgb(168, 168, 168); line-height: normal;" ><u>sdfgsdfgsdfgsdfg</u></a><a dataquery="#1p8p" style="color: rgb(168, 168, 168); line-height: normal;" ><u>sdfgsdfgsdfgsdfg</u></a>';
                var linkList = {'1p8p': testUtils.mockFactory.dataMocks.externalLinkData({id: '1p8p', "url": "http://www.google.com"})};

                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var rootNavigationInfo = mockSiteData.getExistingRootNavigationInfo(mockSiteData.getFocusedRootId());

                var result = textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(
                    textWithLinks,
                    linkList,
                    _.partialRight(utils.linkRenderer.renderLink, mockSiteData, rootNavigationInfo)
                );

                var expectedResult = '<a href="http://www.google.com" target="_blank" data-content="http://www.google.com" data-type="external" style="color: rgb(168, 168, 168); line-height: normal;" ><u>sdfgsdfgsdfgsdfg</u></a><a href="http://www.google.com" target="_blank" data-content="http://www.google.com" data-type="external" style="color: rgb(168, 168, 168); line-height: normal;" ><u>sdfgsdfgsdfgsdfg</u></a>';
                expect(result).toEqual(expectedResult);
            });

            it("Should convert the data query with extra attribute before the data query", function() {
                var textWithLinks = '<a  id="ajksdncjknad" dataquery="#1p8p"><u>sdfgsdfgsdfgsdfg</u></a>';
                var linkData = {'1p8p': testUtils.mockFactory.dataMocks.externalLinkData({id: '1p8p', "url": "http://www.google.com"})};

                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var rootNavigationInfo = mockSiteData.getExistingRootNavigationInfo(mockSiteData.getFocusedRootId());

                var result = textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(
                    textWithLinks,
                    linkData,
                    _.partialRight(utils.linkRenderer.renderLink, mockSiteData, rootNavigationInfo)
                );

                var expectedResult = '<a  id="ajksdncjknad" href="http://www.google.com" target="_blank" data-content="http://www.google.com" data-type="external"><u>sdfgsdfgsdfgsdfg</u></a>';
                expect(result).toEqual(expectedResult);
            });

            it("Should convert the data query with extra attribute before and after the data query", function() {
                var textWithLinks = '<a  id="ajksdncjknad" dataquery="#1p8p" style="color: rgb(168, 168, 168); line-height: normal;" ><u>sdfgsdfgsdfgsdfg</u></a>';
                var linkData = {'1p8p': testUtils.mockFactory.dataMocks.externalLinkData({id: '1p8p', "url": "http://www.google.com"})};

                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var rootNavigationInfo = mockSiteData.getExistingRootNavigationInfo(mockSiteData.getFocusedRootId());

                var result = textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(
                    textWithLinks,
                    linkData,
                    _.partialRight(utils.linkRenderer.renderLink, mockSiteData, rootNavigationInfo)
                );

                var expectedResult = '<a  id="ajksdncjknad" href="http://www.google.com" target="_blank" data-content="http://www.google.com" data-type="external" style="color: rgb(168, 168, 168); line-height: normal;" ><u>sdfgsdfgsdfgsdfg</u></a>';
                expect(result).toEqual(expectedResult);
            });

            it("Should convert the data query with extra spaces", function() {
                var textWithLinks = '<a         dataquery="#1p8p"       ><u>sdfgsdfgsdfgsdfg</u></a>';
                var linkData = {'1p8p': testUtils.mockFactory.dataMocks.externalLinkData({id: '1p8p', "url": "http://www.google.com"})};

                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var rootNavigationInfo = mockSiteData.getExistingRootNavigationInfo(mockSiteData.getFocusedRootId());

                var result = textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(
                    textWithLinks,
                    linkData,
                    _.partialRight(utils.linkRenderer.renderLink, mockSiteData, rootNavigationInfo)
                );

                var expectedResult = '<a         href="http://www.google.com" target="_blank" data-content="http://www.google.com" data-type="external"       ><u>sdfgsdfgsdfgsdfg</u></a>';
                expect(result).toEqual(expectedResult);
            });

            it("Do not convert adataquery tag name", function() {
                var textWithLinks = '<adataquery="#1p8p"><u>sdfgsdfgsdfgsdfg</u></a>';
                var linkData = {'1p8p': testUtils.mockFactory.dataMocks.externalLinkData({id: '1p8p', "url": "http://www.google.com"})};

                var result = textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(
                    textWithLinks,
                    linkData,
                    _.partialRight(utils.linkRenderer.renderLink, testUtils.mockFactory.mockSiteData())
                );

                expect(result).toEqual(textWithLinks);
            });
        });
    });
});
