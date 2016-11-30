describe("DesktopBackground", function() {

    testRequire().components('wysiwyg.viewer.components.background.DesktopBackground').
    resources("W.Preview");

    beforeEach(function() {
        spyOn(W.Preview, 'getPreviewSite').andReturn(window) ;

        var bgDiv = new Element("div");
        this.background = new this.DesktopBackground("Fake-EditorPresenter-ID", bgDiv, null) ;
    }) ;

    it("Should ensure that the DesktopBackground exists.", function() {
        expect(this.background).toBeDefined() ;
    }) ;

    it("should have the left (x) position of the background equals to ZERO if on desktop.", function(){
        var positionObject = {} ;

        this.background._updateBgDefinitionPosition(positionObject) ;

        expect(positionObject.left).toBe(0) ;
    }) ;

    it("should calculate the height of the BG according to the page if bg attachment set to 'fixed'.", function() {
        var isFixed                             = true ;
        this.background._isBgAttachmentFixed    = isFixed ;

        var bgHeight                            = this.background._calculateHeight(isFixed) ;

        var currentHeightOfDesktop              = window.document.getSize().y ;
        expect(parseInt(bgHeight)).toBe(currentHeightOfDesktop) ;
    }) ;

    it("should determine the height of the BG to be 100% if the position property is set to 'scroll'", function() {
        var isFixed                             = false ;
        this.background._isBgAttachmentFixed    = isFixed ;

        var bgHeight                            = this.background._calculateHeight(isFixed) ;

        expect(parseInt(bgHeight)).toBe(document.body.getSize().y) ;
    }) ;
}) ;