define(['lodash', 'siteUtils/core/pageRequests', 'testUtils'], function (_, pageRequests, testUtils) {
    'use strict';

    describe('pageRequests', function () {
        beforeEach(function () {
            this.fullPagesData = {
                pagesData: {}
            };

            this.siteData = testUtils.mockFactory.mockSiteData().updatePublicModel({
                'pageList': {
                    'masterPage': ['masteru', 'masteruu'],
                    'pages': [
                        {'pageId': 'page1', 'urls': ['page1u', 'page1uu']},
                        {'pageId': 'page2', 'urls': ['page2u', 'page2uu']},
                        {'pageId': 'page3', 'urls': ['page3u', 'page3uu']},
                        {'pageId': 'page4'}
                    ],
                    'mainPageId': 'page3'
                }
            }).updateRendererModel({'passwordProtectedPages': ['page4']});
        });
    });

    describe('pageRequests', function () {
        beforeEach(function () {

            this.fullPagesData = {
                pagesData: {}
            };
            this.siteData = {
                'pagesData': {},
                'rendererModel': {
                    'passwordProtectedPages': ['page4']
                },
                'publicModel': {
                    'pageList': {
                        'masterPageJsonFileName': 'masterPage.JSON',
                        'pages': [
                            {'pageId': 'page1', 'pageJsonFileName': 'page1.JSON'},
                            {'pageId': 'page2', 'pageJsonFileName': 'page2.JSON'},
                            {'pageId': 'page3', 'pageJsonFileName': 'page3.JSON'},
                            {'pageId': 'page4', 'pageJsonFileName': 'page4.JSON'}
                        ],
                        'mainPageId': 'page3',
                        'topology': [
                            {
                                'baseUrl': 'https://Base1',
                                'parts': 'sites/{filename}'
                            },
                            {
                                'baseUrl': 'https://Base2',
                                'parts': 'sites/{filename}'
                            }
                        ]
                    }
                },
                'failedRequests': []
            };
        });
        describe('getUrl', function () {
            it("should return master page and main page requests if missing", function () {
                var requests = pageRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
                var masterPageRequest = requests[0];
                var pageRequest = requests[1];
                expect(requests.length).toBe(2);
                testPageRequest(masterPageRequest, ['https://Base1sites/masterPage.JSON', 'https://Base2sites/masterPage.JSON'], 'pagesData', 'masterPage');
                testPageRequest(pageRequest, ['https://Base1sites/page1.JSON', 'https://Base2sites/page1.JSON'], 'pagesData', 'page1');
            });

            it("should return main page if non existing page id in url", function () {
                var requests = pageRequests(this.siteData, this.fullPagesData, {pageId: 'none'});
                var pageRequest = requests[1];
                expect(requests.length).toBe(2);
                testPageRequest(pageRequest, ['https://Base1sites/page3.JSON', 'https://Base2sites/page3.JSON'], 'pagesData', 'page3');
            });

            it("should return only the page if master page is loaded", function () {
                this.fullPagesData.pagesData.masterPage = getPageData();
                var requests = pageRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
                var pageRequest = requests[0];
                expect(requests.length).toBe(1);
                testPageRequest(pageRequest, ['https://Base1sites/page1.JSON', 'https://Base2sites/page1.JSON'], 'pagesData', 'page1');
            });

            it("should return a request with an isValidResponse function", function () {
                this.siteData.pagesData.masterPage = getPageData();
                var requests = pageRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
                var pageRequest = requests[0];
                expect(pageRequest.isValidResponse).toBeDefined();
                expect(typeof pageRequest.isValidResponse).toBe('function');
            });
            it('should return request for pages with onUrlRequestFailure function for every page request', function () {
                var requests = pageRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
                var validRequests = _.pluck(requests, 'onUrlRequestFailure');
                expect(requests.length).toEqual(validRequests.length);
            });
            it("the isValidResponse function should validate objects, and fail responses which are null or are not objects", function () {
                this.siteData.pagesData.masterPage = getPageData();
                var requests = pageRequests(this.siteData, this.fullPagesData, {pageId: 'page1'});
                var pageRequest = requests[0];

                var isNullValid = pageRequest.isValidResponse(null);
                var isObjectValid = pageRequest.isValidResponse({});
                var isArrayValid = pageRequest.isValidResponse([]);
                expect(isNullValid).toBe(false);
                expect(isObjectValid).toBe(true);
                expect(isArrayValid).toBe(true);

            });
            it("should return only the master page if the page is protected", function () {
                var requests = pageRequests(this.siteData, this.fullPagesData, {'pageId': 'page4'});
                var masterPageRequest = requests[0];
                testPageRequest(masterPageRequest, ['https://Base1sites/masterPage.JSON', 'https://Base2sites/masterPage.JSON'], 'pagesData', 'masterPage');
                expect(requests.length).toEqual(1);
            });
            it('should use urlData.jsonUrls as page urls when jsonUrls supplied and page urls are missing from site data (protected pages)', function () {
                var urls = ['http://haxs0r.com'];
                var requests = pageRequests(this.siteData, this.fullPagesData, {'pageId': 'page4', jsonUrls: urls});
                expect(requests.length).toEqual(2);
                var pageRequest = requests[1];
                expect(pageRequest.urls).toBe(urls);
            });
        });
    });

    describe('new request timeout', function(){
        beforeEach(function () {
            testUtils.experimentHelper.openExperiments('pageRequestTimeout');
            this.fullPagesData = {
                pagesData: {}
            };
            this.siteData = {
                'pagesData': {},
                'rendererModel': {
                    'passwordProtectedPages': ['page4']
                },
                'publicModel': {
                    'pageList': {
                        'masterPageJsonFileName': 'masterPage.JSON',
                        'pages': [
                            {'pageId': 'page1', 'pageJsonFileName': 'page1.JSON'},
                            {'pageId': 'page2', 'pageJsonFileName': 'page2.JSON'},
                            {'pageId': 'page3', 'pageJsonFileName': 'page3.JSON'},
                            {'pageId': 'page4', 'pageJsonFileName': 'page4.JSON'}
                        ],
                        'mainPageId': 'page3',
                        'topology': [
                            {
                                'baseUrl': 'https://Base1',
                                'parts': 'sites/{filename}'
                            },
                            {
                                'baseUrl': 'https://Base2',
                                'parts': 'sites/{filename}'
                            }
                        ]
                    }
                },
                'failedRequests': []
            };
        });

        it('should not add timeout if experiment is closed', function() {
            var urls = ['http://haxs0r.com'];
            var requests = pageRequests(this.siteData, this.fullPagesData, {'pageId': 'page4', jsonUrls: urls});
            var pageRequest = requests[1];
            expect(pageRequest.requestTimeout).toBe(2000);
        });

        it('should not add timeout if experiment is closed', function() {
            testUtils.experimentHelper.closeExperiments('pageRequestTimeout');

            var urls = ['http://haxs0r.com'];
            var requests = pageRequests(this.siteData, this.fullPagesData, {'pageId': 'page4', jsonUrls: urls});
            var pageRequest = requests[1];
            expect(pageRequest.requestTimeout).not.toBeDefined();
        });
    });

    function testPageRequest(request, urls, packageName, name) {
        for (var i = 0; i < urls.length; i++) {
            expect(request.urls[i]).toBe(urls[i]);
        }
        expect(request.destination).toEqual([packageName, name]);
    }

    function getPageData() {
        return {
            'structure': {
                'children': [],
                'componentType': 'page'
            },
            'data': {
                'document_data': {},
                'component_properties': {}
            }
        };
    }
});
