testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

var flag;

function clearDialogByButtonSelector(buttonSelector) {
    var okButton = $$(buttonSelector)[0];
    if (okButton) okButton.click();
}

function clearDialogs() {
    clearDialogByButtonSelector('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonBaseBlueSkin-label]');
    clearDialogByButtonSelector('div[skinpart=caption][class=skins_editor_EditorButtonBlueSkin-caption]');
    clearDialogByButtonSelector('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonBaseBlueSkin-label]');
    clearDialogByButtonSelector('span[skinpart=label][class=wysiwyg_editor_skins_InlineTextLinkSkin-label]');
}

describe("No redirect on first save experiment:", function () {

    beforeEach(function() {
        window.editor = window.editor || new this.JasmineEditorHelper();
    });

    afterEach(function() {
        flag = false;

        setTimeout(function() {
            flag = true;
        },100);

        waitsFor(function () {
            clearDialogs();
            return flag;
        }, 'Timeout did not halt artificial wait', 200);
    });

    describe("Editor", function () {

        it("Should load", function () {
            waitsFor(function () {
                return editor.isReady();
            }, 'Editor did not load', 10000);

            runs(function () {
                expect(editor.isReady()).toBeTruthy();
            });
        });

        describe("Saving the site for the first time", function () {

            it("Should save the site without redirection", function () {

                //Note: Redirection will cause the jasmine script to halt, and the testManager will fail, not jasmine, so there will be no jasmine report.

                var siteNameInput;

                runs(function () {
                    var saveButton = $$('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonMainBarDocSkin-label]').filter(function(el){return el.innerHTML.indexOf('Save') == 0;})[0];
                    saveButton.click();
                });

                waitsFor(function () {
                    siteNameInput = $$('input[skinpart=input][type=text][class=wysiwyg_editor_skins_inputs_InputFloatingSkin-input]')[0];
                    return siteNameInput;
                }, "Save dialog popup and name input field did not show up.", 2000);

                runs(function () {
                    var now = new Date();
                    siteNameInput.value = "x" + now.getTime() + now.getMilliseconds();
                });

                runs(function () {
                    flag = false;
                    setTimeout(function(){flag=true},100);
                });

                waitsFor(function () {
                    return flag;
                }, 'Timeout did not halt artificial wait', 200);

                runs(function () {
                    var keyboardEvent = document.createEvent("KeyboardEvent");
                    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
                    keyboardEvent[initMethod]("keyup", true, true, window, false, false, false, false, 40, 0);
                    siteNameInput.dispatchEvent(keyboardEvent);
                    var saveNowButton = $$('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonBaseBlueSkin-label]')[0];
                    saveNowButton.click();
                });

                waitsFor(function () {
                    return window.editorModel.firstSave === false;
                }, "editorModel was not updated", 3000);

                runs(function () {
                    expect(true).toBeTruthy();
                });

            });

            describe("Saving the site an additional time", function () {

                it("should succeed in saving the site", function() {
                    runs(function () {
                        var saveButton = $$('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonMainBarDocSkin-label]').filter(function(el){return el.innerHTML.indexOf('Save') == 0;})[0];
                        saveButton.click();
                    });

                    waitsFor(function () {
                        var dialog = $$('strong[skinpart=dialogTitle][class=wysiwyg_editor_skins_dialogs_WDialogWindowSkin-dialogTitle]')[0];
                        return dialog && dialog.innerHTML == "Your work was saved";
                    }, "Work saved dialong did not show", 3000);

                    runs(function () {
                        expect(true).toBeTruthy();
                    });
                });

                describe("adding a clipart and saving the site", function () {

                    beforeEach(function () {
                        clipart = editor.addComponent('ClipArt', 'wysiwyg.viewer.components.ClipArt');
                        waitsFor(function () {
                            return editor.isComponentReady(clipart);
                        }, 'item to be positioned', 1000);
                    });

                    it("should succeed in saving the site", function() {
                        runs(function () {
                            var saveButton = $$('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonMainBarDocSkin-label]').filter(function(el){return el.innerHTML.indexOf('Save') == 0;})[0];
                            saveButton.click();
                        });

                        waitsFor(function () {
                            var dialog = $$('strong[skinpart=dialogTitle][class=wysiwyg_editor_skins_dialogs_WDialogWindowSkin-dialogTitle]')[0];
                            return dialog && dialog.innerHTML == "Your work was saved";
                        }, "Work saved dialong did not show", 3000);

                        runs(function () {
                            expect(true).toBeTruthy();
                        });
                    });

                });

            });

            describe("publishing the site", function () {

               it("should publish the site successfully", function () {
                   var okButton;

                   runs(function () {
                       var publishButton = $$('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonMainBarDocSkin-label]').filter(function(el){return el.innerHTML.indexOf('Publish') == 0;})[0];
                       publishButton.click();
                   });

                   waitsFor(function () {
                       okButton = $$('div[skinpart=label][class=wysiwyg_editor_skins_buttons_ButtonBaseBlueSkin-label]')[0];
                       return okButton;
                   }, "publish dialon did not load", 1000);

                   runs(function () {
                       flag = false;
                       setTimeout(function(){flag=true},100);
                   });

                   waitsFor(function () {
                       return flag;
                   }, 'Timeout did not halt artificial wait', 200);

                   runs(function () {
                       okButton.click();
                   });

                   waitsFor(function () {
                       var dialog = $$('div[skinpart=label][class=thin wysiwyg_editor_skins_inputs_FloatingDialogTitleSkin-label]').filter(function(el){return el.innerHTML.indexOf('Cong') == 0;})[0];
                       return dialog;
                   }, "publish success dialog did not load", 5000);

                   runs(function () {
                       expect(true).toBeTruthy();
                   });
               });

            });

        });

    });

});