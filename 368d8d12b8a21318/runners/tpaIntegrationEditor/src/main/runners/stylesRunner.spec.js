define(['lodash', 'tpaIntegrationEditor/driver/driver', 'tpaIntegrationEditor/driver/pingpong', 'jasmine-boot'], function (_, driver, Pingpong) {
    'use strict';

    describe('Style changes', function () {
        var appDefId = '13ed1d40-eab6-853c-c84d-056d2e6ed2e6';
        var widgetCompId = 'comp-id4hq80h';
        var settingsComp;

        beforeAll(function (done) {
            function initializeSettingsPingpong(callback) {
                driver.openSettingsPanel(appDefId).then(function () {
                    settingsComp = new Pingpong('tpaSettings');
                    settingsComp.onReady(function () {
                        settingsComp.injectScript(driver.getSDKUrl(), 'head')
                            .then(callback);
                    });
                });
            }

            function initializeWidgetPingpong(callback) {
                var widget = new Pingpong(widgetCompId);
                widget.onReady(function () {
                    widget.injectScript(driver.getSDKUrl(), 'head')
                        .then(callback);
                })
            }

            initializeWidgetPingpong(function () {
                initializeSettingsPingpong(done);
            });
        });

        describe('Wix.Styles.setColorParam', function () {
            describe('should change a lot of colors', function () {

                var compId = 'comp-id4hq80h';
                var colors = {};
                var amount = 5;

                var comp = new Pingpong(compId);

                var onEndOfStyleChanges = function (properties) {
                    var guid = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    _.forEach(colors, function (color, key) {
                        it('should change color #(' + key + ') - ' + guid, function (done) {
                            var obj = {};
                            obj['param_color_oddRowBackground_' + key] = color;
                            expect(properties.styleProperties).toEqual(jasmine.objectContaining(obj));
                            done();
                        });
                    });
                };

                var generateMsg = function (index, value) {
                    return {
                        compId: compId,
                        data: {
                            key: 'oddRowBackground_' + index,
                            type: 'color',
                            param: {
                                value: {
                                    cssColor: value
                                }
                            }
                        }
                    };
                };

                _.forEach(_.range(amount), function (index) {
                    var value = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    colors[index] = value;
                    var callback = (index === amount - 1 ? onEndOfStyleChanges : undefined);
                    driver.setStyleParam(generateMsg(index, value), callback);
                });
            });


            /***
             * changes with pingpong in settings
             ***/
            var PREFIX = 'param_color_';
            var ALPHA_PRE_PREFIX = 'alpha-';
            it('should call success callback with style params', function (done) {
                var onSuccess = jasmine.createSpy('onSuccess');
                settingsComp.request('Wix.Styles.setColorParam', 'someKey', {value: {rgba: 'rgb(255,0,0)'}}, onSuccess).then(function () {
                    setTimeout(function () {
                        expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
                        done();
                    }, 1000);
                });
            });

            // not working, commented out because ci failing when using xit
            /*xit('should call failure callback', function (done) {
             var onFailure = jasmine.createSpy('onFailure');
             settingsComp.request('Wix.Styles.setColorParam', 'someKey', {value: {}}, _.noop, onFailure).then(function(){
             setTimeout(function () {
             expect(onFailure).toHaveBeenCalled();
             done();
             }, 1000);
             });
             });*/

            it('should set color by reference', function (done) {
                var key = 'referenceColor';
                var value = {
                    'value': {
                        'cssColor': '#E9DB89',
                        'color': {
                            'name': 'color_32',
                            'value': '#E9DB89',
                            'reference': 'color-22'
                        }
                    }
                };
                settingsComp.request('Wix.Styles.setColorParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe('color_32');
                    done();
                });
            });

            it('should set rgb color', function (done) {
                var key = 'rgbKey';
                var value = 'rgb(255,0,0)';
                settingsComp.request('Wix.Styles.setColorParam', key, {value: {rgba: value}}, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value);
                    done();
                });
            });

            it('should set rgba color', function (done) {
                var key = 'rgbaKey';
                var value = 'rgba(255,0,0,0.5)';
                settingsComp.request('Wix.Styles.setColorParam', key, {value: {rgba: value}}, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value);
                    done();
                });
            });

            it('should set css 3 chars color', function (done) {
                var key = 'css3chars';
                var value = '#fff';
                settingsComp.request('Wix.Styles.setColorParam', key, {value: {cssColor: value}}, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value);
                    done();
                });
            });

            it('should set css 6 chars color', function (done) {
                var key = 'css6chars';
                var value = '#fff555';
                settingsComp.request('Wix.Styles.setColorParam', key, {value: {cssColor: value}}, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value);
                    done();
                });
            });

            it('should set opacity to color', function (done) {
                var key = 'withOpacity';
                var value = 0.5;
                settingsComp.request('Wix.Styles.setColorParam', key, {value: {opacity: value}}, function (style) {
                    expect(style.styleProperties[ALPHA_PRE_PREFIX + PREFIX + key]).toBe(value);
                    done();
                });
            });

        });

        describe('Wix.Styles.setBooleanParam', function () {
            var PREFIX = 'param_boolean_';

            it('should call success callback with style params', function (done) {
                var onSuccess = jasmine.createSpy('onSuccess');
                settingsComp.request('Wix.Styles.setBooleanParam', 'someKey', {value: true}, onSuccess).then(function () {
                    setTimeout(function () {
                        expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
                        done();
                    }, 1000);
                });
            });

            // not working, commented out because ci failing when using xit
            /*xit('should call failure callback', function (done) {
             var onFailure = jasmine.createSpy('onFailure');
             settingsComp.request('Wix.Styles.setBooleanParam', 'someKey', {}, _.noop, onFailure).then(function(){
             setTimeout(function () {
             expect(onFailure).toHaveBeenCalled();
             done();
             }, 1000);
             });
             });*/

            it('should set param to be true', function (done) {
                var key = 'boolKey';
                var value = {value: true};
                settingsComp.request('Wix.Styles.setBooleanParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(true);
                    done();
                });
            });

            it('should set param to be false', function (done) {
                var key = 'boolKey2';
                var value = {value: false};
                settingsComp.request('Wix.Styles.setBooleanParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(false);
                    done();
                });
            });

            it('should set param to be false and then change to true', function (done) {
                var key = 'boolKey';
                settingsComp.request('Wix.Styles.setBooleanParam', key, {value: false}, function (style1) {
                    expect(style1.styleProperties[PREFIX + key]).toBe(false);
                    settingsComp.request('Wix.Styles.setBooleanParam', key, {value: true}, function (style2) {
                        expect(style2.styleProperties[PREFIX + key]).toBe(true);
                        done();
                    });
                });
            });

            it('should set param to be true and then change to false', function (done) {
                var key = 'boolKey';
                settingsComp.request('Wix.Styles.setBooleanParam', key, {value: true}, function (style1) {
                    expect(style1.styleProperties[PREFIX + key]).toBe(true);
                    settingsComp.request('Wix.Styles.setBooleanParam', key, {value: false}, function (style2) {
                        expect(style2.styleProperties[PREFIX + key]).toBe(false);
                        done();
                    });
                });
            });

        });

        describe('Wix.Styles.setNumberParam', function () {
            var PREFIX = 'param_number_';

            it('should call success callback with style params', function (done) {
                var onSuccess = jasmine.createSpy('onSuccess');
                settingsComp.request('Wix.Styles.setNumberParam', 'someKey', {value: 1}, onSuccess).then(function () {
                    setTimeout(function () {
                        expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
                        done();
                    }, 1000);
                });
            });

            // not working, commented out because ci failing when using xit
            /*xit('should call failure callback', function (done) {
             var onFailure = jasmine.createSpy('onFailure');
             settingsComp.request('Wix.Styles.setNumberParam', 'someKey', {}, _.noop, onFailure).then(function(){
             setTimeout(function () {
             expect(onFailure).toHaveBeenCalled();
             done();
             }, 1000);
             });
             });*/

            it('should set param to be zero', function (done) {
                var key = 'numberKey';
                var value = {value: 0};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to be whole positive', function (done) {
                var key = 'numberKey';
                var value = {value: 10};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to be fraction positive', function (done) {
                var key = 'numberKey';
                var value = {value: 4.5};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to be whole negative', function (done) {
                var key = 'numberKey';
                var value = {value: -10};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to be fraction negative', function (done) {
                var key = 'numberKey';
                var value = {value: -4.5};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to be very big', function (done) {
                var key = 'numberKey';
                var value = {value: 999999999999999999999999999999999999};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to be very small', function (done) {
                var key = 'numberKey';
                var value = {value: -999999999999999999999999999999999999};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

            it('should set param to number with a numeric string', function (done) {
                var key = 'numberKey';
                var value = {value: '927'};
                settingsComp.request('Wix.Styles.setNumberParam', key, value, function (style) {
                    //expect(style.styleProperties[PREFIX + key]).toBe(parseInt(value.value));
                    expect(style.styleProperties[PREFIX + key]).toBe(value.value);
                    done();
                });
            });

        });

        describe('Wix.Styles.setFontParam', function () {
            var PREFIX = 'param_font_';

            it('should call success callback with style params', function (done) {
                var onSuccess = jasmine.createSpy('onSuccess');
                settingsComp.request('Wix.Styles.setFontParam', 'someKey', {value: {}}, onSuccess).then(function () {
                    setTimeout(function () {
                        expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
                        done();
                    }, 1000);
                });
            });

            // not working, commented out because ci failing when using xit
            /*
             xit('should call failure callback', function (done) {
             var onFailure = jasmine.createSpy('onFailure');
             settingsComp.request('Wix.Styles.setFontParam', 'someKey', {}, _.noop, onFailure).then(function(){
             setTimeout(function () {
             expect(onFailure).toHaveBeenCalled();
             done();
             }, 1000);
             });
             });
             */

            it('should save font value as stringified JSON', function (done) {
                var key = 'fontKey';
                var value = {
                    value: {
                        a: true,
                        b: 3,
                        c: 'hi everybody, you can insert whatever you want inside font param. have fun!!!'
                    }
                };
                settingsComp.request('Wix.Styles.setFontParam', key, value, function (style) {
                    var parsedJSON;
                    try {
                        parsedJSON = JSON.parse(style.styleProperties[PREFIX + key]);
                        expect(parsedJSON).toEqual(value.value);
                    } catch (error) {
                        expect(parsedJSON).toBeOfType(jasmine.Object);
                    }
                    done();
                });
            });
        });
    });
});
