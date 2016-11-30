define(['lodash', 'tpaIntegrationEditor/driver/driver', 'tpaIntegrationEditor/driver/pingpong', 'jasmine-boot'], function (_, driver, Pingpong) {
    'use strict';

    describe('addEventListenerRunner', function () {
        var appDefId = '13ed1d40-eab6-853c-c84d-056d2e6ed2e6';

        function addComp(callback) {
            var msg = {
                data: {
                    componentType: 'WIDGET',
                    widget: {
                        tpaWidgetId: 'aaa'
                    }
                }
            };
            driver.addComponent(appDefId, msg, function (compId) {
                var comp = new Pingpong(compId);
                comp.onReady(function () {
                    comp.injectScript(driver.getSDKUrl(), 'head')
                        .then(function () {
                            callback(comp, compId);
                        });
                });
            });
        }

        it('should call listener for COMPONENT_DELETED', function (done) {
            addComp(function (comp, compId) {
                comp.request('Wix.addEventListener', 'COMPONENT_DELETED', function () {
                    expect(true).toBe(true);
                }).then(function () {
                    driver.deleteComponentByCompId(compId);
                    done();
                });
            });
        });

        describe('events', function () {

            afterEach(function () {
                driver.closeAllPanels();
            });

            it('should call listener for SITE_PUBLISHED', function (done) {
                addComp(function (comp, compId) {
                    comp.request('Wix.addEventListener', 'SITE_PUBLISHED', function () {
                        expect(true).toBe(true);
                    }).then(function () {
                        driver.publish();
                        done();
                    });
                });
            });

            it('should call listener for SETTINGS_UPDATED', function (done) {
                addComp(function (comp, compId) {
                    comp.request('Wix.addEventListener', 'SETTINGS_UPDATED', function (data) {
                        expect(data).toBe('message');
                    }).then(function () {
                        driver.postMessage(appDefId, {
                            data: {
                                message: 'message',
                                compId: compId
                            }
                        });
                        done();
                    });
                });
            });

/*
            it('should call listener for EDIT_MODE_CHANGE', function (done) {
                addComp(function (comp, compId) {
                    comp.request('Wix.addEventListener', 'EDIT_MODE_CHANGE', function (mode) {
                        expect(mode).toEqual({
                            editMode: 'preview'
                        });
                    }).then(function () {
                        driver.editModeChange(true);
                        done();
                    });
                });
            });
*/

            it('should call listener for THEME_CHANGE', function (done) {
                addComp(function (comp, compId) {
                    comp.request('Wix.addEventListener', 'THEME_CHANGE', function (changedData) {
                        expect(changedData).toEqual({
                            fonts: jasmine.any(Object),
                            siteColors: jasmine.any(Object),
                            siteTextPresets: jasmine.any(Object),
                            style: jasmine.any(Object)
                        });
                    }).then(function () {
                        driver.setStyleParam({
                            compId: compId,
                            data: {
                                key: 'oddRowBackground_1',
                                type: 'color',
                                param: {
                                    value: {
                                        cssColor: 'color-1'
                                    }
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it('should call listener for DEVICE_TYPE_CHANGED', function (done) {
                addComp(function (comp, compId) {
                    comp.request('Wix.addEventListener', 'DEVICE_TYPE_CHANGED', function (device) {
                       expect(device).toEqual({
                           deviceType: 'mobile'
                       });
                    }).then(function () {
                        driver.changeDeviceType('mobile');
                        done();
                    });
                });
            });

            //only for glued
            //it('should call listener for WINDOW_PLACEMENT_CHANGED', function (done) {
            //    comp.request('Wix.addEventListener', 'WINDOW_PLACEMENT_CHANGED', function (data) {
            //        expect(data).toEqual({});
            //        done();
            //    }).then(function () {
            //        driver.selectCompByCompId(compId);
            //        driver.setWindowPlacement({
            //            compId: compId,
            //            data: {
            //                compId: compId,
            //                placement: 'CENTER_LEFT'
            //            }
            //        });
            //    });
            //});
        });

        // DON'T SAVE!!
        //describe('SITE_SAVED', function(){
        //    it('should call listener for SITE_SAVED', function (done) {
        //        addComp(function (comp, compId) {
        //            comp.request('Wix.addEventListener', 'SITE_SAVED', function () {
        //                expect(true).toBe(true);
        //            }).then(function () {
        //                driver.save(_.noop, function () {
        //                    done(false);
        //                });
        //                done();
        //            });
        //        });
        //    });
        //});
    });
});
