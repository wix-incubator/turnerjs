integration.noAutomation();

integration.requireExperiments([
    'editableimageinput'
]);
 
describe("Editable image input,", function () {
    var utility = create_utility(),
        presets = create_presets(),
        subject,
        panel;

    jasmine_use_single_thread_mode();
    jasmine_extra_matchers();

    describe_image_panel(function () {
        suite_for_image_based_components({
            isChangeImageOnFPP: true,
            isAviaryOnFPP: true,
            i18n_change: "PHOTO_REPLACE_IMAGE",
            i18n_edit: "IMAGEINPUTNEW_IMAGE_EFFECTS",
            i18n_revert: "PHOTO_REVERT_IMAGE",
            componentType: "wysiwyg.viewer.components.WPhoto",
            isEditableImageInput: true
        });

        describe_component(function () {
            it_should_have_original_data('title');
        });

        when_added_a_link('wphoto', function () {
            describe_link_input(function () {
                it_should_have_value(presets.links.data.url);
            });
        });
    });

    describe_clipart_panel(function () {
        suite_for_image_based_components({
            isChangeImageOnFPP: true,
            isAviaryOnFPP: true,
            i18n_change: "CLIP_ART_REPLACE_IMAGE",
            i18n_edit: "IMAGEINPUTNEW_CLIPART_EFFECTS",
            i18n_revert: "PHOTO_REVERT_IMAGE",
            componentType: "wysiwyg.viewer.components.ClipArt",
            isEditableImageInput: true
        });

        when_added_a_link('clipart', function () {
            describe_link_input(function () {
                it_should_have_value(presets.links.data.url);
            });
        });
    });

    describe_imagebutton_panel(function () {
        suite_for_image_based_components({
            isChangeImageOnFPP: false,
            isAviaryOnFPP: false,
            i18n_change: "PHOTO_REPLACE_IMAGE",
            i18n_edit: "IMAGEINPUTNEW_IMAGE_EFFECTS",
            i18n_revert: "PHOTO_REVERT_IMAGE",
            componentType: "wysiwyg.common.components.imagebutton.viewer.ImageButton",
            isEditableImageInput: true
        });
    });

    describe_image_strip_panel(function () {
        var options = {
            isAviaryOnFPP: false,
            isChangeImageOnFPP: true,
            i18n_upload: "BG_STRIP_UPLOAD",
            i18n_change: "BG_STRIP_CHANGE",
            i18n_remove: "IMAGE_REMOVE",
            i18n_revert: "PHOTO_REVERT_IMAGE",
            i18n_edit: "IMAGEINPUTNEW_IMAGE_EFFECTS",
            componentType: "wysiwyg.viewer.components.BgImageStrip",
            background: true,
            hasDelete: true,
            isEdited: false,
            isEditableImageInput: true,
            mobileInputs: true
        };

        suite_that_must_work_always(options);
        suite_when_input_is_empty(options);

        when_image_is_selected_from_gallery_using_FPP(function () {
            suite_when_image_was_changed(options);
        });

        when_image_is_selected_from_gallery_using_Change_Button(function () {
            suite_when_image_was_changed(options);
        });

        if (options.isEditableImageInput) {
            when_image_has_been_edited_in_Aviary_using_Edit_Button(function () {
                suite_when_image_was_changed(_.extend({}, options, { isEdited: true }));
            });
        }
    });

    //describe_background_panel(function () {
    //    var options = {
    //        i18n_upload: 'IMAGE_ADD',
    //        i18n_change: 'PHOTO_REPLACE_IMAGE',
    //        i18n_remove: 'IMAGE_REMOVE',
    //        i18n_revert: 'PHOTO_REVERT_IMAGE',
    //        i18n_edit:   'IMAGEINPUTNEW_IMAGE_EFFECTS',
    //        isAviaryOnFPP: false,
    //        background: true,
    //        hasDelete: true,
    //        noAnimation: true,
    //        componentType: "Background",
    //        isEditableImageInput: true
    //    };

    //    suite_that_must_work_always(options);

    //    when_image_is_selected_from_gallery_using_Change_Button(function () {
    //        suite_when_image_was_changed(options);
    //    });

    //    if (options.isEditableImageInput) {
    //        when_image_has_been_edited_in_Aviary_using_Edit_Button(function () {
    //            suite_when_image_was_changed(_.extend({ isEdited: true }, options));
    //        });
    //    }
    //});

    function suite_that_must_work_always(options) {
        describe_picture_preview(function () {
            it_should_have_transparent_background();
            it_should_open_media_gallery_on_click();
            it_should_show_the_same_image_as_the_edited_component(options.background);
        });

        describe_change_button(function () {
            it_should_be_enabled();
            it_should_be_a_blue_button();
            it_should_open_media_gallery_on_click();
        });

        describe_delete_button(function () {
            it_should_be_a_text_link();
        });

        describe_component(function () {
            if (options.isChangeImageOnFPP) {
                it_should_have_FPP_action(options.i18n_change);

            }
            if (options.isAviaryOnFPP) {
                it_should_have_FPP_action(options.i18n_edit);
            }
        });

        if (options.isEditableImageInput) {
            describe_edit_button(function () {
                it_should_be_a_silver_button();
                it_should_have_text(options.i18n_edit);
            });

            describe_revert_button(function () {
                it_should_be_a_text_link();
            });
        }

        if (!options.noAnimation) {
            describe_add_animation(function () {
                it_should_be_enabled();
            });
        }

        if (options.componentType !== "Background") {
            describe_component(function () {
                it_should_have_original_data('alt');
            });
        }
    }

    function suite_when_input_is_empty(options) {
        describe_picture_preview(function () {
            it_should_show_empty_placeholder();
        });

        describe_change_button(function () {
            it_should_have_text(options.i18n_upload);
        });

        describe_delete_button(function () {
            it_should_be_hidden();
        });

        if (options.isEditableImageInput) {
            describe_edit_button(function () {
                it_should_be_disabled();
                it_should_not_open_Aviary_dialog_on_click();
            });

            describe_revert_button(function () {
                it_should_be_hidden();
            });
        }

        if (options.mobileInputs) {
            describe_component(function () {
                it_should_make_mobile_inputs({ hidden: true });
            });
        }
    }

    function suite_when_input_has_image(options) {
        describe_change_button(function () {
            it_should_have_text(options.i18n_change);
        });

        if (options.isEditableImageInput) {
            describe_edit_button(function () {
                it_should_be_enabled();
                it_should_open_Aviary_dialog_on_click();
                it_should_log_BI_event_on_click(wixEvents.AVIARY_EDIT_IMAGE, {
                    c1: jasmine.any(String),
                    c2: options.componentType,
                    g2: 'panel',
                    i1: options.isEdited ? 1 : 0
                });
            });

            if (options.isEdited) {
                describe_revert_button(function () {
                    it_should_be_visible();
                    it_should_have_text(options.i18n_revert);
                    it_should_log_BI_event_on_click(wixEvents.AVIARY_REVERT_IMAGE, {
                        c1: jasmine.any(String),
                        c2: options.componentType,
                        i1: options.isEdited ? 1 : 0
                    });

                    when_clicked(function () {
                        it_should_revert_input_data_to_original();

                        if (options.background) {
                            it_should_revert_component_background_to_original();
                        } else {
                            it_should_revert_component_image_to_original();
                        }

                        it_should_revert_picture_preview_image_to_original();
                        it_should_be_hidden();
                    });
                });
            } else {
                describe_revert_button(function () {
                    it_should_be_hidden();
                });
            }
        }

        describe_delete_button(function () {
            if (options.hasDelete) {
                it_should_be_visible();
                it_should_have_text(options.i18n_remove);

                when_clicked(function () {
                    suite_when_input_is_empty(options);
                });
            } else {
                it_should_be_hidden();
            }
        });
    }

    function suite_when_image_was_changed(options) {
        describe_component(function () {
            if (options.background) {
                it_should_update_background_image();
                
                when_scaling_was_changed_to(1, function () {
                    it_should_keep_original_radio_selection();
                    it_should_update_background_option();
                });

                when_scaling_was_changed_to(2, function () {
                    it_should_keep_original_radio_selection();
                    it_should_update_background_option();
                });
            } else {
                it_should_update_image();
            }

            if (options.componentType !== "Background") {
                it_should_have_original_data('alt');
            }

            if (options.componentType.match(/WPhoto$/)) {
                it_should_have_original_data('title');

                describe_title_input(function () {
                    it_should_keep_original_value_of('title');
                });

                describe_alt_input(function () {
                    it_should_keep_original_value_of('alt');
                });
            }

            if (options.mobileInputs) {
                it_should_make_mobile_inputs({ hidden: false });
            }
        });

        describe_picture_preview(function () {
            it_should_update_image();
        });

        suite_when_input_has_image(options);
    }

    function suite_for_image_based_components(options) {
        _.extend(options, {
            hasDelete: false,
            isEdited: false,
            background: false
        });

        suite_that_must_work_always(options);
        suite_when_input_has_image(options);

        when_image_is_selected_from_gallery_using_Change_Button(function () {
            suite_when_image_was_changed(options);
        });

        if (options.isChangeImageOnFPP) {
            when_image_is_selected_from_gallery_using_FPP(function () {
                suite_when_image_was_changed(options);
            });
        }

        if (options.isEditableImageInput) {
            when_image_has_been_edited_in_Aviary_using_Edit_Button(function () {
                suite_when_image_was_changed(_.extend({}, options, { isEdited: true }));
            });
        }

        if (options.isAviaryOnFPP) {
            when_image_has_been_edited_in_Aviary_using_FPP(function () {
                suite_when_image_was_changed(_.extend({}, options, { isEdited: true }));

                if (options.isChangeImageOnFPP) {
                    when_image_is_selected_from_gallery_using_FPP(function () {
                        suite_when_image_was_changed(options);
                    });
                }
            });
        }
    }

    function create_utility() {
        var promised_components = {};

        var u = {
            promiseComponent: function (comp) {
                if (!promised_components[comp]) {
                    promised_components[comp] = automation.viewercomponents.ViewerComponent.addComponent({
                        compData: presets[comp]
                    });
                }

                return promised_components[comp];
            },
            addComponent: function (componentName) {
                this.data = componentName;

                var promise = utility.promiseComponent(componentName);
                promise = promise.then(utility.initializeData);
                promise = promise.then(utility.memorizeComponent);
                promise = promise.then(utility.openComponentPanel);
                promise = promise.then(function (spec) { subject = spec.imageInput; });

                automation.Utils.waitsForPromise(function () {
                    return promise;
                }, 5000);
            },
            initializeData: function (component) {
                var componentName = this.data,
                    dataItem = utility.getComponentImageData(component);

                this.data = {
                    modified: _.clone(presets[componentName + '_modified']),
                    nothing: _.clone(presets.noimage)
                };

                if (componentName === 'imagebutton') {
                    this.data.original = _.omit(presets[componentName].dataRefs.defaultImage.data, 'type');
                } else {
                    this.data.original = _.omit(presets[componentName].data, 'type');
                }

                dataItem.setFields(_.omit(this.data.original, 'type', 'metaData'));

                return component;
            },
            memorizeComponent: function (component) {
                this.component = component.$view;
            },
            callInputMediaGalleryCallback: function (data) {
                var logic = this.imageInput.$logic;

                if (logic.$className.match(/Editable/)) {
                    logic._mediaGalleryCallback(data);
                } else {
                    (logic._args.mgCallback || logic._onImgSelect).call(logic, data);
                }
            },
            openComponentPanel: function (componentPanel) {
                componentPanel = componentPanel || W.Editor.getPropertyPanel()._dataPanel;

                this.panel = panel = componentPanel;
                this.imageInput     = this.panel.querySelector("[comp$=ImageInput]");
                this.editButton     = this.imageInput.querySelector("[skinPart=editButton]");
                this.changeButton   = this.imageInput.querySelector("[skinPart=changeButton]");
                this.deleteButton   = this.imageInput.querySelector("[skinPart=deleteButton]");
                this.revertButton   = this.imageInput.querySelector("[skinPart=revertButton]");
                this.picturePreview = this.imageInput.querySelector("[skinPart=image]");

                return this;
            },
            extractImageFromUri: function (path) {
                path = path || "none";
                path = path.replace(/url\((.*)\)/, "$1");
                path = path.replace(/\?.*$/,"");
                path = path.replace(/.*\//,"");
                path = path.replace(/\.(jpg|jpeg|png|gif).+$/, ".$1");

                return path;
            },
            getBackgroundNode: function (container) {
                var bgNode = container.querySelector("[style*='background-image']");
                bgNode = bgNode || container.querySelector("[skinpart=bg]");

                return bgNode;
            },
            isBackgroundEqual: function (component, expectedUri) {
                var bg = utility.getBackgroundNode(component),
                    actualUri = utility.extractImageFromUri(bg.style.backgroundImage);

                actualUri = actualUri || 'none';
                expectedUri = expectedUri || 'none';

                return actualUri === expectedUri;
            },
            getComponentImageData: function (component) {
                component = component || this.component.$logic;

                var data = component.getDataItem();

                if (component.$className.match(/Background$/)) {
                    if (!data) {
                        data = panel.$logic.getDataItem().get('bg');
                        data = panel.$logic._backgroundToImage(data);
                        data.originalImageDataRef = panel.$logic._cachedImageRef;
                        data = W.Data.createDataItem(data);
                    }

                    return data;
                }

                if (component.$className.match(/ImageButton$/)) {
                    return W.Preview.getPreviewManagers().Data.getDataByQuery(data.get('defaultImage'));
                }

                return data;
            },
            editImageInAviary: function (editedData, isFPP) {
                var dataItem = utility.getComponentImageData(),
                    rawData = _.omit(dataItem.getData(), 'id', 'metaData'),
                    original = W.Data.addDataItemWithUniqueId('orig', rawData);

                editedData = _.pick(editedData, 'height', 'width', 'uri');
                editedData.originalImageDataRef = '#' + original.id;

                if (isFPP) {
                    dataItem.setFields(editedData);
                } else {
                    this.picturePreview.$logic._data.setFields(editedData);
                    this.imageInput.$logic._aviaryCallback();
                }

                return editedData.originalImageDataRef;
            },
            locateComponent: function (container, comp, text) {
                function hasText(component) {
                    var actualText = component.get('text').trim();
                    return actualText === text;
                }

                var query = "[comp$='" + comp + "']";
                var components = container.querySelectorAll(query);
                return _(components).find(hasText);
            },
            translate: function (key, bundle) {
                return W.Resources.get(bundle || 'EDITOR_LANGUAGE', key);
            }
        };

        beforeEach(function () {
            var key, fn;

            utility = {};
            for (key in u) { if (u.hasOwnProperty(key)) {
                fn = u[key];
                if (typeof fn === "function") {
                    utility[key] = fn.bind(this);
                }
            } }
        });

        return u;
    }

    function create_presets() {
        var presets = {
            wphoto: {
                "comp": "wysiwyg.viewer.components.WPhoto",
                "skin": "wysiwyg.viewer.skins.wphoto.RoundWPhotoSkin",
                "data": {
                    "type": "Image",
                    "uri": "607cc4_86003ee1f8444c0b97d7687f3a0ad527.jpg",
                    "title": "Title: Original WPhoto",
                    "alt": "Alt: Original WPhoto",
                    "width": 100,
                    "height": 100
                },
                "layout": {
                    "width": 100,
                    "height": 100
                }
            },
            bgstrip: {
                "comp": "wysiwyg.viewer.components.BgImageStrip",
                "skin": "wysiwyg.viewer.skins.bgimagestrip.BgImageStripSkin",
                "data": {
                    "type": "Image",
                    "uri": "",
                    "title": "Title: Original BgStrip",
                    "alt": "Alt: Original BgStrip",
                    "width": 100,
                    "height": 100,
                },
                "layout": { height: 100 }
            },
            clipart: {
                "comp": "wysiwyg.viewer.components.ClipArt",
                "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                "data": {
                    "type":  "Image",
                    "uri":   "b6ff736f264785ab27afa9416c8d5cab.png",
                    "alt": "Alt: Original ClipArt",
                    "width":  200,
                    "height": 200
                },
                "layout": {
                    "width":  200,
                    "height": 200
                }
            },
            imagebutton: {
                "comp": "wysiwyg.common.components.imagebutton.viewer.ImageButton",
                "skin": "wysiwyg.common.components.imagebutton.viewer.skins.ImageButtonSkin",
                "data": {
                    "type": "ImageButton",
                    "alt": "ImageButton: Original Alt"
                },
                "dataRefs": {
                    "defaultImage": {
                        "data": {
                            "type": "Image",
                            "uri": "1731b3_c1cd1ba960b34dada2faae0a6625dd42.png",
                            "width": 98,
                            "height": 98,
                            "alt": "ImageButton: Original Alt",
                            "metaData": {
                                "isPreset": true
                            }
                        }
                    },
                    "hoverImage": {
                        "data": {
                            "type": "Image",
                            "uri": "1731b3_d294fe832cf944d69eb663cd981089fb.png",
                            "width": 98,
                            "height": 98,
                            "metaData": {
                                "isPreset": true
                            }
                        }
                    },
                    "activeImage": {
                        "data": {
                            "type": "Image",
                            "uri": "1731b3_d576a3da470d41cc8251b841b3e851fa.png",
                            "width": 98,
                            "height": 98,
                            "metaData": {
                                "isPreset": true
                            }
                        }
                    }
                },
                "layout": {
                    "width": 98,
                    "height": 98
                },
                "props": {
                    "type": "ImageButtonProperties"
                }
            },
            noimage: {
                "type":  "Image",
                "uri":   "none",
                "width":  128,
                "height": 128
            },
            links: {
                data: {
                    type: "ExternalLink",
                    url: "http://example.com",
                    target: "_self"
                }
            }
        };

        _.extend(presets, {
            wphoto_modified: _.extend({}, presets.wphoto.data, {
                uri: "84770f_cecaffe58665424494ade4929edbc641.jpg",
                width: 426,
                height:	567,
                title: "Title: Modified WPhoto",
                alt:   "Alt: Modified WPhoto"
            }),
            clipart_modified: _.extend({}, presets.clipart.data, {
                uri: "481e93c3c01f590373811bc646473608.png",
                width: 100,
                height:	100,
                alt:   "Alt: Modified ClipArt"
            }),
            background: _.clone(presets.clipart.data),
            background_modified: _.extend({}, presets.background, {
                uri: "84770f_cecaffe58665424494ade4929edbc641.jpg",
                width: 426,
                height: 567
            }),
            bgstrip_modified: _.extend({}, presets.bgstrip.data, {
                uri: "84770f_cecaffe58665424494ade4929edbc641.jpg",
                width: 426,
                height: 567,
                title: "Title: Modified BgStrip",
                alt:   "Alt: Modified BgStrip"
            }),
            imagebutton_modified: _.extend({}, presets.noimage, {
                uri: "607cc4_642bb586a9ab4070ac44a6fcfbcd7732.png",
                alt: "Alt: Modified ImageButton",
                width: 98,
                height: 98
            })
        });

        beforeAll(function () {
            var manager = W.Preview.getPreviewManagers().Data;
            presets.links.wphoto  = manager.addDataItemWithUniqueId('wphotolink', presets.links.data);
            presets.links.clipart = manager.addDataItemWithUniqueId('clipartlink', presets.links.data);
        });

        afterAll(function () {
            W.Data.removeDataItem('#' + presets.links.wphoto.id);
            delete presets.links.wphoto;

            W.Data.removeDataItem('#' + presets.links.clipart.id);
            delete presets.links.clipart;
        });

        return presets;
    }

    function jasmine_use_single_thread_mode() {
        var lock = false;

        beforeEach(function () {
            waitsFor(function () {
                return !lock && (lock = true);
            }, 5000);
        });

        afterEach(function () {
            lock = false;
        });
    }

    function jasmine_extra_matchers() {
        beforeEach(function () {
            this.addMatchers({
                toBeTranslated: function (label, bundle) {
                    var expected = W.Resources.get(bundle || 'EDITOR_LANGUAGE', label);
                    return this.actual.trim() === expected.trim();
                },
                toBeHidden: function () {
                    return this.actual.hasClass("hidden");
                },
                toBeDisabled: function () {
                    return this.actual.hasAttribute("disabled");
                },
                toHaveSkin: function (skin) {
                    return this.actual.getAttribute("skin").indexOf(skin) !== -1;
                },
                toHavePicture: function (expectedSrc) {
                    var img = this.actual.querySelector("img"),
                        actualSrc = utility.extractImageFromUri(img.src);

                    return actualSrc === expectedSrc;
                },
                toHaveBackground: function (expectedSrc) {
                    var bg = this.actual.querySelector("[skinPart=bg]"),
                        actualSrc = utility.extractImageFromUri(bg.style.backgroundImage);

                    actualSrc = actualSrc || 'none';
                    expectedSrc = expectedSrc || 'none';

                    return actualSrc === expectedSrc;
                },
                toBeComponent: function (className) {
                    return this.actual.$logic.$className.indexOf(className) !== -1;
                }
            });
        });
    }

    function it_should_show_the_same_image_as_the_edited_component(hasBackground) {
        it("should show the same image as the edited component", function () {
            var previewImage,
                componentImage,
                bgNode;

            if (this.imageInput.getAttribute("state").indexOf("missingImage") >= 0) {
                previewImage = "none";
            } else {
                previewImage = this.picturePreview.querySelector("img");
                previewImage = utility.extractImageFromUri(previewImage.src);
            }

            if (hasBackground) {
                bgNode = utility.getBackgroundNode(this.component);

                componentImage = bgNode.style.backgroundImage || 'none';
                componentImage = utility.extractImageFromUri(componentImage);
            } else {
                componentImage = this.component.querySelector("img");
                componentImage = utility.extractImageFromUri(componentImage.src);
            }

            expect(previewImage).toBe(componentImage);
        });
    }

    function it_should_show_empty_placeholder() {
        it("should show empty placeholder", function () {
            expect(this.imageInput.getAttribute("state")).toMatch(/missingImage/);
            expect(this.picturePreview.querySelector("img").src).not.toMatch(/none.*none/);
        });
    }

    function it_should_have_transparent_background() {
        it("should have transparent background", function () {
            expect(subject).toBeComponent("ImageNew");
        });
    }

    function it_should_be_a_blue_button() {
        it("should be a blue button", function () {
            expect(subject).toHaveSkin("ButtonBaseBlueSkin");
        });
    }

    function it_should_be_a_silver_button() {
        it("should be a silver button", function () {
            expect(subject).toHaveSkin("ButtonBaseSkin");
        });
    }

    function it_should_be_a_text_link() {
        it("should be a text link", function () {
            expect(subject).toHaveSkin("ButtonBaseTextLinkSkin");
        });
    }

    function it_should_be_enabled() {
        it("should be enabled", function () {
            expect(subject).not.toBeDisabled();
        });
    }

    function it_should_be_disabled() {
        it("should be disabled", function () {
            expect(subject).toBeDisabled();
        });
    }

    function it_should_be_visible() {
        it("should be visible", function () {
            waitsFor(function () {
                return !subject.hasClass('hidden');
            }, 500);
        });
    }

    function it_should_be_hidden() {
        it("should be hidden", function () {
            waitsFor(function () {
                return subject.hasClass('hidden');
            }, 500);
        });
    }

    function it_should_have_text(i18n_text) {
        it("should have text " + i18n_text, function () {
            var text = subject.get('text');
            expect(text).toBeTranslated(i18n_text);
        });
    }

    function it_should_revert_input_data_to_original() {
        it("should revert input data to original", function () {
            var comparedProps = ['uri', 'width', 'height'],
                data = this.imageInput.$logic._value,
                originalData = this.data.original;

            data = _.pick(data, comparedProps);
            data.uri = data.uri || 'none';

            originalData = _.pick(originalData, comparedProps);
            originalData.uri = originalData.uri || 'none';

            expect(data).toEqual(originalData);
        });
    }

    function it_should_revert_component_image_to_original() {
        it("should revert component image to original", function () {
            expect(this.component).toHavePicture(this.data.original.uri);
        });
    }

    function it_should_revert_component_background_to_original() {
        it("should revert component background to original", function () {
            var component = this.component,
                originalUri = this.data.original.uri;

            waitsFor(function () {
                return utility.isBackgroundEqual(component, originalUri);
            }, 1500, "component background was not equal to " + originalUri);
        });
    }

    function it_should_revert_picture_preview_image_to_original() {
        it("should revert picture preview image to original", function () {
            var uri = this.data.original.uri;
            if (uri && uri !== 'none') {
                expect(this.picturePreview).toHavePicture(this.data.original.uri);
            } else {
                expect(this.imageInput.getAttribute('state')).toMatch(/missingImage/);
            }
        });
    }

    function it_should_open_media_gallery_on_click() {
        it("should open media gallery on click", function () {
            var command = W.Commands.getCommand("WEditorCommands.OpenMediaFrame"),
                execute = spyOn(command, 'execute');

            subject.click();
            expect(execute).toHaveBeenCalled();
        });
    }

    function it_should_open_Aviary_dialog_on_click() {
        it("should open Aviary dialog on click", function () {
            var openDialog = spyOn(W.EditorDialogs, 'openAviaryDialog');
            subject.click();

            expect(openDialog).toHaveBeenCalled();
        });
    }

    function it_should_log_BI_event_on_click(biEvent, options) {
        it("should log BI event " + biEvent.biEventId + " on click", function () {
            var biLogger = spyOn(LOG, 'reportEvent');
            spyOn(W.EditorDialogs, 'openAviaryDialog');

            subject.click();

            expect(biLogger).toHaveBeenCalledWith(biEvent, options);
        });
    }

    function it_should_not_open_Aviary_dialog_on_click() {
        it("should not open Aviary Dialog on click", function () {
            var openDialog = spyOn(W.EditorDialogs, 'openAviaryDialog');
            subject.click();

            expect(openDialog).not.toHaveBeenCalled();
        });
    }

    function it_should_update_image() {
        it("should update image", function () {
            expect(subject).toHavePicture(this.data.modified.uri);
        });
    }

    function it_should_have_original_data(propertyName) {
        it("should have original '" + propertyName + "' data", function () {
            var data = subject.$logic.getDataItem();

            var original = this.data.original[propertyName];
            expect(data.get(propertyName)).toBe(original);
        });
    }

    function it_should_have_value(expectedValue) {
        it("should have value " + expectedValue, function () {
            var input = subject.querySelector("input");

            if (expectedValue === undefined) {
                expect(input.value).toBeDefined();
            } else {
                expect(input.value).toBe(expectedValue);
            }
        });
    }

    function it_should_keep_original_value_of(propertyName) {
        it("should keep original " + propertyName + " value", function () {
            var input = subject.querySelector("input");

            expect(input.value).toBe(this.data.original[propertyName]);
        });
    }

    function it_should_keep_original_radio_selection() {
        it("should keep original radio selection after awhile", function () {
            var radio = this.radio,
                checked;

            setTimeout(function () {
                checked = radio.checked;
            }, 400);

            waitsFor(function () {
                return checked;
            }, 500);
        });
    }

    function it_should_update_background_image() {
        it("should update background", function () {
            var component = this.component,
                modified = this.data.modified.uri;

            waitsFor(function () {
                return utility.isBackgroundEqual(component, modified);
            }, 1500, "component background was not equal to " + modified);
        });
    }

    function it_should_update_background_option() {
        it("should update background option", function () {
            var bg = utility.getBackgroundNode(this.component),
                option = this.radio.value.trim();

            waitsFor(function () {
                return getComputedStyle(bg).background.indexOf(option) !== -1;
            }, 1500, "component background did not contain " + option);
        });
    }

    function it_should_make_mobile_inputs(options) {
        var action = (options.hidden) ? "hide" : "show";

        it("should " + action + " mobile inputs", function () {
            waitsFor(function () {
                return subject.$logic.EDITOR_META_DATA.mobile.allInputsHidden === Boolean(options.hidden);
            }, 500, "mobile inputs to " + action);
        });
    }

    function it_should_have_FPP_action(expectedLabel) {
        it("should have FPP action " + expectedLabel, function () {
            var meta = subject.$logic.EDITOR_META_DATA || {};
            var labels = _.map(meta.custom, function (entry) {
                return entry.label;
            });

            expect(labels).toContain(expectedLabel);
        });
    }

    function describe_component(innerDescribe) {
        describe("component", function () {
            beforeEach(function () {
                subject = this.component;
            });

            innerDescribe();
        });
    }

    function describe_picture_preview(innerDescribe) {
        describe("picture preview", function () {
            beforeEach(function () {
                subject = this.picturePreview;
            });

            innerDescribe();
        });
    }

    function describe_change_button(innerDescribe) {
        describe("change button", function () {
            beforeEach(function () {
                subject = this.changeButton;
            });

            innerDescribe();
        });
    }

    function describe_edit_button(innerDescribe) {
        describe("edit button", function () {
            beforeEach(function () {
                subject = this.editButton;
            });

            innerDescribe();
        });
    }

    function describe_revert_button(innerDescribe) {
        describe("revert button", function () {
            beforeEach(function () {
                subject = this.revertButton;
            });

            innerDescribe();
        });
    }

    function describe_delete_button(innerDescribe) {
        describe("delete button", function () {
            beforeEach(function () {
                subject = this.deleteButton;
            });

            innerDescribe();
        });
    }

    function describe_add_animation(innerDescribe) {
        describe("Add Animation button", function () {
            beforeEach(function () {
                var label = panel.$logic._getAnimationLabel();
                subject = utility.locateComponent(panel, "WButton", label);
            });

            innerDescribe();
        });
    }

    function describe_link_input(innerDescribe) {
        describe("Link to:", function () {
            beforeEach(function () {
                var label = utility.translate('LINK_LINK_TO');
                subject = utility.locateComponent(panel, ".Link", label);
            });

            innerDescribe();
        });
    }

    function describe_title_input(innerDescribe) {
        describe("Title input", function () {
            beforeEach(function () {
                var label = utility.translate('PHOTO_TITLE');
                subject = utility.locateComponent(panel, ".Input", label);
            });

            innerDescribe();
        });
    }

    function describe_alt_input(innerDescribe) {
        describe("Alt input", function () {
            beforeEach(function () {
                var label = utility.translate('PHOTO_ALT_TEXT');
                subject = utility.locateComponent(panel, ".Input", label);
            });

            innerDescribe();
        });
    }

    function when_image_is_selected_from_gallery_using_FPP(innerDescribe) {
        describe("when image is selected from gallery using FPP, ", function () {
            beforeEach(function () {
                var modified = _.clone(this.data.modified);
                modified.fileName = modified.uri;

                this.component.$logic._mediaGalleryCallback(modified);
            });

            innerDescribe();
        });
    }

    function when_image_is_selected_from_gallery_using_Change_Button(innerDescribe) {
        describe("when image is selected from gallery using Change Button, ", function () {
            beforeEach(function () {
                var modified = _.clone(this.data.modified);
                modified.fileName = modified.uri;

                utility.callInputMediaGalleryCallback(modified);
            });

            innerDescribe();
        });
    }

    function when_image_has_been_edited_in_Aviary_using_Edit_Button(innerDescribe) {
        describe("when image has been edited in Aviary using Edit Button, ", function () {
            var ref;

            beforeEach(function () {
                var original = _.clone(this.data.original);

                this.imageInput.$logic.setValue(original);
                ref = utility.editImageInAviary(this.data.modified, false);
            });

            afterEach(function () {
                utility.getComponentImageData().set('originalImageDataRef', null);
                W.Data.removeDataItem(ref);
            });

            innerDescribe();
        });
    }

    function when_image_has_been_edited_in_Aviary_using_FPP(innerDescribe) {
        describe("when image has been edited in Aviary using FPP, ", function () {
            var ref;

            beforeEach(function () {
                var original = _.clone(this.data.original);

                this.imageInput.$logic.setValue(original);
                ref = utility.editImageInAviary(this.data.modified, true);
            });

            afterEach(function () {
                utility.getComponentImageData().set('originalImageDataRef', null);
                W.Data.removeDataItem(ref);
            });

            innerDescribe();
        });
    }

    function when_scaling_was_changed_to(i, innerDescribe) {
        describe("when scaling was changed to radio " + i, function () {
            beforeEach(function () {
                var selector = "[comp$=RadioButtons] [comp$=Radio]:nth-child("+i+") input";
                this.radio = panel.querySelector(selector);
                this.radio.click();
            });

            innerDescribe(i);
        });
    }

    function when_added_a_link(linkName, innerDescribe) {
        describe("when added a link", function () {
            beforeEach(function () {
                var data = this.component.$logic.getDataItem();
                data.set('link', '#' + presets.links[linkName].id);
            });

            innerDescribe();
        });
    }

    function when_clicked(innerDescribe) {
        describe("when clicked, ", function () {
            beforeEach(function () {
                subject.click();
            });

            innerDescribe();
        });
    }

    function describe_clipart_panel(innerDescribe) {
        describe("on Clipart panel:", function () {
            beforeEach(function () {
                utility.addComponent("clipart");
            });

            innerDescribe();
        });
    }

    function describe_image_panel(innerDescribe) {
        describe("on Image panel:", function () {
            beforeEach(function () {
                utility.addComponent("wphoto");
            });

            innerDescribe();
        });
    }

    function describe_image_strip_panel(innerDescribe) {
        describe("on Image Strip panel:", function () {
            beforeEach(function () {
                utility.addComponent("bgstrip");
            });

            innerDescribe();
        });
    }

    function describe_imagebutton_panel(innerDescribe) {
        describe("on ImageButton panel:", function () {
            beforeEach(function () {
                utility.addComponent("imagebutton");
            });

            innerDescribe();
        });
    }

    function describe_background_panel(innerDescribe) {
        describe("on Background panel:", function () {
            beforeEach(function () {
                var previewDocument = W.Preview.getPreviewSite().document;
                this.component = previewDocument.querySelector("[comp$=DesktopBackground]");

                this.data = {
                    original: _.clone(presets.background),
                    modified: _.clone(presets.background_modified)
                };

                automation.Utils.waitsForPromise(function () {
                    return open_background_panel().
                           then(reset_background_to_original.bind(this));
                }.bind(this), 5000);
            });

            function open_background_panel() {
                var thePanel = document.querySelector("[comp$=BackgroundEditorPanel]");

                if (thePanel) {
                    utility.openComponentPanel(thePanel);
                    return Q();
                }

                return Q().
                    then(function () {
                        return automation.WebElement.waitForElementToExist(document.body, "#tbDesign");
                    }).
                    then(function (button) {
                        button.click();
                        return automation.WebElement.waitForElementToExist(document.body, "[skinpart=sidePanel] [comp$=WButton]");
                    }).
                    then(function (button) {
                        button.click();
                        return automation.WebElement.waitForElementToExist(document.body, "[skinpart=sidePanel] [skinpart=customize]");
                    }).
                    then(function (button) {
                        button.click();
                        return automation.WebElement.waitForElementToExist(document.body, "[comp$=BackgroundEditorPanel]");
                    }).
                    then(function (backgroundPanel) {
                        utility.openComponentPanel(backgroundPanel);
                    });
            }

            function reset_background_to_original() {
                utility.callInputMediaGalleryCallback(this.data.original);
            }

            innerDescribe();
        });
    }
}); 
