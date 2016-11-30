describe("MobileBackground", function() {

    testRequire().components('wysiwyg.viewer.components.background.MobileBackground');

    beforeEach(function() {
        var mockViewer = {
            getCurrentPageId: function() {return "mainpage" ;},
            addEvent: function(eventName, listener){}
        } ;

        var mockPreviewManagers = { 'Theme': W.Theme, 'Viewer': mockViewer, 'Data': W.Data, 'Commands': W.Commands } ;
        spyOn(W.Preview, 'getPreviewManagers').andReturn(mockPreviewManagers) ;
        spyOn(W.Preview, 'getPreviewSite').andReturn(window) ;

        var bgDiv = new Element("div");
        this.background = new this.MobileBackground("Fake-EditorPresenter-ID", bgDiv, null) ;
    }) ;

    it("Should ensure that the MobileBackground exists.", function() {
        expect(this.background).toBeDefined() ;
    }) ;

    it("should calculate the correct left (x) position of the background if on mobile.", function(){
        var bgPosition = {} ;
        var someWidthOfDevice = 752 ;
        spyOn(this.background, "_getDeviceWidth").andReturn(someWidthOfDevice) ;
        var estimatedLeftPos = (document.body.getSize().x - someWidthOfDevice) / 2;
        this.background._updateBgDefinitionPosition(bgPosition) ;

        var absDifference = Math.abs(estimatedLeftPos - parseInt(bgPosition.left)) ;
        // Tolerate up to 1px difference.
        expect(absDifference).toBeLessThan(1) ;
    }) ;

    it("should determine the height of the BG to be document height - mobile decoration height if in editor frame.'", function() {
        W.Config.env.$isEditorViewerFrame       = true ;
        var heightOfMobileDecoration            = this.background.MOBILE_BOTTOM_DECORATION_IN_EDITOR_HEIGHT ;

        var bgHeight                            = this.background._calculateHeight() ;
        var currentHeightOfDesktop              = window.document.getSize().y - heightOfMobileDecoration ;
        expect(parseInt(bgHeight)).toBe(currentHeightOfDesktop) ;
    }) ;

    it("should determine the height of the BG to be the site height if in viewer.", function() {
        W.Config.env.$isEditorViewerFrame       = false ;
        this.background._siteHeight             = 1884 ;

        var bgHeight                            = this.background._calculateHeight() ;

        expect(parseInt(bgHeight)).toBe(1884) ;
    }) ;

    it("should get the mobile custom background if it has a reference to it.", function() {
        var presetValues = [false, true] ;
        for(var i=0; i < presetValues.length; i++) {
            var desktopBackground = {isCustom: true, ref: "#desktopCustomBgRef", isPreset: presetValues[i]} ;
            for(var j=0; j < presetValues.length; j++) {
                var mobileBackground  = {isCustom: true, ref: "#myCustomMobileBGRef", isPreset: presetValues[i]} ;
                var customBackgrounds = {desktop: desktopBackground, mobile: mobileBackground} ;

                var backgroundToRender = this.background._getCustomBackground(customBackgrounds) ;
                expect(backgroundToRender).toBe(mobileBackground) ;
            }
        }
    }) ;

    it("should get the desktop site if the mobile bg ref is not set.", function() {
        var presetValues = [false, true] ;
        for(var i=0; i < presetValues.length; i++) {
            var desktopBackground = {isCustom: true, ref: "#desktopCustomBgRef", isPreset: presetValues[i]} ;
            for(var j=0; j < presetValues.length; j++) {
                var mobileBackground  = {isCustom: true, ref: "", isPreset: presetValues[i]} ;
                var customBackgrounds = {desktop: desktopBackground, mobile: mobileBackground} ;

                var backgroundToRender = this.background._getCustomBackground(customBackgrounds) ;
                expect(backgroundToRender).toBe(desktopBackground) ;

                mobileBackground.ref = null ;
                backgroundToRender = this.background._getCustomBackground(customBackgrounds) ;
                expect(backgroundToRender).toBe(desktopBackground) ;

                mobileBackground.ref = undefined ;
                backgroundToRender = this.background._getCustomBackground(customBackgrounds) ;
                expect(backgroundToRender).toBe(desktopBackground) ;
            }
        }
    }) ;

    it("should render the background on the entire page length if in public", function() {
        spyOn(this.background, '_isInEditorViewerFrame').andReturn(false) ;
        spyOn(this.background, '_getDeviceHeight').andReturn(385) ;

        var height = this.background._calculateHeight() ;

        expect(height).toBe(385+'px') ;
    }) ;

}) ;