define(['tpa/utils/tpaUtils'], function (tpaUtils) {
    'use strict';

    describe('TPA Utils', function () {
        describe('getCacheKiller', function () {
            it('should get random cache killer', function () {
                var killer = tpaUtils.getCacheKiller();

                expect(killer).toBeDefined();
            });
        });

        describe('getAppDefId', function () {
            var siteAPI;
            var appDefIdMock = 'app-def-id';
            var compId = 'comp-id';
            var compMock = {
                props: {
                    compData: {
                        applicationId: '20'
                    }
                }
            };

            beforeEach(function () {
                siteAPI = {
                    getComponentById: jasmine.createSpy().and.returnValue(compMock),
                    getSiteData: jasmine.createSpy().and.returnValue({
                        getClientSpecMapEntry: jasmine.createSpy().and.returnValue({
                            appDefinitionId: appDefIdMock
                        })
                    })
                };
            });

            it('should get the app definition ID of a given component ID', function () {
                var appDefId = tpaUtils.getAppDefId(siteAPI, compId);

                expect(appDefId).toEqual(appDefIdMock);
            });
        });

        describe('stripPubSubPrefix', function () {
            var naked;

            beforeEach(function () {
                naked = 'id';
            });

            it('should remove PubSub prefix', function () {
                var str = tpaUtils.stripPubSubPrefix(tpaUtils.Constants.TPA_PUB_SUB_PREFIX + naked);

                expect(str).toEqual(naked);
            });

            it('should return the same string', function () {
                var str = tpaUtils.stripPubSubPrefix(naked);

                expect(str).toEqual(naked);
            });

            it('should remove only the prefix', function () {
                var str = tpaUtils.stripPubSubPrefix(tpaUtils.Constants.TPA_PUB_SUB_PREFIX + naked + tpaUtils.Constants.TPA_PUB_SUB_PREFIX);

                expect(str).toEqual(naked + tpaUtils.Constants.TPA_PUB_SUB_PREFIX);
            });
        });

        describe('addPubSubEventPrefix', function () {
            var naked;

            beforeEach(function () {
                naked = 'id';
            });

            it('should add PubSub prefix', function () {
                var str = tpaUtils.addPubSubEventPrefix(naked);

                expect(str).toEqual(tpaUtils.Constants.TPA_PUB_SUB_PREFIX + naked);
            });
        });

        describe('isTPASection', function () {
            var compMock;

            beforeEach(function () {
                compMock = {
                    props: {
                        structure: {
                            componentType: ''
                        }
                    }
                };
            });

            it('should be true for TPASection', function () {
                compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPASection';

                expect(tpaUtils.isTPASection(compMock)).toBeTruthy();
            });

            it('should be true for TPAMultiSection', function () {
                compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAMultiSection';

                expect(tpaUtils.isTPASection(compMock)).toBeTruthy();
            });

            it('should be false for TPAWidget', function () {
                compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';

                expect(tpaUtils.isTPASection(compMock)).toBeFalsy();
            });
        });

        describe('sdkVersionIsAtLeast', function () {
            it('should support none valid version numbers', function () {
                expect(tpaUtils.sdkVersionIsAtLeast('foo', 'bar')).not.toBeTruthy();
                expect(tpaUtils.sdkVersionIsAtLeast(undefined, null)).not.toBeTruthy();
            });

            it('should support none valid currentVersion number', function () {
                expect(tpaUtils.sdkVersionIsAtLeast('foo', '1.1.1')).not.toBeTruthy();
            });

            it('should support none valid requiredVersion number', function () {
                expect(tpaUtils.sdkVersionIsAtLeast('1.1.1', 'foo')).not.toBeTruthy();
            });

            it('should support major.minor.revision', function () {
                expect(tpaUtils.sdkVersionIsAtLeast('1.1.1', '1.1.1')).toBeTruthy();
                expect(tpaUtils.sdkVersionIsAtLeast('1.1.1', '1.1.0')).toBeTruthy();
                expect(tpaUtils.sdkVersionIsAtLeast('1.1.0', '1.1.1')).not.toBeTruthy();
            });
        });

        describe('getInstance', function() {

            var comp = {
                props: {
                    compData: {
                        applicationId: 15
                    }
                }
            };

            it('should support non valid appId', function() {
                var siteAPI = {
                    getComponentById: function() { return comp; },
                    getSiteData: jasmine.createSpy().and.returnValue({
                        getClientSpecMap: function() {
                            return {};
                        }
                    })
                };
                var instance = tpaUtils.getInstance(siteAPI);
                expect(instance).toBeUndefined();
            });

            xit('should support valid appId', function() {
                var siteAPI = {
                    getComponentById: function() { return comp; },
                    getSiteData: function() {
                        return {
                            getClientSpecMap: function () {
                                return {
                                    15: {
                                        appDefinitionId: "12aacf69-f3fb-5334-2847-e00a8f13c12f",
                                        appDefinitionName: "Form Builder",
                                        instance: "hello.eyJpbnN0YW5jZUlkIjoiMTIzNCJ9"
                                    }
                                };
                            }
                        };
                    }
                };
                var instance = tpaUtils.getInstance(siteAPI, 15);
                expect(instance.instanceId).toEqual("1234");
            });

        });

        describe('getVisitorUuid', function() {

            it('should return empty string in case wix cookie is missing', function() {
                    var utils = {
                        cookieUtils: {
                            getCookie: jasmine.createSpy().and.returnValue(undefined)
                        }
                    };
                    var vuuid = tpaUtils.getVisitorUuid(utils);
                    expect(vuuid).toBeDefined();
            });

            it('should return valid uuid in case wix cookie exists', function() {
                var utils = {
                    cookieUtils: {
                        getCookie: jasmine.createSpy().and.returnValue("897853544|1129e7da-459f-4914-b7f5-5377bd98ea8e")
                    }
                };
                var vuuid = tpaUtils.getVisitorUuid(utils);
                expect(vuuid).toBe('1129e7da-459f-4914-b7f5-5377bd98ea8e');
            });

            it('should return valid output in case wix cookie with no pipe', function() {
                var utils = {
                    cookieUtils: {
                        getCookie: jasmine.createSpy().and.returnValue("1129e7da-459f-4914-b7f5-5377bd98ea8e")
                    }
                };
                var vuuid = tpaUtils.getVisitorUuid(utils);
                expect(vuuid).toBe('1129e7da-459f-4914-b7f5-5377bd98ea8e');
            });

        });

        describe('isPageMarkedAsHideFromMenu', function () {

            beforeEach(function () {
                this.appData = {
                    widgets: {
                        widget1: {
                            appPage: {
                                id: 'product_page'
                            }
                        }
                    }
                };
            });

            it('should return true if hideFromMenu flag is true', function () {
                this.appData.widgets.widget1.appPage.hideFromMenu = true;

                expect(tpaUtils.isPageMarkedAsHideFromMenu(this.appData, 'product_page')).toBe(true);
            });

            it('should return false if hideFromMenu flag is false', function () {
                this.appData.widgets.widget1.appPage.hideFromMenu = false;

                expect(tpaUtils.isPageMarkedAsHideFromMenu(this.appData, 'product_page')).toBe(false);
            });

            it('should return true if hideFromMenu flag is true for multi mutli section', function () {
                this.appData.widgets.widget1.appPage.hideFromMenu = true;

                expect(tpaUtils.isPageMarkedAsHideFromMenu(this.appData, 'product_page$TPA$TPASection_iqaqcd6z')).toBe(true);
            });

            it('should return false if there are no sections', function () {
                delete this.appData.widgets.widget1.appPage;

                expect(tpaUtils.isPageMarkedAsHideFromMenu(this.appData, 'product_page')).toBe(false);
            });

            it('should return false if there is no section with the same tpaPageId', function () {
                this.appData.widgets.widget1.appPage.id = '111';

                expect(tpaUtils.isPageMarkedAsHideFromMenu(this.appData, 'product_page')).toBe(false);
            });

        });
    });
});
