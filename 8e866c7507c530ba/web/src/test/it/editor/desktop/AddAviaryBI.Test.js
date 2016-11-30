integration.noAutomation();
integration.requireExperiments([
    'addmediagallerybi',
    'editableimageinput'
]);

describe("BI events for Media Gallery: ", function () {
    var addedComponents = [],
        logger = {
            editor: null,
            viewer: null
        };

    beforeEach(function () {
        if (!LOG.reportEvent.isSpy) {
            logger.editor = spyOn(LOG, 'reportEvent');
        } else if (!logger.editor) {
            logger.editor = LOG.reportEvent;
        }

        logger.editor.reset();

        var p = W.Preview.getPreviewSite();
        if (!p.LOG.reportEvent.isSpy) {
            logger.viewer = spyOn(p.LOG, 'reportEvent');
        } else if (!logger.viewer) {
            logger.viewer = p.LOG.reportEvent;
        }

        logger.viewer.reset();
    });

    the_component('WPhoto', function () {
        var options = {
            biComponentType: 'wysiwyg.viewer.components.WPhoto',
            resourceType: 'image',
            fppLabel: 'IMAGEINPUTNEW_IMAGE_EFFECTS',
            panelLabel: 'IMAGEINPUTNEW_IMAGE_EFFECTS'
        };

        when_panel_button_was_clicked(options,
            suite_for_aviary_dialog_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_aviary_dialog_BI_tracking);
    });

    the_component('ClipArt', function () {
        var options = {
            biComponentType: 'wysiwyg.viewer.components.ClipArt',
            resourceType: 'clipart',
            fppLabel: 'IMAGEINPUTNEW_CLIPART_EFFECTS',
            panelLabel: 'IMAGEINPUTNEW_CLIPART_EFFECTS'
        };

        when_panel_button_was_clicked(options,
            suite_for_aviary_dialog_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_aviary_dialog_BI_tracking
        );
    });

    function the_component(preset, innerDescribe) {
        preset = getDefaultPreset(preset);

        describe("the " + preset.compType + " component, ", function () {
            beforeEach(function () {
                if (addedComponents.indexOf(preset.compType) >= 0) {
                    return;
                }

                addedComponents.push(preset.compType);

                automation.Utils.waitsForPromise(function () {
                    var promise = automation.viewercomponents.ViewerComponent.addComponent(preset);

                    return promise.then(function (component) {
                        return automation.editorcomponents.EditorComponents.selectComponent(component);
                    });
                });
            });

            innerDescribe();
        });
    }

    function when_panel_button_was_clicked(options, innerDescribe) {
        var label = W.Resources.get('EDITOR_LANGUAGE', options.panelLabel);

        describe("when panel button '" + label + "' was clicked and Aviary Dialog opened, ", function () {
            beforeEach(function () {
                var driver = automation.WebElement;

                function matcher(button) {
                    return button.get('text').trim() === label.trim();
                }

                W.Editor.openComponentPropertyPanels(null, false, true);

                automation.Utils.waitsForPromise(function () {
                    var promise = driver.waitForElementWithCondition(document.body,
                            '[skinpart=dataPanelContainer] [comp$=Button]',
                            matcher);

                    promise = promise.then(function (button) {
                        button.click();
                    });

                    return promise;
                });
            });

            afterEach(close_all_dialogs);

            innerDescribe(
                _.extend({}, options, { commandSource: 'panel' })
            );
        });
    }

    function when_FPP_action_was_clicked(options, innerDescribe) {
        var label = W.Resources.get('EDITOR_LANGUAGE', options.fppLabel);

        describe("when FPP action '" + label + "' was clicked and media gallery is opened, ", function () {
            beforeEach(function () {
                var driver = automation.editorcomponents.FloatingPropertyPanelDriver;

                automation.Utils.waitsForPromise(function () {
                    var promise = driver.openFpp();

                    promise = promise.then(function (fpp) {
                        return driver.clickOnFppItemByLabel(fpp, label);
                    });

                    promise = promise.then(function () {
                        return driver.closeFpp();
                    });

                    return promise;
                });
            });

            afterEach(close_all_dialogs);

            innerDescribe(
                _.extend({}, options, { commandSource: 'FPP' }
            ));
        });
    }

    function suite_for_aviary_dialog_BI_tracking(options) {
        it_should_log_BI_event('editor', wixEvents.AVIARY_EDIT_IMAGE, {
            c1: jasmine.any(String),
            c2: options.biComponentType,
            g2: options.commandSource,
            i1: jasmine.any(Number)
        }, 1500);
    }

    function getDefaultPreset(compType) {
        var COMPONENT_TYPES = W.Data.getDataByQuery('#COMPONENT_TYPES'),
            compData = COMPONENT_TYPES.get('items')[compType].component;

        compData = typeof compData === "function" ? compData() : compData;

        return {
            compType: compType,
            compData: _.cloneDeep(compData)
        };
    }

    function it_should_log_BI_event(where, eventType, eventParams, delay) {
        it("should log BI event " + eventType.biEventId, function () {
            var spy = logger[where];

            function matcher(call) {
                return call.args[0].biEventId == eventType.biEventId;
            }

            waitsFor(function () {
                return spy.calls.some(matcher);
            }, delay, "bi event " + eventType.biEventId + " to be logged");

            runs(function () {
                expect(spy).toHaveBeenCalledWith(eventType, eventParams);
            });
        });
    }

    function close_all_dialogs() {
        W.EditorDialogs.closeAllDialogs();
    }
});

