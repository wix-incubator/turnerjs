describe('Font Style Highlight Tests', function () {

    var customizeFontsPanel,
        // highlight color
        styleHighlightBackgroundColor = ['252', '253', '70', '0.4'],
        // the paragraph font class index ( font_X )
        paragraphFontClassIndex = 8,
        // the paragraph font class
        paragraphFontClass = 'font_8',
        cachedComp,
        highlightedElement;

    /**
     * Open customize fonts panel
     * @returns {Q.promise}
     */
    function openCustomizeFontsPanel() {
        W.Utils.openSidePanel('wysiwyg.editor.components.panels.CustomizeFontsPanel', 'WEditorCommands.CustomizeFonts');
    }

    function waitForCustomizePanel() {
        return automation.editorcomponents.Panels.waitForPanelWithTitle('Customize Fonts');
    }

    /**
     * Cache customize fonts panel
     */
    function cachePanel(panel) {
        customizeFontsPanel = panel;
    }

    /**
     * Hover the font style that is used in paragraph class
     */
    function highlightParagraphFontStyle() {
        customizeFontsPanel._fieldsProxies[paragraphFontClassIndex]._htmlElement.fireEvent('mouseover');
    }

    /**
     * Add a paragraph comp
     * @returns {Q.promise}
     */
    function addParagraph() {
        return automation.viewercomponents.ViewerComponent.addComponent('richText');
    }

    /**
     * Cache component
     * @param comp
     */
    function cacheComp(comp) {
        cachedComp = comp;
    }

    /**
     *
     */
    function resetHighlightParagraphFontStyle() {
        customizeFontsPanel._fieldsProxies[paragraphFontClassIndex]._htmlElement.fireEvent('mouseout');
    }

    /**
     *
     */
    function cacheHighlightedElement() {
        highlightedElement = cachedComp.$view.getElement('.' + paragraphFontClass);
    }

    /**
     * Expect matching background color for the highlighted comp
     */
    function expectMatchingStyleHighlight() {
        var actualBgColor = highlightedElement.getStyle('background-color'),
            isHighlighted = _compareRgba(actualBgColor, styleHighlightBackgroundColor);

        expect(isHighlighted).toBeTruthy();
    }

    /**
     * Expect to have a transparent background
     */
    function expectMatchingStyleHighlightRemove() {
        var actualBgColor = highlightedElement.getStyle('background-color'),
            expectedBgColor = 'transparent';

        expect(actualBgColor).toEqual(expectedBgColor);
    }

    /**
     * Compare background ( RGB ) values
     * @param target
     * @param expectedRgbaObj
     * @returns {boolean}
     * @private
     */
    function _compareRgba(target, expectedRgbaObj) {
        if (target === 'transparent') {
            return false;
        }
        var $target = target.split('(')[1].split(')')[0].split(',');
        return !!_.difference($target, expectedRgbaObj).length;
    }

    it('Should highlight/unhighlight paragraph component on mouseover/mouseout', function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(openCustomizeFontsPanel)
                .then(waitForCustomizePanel)
                .then(cachePanel)
                .then(addParagraph)
                .then(cacheComp)
                .then(cacheHighlightedElement)
                .then(highlightParagraphFontStyle)
                .then(expectMatchingStyleHighlight)
                .then(resetHighlightParagraphFontStyle)
                .then(expectMatchingStyleHighlightRemove);
        });
    });
});