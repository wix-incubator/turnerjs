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
            fppLabel: 'PHOTO_REPLACE_IMAGE',
            panelLabel: 'PHOTO_REPLACE_IMAGE'
        };

        when_it_is_double_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_panel_button_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_media_gallery_BI_tracking);
    });

    the_component('ClipArt', function () {
        var options = {
            biComponentType: 'wysiwyg.viewer.components.ClipArt',
            resourceType: 'clipart',
            fppLabel: 'CLIP_ART_REPLACE_IMAGE',
            panelLabel: 'CLIP_ART_REPLACE_IMAGE'
        };

        when_it_is_double_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_panel_button_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );
    });

    the_component('addDocumentMedia', function () {
        var options = {
            biComponentType: 'wysiwyg.viewer.components.documentmedia.DocumentMedia',
            resourceType: 'document',
            fppLabel: 'CHOOSE_DOCUMENT',
            panelLabel: 'CHOOSE_DOCUMENT'
        };

        when_it_is_double_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_panel_button_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );
    });

    the_component('addSvgShape', function () {
        var options = {
            biComponentType: 'wysiwyg.viewer.components.svgshape.SvgShape',
            resourceType: 'shape',
            fppLabel: 'SVGSHAPE_SELECT_SKIN',
            panelLabel: 'SVGSHAPE_SELECT_SKIN'
        };

        when_it_is_double_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_panel_button_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );
    });

    the_component('addAudioPlayer', function () {
        var options = {
            biComponentType: 'wysiwyg.viewer.components.AudioPlayer',
            resourceType: 'music',
            fppLabel: 'AUDIO_REPLACE_AUDIO',
            panelLabel: 'AUDIO_REPLACE_AUDIO'
        };

        when_it_is_double_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_panel_button_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );
    });

    the_component(addSingleAudioPlayer(), function () {
        var options = {
            biComponentType: 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer',
            resourceType: 'music',
            fppLabel: 'AUDIO_REPLACE_AUDIO',
            panelLabel: 'AUDIO_REPLACE_AUDIO'
        };

        when_it_is_double_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_panel_button_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );

        when_FPP_action_was_clicked(options,
            suite_for_media_gallery_BI_tracking
        );
    });

    function the_component(preset, innerDescribe) {
        if (typeof preset === "string") {
            preset = getDefaultPreset(preset);
        }

        describe("the " + preset.compType + " component, ", function () {
            beforeEach(function () {
                if (addedComponents.indexOf(preset.compType) >= 0) {
                    return;
                }
                addedComponents.push(preset.compType);

                automation.Utils.waitsForPromise(function () {
                    return automation.viewercomponents.ViewerComponent.addComponent(preset).
                    then(function (component) {
                        return automation.editorcomponents.EditorComponents.selectComponent(component);
                    });
                });
            });

            innerDescribe();
        });
    }

    function when_it_is_double_clicked(options, innerDescribe) {
        describe("when it is double clicked and media gallery is opened, ", function () {
            beforeEach(function () {
                var editBox = automation.editorcomponents.EditBox.getEditBox();
                var pos = editBox.$logic.getPosition();

                editBox.fireEvent('dblclick', {
                    client: {
                        x: pos.x + 10,
                        y: pos.y + 10
                    }
                });

                waits_for_media_gallery();
            });

            afterEach(cancel_media_gallery);

            innerDescribe(
                _.extend({}, options, { commandSource: 'dblClick' })
            );
        });
    }

    function suite_for_media_gallery_BI_tracking(options) {
        it_should_log_BI_event('editor', wixEvents.CHANGE_IMAGE_CLICK, {
            c1: options.commandSource,
            c2: options.biComponentType
        }, 1500);

        when_media_gallery_is_cancelled(function () {
            it_should_not_log_BI_event('viewer', wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, jasmine.any(Object));
        });

        when_resource_is_selected_from_media_gallery(options.resourceType, function () {
            it_should_log_BI_event('viewer', wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {
                c1: options.biComponentType
            }, 4000);
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

            afterEach(cancel_media_gallery);

            innerDescribe(_.extend(
                {}, options, { commandSource: 'FPP' }
            ));
        });
    }

    function when_panel_button_was_clicked(options, innerDescribe) {
        var label = W.Resources.get('EDITOR_LANGUAGE', options.panelLabel);

        describe("when panel button '" + label + "' was clicked and media gallery opened, ", function () {
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

            afterEach(cancel_media_gallery);

            innerDescribe(
                _.extend({}, options, { commandSource: 'panel' })
            );
        });
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

    function it_should_not_log_BI_event(where, eventType, eventParams) {
        it("should not (!) log BI event " + eventType.biEventId, function () { // TODO: find a better way
            make_delay(function () {
                expect(logger[where]).not.toHaveBeenCalledWith(eventType, eventParams);
            }, 2000);
        });
    }

    function make_delay(fn, timeMs) {
        var flag;

        waitsFor(function () { return flag; }, timeMs + 100);

        setTimeout(function () {
            flag = true;
            fn();
        }, timeMs);
    }

    function when_media_gallery_is_cancelled(innerDescribe) {
        describe("when media gallery is cancelled, ", function () {
            beforeEach(cancel_media_gallery);

            innerDescribe();
        });
    }

    function waits_for_media_gallery(callback) {
        waitsFor(function () {
            var frame = document.getElementById("mediaGalleryFrame");

            if (!frame) return;
            try {
                if (!frame.contentWindow) return;
                if (!frame.contentWindow.protocol) return;
                if (!frame.contentWindow.protocol.sendCancel) return;

                if (callback) {
                    callback(frame.contentWindow);
                }

                return true;
            }
            catch (e) { }
        }, 5000, "media gallery frame to be accessible");
    }

    function cancel_media_gallery() {
        if (!document.getElementById("mediaGalleryFrame")) {
            return;
        }

        waits_for_media_gallery(function (mg) {
            try { mg.protocol.sendCancel(); }
            catch (e) { }
        });
    }

    function when_resource_is_selected_from_media_gallery(resourceType, innerDescribe) {
        describe("when " + resourceType + " is selected from media gallery, ", function () {
            beforeEach(function () {
                var that = this;

                automation.Utils.waitsForPromise(function () {
                    return automation.editorcomponents.MediaGalleryDriver.selectResource(resourceType)
                           .then(function (resource) {
                               waits_for_media_gallery(function (mg) {
                                   try {
                                       mg.protocol.sendItems([resource]);
                                   }
                                   catch (e) {
                                       console.debug(e);
                                   }
                               });
                           });
                });
            });

            innerDescribe();
        });
    }

    function addSingleAudioPlayer() {
        return {
            compType: 'SingleAudioPlayer',
            compData: {
                comp: 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer',
                skin: 'wysiwyg.common.components.singleaudioplayer.viewer.skins.SingleAudioPlayerSkin',
                data: {
                    'type': 'SingleAudioPlayer'
                },
                "layout": {
                    "width": 280,
                    "height": 68
                }
            }
        };
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
});
