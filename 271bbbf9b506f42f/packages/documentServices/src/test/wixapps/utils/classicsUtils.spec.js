define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/wixapps/utils/classicsUtils',
    'utils'
], function (_, testUtils, mockPrivateServicesHelper, classicsUtils, utils) {
    'use strict';

    var blogAppPartNames = utils.blogAppPartNames;

    describe('Wixapps classicsHelpers Document Services', function () {
        var applicationIdMock = 1000;

        function createPrivateServicesWithDescriptor(packageName, descriptor) {
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.updateClientSpecMap({
                type: packageName,
                applicationId: applicationIdMock,
                packageName: packageName
            });

            siteData.wixapps[packageName] = {
                descriptor: descriptor
            };
            return mockPrivateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        it('should get the appPart role', function () {
            var packageName = 'blog';
            var appPartName = blogAppPartNames.CUSTOM_FEED;
            var role = 'CUSTOM_FEED';
            var descriptor = {
                parts: [
                    {
                        id: appPartName,
                        role: role
                    }
                ]
            };
            var ps = createPrivateServicesWithDescriptor(packageName, descriptor);
            expect(classicsUtils.getAppPartRole(ps, packageName, appPartName)).toEqual(role);
        });

        it('should get the appPart definition', function () {
            var packageName = 'blog';
            var appPartName = blogAppPartNames.CUSTOM_FEED;
            var appPartDefinition = {
                id: appPartName
            };
            var descriptor = {
                parts: [
                    appPartDefinition
                ]
            };
            var ps = createPrivateServicesWithDescriptor(packageName, descriptor);
            expect(classicsUtils.getAppPartDefinition(ps, packageName, appPartName)).toEqual(appPartDefinition);
        });

        it('should not throw getting app part role if descriptor is missing', function () {
            expect(function () {
                classicsUtils.getAppPartRole(
                    mockPrivateServicesWithoutDescriptor(getExamplePackageName()),
                    getExamplePackageName(),
                    getExampleAppPartName());
            }).not.toThrow();
        });

        it('should not throw getting app part definition if descriptor is missing', function () {
            expect(function () {
                classicsUtils.getAppPartDefinition(
                    mockPrivateServicesWithoutDescriptor(getExamplePackageName()),
                    getExamplePackageName(),
                    getExampleAppPartName());
            }).not.toThrow();
        });

        it('should get package name ', function () {
            var packageName = 'blog';
            var ps = createPrivateServicesWithDescriptor(packageName, {});

            expect(classicsUtils.getPackageName(ps, applicationIdMock)).toEqual(packageName);
        });

        it('should fail getting package name if appId is wrong', function () {
            var packageName = 'blog';
            var ps = createPrivateServicesWithDescriptor(packageName, {});
            expect(classicsUtils.getPackageName(ps, 'wrong-app-id')).toBe(undefined);
        });

        function mockPrivateServicesWithoutDescriptor(packageName) {
            var siteData = {
                wixapps: {}
            };
            siteData.wixapps[packageName] = {};
            return mockPrivateServicesHelper.mockPrivateServices(siteData);
        }

        function getExamplePackageName() {
            return 'blog';
        }

        function getExampleAppPartName() {
            return blogAppPartNames.CUSTOM_FEED;
        }
    });
});
