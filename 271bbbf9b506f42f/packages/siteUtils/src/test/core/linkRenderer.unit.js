define(['lodash', 'testUtils', 'siteUtils/core/linkRenderer', 'coreUtils', 'wixUrlParser'], function (_, testUtils, linkRenderer, coreUtils, wixUrlParser) {
    'use strict';

    describe('LinkRenderer public functions', function () {

        var mockSiteData, mockLinks;

        function createAnchorLink(siteData, def) {
            if (def.pageId) {
                var pageData = siteData.getDataByQuery(def.pageId);
                if (!pageData) {
                    siteData.addPageWithDefaults(def.pageId.substring(1));
                    pageData = siteData.getDataByQuery(def.pageId);
                }
                def.pageId = pageData;
            }

            if (def.anchorDataId && !_.includes(['SCROLL_TO_BOTTOM', 'SCROLL_TO_TOP'], def.anchorDataId)) {
                var anchorData = siteData.getDataByQuery(def.anchorDataId);
                if (!anchorData) {
                    siteData.mock.anchorData({
                        id: def.anchorDataId,
                        pageId: def.pageId
                    });

                    anchorData = siteData.getDataByQuery(def.anchorDataId);
                }
                def.anchorDataId = anchorData;
            }

            return def;
        }

        beforeEach(function () {
            var siteModel = {
                publicModel: {
                    pageList: {
                        mainPageId: '#mockMainPage'
                    },
                    externalBaseUrl: 'mockExternalBaseUrl'
                },
                currentUrl: {
                    full: 'mockExternalBaseUrl?ReactSource=false#!pageTitle/mockSamePage',
                    query: {
                        ReactSource: false
                    }
                }
            };
            mockSiteData = testUtils.mockFactory.mockSiteData(siteModel)
                .addPageWithDefaults('mockMainPage')
                .addPageWithDefaults('mockOtherPage')
                .addPopupPageWithDefaults('mockPopupPage')
                .setCurrentPage('mockCurrentPageId');

            mockSiteData.mock.anchorData({id: 'mockDataId', pageId: 'mockOtherPage'});

            var anchorLinks = {
                otherPage: {
                    type: 'AnchorLink',
                    pageId: '#mockOtherPage',
                    anchorName: 'mockAnchorName',
                    anchorDataId: '#mockDataId'
                },
                samePage: {
                    type: 'AnchorLink',
                    pageId: '#mockSamePage',
                    anchorName: 'mockAnchorName',
                    anchorDataId: '#mockDataId'
                },
                bottom: {
                    type: 'AnchorLink',
                    pageId: '#masterPage',
                    anchorName: 'mockAnchorName',
                    anchorDataId: 'SCROLL_TO_BOTTOM'
                },
                top: {
                    type: 'AnchorLink',
                    pageId: '#masterPage',
                    anchorName: 'mockAnchorName',
                    anchorDataId: 'SCROLL_TO_TOP'
                },
                otherPageNoAnchor: {
                    type: 'AnchorLink',
                    pageId: '#mockOtherPage',
                    anchorName: 'mockAnchorName'
                }
            };
            mockLinks = {
                pageLink: {
                    type: 'PageLink',
                    pageId: mockSiteData.getDataByQuery('#mockMainPage')
                },
                popupPageLink: {
                    type: 'PageLink',
                    pageId: mockSiteData.getDataByQuery('#mockPopupPage')
                },
                DynamicPageLink: {
                    type: 'DynamicPageLink',
                    routerId:'5',
                    innerRoute:'dog'
                },
                DynamicPageLinkWithAnchor: {
                    type: 'DynamicPageLink',
                    routerId:'5',
                    innerRoute:'dog',
                    anchorDataId:'#fff'
                },
                anchorLink: _.mapValues(anchorLinks, _.partial(createAnchorLink, mockSiteData)),
                externalLink: {
                    type: 'ExternalLink',
                    url: 'http://www.wix.com',
                    target: '_blank'
                },
                loginToWixLink: {
                    type: 'LoginToWixLink',
                    postLoginUrl: 'http://www.wix.com/somePostLoginUrl',
                    postSignupUrl: 'http://www.wix.com/somePostSignUpUrl',
                    dialog: 'createUser'
                },
                loginToWixLinkWithContext: {
                    type: 'LoginToWixLink',
                    postLoginUrl: 'http://www.wix.com/somePostLoginUrl',
                    postSignupUrl: 'http://www.wix.com/somePostSignUpUrl?ifcontext=someContext&someParam={ifcontext}',
                    dialog: 'createUser'
                },
                loginToWixLinkWithIllegalContext: {
                    type: 'LoginToWixLink',
                    postLoginUrl: 'http://www.wix.com/somePostLoginUrl',
                    postSignupUrl: 'http://www.wix.com/somePostSignUpUrl?ifcontext=bad-context&someParam={ifcontext}',
                    dialog: 'createUser'
                },
                emailLink: {
                    type: 'EmailLink',
                    recipient: "akaspi@wix.com",
                    subject: "someSubject",
                    body: "someBody"
                },
                documentLink: {
                    type: 'DocumentLink',
                    docId: 'dc6fab_68e13a25514c43b7ab7ed1109232.doc',
                    name: "someName.doc"
                }
            };
        });

        function getRootNavigationInfo() {
            return mockSiteData.getExistingRootNavigationInfo(mockSiteData.getFocusedRootId());
        }

        describe('renderLink()', function () {

            describe('Invalid calls', function () {

                it('should not render a link if data item has no type', function () {
                    var calculatedHref = linkRenderer.renderLink({}, mockSiteData, getRootNavigationInfo());

                    expect(calculatedHref).toEqual({});
                });

                it('should not render a link if data item is not provided', function () {
                    var expectedHref = {},
                        calculatedHref = linkRenderer.renderLink(null, mockSiteData, getRootNavigationInfo());

                    expect(calculatedHref).toEqual(expectedHref);
                });


                it('should not render a link if rootNavigationInfo is not provided', function () {
                    var expectedHref = {},
                        calculatedHref = linkRenderer.renderLink(mockLinks.pageLink, mockSiteData);

                    expect(calculatedHref).toEqual(expectedHref);
                });
            });

            describe('PageLink', function () {

                it('should render PageLink', function () {
                    var linkData = _.defaultsDeep({
                        pageId: {
                            id: 'mockMainPage',
                            pageUriSEO: 'pageTitle'
                        }
                    }, mockLinks.pageLink);
                    var calculated = linkRenderer.renderLink(linkData, mockSiteData, getRootNavigationInfo());

                    expect(calculated.href).toEqual('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockMainPage');
                    expect(calculated.target).toEqual('_self');
                });

                it("should not render PageLink if no such data item", function () {
                    var calculatedHref = linkRenderer.renderLink(undefined, mockSiteData, getRootNavigationInfo());

                    expect(calculatedHref).toEqual({});
                });

                it("should render a page's pageUriSEO as 'untitled' if missing", function () {
                    var linkData = _.chain(mockLinks.pageLink)
                        .cloneDeep()
                        .merge({pageId: {id: 'mockMainPage'}})
                        .value();
                    delete linkData.pageId.pageUriSEO;
                    var calculated = linkRenderer.renderLink(linkData, mockSiteData, getRootNavigationInfo());
                    expect(calculated.href).toEqual('mockExternalBaseUrl?ReactSource=false#!untitled/mockMainPage');
                });

            });

            describe('ExternalLink', function () {

                it('should render ExternalLink', function () {
                    var calculatedLink = linkRenderer.renderLink(mockLinks.externalLink, mockSiteData, getRootNavigationInfo());
                    expect(calculatedLink.href).toEqual('http://www.wix.com');
                    expect(calculatedLink.target).toEqual('_blank');
                });

            });

            describe('LoginToWixLink', function () {

                describe('User is logged out', function () {

                    beforeEach(function () {
                        spyOn(coreUtils.wixUserApi, 'isSessionValid').and.returnValue(false);
                    });

                    it('should replace {ifcontext} in the postSignUp url to the value of the "ifcontext" key in the postSignUp url', function () {
                        var expectedPostSignUp = mockLinks.loginToWixLinkWithContext.postSignupUrl.replace('{ifcontext}', 'someContext');
                        var calculatedHref = linkRenderer.renderLink(mockLinks.loginToWixLinkWithContext, mockSiteData, getRootNavigationInfo());
                        var parsedHref = coreUtils.urlUtils.parseUrl(calculatedHref.href);

                        expect(parsedHref.query.postSignUp).toEqual(expectedPostSignUp);
                    });

                    it('should replace {ifcontext} in the postSignUp url to "illegalContextValue" if the ifcontext value is not alphanumeric', function () {
                        var expectedPostSignUp = mockLinks.loginToWixLinkWithIllegalContext.postSignupUrl.replace('{ifcontext}', 'illegalContextValue');
                        var calculatedHref = linkRenderer.renderLink(mockLinks.loginToWixLinkWithIllegalContext, mockSiteData, getRootNavigationInfo());
                        var parsedHref = coreUtils.urlUtils.parseUrl(calculatedHref.href);

                        expect(parsedHref.query.postSignUp).toEqual(expectedPostSignUp);
                    });

                    it('should link to the login form\'s url', function () {
                        var baseLoginUrl = 'https://users.wix.com/signin?';
                        var calculatedHref = linkRenderer.renderLink(mockLinks.loginToWixLink, mockSiteData, getRootNavigationInfo());

                        expect(calculatedHref.href).toStartWith(baseLoginUrl);
                    });

                    it('should set the postLogin param to the postLoginUrl key in the link data', function () {
                        var expectedPostLogin = mockLinks.loginToWixLink.postLoginUrl;
                        var calculatedHref = linkRenderer.renderLink(mockLinks.loginToWixLink, mockSiteData, getRootNavigationInfo());
                        var parsedHref = coreUtils.urlUtils.parseUrl(calculatedHref.href);

                        expect(parsedHref.query.postLogin).toEqual(expectedPostLogin);
                    });

                    it('should set the postSignUp param to the postSignUpUrl key in the link data', function () {
                        var expectedPostSignUp = mockLinks.loginToWixLink.postSignupUrl;
                        var calculatedHref = linkRenderer.renderLink(mockLinks.loginToWixLink, mockSiteData, getRootNavigationInfo());
                        var parsedHref = coreUtils.urlUtils.parseUrl(calculatedHref.href);

                        expect(parsedHref.query.postSignUp).toEqual(expectedPostSignUp);
                    });
                });

                describe('User is logged in', function () {

                    beforeEach(function () {
                        spyOn(coreUtils.wixUserApi, 'isSessionValid').and.returnValue(true);
                    });

                    it('Should link to the post login url', function () {
                        var expectedPostLogin = mockLinks.loginToWixLink.postLoginUrl;

                        var link = linkRenderer.renderLink(mockLinks.loginToWixLink, mockSiteData, getRootNavigationInfo());

                        expect(link.href).toEqual(expectedPostLogin);
                    });
                });
            });

            describe('EmailLink', function () {
                it('Should render an email link with email address only', function () {
                    var mockEmailLinkData = _.omit(mockLinks.emailLink, ['subject', 'body']),
                        expectedLink = {
                            href: "mailto:" + mockLinks.emailLink.recipient
                        };
                    var emailLink = linkRenderer.renderLink(mockEmailLinkData, mockSiteData, getRootNavigationInfo());

                    expect(emailLink.href).toBe(expectedLink.href);
                });

                it('Should render an email link with subject only', function () {
                    var mockEmailLinkData = _.omit(mockLinks.emailLink, ['body']),
                        expectedLink = {
                            href: "mailto:" + mockLinks.emailLink.recipient + "?" + "subject=" + mockLinks.emailLink.subject
                        };

                    var emailLink = linkRenderer.renderLink(mockEmailLinkData, mockSiteData, getRootNavigationInfo());

                    expect(emailLink.href).toBe(expectedLink.href);
                });


                it('Should render an email link with body only', function () {
                    var mockEmailLinkData = _.omit(mockLinks.emailLink, ['subject']),
                        expectedLink = {
                            href: "mailto:" + mockLinks.emailLink.recipient + "?" + "body=" + mockLinks.emailLink.body
                        };

                    var emailLink = linkRenderer.renderLink(mockEmailLinkData, mockSiteData, getRootNavigationInfo());

                    expect(emailLink.href).toBe(expectedLink.href);
                });

                it('Should render a link to email address with subject and body', function () {
                    var mockEmailLinkData = mockLinks.emailLink;
                    var expectedLink = {
                        href: "mailto:" + mockLinks.emailLink.recipient + "?" + "subject=" + mockLinks.emailLink.subject + "&" + "body=" + mockLinks.emailLink.body
                    };

                    var emailLink = linkRenderer.renderLink(mockEmailLinkData, mockSiteData, getRootNavigationInfo());

                    expect(emailLink.href).toBe(expectedLink.href);
                });

                it('Should render a link to email within the same tab', function () {
                    var mockEmailLinkData = mockLinks.emailLink;

                    var emailLink = linkRenderer.renderLink(mockEmailLinkData, mockSiteData, getRootNavigationInfo());

                    expect(emailLink.target).toEqual('_self');
                });
            });

            describe('DocumentLink', function () {
                it('Should render a non-pdf document', function () {
                    var mockDocumentLinkData = mockLinks.documentLink;
                    var expectedLink = {
                        href: mockSiteData.serviceTopology.staticDocsUrl + "/" + mockDocumentLinkData.docId + "?" + coreUtils.urlUtils.toQueryString({dn: mockDocumentLinkData.name})
                    };

                    var documentLink = linkRenderer.renderLink(mockDocumentLinkData, mockSiteData, getRootNavigationInfo());

                    expect(documentLink.href).toBe(expectedLink.href);
                });

                it('Should render a pdf document link', function () {
                    var mockDocumentLinkData = _.clone(mockLinks.documentLink);
                    mockDocumentLinkData.docId = mockDocumentLinkData.docId.replace(".doc", ".pdf");
                    mockDocumentLinkData.name = mockDocumentLinkData.name.replace(".doc", ".pdf");

                    var expectedLink = {
                        href: mockSiteData.serviceTopology.staticDocsUrl + "/" + mockDocumentLinkData.docId
                    };

                    var documentLink = linkRenderer.renderLink(mockDocumentLinkData, mockSiteData, getRootNavigationInfo());

                    expect(documentLink.href).toBe(expectedLink.href);
                });

                it('Should render document link with spaces in its name', function () {
                    var mockDocumentLinkData = _.clone(mockLinks.documentLink);
                    mockDocumentLinkData.name = "some name with spaces.doc";
                    var expectedLink = {
                        href: mockSiteData.serviceTopology.staticDocsUrl + "/" + mockDocumentLinkData.docId + "?dn=" + mockDocumentLinkData.name.split(' ').join('%20')
                    };

                    var documentLink = linkRenderer.renderLink(mockDocumentLinkData, mockSiteData, getRootNavigationInfo());

                    expect(documentLink.href).toBe(expectedLink.href);
                });

                it('should render link with valid url (no duplicate "ugd" in url)', function () {
                    var mockDocumentLinkData1 = _.clone(mockLinks.documentLink);
                    var mockDocumentLinkData2 = _.clone(mockLinks.documentLink);
                    mockDocumentLinkData1.docId = '/ugd/' + mockDocumentLinkData1.docId;
                    mockDocumentLinkData2.docId = 'ugd/' + mockDocumentLinkData2.docId;

                    var documentLink1 = linkRenderer.renderLink(mockDocumentLinkData1, mockSiteData, getRootNavigationInfo());
                    var documentLink2 = linkRenderer.renderLink(mockDocumentLinkData2, mockSiteData, getRootNavigationInfo());

                    expect(documentLink1.href).toBe(mockSiteData.serviceTopology.staticDocsUrl + "/" + mockLinks.documentLink.docId + "?" + coreUtils.urlUtils.toQueryString({dn: mockDocumentLinkData1.name}));
                    expect(documentLink2.href).toBe(mockSiteData.serviceTopology.staticDocsUrl + "/" + mockLinks.documentLink.docId + "?" + coreUtils.urlUtils.toQueryString({dn: mockDocumentLinkData2.name}));
                });
            });

            describe('AnchorLink', function () {

                describe('Same page link', function () {

                    it('should render "scroll to bottom" anchor link', function () {
                        spyOn(mockSiteData, 'findDataOnMasterPageByPredicate').and.returnValue(false);
                        var navigationInfo = _.assign(getRootNavigationInfo(), {title :'pageTitle'});
                        var calculatedData = linkRenderer.renderLink(mockLinks.anchorLink.bottom, mockSiteData, navigationInfo);

                        expect(calculatedData.href).toEqual('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockCurrentPageId');
                        expect(calculatedData.target).toEqual('_self');
                        expect(calculatedData['data-anchor']).toBe('SCROLL_TO_BOTTOM');
                    });

                    it('should render "scroll to top" anchor link', function () {
                        spyOn(mockSiteData, 'findDataOnMasterPageByPredicate').and.returnValue(false);
                        var navigationInfo = _.assign(getRootNavigationInfo(), {title :'pageTitle'});
                        var calculatedData = linkRenderer.renderLink(mockLinks.anchorLink.top, mockSiteData, navigationInfo);

                        expect(calculatedData.href).toEqual('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockCurrentPageId');
                        expect(calculatedData.target).toEqual('_self');
                        expect(calculatedData['data-anchor']).toBe('SCROLL_TO_TOP');
                    });

                    it('Should render "regular" anchor link on the same page', function () {
                        spyOn(mockSiteData, 'findDataOnMasterPageByPredicate').and.returnValue(false);
                        mockSiteData.addPageWithDefaults('mockSamePage').setCurrentPage('mockSamePage');
                        var pageData = mockSiteData.getDataByQuery('mockSamePage');
                        pageData.pageUriSEO = 'pageTitle';
                        var linkData = mockSiteData.resolveData(testUtils.mockFactory.dataMocks.anchorLinkData({pageId: '#masterPage', anchorDataId: '#mockDataId'}));
                        var navigationInfo = _.assign(getRootNavigationInfo(), {title :'pageTitle'});
                        var calculated = linkRenderer.renderLink(linkData, mockSiteData, navigationInfo);

                        expect(calculated.href).toEqual('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockSamePage');
                        expect(calculated.target).toEqual('_self');
                        expect(calculated['data-anchor']).toBe('mockDataId');
                    });

                    it('Should render "regular" anchor link on the masterPage', function () {
                        spyOn(mockSiteData, 'findDataOnMasterPageByPredicate').and.returnValue(false);
                        mockSiteData.addPageWithDefaults('mockSamePage').setCurrentPage('mockSamePage');
                        var pageData = mockSiteData.getDataByQuery('mockSamePage');
                        pageData.pageUriSEO = 'pageTitle';
                        var linkData = _.defaultsDeep({pageId: pageData}, mockLinks.anchorLink.samePage);
                        var calculated = linkRenderer.renderLink(linkData, mockSiteData, getRootNavigationInfo());

                        expect(calculated.href).toEqual('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockSamePage');
                        expect(calculated.target).toEqual('_self');
                        expect(calculated['data-anchor']).toBe('mockDataId');
                    });



                    it('Should reset zoom if zoom page', function () {
                        mockSiteData.currentUrl.hash = "#!mockImageTitle/zoom/mockCurrentPageId/#mockImageId";
                        mockSiteData.addData({
                            id: 'mockSamePage',
                            type: 'Page',
                            pageUriSEO: 'pageTitle',
                            title: 'mockSamePage'
                        });
                        spyOn(mockSiteData, 'findDataOnMasterPageByPredicate').and.returnValue(false);
                        var pageData = {id: 'mockSamePage', pageUriSEO: 'pageTitle'};
                        var linkData = _.defaults({pageId: pageData}, mockLinks.anchorLink.top);
                        var navigationInfo = _.assign(getRootNavigationInfo(), {title :'pageTitle'});
                        var calculated = linkRenderer.renderLink(linkData, mockSiteData, navigationInfo);

                        expect(calculated.href).toEqual('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockCurrentPageId');
                    });
                });

                describe('Different page link', function () {

                    it('Should render link to anchor on different page', function () {
                        spyOn(mockSiteData, 'findDataOnMasterPageByPredicate').and.returnValue(false);

                        var pageData = {id: 'mockOtherPage', pageUriSEO: 'pageTitle'};
                        var linkData = _.defaultsDeep({pageId: pageData}, mockLinks.anchorLink.otherPage);
                        var calculated = linkRenderer.renderLink(linkData, mockSiteData, getRootNavigationInfo());

                        expect(calculated.href).toBe('mockExternalBaseUrl?ReactSource=false#!pageTitle/mockOtherPage');
                        expect(calculated.target).toBe('_self');
                        expect(calculated['data-anchor']).toBe('mockDataId');
                    });
                });
            });
        });

        describe('renderImageZoomLink()', function () {

            it('should render image zoom link without context attribute', function () {
                var imageData = mockSiteData.mock.imageData({
                    id: 'mockImageId',
                    title: 'mockImageTitle'
                });

                var calculatedLink = linkRenderer.renderImageZoomLink(mockSiteData, getRootNavigationInfo(), imageData);

                expect(calculatedLink['data-page-item-context']).toBeUndefined();
                expect(calculatedLink.href).toEqual('mockExternalBaseUrl?ReactSource=false#!mockImageTitle/zoom/mockCurrentPageId/mockImageId');
            });


            it('should render image zoom link with context attribute of galleryId and propertyQuery', function () {
                var imageData = mockSiteData.mock.imageData({
                    id: 'mockImageId',
                    title: 'mockImageTitle'
                });

                var calculatedLink = linkRenderer.renderImageZoomLink(mockSiteData, getRootNavigationInfo(), imageData, 'demoGalleryId', 'demoPropertyQuery');

                expect(calculatedLink['data-page-item-context']).toEqual('galleryId:demoGalleryId propertyQuery:demoPropertyQuery');
            });

            it('should render image zoom link with context attribute of galleryId', function () {
                var imageData = mockSiteData.mock.imageData({
                    id: 'mockImageId',
                    title: 'mockImageTitle'
                });

                var calculatedLink = linkRenderer.renderImageZoomLink(mockSiteData, getRootNavigationInfo(), imageData, 'demoGalleryId');

                expect(calculatedLink['data-page-item-context']).toEqual('galleryId:demoGalleryId');
            });

            it('should render image zoom link with context attribute of propertyQuery', function () {
                var imageData = mockSiteData.mock.imageData({
                    id: 'mockImageId',
                    title: 'mockImageTitle'
                });

                var calculatedLink = linkRenderer.renderImageZoomLink(mockSiteData, getRootNavigationInfo(), imageData, null, 'demoPropertyQuery');

                expect(calculatedLink['data-page-item-context']).toEqual('propertyQuery:demoPropertyQuery');
            });

            it('should render image zoom link which calls nonPageItemZoom.zoom on click if passing image data created by nonPageItemZoom', function () {
                var imageData = coreUtils.nonPageItemZoom.addGalleryDataToImageData({type: 'Image'}, {}, _.noop);

                var calculatedLink = linkRenderer.renderImageZoomLink(mockSiteData, getRootNavigationInfo(), imageData);
                expect(calculatedLink.onClick).toBeDefined();
                spyOn(coreUtils.nonPageItemZoom, 'zoom');
                calculatedLink.onClick();
                expect(coreUtils.nonPageItemZoom.zoom).toHaveBeenCalledWith(imageData);
            });

            it("should render image zoom link with empty href if navInfo belongs to a popup", function () {
                var popupId = 'popup1';
                mockSiteData.addPageWithData(popupId, {isPopup: true});
                mockSiteData.setRootNavigationInfo({pageId: popupId});

                var imageData = mockSiteData.mock.imageData({
                    id: 'mockImageId',
                    title: 'mockImageTitle'
                });

                var calculatedLink = linkRenderer.renderImageZoomLink(mockSiteData, getRootNavigationInfo(), imageData);

                /*eslint no-script-url:0*/
                expect(calculatedLink.href).toBe('javascript:void()');
            });

        });

        describe('renderPageLink()', function () {

            it('should return an empty object if there is no pageData', function() {
                expect(linkRenderer.renderPageLink(null, mockSiteData)).toEqual({});
            });

            it('should render page link', function () {
                var expectedHref = {
                    href: 'mockExternalBaseUrl?ReactSource=false#!pageTitle/mockMainPage',
                    target: '_self'
                }, calculatedHref;

                var pageLink = _.cloneDeep(mockLinks.pageLink);
                _.assign(pageLink.pageId, {id: 'mockMainPage', pageUriSEO: 'pageTitle'});

                calculatedHref = linkRenderer.renderPageLink(pageLink.pageId, mockSiteData, getRootNavigationInfo());
                expect(calculatedHref).toEqual(expectedHref);

            });

            describe('when popups experiment is open and pageData is Popup', function() {
                it('should render link with empty href and with data-no-physical-url', function() {
                    var expectedHref = {
                        href: 'javascript:void()',
                        target: '_self',
                        'data-no-physical-url': 'mockExternalBaseUrl?ReactSource=false#!popupTitle/mockPopupPage'
                    }, calculatedHref;

                    var popupPageLink = _.cloneDeep(mockLinks.popupPageLink);
                    _.assign(popupPageLink.pageId, {pageUriSEO: 'popupTitle'});

                    calculatedHref = linkRenderer.renderPageLink(popupPageLink.pageId, mockSiteData);
                    expect(calculatedHref).toEqual(expectedHref);
                });
            });

        });

        describe('renderDynamicPageLink()', function () {
            it('should render dynamic page link', function () {
                testUtils.experimentHelper.openExperiments('sv_dpages');
                var expectedHref = {
                    href: 'mockBaseUrl/david_animals/dog?ReactSource=false',
                    target: '_self'
                }, calculatedHref;

                var DynamicPageLink = _.cloneDeep(mockLinks.DynamicPageLink);
                mockSiteData.getUrlFormat = function(){
                    return 'slash';
                };
                mockSiteData.routers = {
                    configMap: {
                        5: {
                            prefix: 'david_animals',
                                appId: '34234',
                                config: {
                                routerFunctionName: 'animals',
                                    siteMapFunctionName: 'siteMapFunc'
                            }
                        }
                    }
                };
                spyOn(mockSiteData, 'getExternalBaseUrl').and.returnValue('mockBaseUrl');
                calculatedHref = linkRenderer.renderLink(DynamicPageLink, mockSiteData, {});
                expect(calculatedHref).toEqual(expectedHref);

            });
        });

        describe('isEmailLink', function () {
            it('should return true for an e-mail link', function () {
                var url = 'mailto:somemail@wix.com';

                expect(linkRenderer.isEmailLink(url)).toBe(true);
            });

            it('should return false for non e-mail link', function () {
                var url = 'www.somesite.com';

                expect(linkRenderer.isEmailLink(url)).toBe(false);
            });

            it('should return false for undefined link', function () {
                var url;

                expect(linkRenderer.isEmailLink(url)).toBe(false);
            });
        });

        describe('isExternalLink', function () {
            it('should return false for a site URL', function () {
                var url = 'someUrl';
                spyOn(wixUrlParser, 'parseUrl').and.returnValue(true);

                expect(linkRenderer.isExternalLink(mockSiteData, url)).toBe(false);
            });

            it('should return false for an email link', function () {
                var url = 'mailto://some@address.com';

                expect(linkRenderer.isExternalLink(mockSiteData, url)).toBe(false);
            });

            it('should return false for a document link', function () {
                var url = mockSiteData.serviceTopology.staticDocsUrl + '/someUrl';

                expect(linkRenderer.isExternalLink(mockSiteData, url)).toBe(false);
            });

            it('should return true if login to wix URL', function () {
                var url = linkRenderer.CONSTS.LOGIN_TO_WIX_URL + 'someParam=someVal';

                expect(linkRenderer.isExternalLink(mockSiteData, url)).toBe(true);
            });

            it('should return true for an external url', function () {
                var url = "http://www.some.url/";

                expect(linkRenderer.isExternalLink(mockSiteData, url)).toBe(true);
            });
        });

    });
});

