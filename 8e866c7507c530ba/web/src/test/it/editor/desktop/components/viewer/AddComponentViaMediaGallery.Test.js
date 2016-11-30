integration.noAutomation();

describe("Add via Media Gallery experiment: ", function () {
    var utility = create_utility(),
        subPanel,
        openMediaFrame,
        addComponentViaMediaGallery;

    beforeAll(function () {
        var registrar = W.Editor._commandRegistrar._componentCommandRegistrar;
        addComponentViaMediaGallery = registrar._addComponentViaMediaGallery;
    });

    beforeEach(function () {
        var command = W.Commands.getCommand("WEditorCommands.OpenMediaFrame");
        openMediaFrame = spyOn(command, 'execute');
    });

    when_adding_component_from_menu("IMAGE", function () {
        media_gallery_dialog_should_appear_for("ADD_IMAGE", {
            galleryConfigID: 'photos',
            publicMediaFile: 'photos',
            selectionType: 'multiple',
            i18nPrefix: 'multiple_images',
            mediaType: 'picture',
            callback: jasmine.any(Function)
        });

        media_gallery_dialog_should_appear_for("ADD_IMAGE_WITHOUT_FRAME", {
            galleryConfigID: 'photos',
            publicMediaFile: 'photos',
            selectionType: 'multiple',
            i18nPrefix: 'multiple_images',
            mediaType: 'picture',
            callback: jasmine.any(Function)
        });

        media_gallery_dialog_should_appear_for("ADD_CLIP_ART", {
            galleryConfigID: 'clipart',
            publicMediaFile: 'clipart',
            i18nPrefix: 'addmultiple_clipart',
            selectionType: 'multiple',
            mediaType: 'picture',
            startingTab: 'free',
            callback: jasmine.any(Function)
        });
    });

    when_adding_component_from_menu("MEDIA", function () {
        media_gallery_dialog_should_appear_for("ADD_DOCUMENT", {
            galleryConfigID: 'documents',
            publicMediaFile: 'file_icons',
            i18nPrefix: 'addmultiple_document',
            selectionType: 'multiple',
            mediaType: 'document',
            callback: jasmine.any(Function)
        });

        media_gallery_dialog_should_appear_for("COMP_AudioPlayer", {
            galleryConfigID: 'audio',
            i18nPrefix: 'addmultiple_music',
            selectionType: 'multiple',
            mediaType: 'music',
            callback: jasmine.any(Function)
        });

        media_gallery_dialog_should_appear_for("COMP_SingleAudioPlayer", {
            galleryConfigID: 'audio',
            i18nPrefix: 'addmultiple_music',
            selectionType: 'multiple',
            mediaType: 'music',
            callback: jasmine.any(Function)
        });
    });

    when_adding_component_from_menu("AREAS", function () {
        media_gallery_dialog_should_appear_for("ADD_SVG_SHAPE", {
            publicMediaFile: 'shapes',
            i18nPrefix: 'addmultiple_shape',
            selectionType: 'multiple',
            hasPrivateMedia: false,
            callback: jasmine.any(Function)
        });
    });

    describe("after choosing item from media gallery", function () {
        var mediaGalleryData;

        it_should_add_to_stage({ resourceType: 'image',    compType: 'WPhoto', styleId: 'wp1' });
        it_should_add_to_stage({ resourceType: 'image',    compType: 'WPhoto', styleId: 'wp2' });
        it_should_add_to_stage({ resourceType: 'clipart',  compType: 'ClipArt'           });
        it_should_add_to_stage({ resourceType: 'shape',    compType: 'Shape'             });
        it_should_add_to_stage({ resourceType: 'document', compType: 'DocumentMedia'     });
        it_should_add_to_stage({ resourceType: 'music',    compType: 'AudioPlayer'       });
        it_should_add_to_stage({ resourceType: 'music',    compType: 'SingleAudioPlayer' });

        function it_should_add_to_stage(options) {
            var resourceType = options.resourceType,
                style = options.styleId ? (" with style=" + options.styleId) : "";

            it("should successfully add to stage the " + options.compType + style, function () {
                addComponentViaMediaGallery._pickStrategyFor(options.compType);
                addComponentViaMediaGallery._strategy.options = options;

                automation.Utils.waitsForPromise(function () {
                    return automation.editorcomponents.MediaGalleryDriver.selectResource(resourceType).
                        then(function (data) {
                            mediaGalleryData = data;
                            addComponentViaMediaGallery._openMediaGalleryCallback(data);
                        }).
                        then(function () {
                            var preview = W.Preview.getPreviewSite().document,
                                uri,
                                selector;

                            if (resourceType === 'document') {
                                uri = mediaGalleryData.thumbnailUrl;
                            } else {
                                uri = mediaGalleryData.fileName || mediaGalleryData.uri;
                            }

                            if (resourceType === 'shape') {
                                selector = 'svg';
                            } else if (resourceType === 'music') {
                                selector = '[comp$=' + options.compType + ']';
                            } else {
                                selector = 'img[src*="' + uri + '"]';
                            }

                            return automation.WebElement.waitForElementToExist(preview, selector);
                        }).
                        then(function (img) {
                            subject = img.getParent("[comp$=" + options.compType + "]");
                        });
                });

                runs(function () {
                    expect(subject).toBeDefined();
                });
            });
        }
    });

    function when_adding_component_from_menu(i18n_label, innerDescribe) {
        describe("when adding a component from '" + utility.translate(i18n_label) + "' menu,", function () {
            beforeEach(function () {
                automation.Utils.waitsForPromise(function () {
                    return automation.WebElement.waitForElementToExist(document, "#tbAdd").
                           then(function (button) {
                               button.click();
                           }).
                           then(function () {
                               return automation.WebElement.waitForElementToExist(document, "[comp$=MasterComponentPanel]");
                           }).
                           then(function (panel) {
                               return utility.findButton(i18n_label, panel);
                           }).
                           then(function (button) {
                               button.click();
                               return automation.WebElement.waitForElementToExist(document, "[comp$=AddComponentPanel]");
                           }).
                           then(function (panel) {
                               subPanel = panel;
                           }).
                           timeout(1500, "timed out");
                });
            });
            
            innerDescribe();
        });
    }

    function media_gallery_dialog_should_appear_for(i18n_label, commandArgs) {
        it("media gallery dialog should appear for '" + utility.translate(i18n_label) + "'", function () {
            automation.Utils.waitsForPromise(function () {
                return Q().
                    then(function () {
                        return utility.findButton(i18n_label, subPanel);
                    }).
                    then(function (button) {
                        button.click();
                    }).
                    then(function () {
                        expect(openMediaFrame).toHaveBeenCalledWith(commandArgs, undefined);
                    });
            });
        });
    }

    /* Utility methods */
    function create_utility() {
        return {
            translate: function (i18n_label) {
                return W.Resources.get('EDITOR_LANGUAGE', i18n_label).trim();
            },
            findButton: function (i18n_label, rootElement) {
                var text = utility.translate(i18n_label),
                    buttons = rootElement.querySelectorAll("[comp$=WButton]"); 

                return _(buttons).find(function (button) {
                    return button.get('text').trim() === text;
                }) || Q.reject("button not found with text = " + text);
            }
        };
    }
    /* end of Utility methods */
}); 
