describe("Unit tests for the BackgroundDesignPanel.", function() {

    testRequire().
        resources('W.Commands', 'W.Preview', 'W.Config','W.Theme', 'W.Data').
        components('wysiwyg.editor.components.panels.BackgroundDesignPanel') ;

    beforeEach(function() {
        var mockViewer = {
            getCurrentPageId: function() {return "mainpage" ;},
            getPagesData: function() {return [{id: 'page1'},{id: 'page2'}];}
        } ;

        var mockPageCustomBGs = {
            "desktop"   : {"custom": false, "ref": undefined},
            "mobile"    : {"custom": false, "ref": undefined}
        } ;

        var mockPreviewManagers = { 'Theme': W.Theme, 'Viewer': mockViewer, 'Data': W.Data, 'Commands': W.Commands } ;

        spyOn(W.Preview, 'getPreviewManagers').andReturn(mockPreviewManagers) ;
        spyOn(W.BackgroundManager, '_getPageCustomBackgrounds').andReturn(mockPageCustomBGs) ;
        spyOn(W.Commands, 'executeCommand') ;
    }) ;

    describe("The Background Design Panel tests.", function() {

        beforeEach(function() {
            var viewNode        = new Element("div") ;
            this._bgDesignPanel = new this.BackgroundDesignPanel("fake-id", viewNode, null) ;
            this._bgDesignPanel._skinParts = {'customBG': {'setChecked': function(isChecked){}}} ;

            spyOn(this._bgDesignPanel, '_getCommandSender').andReturn("mockBackgroundDesignPanelSender") ;
            spyOn(this._bgDesignPanel, '_disableCancel') ;
        }) ;


        it("should set the panel's state to 'custom' if the background of the page is custom.", function() {
            spyOn(W.BackgroundManager, 'isPageCustomBGEnabled').andReturn(true) ;

            this._bgDesignPanel._updatePanelState() ;

            expect(this._bgDesignPanel.getState("background")).toBe('custom') ;
        }) ;

        it("should set the panel's state to 'site' if the background of the page is NOT custom.", function() {
            spyOn(W.BackgroundManager, 'isPageCustomBGEnabled').andReturn(false) ;

            this._bgDesignPanel._updatePanelState() ;

            expect(this._bgDesignPanel.getState("background")).toBe('site') ;
        }) ;

        it("Should revert to valid BG properties on the data, when reverting changes on the design panel.", function() {
            // Set initial BG and a CHANGED Background to the panel.
            var pageId              = W.Preview.getPreviewManagers().Viewer.getCurrentPageId() ;
            var deviceName          = Constants.ViewerTypesParams.TYPES.DESKTOP ;
            var initialBgCssValue   = "firstImg.png 0 0 center center auto repeat repeat fixed {color_1}" ;
            var mockMemento         = {'color_0': '{color_1}', 'isCustom': true} ;
            mockMemento[deviceName] = initialBgCssValue ;
            spyOn(this._bgDesignPanel, '_createPanelMemento').andReturn(mockMemento) ;
            this._bgDesignPanel.saveCurrentState() ;
            spyOn(W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI') ;

            // discard changes!
            this._bgDesignPanel._revertCustomBg(deviceName) ;

            // assert that changes will be discarded
            expect(W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalledWith(
                pageId, deviceName, initialBgCssValue, false, "mockBackgroundDesignPanelSender") ;
        }) ;
    }) ;

}) ;