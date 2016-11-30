define([
    'lodash',
    'utils',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/siteMetadata/generalInfo'
], function (_, utils, testUtils, privateServicesHelper, generalInfo) {
    'use strict';

    describe('generalInfo', function () {

        function mockPrivateServices(rendererModel, dsModel) {
            var siteModel = testUtils.mockFactory.mockSiteModel({
                documentServicesModel: dsModel || {},
                rendererModel: rendererModel || {}
            });
            var siteData = testUtils.mockFactory.mockSiteData(siteModel, true);
            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        describe('isSiteFromOnBoarding', function () {
            it('sould return true if onboarding clientSpecMap inUse value is true and useOnboarding in metasite is undefined', function () {
                var ps = mockPrivateServices({
                    clientSpecMap: {
                        "3": {
                            "type": "onboarding",
                            "applicationId": 3,
                            "storyId": "1cf2ac09-436f-4921-bd83-27d9d8323603",
                            "inUse": true
                        }
                    }
                }, {
                    metaSiteData: {}
                });

                expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(true);
            });

            it('sould return true if onboarding clientSpecMap inUse value is true and useOnboarding in metasite is true', function () {
                var ps = mockPrivateServices({
                    clientSpecMap: {
                        "3": {
                            "type": "onboarding",
                            "applicationId": 3,
                            "storyId": "1cf2ac09-436f-4921-bd83-27d9d8323603",
                            "inUse": true
                        }
                    }
                }, {
                    metaSiteData: {
                        useOnboarding: true
                    }
                });

                expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(true);
            });

            it('sould return false if onboarding clientSpecMap inUse value is true and useOnboarding in metasite is false', function () {
                var ps = mockPrivateServices({
                    clientSpecMap: {
                        "3": {
                            "type": "onboarding",
                            "applicationId": 3,
                            "storyId": "1cf2ac09-436f-4921-bd83-27d9d8323603",
                            "inUse": true
                        }
                    }
                }, {
                    metaSiteData: {
                        useOnboarding: false
                    }
                });

                expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(false);
            });

            it('sould return false if onboarding clientSpecMap inUse value is false', function () {
                var ps = mockPrivateServices({
                    clientSpecMap: {
                        "3": {
                            "type": "onboarding",
                            "applicationId": 3,
                            "storyId": "1cf2ac09-436f-4921-bd83-27d9d8323603",
                            "inUse": false
                        }
                    }
                }, {
                    metaSiteData: {
                        useOnboarding: true
                    }
                });

                expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(false);
            });

            it('sould return false if onboarding is not in clientSpecMap', function () {
                var ps = mockPrivateServices({
                    clientSpecMap: {
                        "666": {
                            "type": "sometype",
                            "applicationId": 666,
                            "storyId": "1cf2ac09-436f-4921-bd83-27d9d8323603",
                            "inUse": false
                        }
                    }
                }, {
                    metaSiteData: {
                        useOnboarding: true
                    }
                });

                expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(false);
            });

        });

        describe('getSiteToken', function() {

            it('should return the site token if exists', function() {
                var ps = mockPrivateServices({}, {
                    permissionsInfo: {
                        siteToken: 'xxx'
                    }
                });

                var siteToken = generalInfo.getSiteToken(ps);

                expect(siteToken).toEqual('xxx');
            });

            it('should return undefined if not exists', function() {
                var ps = mockPrivateServices({}, {
                    permissionsInfo: {}
                });

                var siteToken = generalInfo.getSiteToken(ps);

                expect(siteToken).not.toBeDefined();
            });

        });


        it('should return the user info', function () {
            var ps = mockPrivateServices({}, {
                userInfo: 'userInfo'
            });

            var userInfo = generalInfo.getUserInfo(ps);

            expect(userInfo).toEqual('userInfo');
        });

        it('should return the public url', function () {
            var ps = mockPrivateServices({}, {
                publicUrl: 'publicUrl'
            });

            var publicUrl = generalInfo.getPublicUrl(ps);

            expect(publicUrl).toEqual('publicUrl');
        });

        it('setting the public url', function () {
            var domain = 'www.example-domain.com';

            var ps = mockPrivateServices({}, {
                publicUrl: 'publicUrl'
            });

            generalInfo.setPublicUrl(ps, domain);

            var publicUrl = generalInfo.getPublicUrl(ps);

            expect(publicUrl).toEqual(domain);
        });

        it('getting the metasite id', function () {
            var ps = mockPrivateServices({
                metaSiteId: 'metaSiteId'
            }, {});

            var metaSiteId = generalInfo.getMetaSiteId(ps);

            expect(metaSiteId).toEqual('metaSiteId');
        });

        it('getting the site original template id', function () {
            var ps = mockPrivateServices({}, {
                originalTemplateId: 'originalTemplateId'
            });

            var originalTemplateId = generalInfo.getSiteOriginalTemplateId(ps);

            expect(originalTemplateId).toEqual('originalTemplateId');
        });

        it('return the site id', function () {
            var ps = mockPrivateServices({
                siteInfo: {
                    siteId: 'siteId'
                }
            }, {});

            var siteId = generalInfo.getSiteId(ps);

            expect(siteId).toEqual('siteId');
        });

        describe('getLanguage', function() {

            it('return the language code if exists', function () {
                var ps = mockPrivateServices({
                    languageCode: 'languageCode'
                }, {});

                var languageCode = generalInfo.getLanguage(ps);

                expect(languageCode).toEqual('languageCode');
            });

            it('return en if language code does not exist', function () {
                var ps = mockPrivateServices({
                    languageCode: null
                }, {});

                var languageCode = generalInfo.getLanguage(ps);

                expect(languageCode).toEqual('en');
            });
        });


        it('return the GEO', function () {
            var ps = mockPrivateServices({
                geo: 'geo'
            }, {});

            var geo = generalInfo.getGeo(ps);

            expect(geo).toEqual('geo');
        });

        it('return is first save - has the site never been saved before', function () {
            var ps = mockPrivateServices({}, {
                neverSaved: true
            });

            var isFirstSave = generalInfo.isFirstSave(ps);

            expect(isFirstSave).toBe(true);
        });

        it('return the document type', function () {
            var ps = mockPrivateServices({
                siteInfo: {
                    documentType: 'documentType'
                }
            }, {});

            var documentType = generalInfo.getDocumentType(ps);

            expect(documentType).toEqual('documentType');
        });
    });
});
