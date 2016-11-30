define(['testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/componentsMetaData/components/tpaSectionMetaData'],
    function (testUtils, privateServicesHelper, tpaSectionMetaData) {
        'use strict';

        describe('tpaSectionMetaData', function () {
            var mockPrivateServices, comp, appData, compData, mockSiteData, pageId;

            beforeEach(function () {
                compData = {
                    "id": "dataItem-iv6h1ao7",
                    "type": "TPA",
                    "applicationId": "4467",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "widgetId": null,
                    "referenceId": ""
                };
                appData = {
                    "type": "editor",
                    "applicationId": 4467,
                    "appDefinitionId": "1443ef19-b4f6-8f8a-7e7c-3e8daf8715dd",
                    "appDefinitionName": "widget_and_section",
                    "sectionUrl": "http://naamaaharoni.github.io/Kickstart/website",
                    "sectionMobileUrl": "http://naamaaharoni.github.io/Kickstart/website",
                    "sectionPublished": true,
                    "sectionMobilePublished": false,
                    "sectionSeoEnabled": true,
                    "sectionDefaultPage": "",
                    "sectionRefreshOnWidthChange": true,
                    "widgets": {
                        "14470e75-e13b-0dd3-bccb-8d5793bed0eb": {
                            "widgetUrl": "http://naamaaharoni.github.io/Kickstart/website",
                            "widgetId": "14470e75-e13b-0dd3-bccb-8d5793bed0eb",
                            "refreshOnWidthChange": true,
                            "gluedOptions": null,
                            "mobileUrl": "http://naamaaharoni.github.io/Kickstart/website",
                            "appPage": {
                                "id": "testpage",
                                "name": "testpage$naama",
                                "defaultPage": "",
                                "hidden": false,
                                "multiInstanceEnabled": false,
                                "order": 1,
                                "indexable": true,
                                "fullPage": false,
                                "hideFromMenu": false
                            },
                            "published": true,
                            "mobilePublished": false,
                            "seoEnabled": true,
                            "preFetch": false,
                            "defaultWidth": null,
                            "defaultHeight": null,
                            "defaultShowOnAllPages": false,
                            "settings": {
                                "height": 750,
                                "width": 600,
                                "url": "http://naamaaharoni.github.io/Kickstart/website",
                                "urlV2": null,
                                "onboardingUrl": null,
                                "version": 1
                            },
                            "autoAddToSite": false,
                            "defaultPosition": null,
                            "tpaWidgetId": null,
                            "canBeStretched": true,
                            "shouldBeStretchedByDefault": true,
                            "shouldBeStretchedByDefaultMobile": true,
                            "santaEditorPublished": false
                        },
                        "148393f9-f2e5-ab24-8f42-e47be7d82bdf": {
                            "widgetUrl": "http://naamaaharoni.github.io/Kickstart/website",
                            "widgetId": "148393f9-f2e5-ab24-8f42-e47be7d82bdf",
                            "refreshOnWidthChange": true,
                            "gluedOptions": null,
                            "mobileUrl": null,
                            "appPage": null,
                            "published": true,
                            "mobilePublished": false,
                            "seoEnabled": true,
                            "preFetch": false,
                            "defaultWidth": 250,
                            "defaultHeight": 250,
                            "defaultShowOnAllPages": false,
                            "settings": {
                                "height": 750,
                                "width": 600,
                                "url": "http://naamaaharoni.github.io/Kickstart/website",
                                "urlV2": null,
                                "onboardingUrl": null,
                                "version": 1
                            },
                            "autoAddToSite": false,
                            "defaultPosition": null,
                            "tpaWidgetId": "widget",
                            "canBeStretched": false,
                            "shouldBeStretchedByDefault": false,
                            "santaEditorPublished": false
                        }
                    }
                };

                mockSiteData = testUtils.mockFactory.mockSiteData().updateClientSpecMap(appData);
                mockPrivateServices = privateServicesHelper.mockPrivateServices(mockSiteData);
                pageId = mockSiteData.getCurrentUrlPageId();
                comp = testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData});
            });

            it('should return true for stretchHorizontally if app is marked as stretched by default on mobile in case widgetId does not exist', function () {
                var stretchHorizontally = tpaSectionMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp, 'mainPage');

                expect(stretchHorizontally).toBe(true);
            });

            it('should return true for stretchHorizontally if app is marked as stretched by default on mobile in case widgetId does exist', function () {
                compData.widgetId = '14470e75-e13b-0dd3-bccb-8d5793bed0eb';
                comp = testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: compData});

                var stretchHorizontally = tpaSectionMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp, 'mainPage');

                expect(stretchHorizontally).toBe(true);
            });

            it('should return false for stretchHorizontally if app is not marked as stretched by default on mobile', function () {
                appData.widgets['14470e75-e13b-0dd3-bccb-8d5793bed0eb'].shouldBeStretchedByDefaultMobile = false;

                var stretchHorizontally = tpaSectionMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp, 'mainPage');

                expect(stretchHorizontally).toBe(false);
            });

            it('should return false if comp is not tpa', function () {
                var comp2 = testUtils.mockFactory.mockComponent('tpa.viewer.components.tpapps.TPAWidget', mockSiteData, pageId, {data: {'id': 'dataItem-iv6h1ao7'}});

                var stretchHorizontally = tpaSectionMetaData.mobileConversionConfig.stretchHorizontally(mockPrivateServices, comp2, 'mainPage');

                expect(stretchHorizontally).toBe(false);
            });
        });
    });
