define(['lodash', 'tpaIntegrationEditor/driver/driver', 'tpaIntegrationEditor/driver/pingpong', 'jasmine-boot'], function (_, driver, Pingpong) {
    'use strict';

    var appDefId = '13ed1d40-eab6-853c-c84d-056d2e6ed2e6';
    var settingsComp;

    beforeAll(function (done) {
        driver.openSettingsPanel(appDefId).then(function () {
            settingsComp = new Pingpong('tpaSettings');
            settingsComp.onReady(function () {
                settingsComp.injectScript(driver.getSDKUrl(), 'head')
                    .then(done)
            });
        });
    });

    var openFontPicker = function (options, callback) {
        options = _.defaults({
            "title": "Title style and color",
            "left": 370,
            "top": 94,
            "wixParam": "design_titleFont",
            "startWithTheme": "font_2"
        }, options);

        settingsComp.request('Wix.Styles.openFontPicker', options, function () {
            debugger;
        }).then(function () {
            driver.waitForDomElement('.settings-panel.tool-panel-frame', 10, 1000, 'failed to open font picker frame.')
                .then(callback);
        });
    };

    var closeFontPicker = function () {
        driver.closePanelByName('tpaPanels.uiLib.uiLibTextParamDesignPanel')
    };

    describe('uiLibTextParamDesignPanel', function () {
        it('should open font picker', function (done) {
            openFontPicker({}, function () {
                expect(true).toBeTruthy();
                closeFontPicker();
                done();
            })
        });

        describe('hide style', function () {

            afterEach(closeFontPicker);

            it('should show text style options', function (done) {
                openFontPicker({hideStyle: undefined}, function (fontPicker) {
                    expect($('.style-options').length).toBe(1);
                    done();
                })
            });

            it('should hide text style options', function (done) {
                openFontPicker({hideStyle: true}, function () {
                    expect($('.style-options').length).toBe(0);
                    done();
                })
            })
        });
    });
});
