testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

describe("MobileHiddenElementsPanel:", function () {
    beforeEach(function () {
        window.editor = window.editor || new this.JasmineEditorHelper();

        waitsFor(function () {
            return editor && editor.isReady();
        }, 'editor to finish loading', 10000);
    });

    describe("Mobile Editor", function () {
        var newBlankPage,
            newBlankPageId,
            newBlankPageTitle,
            homePageId;
        //Preliminaries for hidden elements panelNode
        var panelNode;
        var panelVisible;
        var isPageChanged;
        var isMobileViewerReady;
        var testCompImage;
        var testCompText;

        var goToPageAndWaitForPageChange = function (pageId, waitMessage, waitDuration) {
            //If switching to a different page
            if (W.Preview.getPreviewManagers().Viewer.getCurrentPageId() === pageId) {
                return
            }
            // Make sure transitions are turned off
            W.Commands.executeCommand("WEditorCommands.PageTransition", Constants.TransitionTypes.NONE);
            // Switch to page
            W.Commands.executeCommand("EditorCommands.gotoSitePage", pageId);
            // Wait for page changed event (either pageChanged or transitionEnd, depends...)
            waitsFor(function () {
                if (isPageChanged) {
                    isPageChanged = false;
                    return true;
                }
            }, waitMessage, waitDuration || 4000);
        }

        var onPageChanged = function () {
            isPageChanged = true;
        }

        var onMobileReady = function () {
            isMobileViewerReady = true;
        }

        //Before all tests, do some preliminary actions

        it('Setup: Should add Components to page and change to the mobile editor', function () {
            //Preliminaries for mobile editor state:
            W.Preview.getPreviewManagers().Viewer.addEvent('pageTransitionEnded', onPageChanged);
            //Save homepage Id
            homePageId = W.Preview.getPreviewManagers().Viewer.getHomePageId();
            //Add a blank page
            newBlankPage = editor.addBlankPage('Test Page', true);
            waitsFor(function () {
                newBlankPageId = newBlankPage.$logic && newBlankPage.$logic.getID();
                if (newBlankPageId) {
                    newBlankPageTitle = newBlankPage.$logic.getDataItem().get('title');
                    return true;
                }
            });
            //When page is ready
            runs(function () {
                //Change to the new page
                goToPageAndWaitForPageChange(newBlankPageId, 'Goto Test Page');
                runs(function () {
                    //Add an image component
                    W.CommandsNew.executeCommand('WEditorCommands.AddComponent', {compType: 'WPhoto', styleId: 'wp1'}, this);
                });

                waitsFor(function () {
                    //Save a ref to the new image component
                    testCompImage = W.Editor.getEditedComponent();
                    if (testCompImage && testCompImage.$className === 'wysiwyg.viewer.components.WPhoto') {
                        return true;
                    }
                }, 'Added Image comp', 4000);

                runs(function () {
                    W.CommandsNew.executeCommand('WEditorCommands.AddComponent', {compType: 'richTitle', styleId: 'txtNew'}, this);
                });

                waitsFor(function () {
                    //Save a ref to the new text component
                    testCompText = W.Editor.getEditedComponent();
                    if (testCompText && testCompText.$className === 'wysiwyg.viewer.components.WRichText') {
                        return true;
                    }
                }, 'Added Text comp', 4000);

                //And switch to the mobile editor
                runs(function () {
                    //Change to mobile view
                    isMobileViewerReady = false;
                    W.Commands.registerCommandAndListener('WEditorCommands.SecondaryPreviewReady', this, onMobileReady);
                    W.Commands.executeCommand('WEditorCommands.SetViewerMode', {mode: Constants.ViewerTypesParams.TYPES.MOBILE}, this);
                });

                waitsFor(function () {
                    return isMobileViewerReady;
                }, 'mobile editor viewer is ready', 10000);

                runs(function(){
                    expect(testCompImage.$className).toBe('wysiwyg.viewer.components.WPhoto');
                    expect(testCompText.$className).toBe('wysiwyg.viewer.components.WRichText');
                    expect(W.Config.env.isViewingDesktopDevice()).toBeFalsy();
                });
            });
        });

        describe('Mobile Hidden Elements Panel', function () {
            var testCompImageId;
            var mobileTestCompImage;
            var testCompTextId;
            var mobileTestCompText;
            it('Setup: Should hide the two tests components', function () {
                var buttons;

                //Assume testComps

                testCompImageId = testCompImage.getID();
                mobileTestCompImage = W.Preview.getCompLogicById(testCompImageId);

                testCompTextId = testCompText.getID();
                mobileTestCompText = W.Preview.getCompLogicById(testCompTextId);

                //Change to test page
                goToPageAndWaitForPageChange(newBlankPageId, 'Goto test Page');
                runs(function () {
                    //Select and hide image
                    W.Editor.setSelectedComp(mobileTestCompImage);
                    W.Commands.executeCommand('WEditorCommands.WHideSelectedComponent');
                });

                // Wait for the panel to show
                waitsFor(function () {
                    panelNode = editor.getEditorComponentNode('wysiwyg.editor.components.panels.MobileHiddenElementsPanel', 0);
                    panelVisible = panelNode && (panelNode.isVisible() && panelNode.isDisplayed());
                    return panelVisible;
                }, 'Show panelNode', 4000);

                //Wait for button to be added to hidden elements panel
                waitsFor(function () {
                    buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_buttons_MobileAddHiddenComponentButtonSkin-button');
                    var imageButton = buttons[0];
                    var params = imageButton && imageButton.$logic && imageButton.$logic._commandParameter;
                    return params && params.id === testCompImageId;
                }, 'delete image', 4000);

                runs(function () {
                    //Select and hide text
                    W.Editor.setSelectedComp(mobileTestCompText);
                    W.Commands.executeCommand('WEditorCommands.WHideSelectedComponent');
                });

                //Wait for button to be added to hidden elements panel
                waitsFor(function () {
                    buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_buttons_MobileAddHiddenComponentButtonSkin-button');
                    var textButton = buttons[1];
                    var params = textButton && textButton.$logic && textButton.$logic._commandParameter;
                    return params && params.id === testCompTextId;
                }, 'delete text', 4000);

                runs(function () {
                    expect(buttons.length).toBe(2);
                })
            });

            describe('General panelNode actions', function () {
                it('Should show the panel automatically after deleting a component for the first time', function () {
//                    W.Commands.executeCommand('WEditorCommands.MobileHiddenElements', Constants.EditorUI.MOBILE_HIDDEN_ELEMENTS_PANEL, this);
                    expect(panelNode.getAttribute('comp')).toBe('wysiwyg.editor.components.panels.MobileHiddenElementsPanel');
                    expect(panelVisible).toBeTruthy();
                });
            });

            describe('Page actions', function () {
                it('Should set the title of pages section to include the name of the current page', function () {
                    var currentPage = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
                    var currentPageTitle = currentPage.$logic.getDataItem().get('title');
                    var currentPagePanelTitle = panelNode.$logic._skinParts.pageLabel.innerText;
                    expect(_(currentPagePanelTitle).contains(currentPageTitle)).toBeTruthy();
                });
            });

            describe('Buttons creation', function () {
                it('Should add buttons to the hidden elements list when components are deleted', function () {
                    var buttons;

                    buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_buttons_MobileAddHiddenComponentButtonSkin-button');
                    paramsImage = buttons[0].$logic._commandParameter;
                    paramsText = buttons[1].$logic._commandParameter;

                    expect(paramsImage.id).toBe(testCompImageId);
                    expect(paramsText.id).toBe(testCompTextId);
                });

                it('Should use the right component icon in the data', function () {
                    var compIconData = W.Data.getDataByQuery('#COMP_ICONS');
                    var testCompTextIconOffset = compIconData.get('spriteOffsets')[testCompText.$className];
                    var offsetAsString = testCompTextIconOffset.x + 'px ' + testCompTextIconOffset.y + 'px';
                    var buttons;
                    var bgPosition;

                    buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_inputs_LabelMobileHiddenElements-icon');
                    bgPosition = buttons[1].style.backgroundPosition;

                    expect(bgPosition).toBe(offsetAsString);
                });

                it('Should use a preview image if defined', function () {
                    var rawImageSrc = testCompImage._data.get('uri');
                    var icons;
                    var publicMediaImageSrc;

                    icons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_inputs_LabelMobileHiddenElements-icon');
                    publicMediaImageSrc = icons[0].style.backgroundImage;

                    expect(_(publicMediaImageSrc).contains(rawImageSrc)).toBeTruthy();
                });

                it('Should use a preview text if defined', function () {
                    var testCompTextText = testCompText._data.get('text').substring(0, panelNode.$logic.MAX_TEXT_SIZE);
                    testCompTextText = W.Utils.removeHtmlTagsFromString(W.Utils.removeBreaklinesFromString(testCompTextText));
                    var labels;
                    var buttonText;

                    labels = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_inputs_LabelMobileHiddenElements-label');
                    buttonText = labels[1].innerText;

                    expect(_(buttonText).contains(testCompTextText)).toBeTruthy();
                });
            });

            describe('Hide and show actions', function () {
                describe('Page Section list actions', function () {
                    it('Should remove the item from list when clicking its "eye" icon', function () {
                        var buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_buttons_MobileAddHiddenComponentButtonSkin-button');
                        var imageButton = buttons[0];

                        imageButton.click();

                        waitsFor(function () {
                            buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_buttons_MobileAddHiddenComponentButtonSkin-button');
                            return buttons && buttons.length === 1 && buttons[0].$logic && buttons[0].$logic._commandParameter;
                        }, 'component to be removed from list', 4000);
//                        waitsFor(function(){
//                            W.Editor.getEditedComponent();
//                        });
                        runs(function () {
                            expect(buttons.length).toBe(1);
                            expect(buttons[0].$logic._commandParameter.id).not.toBe(testCompImageId);
                        });
                    });
                });
            });

            describe('Reorder section', function () {
                describe('"Undo Reorder" button', function () {
                    var reorderButton;
                    var discardReorderButton;
                    var isUndoEnabled;

                    it('Setup Undo Reorder tests:', function () {
                        reorderButton = panelNode.$logic._skinParts.reorderButton;
                        discardReorderButton = panelNode.$logic._skinParts.discardReorderButton;
                        isUndoEnabled = discardReorderButton.isEnabled();

                        // *** Remove this when MultipleViewersHandler.js line 337 is fixed to not have a 500ms timeout ***
                        window.waited1000Milliseconds = false;
                        setTimeout(function workaroundReaddComponentTimeout(){
                            window.waited1000Milliseconds = true;
                        }, 1000);
                        waitsFor(function(){
                            return window.waited1000Milliseconds;
                        }, 'wait for readd to finish it\'s silly timeout', 2000);
                        // *** *** *** *** ***
                    });

                    it('Should make sure "Undo reorder" button is disabled by default', function () {
                        expect(isUndoEnabled).toBeFalsy();
                    });

                    it('Should enable the "Undo Reorder" when after reordering', function () {
                        reorderButton._view.click();
                        waitsFor(function () {
                            isUndoEnabled = discardReorderButton.isEnabled();
                            return isUndoEnabled;
                        }, 'undo to be enabled', 4000);
                        runs(function () {
                            expect(isUndoEnabled).toBeTruthy();
                        });

                    });

                    it('Should disable the "Undo Reorder" after hiding another component', function () {
                        //Select and hide image
                        // We need to bring the image comp again because it's not the same object as before removing it
                        mobileTestCompImage = W.Preview.getCompLogicById(testCompImageId);

                        W.Editor.setSelectedComp(mobileTestCompImage);
                        W.Commands.executeCommand('WEditorCommands.WHideSelectedComponent');

                        // Wait for the panel to show
                        waitsFor(function () {
                            buttons = panelNode.$logic._skinParts.pageComps.getElements('.wysiwyg_editor_skins_buttons_MobileAddHiddenComponentButtonSkin-button');
                            var imageButton = buttons[0];
                            var params = imageButton && imageButton.$logic && imageButton.$logic._commandParameter;
                            return params && params.id === testCompImageId;
                        }, 'delete image', 4000);

                        waitsFor(function () {
                            isUndoEnabled = discardReorderButton.isEnabled();
                            return !isUndoEnabled;
                        }, 'undo to be enabled', 4000);

                        runs(function () {
                            expect(isUndoEnabled).toBeFalsy();
                        });
                    });
                });
            });
        });
    })
    ;
})
;