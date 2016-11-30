describe("mobile change text brightness", function () {
    var compId,
        compLogic,
        mobileFontColorBeforeBrightnessChange,
        mobileFontColorAfterBrightnessChange,
        mobileFontSizeBeforeScaleChange,
        mobileFontSizeAfterScaleChange,
        desktopFontColorBeforeBrightnessChange,
        desktopFontColorAfterBrightnessChange,
        desktopFontSizeBeforeScaleChange,
        desktopFontSizeAfterScaleChange,
        desktopComponentStyledElement,
        brightnessValue = 1.3,
        scaleValue = 1.8;

    beforeAll(function(){
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(addTextComponent)
                .then(saveCompInfoAndMoveToMobileMode)
                .then(selectMobileComponent);
        });
    });

    it('should change text color according to new brightness', function () {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(changeComponentBrightness)
                .then(validateMobileTextColorChange);
        });
    });
    it('should change text scale according to new scale', function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(changeComponentScale)
                .then(validateMobileTextSizeChange);
        });
    });
    it("should make sure that desktop component brightness wasn't changed", function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(moveToDesktopMode)
                .then(updateComponentInstance)
                .then(validateDesktopTextColorNoChange);
        });
    });
    it("should make sure that desktop component scale wasn't changed", function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(validateDesktopTextSizeNoChange);
        });
    });
    it("should make sure that text brightness change was saved", function(){
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(moveToMobileMode)
                .then(updateComponentInstance)
                .then(validateMobileTextColorChange);
        });
    });
    it("should make sure that text scale change was saved", function(){
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(validateMobileTextSizeChange);
        });
    });


    //help methods
    function addTextComponent() {
        return automation.viewercomponents.ViewerComponent.addComponent('richText');
    }

    function saveCompInfoAndMoveToMobileMode(compLogic) {
        compId = compLogic.getComponentId();
        desktopComponentStyledElement = getLastDescendant(compLogic.getRichTextContainer());
        desktopFontColorBeforeBrightnessChange = desktopComponentStyledElement.getStyle('color');
        desktopFontSizeBeforeScaleChange = desktopComponentStyledElement.getStyle('font-size');
        return moveToMobileMode();
    }

    function moveToMobileMode() {
        return automation.controllers.States.switchToMobileEditor();
    }

    function moveToDesktopMode() {
        return automation.controllers.States.switchToDesktopEditorSync();
    }

    function getLastDescendant(parentNode) {
        if (parentNode.children.length === 0) {
            return parentNode;
        }
        return getLastDescendant(parentNode.getFirst());
    }

    function selectMobileComponent() {
        updateComponentInstance();
        W.Editor.setSelectedComp(compLogic);
        W.Editor.openComponentPropertyPanels(false, false, true);
        return automation.WebElement.waitForElementToExist(W.Editor.getPanelsLayer().getViewNode(), '[comp="wysiwyg.editor.components.inputs.Slider"]');
    }

    function updateComponentInstance() {
        compLogic = W.Preview.getPreviewManagers().Viewer.getCompLogicById(compId);
    }

    function getNodeTextColor(node) {
        return node.getStyle('color');
    }

    function getNodeTextSize(node) {
        return node.getStyle('font-size');
    }

    function changeComponentBrightness() {
        mobileFontColorBeforeBrightnessChange = getNodeTextColor(desktopComponentStyledElement);
        compLogic.setComponentProperty('brightness', brightnessValue);
    }

    function changeComponentScale() {
        mobileFontSizeBeforeScaleChange = getNodeTextSize(desktopComponentStyledElement);
        compLogic.setScale(scaleValue);
    }

    function validateMobileTextColorChange() {
        var expectedColorAfterChange = getExpectedColorAfterChange();

        mobileFontColorAfterBrightnessChange = getNodeTextColor(getLastDescendant(compLogic.getRichTextContainer()));
        expect(expectedColorAfterChange).toBeEquivalentTo(mobileFontColorAfterBrightnessChange);
    }

    function getExpectedColorAfterChange() {
        var colorInstanceBeforeChange = W.Theme.getColorClassInstance(mobileFontColorBeforeBrightnessChange);
        var expectedColorInHsl = W.Utils.getNewColorAccordingToBrightness(colorInstanceBeforeChange , brightnessValue);
        return new Element('div', {styles: {color: expectedColorInHsl }}).getStyle('color');
    }

    function validateMobileTextSizeChange() {
        mobileFontSizeAfterScaleChange = getNodeTextSize(getLastDescendant(compLogic.getRichTextContainer()));
        expect(mobileFontSizeAfterScaleChange).not.toBeEquivalentTo(mobileFontSizeBeforeScaleChange);
    }

    function validateDesktopTextColorNoChange() {
        desktopFontColorAfterBrightnessChange = getNodeTextColor(getLastDescendant(compLogic.getRichTextContainer()));
        expect(desktopFontColorAfterBrightnessChange).toBeEquivalentTo(desktopFontColorBeforeBrightnessChange);
    }

    function validateDesktopTextSizeNoChange() {
        desktopFontSizeAfterScaleChange = getNodeTextSize(getLastDescendant(compLogic.getRichTextContainer()));
        expect(desktopFontSizeAfterScaleChange).toBeEquivalentTo(desktopFontSizeBeforeScaleChange);
    }
});
