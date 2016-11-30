/**
 * Created by alexandreroitman on 14/11/2016.
 */
define(['lodash', 'react', 'testUtils', 'socialCommon/mixins/socialCompMixin'], function (_, React, /** testUtils */ testUtils, socialCompMixin) {
    'use strict';

    describe('socialCompMixin', function () {

        function createProps(partialProps, rootNavigationInfo, mainPageId) {
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.urlFormatModel = {format: rootNavigationInfo.format};
            siteData.setRootNavigationInfo(rootNavigationInfo);

            if (mainPageId) {
                siteData.setMainPage(mainPageId);
            }

            return testUtils.santaTypesBuilder.getComponentProps(getCompDefinition(), partialProps, siteData);
        }

        function getComponent(partialProps, rootNavigationInfo, mainPageId) {
            var props = createProps(partialProps, rootNavigationInfo, mainPageId);
            return testUtils.getComponentFromDefinition(getCompDefinition(), props);
        }

        function getCompDefinition() {
            return {
                mixins: [socialCompMixin],
                render: function () {
                    return React.DOM.div(this.props);
                }
            };
        }

        it('should get url with hashBang format if urlFormat is hashBang, even if current site format is "slash"', function () {
            var rootNavigationInfo = {pageId: 'mockPageId', format: 'slash', title: 'My page'};
            var props = {
                urlFormat: 'slash',
                compData: {
                    urlFormat: 'hashBang'
                }
            };

            var comp = getComponent(props, rootNavigationInfo);

            expect(comp.getSocialUrl()).toEqual('mockExternalBaseUrl#!My page/mockPageId');
        });

        it('should get url with hashBang format if component urlFormat is hashBang with "untitled" if page has no title', function () {
            var rootNavigationInfo = {pageId: 'mockPageId', format: 'slash'};
            var props = {
                urlFormat: 'slash',
                compData: {
                    urlFormat: 'hashBang'
                }
            };

            var comp = getComponent(props, rootNavigationInfo);

            expect(comp.getSocialUrl()).toEqual('mockExternalBaseUrl#!untitled/mockPageId');
        });

        it('should get url with site urlFormat hash if comp has no data', function () {
            var rootNavigationInfo = {pageId: 'mockPageId', format: 'hashBang'};
            var props = {
                urlFormat: 'hashBang'
            };

            var comp = getComponent(props, rootNavigationInfo);
            expect(comp.getSocialUrl()).toEqual('mockExternalBaseUrl#!untitled/mockPageId');
        });

        it('should get url with site urlFormat slash if comp has no data', function () {
            var rootNavigationInfo = {pageId: 'mockPageId', format: 'slash'};
            var props = {
                urlFormat: 'slash'
            };

            var comp = getComponent(props, rootNavigationInfo);
            expect(comp.getSocialUrl()).toEqual('mockExternalBaseUrl/untitled');
        });

        it('should get url with compData.urlFormat if urlFormat is slash, no matter what the site format is', function () {
            var rootNavigationInfo = {pageId: 'mockPageId', format: 'random schema'};
            var props = {
                urlFormat: 'random schema',
                compData: {
                    urlFormat: 'slash'
                }
            };
            var comp = getComponent(props, rootNavigationInfo);
            expect(comp.getSocialUrl()).toEqual('mockExternalBaseUrl/untitled');
        });


    });
});
