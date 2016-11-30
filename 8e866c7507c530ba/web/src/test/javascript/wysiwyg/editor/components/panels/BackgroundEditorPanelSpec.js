describe("A unit test for the Background Editor panel", function() {

    testRequire().
        resources('W.Commands', 'W.Preview', 'W.Config','W.Theme', 'W.Data', 'W.UndoRedoManager').
        classes('core.utils.css.Background').
        components('wysiwyg.editor.components.panels.BackgroundEditorPanel') ;

    beforeEach(function() {
        this.mockViewer = {
            getCurrentPageId: function() {return "mainpage" ;},
            addEvent: function(eventName, listener){},
            getPagesData: function() {return [{id: 'page1'},{id: 'page2'}];},
            getCompLogicById: function(compId){}
        } ;

        var mockPageCustomBGs = {
            "desktop"   : {"custom": false, "ref": undefined},
            "mobile"    : {"custom": false, "ref": undefined}
        } ;

        var mockPreviewManagers = { 'Theme': W.Theme, 'Viewer': this.mockViewer, 'Data': W.Data, 'Commands': W.Commands } ;

        spyOn(W.Preview, 'getPreviewManagers').andReturn(mockPreviewManagers) ;
        spyOn(W.BackgroundManager, '_getPageCustomBackgrounds').andReturn(mockPageCustomBGs) ;
        spyOn(W.Commands, 'executeCommand') ;
        spyOn(W.UndoRedoManager, 'startTransaction') ;
        spyOn(W.UndoRedoManager, 'endTransaction') ;
    }) ;

    describe("The Background Editor Panel tests.", function() {

        beforeEach(function() {
            var viewNode                       = new Element("div") ;
            this._bgEditorPanel                = new this.BackgroundEditorPanel("fake-id", viewNode, null) ;

            spyOn(this._bgEditorPanel, '_getViewingDevice').andReturn("MOBILE") ;
            spyOn(this._bgEditorPanel, '_addCancelAction') ;
            spyOn(this._bgEditorPanel, '_enableCancel') ;
            spyOn(this._bgEditorPanel, '_isCustomBgOnPage').andReturn(true) ;
            spyOn(this._bgEditorPanel, '_getCommandSender').andReturn("mockSender");
            spyOn(this._bgEditorPanel, '_setDeviceBackgroundToNonPreset');

            var dataItem = {type: 'BackgroundImage'};
            W.Data.addDataItemWithId('customBgId', dataItem) ;
        }) ;

        it("should change the 'Color' of the BG for a custom page on the mobile device.", function() {
            var oldBgCssString = "none 0 0 center center auto repeat repeat scroll #000";

            spyOn(W.BackgroundManager, 'getCurrentlyShowingBackground').andReturn(oldBgCssString) ;
            spyOn(W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI');

            // change the actual value of the BG...
            var newBgColor = "#AABBCC";
            var bgCssString = "none 0 0 center center auto repeat repeat scroll " + newBgColor ;
            this._bgEditorPanel._colorChangedHandler(bgCssString) ;

            expect(W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalledWith(
                                                            "mainpage", "MOBILE", bgCssString, false, 'mockSender') ;
        }) ;

        it("should change the 'Attachment' of the Background for a Custom page BG on desktop.", function() {
            var oldBgCssString = "none 0 0 center center auto repeat repeat fixed #000";

            spyOn(W.BackgroundManager, 'getCurrentlyShowingBackground').andReturn(oldBgCssString) ;
            spyOn(W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI');

            // change the actual value of the BG...
            var newBgAttachment = "scroll";
            var bgCssString = "none 0 0 center center auto repeat repeat " + newBgAttachment + " {color_1}"  ;
            this._bgEditorPanel._attachmentChangeHandler(bgCssString) ;

            // make sure the color has been changed, and an event informing of BG change was fired.
            expect(W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalledWith(
                                            "mainpage", "MOBILE", bgCssString, false, 'mockSender') ;
        }) ;

        it("should change the 'Image' of the Background for a Custom page BG on Desktop", function() {
            var oldBgCssString = "none 0 0 center center auto repeat repeat fixed #000";
            spyOn(W.BackgroundManager, 'getCurrentlyShowingBackground').andReturn(oldBgCssString) ;
            spyOn(W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI');

            // change the actual value of the BG...
            var newImg = "my-custom-image.png";
            var bgCssString = newImg + " 0 0 center center auto repeat repeat scroll {color_1}"  ;
            var background = new this.Background(bgCssString, W.Theme) ;
            this._bgEditorPanel._imageChangeHandler(background) ;

            // make sure the color has been changed, and an event informing of BG change was fired.
            expect(W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalledWith(
                                                "mainpage", "MOBILE", bgCssString, false, 'mockSender') ;
        }) ;

        it("should return the tiling properties of a background string", function() {
            var oldBgCssString = "none 0 0 center center auto repeat repeat fixed #000";
            spyOn(W.BackgroundManager, 'getCurrentlyShowingBackground').andReturn(oldBgCssString) ;
            spyOn(W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI');

            var bgCssString = "none 0 0 center center auto no-repeat no-repeat scroll {color_17}"  ;
            this._bgEditorPanel._tilingChangeHandler(bgCssString) ;

            // make sure the color has been changed, and an event informing of BG change was fired.
            expect(W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalledWith(
                                                        "mainpage", "MOBILE", bgCssString, false, 'mockSender') ;
        });
    }) ;
}) ;