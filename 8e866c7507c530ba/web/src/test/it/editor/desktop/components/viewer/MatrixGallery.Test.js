describe("Matrix Gallery, ", function () {
    var W_INPUT = '[skinpart=propertyPanel] [skinpart=wInput]',
        H_INPUT = '[skinpart=propertyPanel] [skinpart=hInput]',
        component;

    beforeEach(ensure_the_component_is_on_stage);

    describe_input_on_panel(W_INPUT, "width",  function () {
        when_its_value_is_divided_by_half(function () {
            describe_last_gallery_item(function () {
                it("should not go beyond new width", function () {
                    expect(this.galleryItem.offsetLeft).toBeLessThan(this.input.value);
                });
            });
        });
    });

    describe_input_on_panel(H_INPUT, "height",  function () {
        when_its_value_is_divided_by_half(function () {
            describe_last_gallery_item(function () {
                it("should not go beyond new height", function () {
                    expect(this.galleryItem.offsetTop).toBeLessThan(this.input.value);
                });
            });
        });
    });

    function ensure_the_component_is_on_stage() {
        if (component) return;

        var that = this;
        automation.Utils.waitsForPromise(function () {
            var COMPONENT_TYPES = W.Data.getDataByQuery('#COMPONENT_TYPES'),
                compData = COMPONENT_TYPES.get('items').addMatrixGallery.component,
                preset;

            compData = typeof compData === "function" ? compData() : compData;
            preset = {
                compType: 'addMatrixGallery',
                compData: _.cloneDeep(compData)
            };

            return automation.viewercomponents.ViewerComponent.addComponent(preset);
        })
        .then(function (compLogic) {
            component = compLogic;
            return automation.editorcomponents.EditorComponents.selectComponent(component);
        })
        .then(function (compLogic) {
            W.Editor.openComponentPropertyPanels(null, false, true);
        });
    }

    function describe_input_on_panel(selector, title, innerDescribe) {
        describe("on property panel, the " + title + " input, ", function () {
            beforeEach(function () {
                var that = this;
                automation.Utils.waitsForPromise(function () {
                    var promise = automation.WebElement.waitForElementToExist(document.body, selector);

                    return promise.then(function (input) {
                        that.input = input;
                    });
                });
            });

            innerDescribe();
        });
    }

    function when_its_value_is_divided_by_half(innerDescribe) {
        describe("when its value is divided by half, ", function () {
            var originalValue;

            beforeEach(function () {
                originalValue = this.input.value;
                this.input.value = Math.round(0.5 * originalValue);
                this.input.fireEvent(Constants.CoreEvents.BLUR, { target: this.input });
            });

            innerDescribe();

            afterEach(function () {
                this.input.value = originalValue;
                this.input.fireEvent(Constants.CoreEvents.BLUR, { target: this.input });
            });
        });
    }

    function describe_last_gallery_item(innerDescribe) {
        describe("the last item in gallery", function () {
            beforeEach(function () {
                this.galleryItem = component.$view.querySelector("[comp$=Displayer]:last-child");
            });

            innerDescribe();
        });
    }
});
