define(['lodash',
    'utils',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/siteMetadata/passwordProtected',
    'documentServices/mockPrivateServices/privateServicesHelper'], function (_, utils, siteMetadata, passwordProtected, privateServicesHelper) {
        'use strict';

        describe('password protected tests', function () {
            var mockPrivateServices;
            var BLANK_PAGE = {
                "componentType": "mobile.core.components.Page",
                "type": "Page",
                "skin": "skins.core.InlineSkin",
                "layout": {
                    "anchors": [],
                    "x": 0,
                    "y": 0,
                    "fixedPosition": false,
                    "width": 980,
                    "height": 500,
                    "scale": 1,
                    "rotationInDegrees": 0
                },
                "components": [],
                "data": {
                    "pageUriSEO": "blank",
                    "descriptionSEO": "",
                    "underConstruction": false,
                    "indexable": true,
                    "metaKeywordsSEO": "",
                    "pageSecurity": {"requireLogin": false, "passwordDigest": "", "dialogLanguage": ""},
                    "metaData": {"isPreset": false, "schemaVersion": 1, "isHidden": false},
                    "hidePage": false,
                    "mobileHidePage": null,
                    "pageTitleSEO": "",
                    "hideTitle": true,
                    "pageBackgrounds": {
                        "desktop": {},
                        "mobile": {}
                    },
                    "title": "New Page",
                    "icon": "",
                    "type": "Page",
                    "isLandingPage": false
                },
                "style": "p2"
            };

            function createMockPrivateServicesWithPages(pagesId, passwordDigest) {
                var pages = _.transform(pagesId, function (result, pageId) {
                    result[pageId] = {
                        title: pageId + '_title'
                    };
                }, {});

                var siteData = privateServicesHelper.getSiteDataWithPages(pages);

                _.forEach(pagesId, function (pageId) {
                    var data = _.cloneDeep(BLANK_PAGE.data);
                    data.id = pageId;
                    data.data = 'PAGE_DATA_' + pageId;
                    data.pageSecurity.passwordDigest = passwordDigest;
                    siteData.addData(data, 'masterPage');
                });

                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                return mockPrivateServices;
            }

            beforeEach(function () {
                mockPrivateServices = createMockPrivateServicesWithPages(['mainPage']);// privateServicesHelper.mockPrivateServicesWithRealDAL();
            });

            it('should return all password protected pages', function () {
                spyOn(siteMetadata, "getProperty").and.returnValue({
                    foo: 'bar'
                });
                var pagesData = passwordProtected.getPasswordProtectedPages(mockPrivateServices);
                expect(pagesData).toEqual({foo: 'bar'});
            });

            describe('setPagePassword', function () {
                it('should set the given pageId password to the given password', function () {
                    var pageId = 'pageId';
                    var newPassword = 'hashed password';
                    passwordProtected.setPagePassword(mockPrivateServices, pageId, {
                        value: newPassword, isHashed: true
                    });
                    var protectedPagesData = siteMetadata.getProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD);
                    expect(protectedPagesData[pageId]).toBe(newPassword);
                });

                it('should hash the given password if needed', function () {
                    var pageId = 'pageId';
                    var newPassword = 'new password';
                    var hashedPassword = utils.hashUtils.SHA256.b64_sha256(newPassword);
                    passwordProtected.setPagePassword(mockPrivateServices, pageId, {
                        value: newPassword, isHashed: false
                    });
                    var protectedPagesData = siteMetadata.getProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD);
                    expect(protectedPagesData[pageId]).toBe(hashedPassword);
                });

                it('should add the given page to passwordProtectedPages array', function () {
                    var pageId = 'pageId';
                    var newPassword = 'new password';
                    var hashedPassword = utils.hashUtils.SHA256.b64_sha256(newPassword);
                    passwordProtected.setPagePassword(mockPrivateServices, pageId, {
                        value: newPassword
                    });
                    var protectedPagesData = siteMetadata.getProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD);
                    expect(protectedPagesData[pageId]).toBe(hashedPassword);
                });

                it('should add the given page to passwordProtectedPages array', function () {
                    var pageId = 'pageId';
                    var newPassword = 'new password';
                    var hashedPassword = utils.hashUtils.SHA256.b64_sha256(newPassword);
                    passwordProtected.setPagePassword(mockPrivateServices, pageId, {
                        value: newPassword
                    });
                    var protectedPagesData = siteMetadata.getProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD);
                    expect(protectedPagesData[pageId]).toBe(hashedPassword);
                });
            });

            describe('setPageToNoRestriction', function () {
                it('should set the given pageId password to null', function () {
                    var pageId = 'pageId';
                    var passwordObject = {};
                    passwordObject[pageId] = 'some password';
                    siteMetadata.setProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD, passwordObject);

                    passwordProtected.setPageToNoRestriction(mockPrivateServices, pageId);
                    var protectedPagesData = siteMetadata.getProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD);
                    expect(protectedPagesData[pageId]).toBe(null);
                });

                it('should remove the given page from passwordProtectedPages array', function () {
                    var pageId = 'pageId';
                    passwordProtected.setPageToNoRestriction(mockPrivateServices, pageId);
                    var protectedPagesData = siteMetadata.getProperty(mockPrivateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD);
                    expect(protectedPagesData[pageId]).toBe(null);
                });

                it('should return false if supplied pageId not in passwordProtectedPages array', function () {
                    var pageId = 'pageId';
                    spyOn(siteMetadata, 'getProperty').and.returnValue(['not that page']);
                    expect(passwordProtected.isPageProtected(mockPrivateServices, pageId)).toBe(false);
                });

                it('should return true if supplied pageId in passwordProtectedPages array', function () {
                    var pageId = 'pageId';
                    spyOn(siteMetadata, 'getProperty').and.returnValue([pageId]);
                    expect(passwordProtected.isPageProtected(mockPrivateServices, pageId)).toBe(true);
                });
            });
        });
});
