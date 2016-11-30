define(['lodash', 'tpaIntegrationEditor/driver/driver', 'tpaIntegrationEditor/driver/pingpong', 'tpaIntegrationEditor/driver/snapshot', 'jasmine-boot'], function (_, driver, Pingpong, snapshot) {
    'use strict';

    describe('editor UI lib Runner', function () {
        var appDefId = '13ed1d40-eab6-853c-c84d-056d2e6ed2e6';
        var widgetCompId = 'comp-is8yjs8o';
        var settingsComp;

        var MATCH_LEVEL_PERCENTAGE = 99.9;
        var IS_SAMPLE_MODE = false;

        function injectUILibComp(comp, props, children, callback) {
            children = children || null;
            var compRenderedId = 'COMP_DID_MOUNT_' + Math.random().toString(36).substr(2, 9);
            function componentDidMountCallback(message) {
                if (message.data === compRenderedId) {
                    window.removeEventListener("message", componentDidMountCallback);
                    callback();
                }
            }
            window.addEventListener("message", componentDidMountCallback);

            return settingsComp.injectScript({
                src: '' +
                'var componentRef;' +
                'var WrapperClass = React.createClass({' +
                    'componentDidMount: function () {' +
                        'setTimeout(function(){' +
                            'parent.parent.postMessage("'+ compRenderedId +'", "*");' +
                        '}, 100);' +
                    '},' +
                    'render: function () {' +
                        'return React.createElement(UI.appSettings, {}, ' +
                            'React.createElement(UI.panelTabs, {defaultTabIndex: 0}, [' +
                                'React.createElement("div", {tab: "main"}, ' +
                                    'React.createElement(' + comp + ', {ref: (comp) => {componentRef = comp;},' + JSON.stringify(props).substr(1) + ', ' + children + ')' +
                                '),' +
                                'React.createElement("div", {tab: "dummy tab"}, null)' +
                            '])' +
                        ')' +
                    '}' +
                '});' +
                'ReactDOM.render(React.createElement(WrapperClass), $("#app-root")[0]);',
                inline: true
            });
        }

        beforeAll(function (done) {
            function initializeSettingsPingpong(callback) {
                driver.openSettingsPanel(appDefId).then(function () {
                    settingsComp = new Pingpong('tpaSettings');
                    settingsComp.onReady(function () {
                        settingsComp.injectDOM('<div id="app-root">settings app root</div>').then(function () {
                            settingsComp.injectScript([
                                driver.getSDKUrl(),
                                '//cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react-with-addons.min.js',
                                '//cdnjs.cloudflare.com/ajax/libs/react/15.3.1/react-dom.min.js',
                                '//code.jquery.com/jquery-2.1.4.min.js',
                                '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js',
                                '//static.parastorage.com/services/editor-ui-lib/1.20.0/lib/editor-ui-lib.min.js'
                            ]).then(function(){
                                // TODO: waiting for UI lib to be loaded, find a batter way to do it.
                                setTimeout(callback, 300);
                            });
                        });
                    });
                });
            }

            function initializeWidgetPingpong(callback) {
                var widget = new Pingpong(widgetCompId);
                widget.onReady(function () {
                    widget.injectScript(driver.getSDKUrl())
                        .then(callback);
                })
            }

            initializeWidgetPingpong(function () {
                initializeSettingsPingpong(done);
            });
        });

        it('should display button correctly', function (done) {
            injectUILibComp('UI.button', {label: 'hello'}, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/button', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        it('should display checkbox correctly', function (done) {
            injectUILibComp('UI.checkbox', {label: 'Check me...', defaultValue: true}, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/checkbox', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        // TODO: add open action
        it('should display colorPickerSlider correctly', function (done) {
            injectUILibComp('UI.colorPickerSlider', {title: 'color picker with opacity', startWithColor: 'color-10', startWithOpacity: 0.7}, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/colorPickerSlider', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        // TODO: add open action
        it('should display colorPickerInput correctly', function (done) {
            injectUILibComp('UI.colorPickerInput', {title: 'color picker', startWithColor: 'color-10'}, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/colorPickerInput', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        it('should display dock correctly', function (done) {
            injectUILibComp('UI.dock', {title: 'dock', defaultValue: 'TOP_RIGHT'}, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/dock', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        // TODO: add open action
        it('should display dropDownSelect correctly', function (done) {
            injectUILibComp('UI.dropDownSelect', {
                title: 'drop down select', defaultValue: "1", options: [
                    {value: '1', label: 'main'},
                    {value: '2', label: 'sub level 1', className: 'level1'},
                    {value:'3', label: 'sub 2 level 1', className: 'level1'},
                    {value:'4', label: 'sub level 2'}]
            }, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/dropDownSelect', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        describe('fontAndColorPicker including font & color picker editor panels', function () {
            describe('startWithTheme', function () {
                var wixParam = 'wix-param-fontAndColorPicker-startWithTheme',
                    title = 'font and color',
                    color_ref = 'color_26',
                    color_name = 'color_16',
                    theme = 'font_6';

                afterEach(function () {
                    driver.closePanelByName('panels.toolPanels.colorPicker.colorPickerPanel');
                    driver.closePanelByName('tpaPanels.uiLib.uiLibTextParamDesignPanel');
                });

                it('should display the component', function (done) {
                    injectUILibComp('UI.fontAndColorPicker', {
                        title: title,
                        startWithColor: color_ref,
                        startWithTheme: theme,
                        'wix-param': wixParam
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/fontAndColorPicker-startWithTheme', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should open font picker panel', function (done) {
                    settingsComp.request('Wix.Styles.openFontPicker', {
                        title: title,
                        wixParam: wixParam
                    }).then(function () {
                        driver.waitForDomElement('.ui-lib-text-design-panel', 10, 100).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/fontPickerPanel-startWithTheme', '.ui-lib-text-design-panel', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    })
                });

                it('should open colorPicker panel', function (done) {
                    settingsComp.request('Wix.Styles.openColorPicker', {
                        title: title,
                        wixParam: wixParam,
                        color: color_name
                    }).then(function () {
                        driver.waitForDomElement('.color-picker-panel', 10, 100).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/colorPickerPanel-startWithColor', '.color-picker-panel', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    })
                });
            })

            describe('startWithfFont', function () {
                var wixParam = 'wix-param-fontAndColorPicker-startWithFont',
                    title = 'font and color',
                    color_ref = 'color_26',
                    font = 'Georgia';

                afterEach(function () {
                    driver.closePanelByName('tpaPanels.uiLib.uiLibTextParamDesignPanel');
                });

                it('should display the component', function (done) {
                    injectUILibComp('UI.fontAndColorPicker', {
                        title: title,
                        startWithColor: color_ref,
                        startWithFont: font,
                        'wix-param': wixParam
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/fontAndColorPicker-startWithFont', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should open font picker panel', function (done) {
                    settingsComp.request('Wix.Styles.openFontPicker', {
                        title: title,
                        wixParam: wixParam
                    }).then(function () {
                        driver.waitForDomElement('.ui-lib-text-design-panel', 10, 100).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/fontPickerPanel-startWithFont', '.ui-lib-text-design-panel', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    })
                });
            });

            describe('startWithfFont - hideTheme', function () {
                var wixParam = 'wix-param-fontAndColorPicker-startWithFont-hideTheme',
                    title = 'font and color',
                    color_ref = 'color_26',
                    font = 'Georgia';

                afterEach(function () {
                    driver.closePanelByName('tpaPanels.uiLib.uiLibTextParamDesignPanel');
                });

                it('should display the component', function (done) {
                    injectUILibComp('UI.fontAndColorPicker', {
                        title: title,
                        startWithColor: color_ref,
                        startWithFont: font,
                        hideTheme: true,
                        'wix-param': wixParam
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/fontAndColorPicker-startWithFont-hideTheme', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should open font picker panel', function (done) {
                    settingsComp.request('Wix.Styles.openFontPicker', {
                        title: title,
                        hideTheme: true,
                        wixParam: wixParam
                    }).then(function () {
                        driver.waitForDomElement('.ui-lib-text-design-panel', 10, 100).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/fontPickerPanel-startWithFont-hideTheme', '.ui-lib-text-design-panel', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    })
                });
            });

            describe('open font panel with hide[size/style/theme/font]', function () {
                var wixParam = 'wix-param-fontAndColorPicker-hide-things',
                    title = 'font and color',
                    color_ref = 'color_26',
                    font = 'Georgia';

                afterAll(function () {
                    driver.closePanelByName('tpaPanels.uiLib.uiLibTextParamDesignPanel');
                });

                it('should display the component', function (done) {
                    injectUILibComp('UI.fontAndColorPicker', {
                        title: title,
                        startWithColor: color_ref,
                        startWithFont: font,
                        hideTheme: true,
                        'wix-param': wixParam
                    }, null, done);
                });

                _.forEach(['size','style','theme','font'], function (propToHide) {
                    it('should open font picker panel with ' + propToHide + ' hidden', function (done) {
                        settingsComp.request('Wix.Styles.openFontPicker', {
                            title: title,
                            hideSize: propToHide === 'size',
                            hideStyle: propToHide === 'style',
                            hideTheme: propToHide === 'theme',
                            hideFont: propToHide === 'font',
                            wixParam: wixParam
                        }).then(function () {
                            driver.waitForDomElement('.ui-lib-text-design-panel', 10, 100).then(function () {
                                snapshot.takeSnapshot('editor-ui-lib/fontPickerPanel-fontPickerPanel-hide-things-' + propToHide, '.ui-lib-text-design-panel', IS_SAMPLE_MODE)
                                    .then(function (imageCompareData) {
                                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                        done();
                                    });
                            })
                        })
                    });

                });
            })
        });

        describe('fontPicker', function () {
            it('should display fontPicker - startWithTheme correctly', function (done) {
                injectUILibComp('UI.fontPicker', {
                    title: 'font and color',
                    startWithColor: 'color-15',
                    startWithTheme: 'font_6'
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/fontPicker-startWithTheme', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

            it('should display fontPicker - startWithFont correctly', function (done) {
                injectUILibComp('UI.fontPicker', {
                    title: 'font and color',
                    startWithColor: 'color-15',
                    startWithFont: 'Georgia'
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/fontPicker-startWithFont', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

            it('should display fontPicker - startWithFont - hideTheme correctly', function (done) {
                injectUILibComp('UI.fontPicker', {
                    title: 'font and color',
                    startWithColor: 'color-15',
                    startWithFont: 'Georgia',
                    hideTheme: true
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/fontPicker-startWithFont-hideTheme', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });
        })

        describe('image preview', function () {
            it('should display imagePreview correctly', function (done) {
                injectUILibComp('UI.imagePreview', {
                    label: 'image preview',
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/imagePreview', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

            it('should display imagePreview with buttons correctly', function (done) {
                injectUILibComp('UI.imagePreview', {
                    label: 'image preview',
                    buttons: [{
                        label: 'Add Image',
                        icon: 'plus'
                    }]
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/imagePreview|buttons', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

/*
            it('should display imagePreview with initial image correctly', function (done) {
                injectUILibComp('UI.imagePreview', {
                    label: 'image preview',
                    value: [{
                        "fileName": "pexels-photo.jpg",
                        "relativeUri": "53efc0_8a3efd22dc9d44bd97f3b29b9b2f6e10.jpg",
                        "width": 288,
                        "height": 155
                    }]
                }, null, function () {
                    setTimeout(function () { // wait for image load
                        snapshot.takeSnapshot('editor-ui-lib/imagePreview|initialImageValue', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(matchLevel);
                                done();
                            });
                    }, 300)
                });
            });

            it('should display imagePreview with initial image and buttons correctly', function (done) {
                injectUILibComp('UI.imagePreview', {
                    label: 'image preview',
                    value: [{
                        "fileName": "pexels-photo.jpg",
                        "relativeUri": "53efc0_8a3efd22dc9d44bd97f3b29b9b2f6e10.jpg",
                        "width": 288,
                        "height": 155
                    }],
                    buttons: [{
                        label: 'Add Image',
                        icon: 'plus'
                    }]
                }, null, function () {
                    setTimeout(function () { // wait for image load
                        snapshot.takeSnapshot('editor-ui-lib/imagePreview|initialImageValue|buttons', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(matchLevel);
                                done();
                            });
                    }, 300)
                });
            });
*/

        });

        it('should display radioButtons correctly', function (done) {
            injectUILibComp('UI.radioButtons', {
                title: 'radio buttons',
                defaultValue: '2',
                options: [
                    { value: '1', label: 'first', className: 'classFirst'},
                    { value: '2', label: 'second', className: 'classSecond'},
                    { value: '3', label: 'third', className: 'classThird'}
                ]
            }, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/radioButtons', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        it('should display sectionDividerLabeled correctly', function (done) {
            injectUILibComp('UI.sectionDividerLabeled', {
                label: 'Section Divider',
                infoTitle: 'info title',
                infoLabel: 'info label'
            }, null, function () {
                snapshot.takeSnapshot('editor-ui-lib/sectionDividerLabeled', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                    .then(function (imageCompareData) {
                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                        done();
                    });
            });
        });

        describe('slider', function () {
            it('should display slider correctly', function (done) {
                injectUILibComp('UI.slider', {
                    title: 'slider'
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/slider', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

            it('should display slider with units correctly', function (done) {
                injectUILibComp('UI.slider', {
                    title: 'slider',
                    units: 'px'
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/slider-units', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

            it('should display slider with default value and range correctly', function (done) {
                injectUILibComp('UI.slider', {
                    title: 'slider',
                    defaultValue: 9,
                    max: 10,
                    min: 1
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/slider-default-value', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });
        });

        describe('textInput', function () {

            describe('short', function () {
                it('should display textInput', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput disabled', function (done) {
                    injectUILibComp('UI.textInput', {
                        disabled: true,
                        defaultText: 'default text'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|disabled', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with placeholder', function (done) {
                    injectUILibComp('UI.textInput', {
                        placeholder: 'placeholder'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|placeholder', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with placeholder', function (done) {
                    injectUILibComp('UI.textInput', {
                        placeholder: 'placeholder'
                    }, null, function () {
                        settingsComp.injectScript({
                            inline: true,
                            src: 'componentRef.focus();'
                        }).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/text-input|placeholder|focus', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    });
                });


                it('should display textInput with title', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text',
                        title: 'title'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|title', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with defaultText', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|defaultText', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with placeholder', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text'
                    }, null, function () {
                        settingsComp.injectScript({
                            inline: true,
                            src: 'componentRef.focus();'
                        }).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/text-input|defaultText|focus', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    });
                });


/*
                // TODO: not working
                it('should display textInput with invalid', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text',
                        focus: true
                    }, null, function () {
                        settingsComp.injectScript({
                            inline: true,
                            src: 'componentRef.props.validator = function(){return false;}; componentRef.setValue("not valid");'
                        }).then(function () {
                            snapshot.takeSnapshot('editor-ui-lib/text-input|validator-invalid', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                                .then(function (imageCompareData) {
                                    expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                    done();
                                });
                        })
                    });
                });
*/

                it('should display textInput focus', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text',
                        focus: true
                    }, null, function () {
                        settingsComp.injectScript({
                            inline: true,
                            src: 'componentRef.focus();'
                        }).then(function () {
                            setTimeout(function () { // wait to textInput height animation
                                snapshot.takeSnapshot('editor-ui-lib/text-input|focus', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                                    .then(function (imageCompareData) {
                                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                        done();
                                    });
                            }, 100);
                        })
                    });
                });

                it('should display textInput with type=password', function (done) {
                    injectUILibComp('UI.textInput', {
                        defaultText: 'default text',
                        type: 'password'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|password|defaultText', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });
            });

            describe('isMultiLine', function () {
                it('should display textInput', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput disabled', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true,
                        disabled: true
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine|disabled', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with placeholder', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true,
                        placeholder: 'placeholder'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine|placeholder', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with placeholder and focus', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true,
                        placeholder: 'placeholder'
                    }, null, function () {
                        settingsComp.injectScript({
                            inline: true,
                            src: 'componentRef.focus();'
                        }).then(function () {
                            setTimeout(function () { // wait to textInput height animation
                                snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine|placeholder|focus', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                                    .then(function (imageCompareData) {
                                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                        done();
                                    });
                            }, 100);
                        })
                    });
                });

                it('should display textInput with title', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true,
                        title: 'title'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine|title', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with defaultText', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true,
                        defaultText: 'default text'
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine|defaultText', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should display textInput with defaultText and focus', function (done) {
                    injectUILibComp('UI.textInput', {
                        isMultiLine: true,
                        defaultText: 'default text'
                    }, null, function () {
                        settingsComp.injectScript({
                            inline: true,
                            src: 'componentRef.focus();'
                        }).then(function () {
                            setTimeout(function () { // wait to textInput height animation
                                snapshot.takeSnapshot('editor-ui-lib/text-input|isMultiLine|defaultText|focus', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                                    .then(function (imageCompareData) {
                                        expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                        done();
                                    });
                            }, 100);
                        })
                    });
                });
            });
        });

        describe('toggleSwitch', function () {
            it('should display label', function (done) {
                injectUILibComp('UI.toggleSwitch', {
                    label: 'label'
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/toggleSwitch|label', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

            describe('defaultValue', function () {
                it('should be true', function (done) {
                    injectUILibComp('UI.toggleSwitch', {
                        label: 'label',
                        defaultValue: true
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/toggleSwitch|defaultValue|true', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });

                it('should be false', function (done) {
                    injectUILibComp('UI.toggleSwitch', {
                        label: 'label',
                        defaultValue: false
                    }, null, function () {
                        snapshot.takeSnapshot('editor-ui-lib/toggleSwitch|defaultValue|false', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
                });
            });

            it('should be disabled', function (done) {
                injectUILibComp('UI.toggleSwitch', {
                    label: 'label',
                    disabled: true
                }, null, function () {
                    snapshot.takeSnapshot('editor-ui-lib/toggleSwitch|disabled', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });


            /*
             it('should display info icon', function () {

             });
             */
        });

        describe('divider', function () {
            it('should display long divider correctly', function (done) {
                injectUILibComp('"div"', {},
                    '[' +
                    'React.createElement("div", {style: {width: "100%", background: "white"}}, "before divider"),' +
                    'React.createElement("hr", {className: "divider-long"}, null),' +
                    'React.createElement("div", {style: {width: "100%", background: "white"}}, "after divider")' +
                    ']', function () {
                        snapshot.takeSnapshot('editor-ui-lib/divider|long', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                            .then(function (imageCompareData) {
                                expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                                done();
                            });
                    });
            });

            it('should display short divider correctly', function (done) {
                injectUILibComp('"div"', {},
                    '[' +
                        'React.createElement("div", {style: {width: "100%", background: "white"}}, "before divider"),' +
                        'React.createElement("hr", {className: "divider-short"}, null),' +
                        'React.createElement("div", {style: {width: "100%", background: "white"}}, "after divider")' +
                    ']', function () {
                    snapshot.takeSnapshot('editor-ui-lib/divider|short', '.tpa-settings-panel-frame', IS_SAMPLE_MODE)
                        .then(function (imageCompareData) {
                            expect(imageCompareData.matchPercentage).toBeGreaterThan(MATCH_LEVEL_PERCENTAGE);
                            done();
                        });
                });
            });

        });
        // Symbole
        // Teaser popup
        // Text Input
        // Text Input With Button
        // Thumbnails
        // Toggle Buttons
        // Toggle Switch
        // Tooltip

    });
});