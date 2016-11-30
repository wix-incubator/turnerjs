describe("Clip Art: ", function () {
    var utility = new Utility(),
        STRETCH_RATIO = 1.5,
        presets,
        component,
        panel,
        subject;

    jasmine_extra_matchers();

    describe("when added to stage, ", function () {
        suite_that_should_work_always({ modified: false, obvious: true });
        suite_when_proportional_scaling_is_enabled();
    });

    describe("when image is selected from gallery using FPP, ", function () {
        beforeAll(function () {
            var modified = _.clone(presets.modified);
            modified.fileName = modified.uri;

            component.$logic._mediaGalleryCallback(modified);
        });

        afterAll(function () {
            utility.revertData.call(this);
        });

        suite_that_should_work_always({ modified: true, obvious: false });
    });

    describe("when image is selected from gallery using Change Button, ", function () {
        beforeAll(function () {
            var modified = _.clone(presets.modified);
            var imageInput = panel.querySelector("[comp*=ImageInput]");

            imageInput.$logic.setValue(modified);
        });

        afterAll(function () {
            utility.revertData.call(this);
        });


        suite_that_should_work_always({ modified: true, obvious: false });
    });

    describe("when image has been edited in Aviary using FPP, ", function () {
        beforeAll(function () {
            var dataItem = component.$logic.getDataItem(),
                rawData = _.omit(dataItem.getData(), 'id', 'metaData'),
                original = W.Data.addDataItemWithUniqueId('orig', rawData);

            this.origDataRef = '#' + original.id;

            var modified = _.extend({}, presets.modified, {
                originalImageDataRef: this.origDataRef
            });

            component.$logic.getDataItem().setFields(modified);
        });

        afterAll(function () {
            utility.revertData.call(this);

            W.Data.removeDataItem(this.origDataRef);
            delete this.origDataRef;
        });

        suite_that_should_work_always({ modified: true, obvious: false });
    });

    describe("when proportional scaling was enabled, ", function () {
        beforeAll(function () {
            utility.setCheckbox(true);
        });

        suite_when_proportional_scaling_is_enabled();

        describe("when proportional scaling was disabled, ", function () {
            beforeAll(function () {
                utility.setCheckbox(false);
            });

            suite_when_proportional_scaling_is_disabled();
        });
    });

    describe("when proportional scaling had been enabled and Undo was pressed, ", function () {
        beforeAll(function () {
            utility.setCheckbox(true);

            runs(function () {
                W.Commands.executeCommand("WEditorCommands.Undo");
            });
        });

        suite_when_proportional_scaling_is_disabled();
    });

    describe("when proportional scaling had been enabled, undoed and again redoed", function () {
        beforeAll(function () {
            utility.setCheckbox(true);
            utility.setCheckbox(false);

            runs(function () {
                W.Commands.executeCommand("WEditorCommands.Undo");
                W.Commands.executeCommand("WEditorCommands.Redo");
            });
        });

        suite_when_proportional_scaling_is_enabled();
    });

    function suite_that_should_work_always(options) {
        describe("on component panel, ", function () {
            describe_change_clip_art(function () {
                it_should_be_enabled();
            });

            if (options.obvious) {
                describe_add_animation(function () {
                    it_should_be_enabled();
                });

                describe_proportional_scaling_checkbox(function () {
                    it_should_show_input_group_on_mobile_panel();
                    it_should_have_text('CLIP_ART_MAINTAIN_ASPECT_RATIO');
                });

                describe_link_to(function () {
                    it_should_be_enabled();
                    it_should_have_a_placeholder('LINK_ADD_LABEL');
                });
            }
        });

        describe_component(function () {
            it_should_not_display_tooltip_on_hover();
        });

        describe_image_preview(function () {
            if (options.obvious) {
                it_should_have_transparent_background();
            }

            var picture = options.modified ? "modified" : "original";
            it_should_display_picture(picture);
        });
    }

    function suite_when_proportional_scaling_is_enabled() {
        describe_settings_panel(function () {
            describe_proportional_scaling_checkbox(function () {
                it_should_be_checked();
            });
        });

        after_component_was_stretched_vertically(function () {
            describe_component_image(function () {
                it_should_take_up_all_component_width();
                it_should_take_up_part_of_component_height();
            });
        });

        after_component_was_stretched_horizontally(function () {
            describe_component_image(function () {
                it_should_take_up_part_of_component_width();
                it_should_take_up_all_component_height();
            });
        });
    }

    function suite_when_proportional_scaling_is_disabled() {
        describe_settings_panel(function () {
            describe_proportional_scaling_checkbox(function () {
                it_should_be_unchecked();
            });
        });

        after_component_was_stretched_vertically(suite_after_stretch);
        after_component_was_stretched_horizontally(suite_after_stretch);

        function suite_after_stretch() {
            describe_component_image(function () {
                it_should_take_up_all_component_width();
                it_should_take_up_all_component_height();
            });
        }
    }

    beforeEach(init_preset_data);

    beforeAll(function () {
        init_preset_data();

        automation.Utils.waitsForPromise(function () {
            var preset = utility.getDefaultPreset();
            var promise = automation.viewercomponents.ViewerComponent.addComponent(preset);

            return promise.then(function (compLogic) {
                component = compLogic.$view;
                panel = W.Editor.getPropertyPanel()._dataPanel;
            });
        }.bind(this));
    });

    function Utility() {}

    Utility.prototype.getDefaultPreset = function () {
        var COMPONENT_TYPES = W.Data.getDataByQuery('#COMPONENT_TYPES'),
            compData = COMPONENT_TYPES.get('items').ClipArt.component;

        compData = typeof compData === "function" ? compData() : compData;

        return {
            compType: this.compType,
            compData: _.cloneDeep(compData)
        };
    };

    Utility.prototype.extractImageFromUri = function (path) {
        path = path || "none";
        path = path.replace(/url\((.*)\)/, "$1");
        path = path.replace(/\?.*$/,"");
        path = path.replace(/.*\//,"");
        path = path.replace(/\.(jpg|jpeg|png|gif).+$/, ".$1");

        return path;
    };

    Utility.prototype.revertData = function () {
        component.$logic.getDataItem().setFields(
            _.extend({ originalImageDataRef: null }, presets.original)
        );
    };

    Utility.prototype.setCheckbox = function (value) {
        var checkbox = panel.querySelector("[comp$=CheckBox] input"),
            ops;

        if (checkbox.checked === Boolean(value)) {

            runs(function () {
                ops = W.UndoRedoManager._undoStack.length + 1;
                checkbox.click();
            });

            waitsFor(function () {
                return W.UndoRedoManager._undoStack.length === ops;
            }, 1000);
        }

        runs(function () {
            ops = W.UndoRedoManager._undoStack.length + 1;
            checkbox.click();
        });

        waitsFor(function () {
            return W.UndoRedoManager._undoStack.length === ops;
        }, 1000);
    };

    function jasmine_extra_matchers() {
        beforeEach(function () {
            this.addMatchers({
                toBeTranslated: function (label, bundle) {
                    var expected = W.Resources.get(bundle || 'EDITOR_LANGUAGE', label);
                    return (this.actual || "").trim() === expected.trim();
                },
                toBeDisabled: function () {
                    return this.actual.hasAttribute("disabled");
                },
                toHavePicture: function (expectedSrc) {
                    var img = this.actual.querySelector("img"),
                        actualSrc = utility.extractImageFromUri(img.src);

                    return actualSrc === expectedSrc;
                },
                toBeComponent: function (className) {
                    return this.actual.$logic.$className.indexOf(className) !== -1;
                }
            });
        });
    }
    
    function init_preset_data() {
        presets = {
            "original": {
                "uri":   "b6ff736f264785ab27afa9416c8d5cab.png",
                "width":  200,
                "height": 200,
                "title": "Idea"
            },
            "modified": {
                "title":  "Modified",
                "uri":    "481e93c3c01f590373811bc646473608.png",
                "width":  100,
                "height": 100
            },
            "layout": {
                "width": 200,
                "height": 200
            }
        };
    }

    function it_should_have_a_placeholder(i18n_text) {
        it("should have a placeholder " + i18n_text, function () {
            var placeholder = subject.querySelector("input").getAttribute("placeholder");

            expect(placeholder).toBeTranslated(i18n_text);
        });
    }

    function it_should_have_transparent_background() {
        it("should have transparent background", function () {
            expect(subject).toBeComponent("ImageNew");
        });
    }

    function it_should_have_text(i18n_text) {
        it("should be have text " + i18n_text, function () {
            expect(subject.get('text')).toBeTranslated(i18n_text);
        });
    }

    function it_should_be_enabled() {
        it("should be enabled", function () {
            expect(subject).not.toBeDisabled();
        });
    }

    function it_should_be_checked() {
        it("should be checked", function () {
            var input = subject.querySelector("input");

            waitsFor(function () {
                return input.checked;
            }, 100);
        });
    }

    function it_should_be_unchecked() {
        it("should be unchecked", function () {
            var input = subject.querySelector("input");

            waitsFor(function () {
                return !input.checked;
            }, 100);
        });
    }

    function it_should_display_picture(which) {
        it("should display " + which + " picture", function () {
            expect(subject).toHavePicture(presets[which].uri);
        });
    }

    function it_should_not_display_tooltip_on_hover() {
        it("should not display tooltip on hover", function () {
            var tooltip = subject.getAttribute("title");
            expect(tooltip).toBeFalsy();
        });
    }

    function it_should_show_input_group_on_mobile_panel() {
        it("should show input group on mobile panel", function () {
            var group = subject.getParent('[comp$=InputGroup]');
            expect(group.hasClass('hiddenOnMobile')).toBe(false);
        });
    }

    function it_should_take_up_all_component_width() {
        it("should take up all component width", function () {
            var componentWidth = component.$logic.getWidth();

            waitsFor(function () {
                return subject.offsetWidth === componentWidth;
            }, 100, "width to change");
        });
    }

    function it_should_take_up_all_component_height() {
        it("should take up all component height", function () {
            var componentHeight = component.$logic.getHeight();

            waitsFor(function () {
                return subject.offsetHeight === componentHeight;
            }, 100, "height to change");
        });
    }

    function it_should_take_up_part_of_component_width() {
        it("should take up part of component width", function () {
            var componentWidth = component.$logic.getWidth(),
                partWidth = Math.round(componentWidth / STRETCH_RATIO),
                offset = Math.floor(0.5 * (componentWidth - partWidth));

            waitsFor(function () {
                return subject.offsetWidth === partWidth;
            }, 100, "width to change");

            waitsFor(function () {
                return subject.style.marginLeft === (offset + 'px');
            }, 100, "margin to change");
        });
    }

    function it_should_take_up_part_of_component_height() {
        it("should take up part of component height", function () {
            var componentHeight = component.$logic.getHeight(),
                partHeight = Math.round(componentHeight / STRETCH_RATIO),
                offset = Math.floor(0.5 * (componentHeight - partHeight));

            waitsFor(function () {
                return subject.offsetHeight === partHeight;
            }, 100, "height to change");

            waitsFor(function () {
                return subject.style.marginTop === (offset + 'px');
            }, 100, "margin to change");
        });
    }

    function describe_component(innerDescribe) {
        describe("component", function () {
            beforeAll(function () {
                subject = component;
            });

            innerDescribe();
        });
    }

    function describe_settings_panel(innerDescribe) {
        describe("on settings panel, ", function () {
            beforeAll(function () {
                subject = panel;
            });

            innerDescribe();
        });
    }

    function describe_component_image(innerDescribe) {
        describe("component image", function () {
            beforeAll(function () {
                subject = component.querySelector("img");
            });

            innerDescribe();
        });
    }

    function describe_image_preview(innerDescribe) {
        describe("image preview", function () {
            beforeAll(function () {
                subject = panel.querySelector("[comp*=ImageInput] [skinPart=image]");
            });

            innerDescribe();
        });
    }

    function describe_change_clip_art(innerDescribe) {
        describe("Change Clip Art", function () {
            beforeAll(function () {
                subject = panel.querySelector("[comp*=ImageInput] [skinPart=changeButton]");
            });

            innerDescribe();
        });
    }

    function describe_add_animation(innerDescribe) {
        describe("Add Animation", function () {
            beforeAll(function () {
                function isAnimationButton(button) {
                    var text = button.get('text').trim();

                    return text === panel.$logic._getAnimationLabel();
                }

                var buttons = panel.querySelectorAll("[comp$=InputGroup] [comp$=WButton]");
                subject = _(buttons).find(isAnimationButton);
            });

            innerDescribe();
        });
    }

    function describe_proportional_scaling_checkbox(innerDescribe) {
        describe("Proportional Scaling checkbox", function () {
            beforeAll(function () {
                subject = panel.querySelector("[comp$=CheckBox]");
            });

            innerDescribe();
        });
    }

    function describe_link_to(innerDescribe) {
        describe("'Link to:' field", function () {
            beforeAll(function () {
                subject = panel.querySelector("[comp$=InputGroup] [comp$=Link]");
            });

            innerDescribe();
        });
    }

    function after_component_was_stretched_vertically(innerDescribe) {
        describe("after component was stretched vertically, ", function () {
            beforeAll(function () {
                var newHeight = presets.layout.height * STRETCH_RATIO;
                component.$logic.setWidth(presets.layout.width);
                component.$logic.setHeight(newHeight);
            });

            afterAll(function () {
                component.$logic.setHeight(presets.layout.height);
            });

            innerDescribe();
        });
    }

    function after_component_was_stretched_horizontally(innerDescribe) {
        describe("after component was stretched horizontally, ", function () {
            beforeAll(function () {
                var newWidth = presets.layout.width * STRETCH_RATIO;
                component.$logic.setWidth(newWidth);
                component.$logic.setHeight(presets.layout.height);
            });

            afterAll(function () {
                component.$logic.setWidth(presets.layout.width);
            });

            innerDescribe();
        });
    }
}); 
