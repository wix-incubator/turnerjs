describe('MobileViewSelectorPanel test suite', function() {

    testRequire().components('wysiwyg.editor.components.panels.MobileViewSelectorPanel');

    beforeEach(function() {
        var args = {} ;
        this._selectorPanel = new this.MobileViewSelectorPanel("panel-component-id", new Element("div"), args) ;
    }) ;

    it("Should ensure a reset panel is instantiated", function() {
        expect(this._selectorPanel).not.toBeNull() ;
        expect(this._selectorPanel).toBeDefined() ;
    });

}) ;
