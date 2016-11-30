describe('CustomBackgroundChange UndoRedoManager handler', function() {
    testRequire().
        classes('wysiwyg.editor.managers.undoredomanager.CustomBackgroundChange')
        .resources('W.BackgroundManager', 'W.Preview', 'W.Config') ;

    beforeEach(function() {
        this._customBgChangeHandler = new this.CustomBackgroundChange() ;

        this._mockPreviewmanagers = {
            Viewer: {getCurrentPageId: function(){return "masterPage" ;}},
            Config: this.W.Config
        } ;
        spyOn(this.W.Preview, 'getPreviewManagers').andReturn(this._mockPreviewmanagers) ;
        spyOn(this.W.Config.env, 'getCurrentFrameDevice').andReturn("desktop") ;
    }) ;

    it("should make sure that the handler is instantiated", function() {
        expect(this._customBgChangeHandler).toBeTruthy() ;
    }) ;

    it("should make sure that the Undo operation is working for setting a custom background", function() {
        spyOn(this.W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI') ;
        var isAnUndoOperation = true ;

        var changeData = {oldValue:'old bg css values...', newValue: 'new custom bg css...'} ;
        this._customBgChangeHandler.undo(changeData) ;

        expect(this.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalled() ;
        expect(this.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI).toHaveBeenCalledWith('masterPage', 'desktop',changeData.oldValue, isAnUndoOperation) ;
    }) ;

    it("should make sure that the Redo operation is working for setting a custom background", function() {
        spyOn(this._customBgChangeHandler, '_setCustomBackgroundToCurrentPageAndDevice') ;
        spyOn(this.W.BackgroundManager, 'setCustomBGOnDevicePageAndUpdateUI') ;

        var changeData = {oldValue:'old bg css values...', newValue: 'new custom bg css...', 'device': 'mobile', 'currentPageId': 'page123'} ;
        this._customBgChangeHandler.redo(changeData) ;

        expect(this._customBgChangeHandler._setCustomBackgroundToCurrentPageAndDevice).toHaveBeenCalledWith(changeData) ;
    }) ;

    it("should make sure that the Undo for switching to Custom BG mode is working.", function() {
        spyOn(this.W.BackgroundManager, 'disableCustomBG') ;
        spyOn(this.W.BackgroundManager, 'setCustomBGOnDevicePage') ;
        var device              = this.W.Config.env.getCurrentFrameDevice();
        var isUndoRedoAction    = true ;

        var changeData = {isCustom: true, 'pageId': "masterpage"} ;
        this._customBgChangeHandler.undo(changeData) ;

        expect(this.W.BackgroundManager.disableCustomBG).toHaveBeenCalled() ;
        expect(this.W.BackgroundManager.disableCustomBG).toHaveBeenCalledWith('masterpage', device, isUndoRedoAction) ;
    }) ;

    it("should make sure that the Redo for switching to Custom BG mode is working.", function() {
        spyOn(this.W.BackgroundManager, 'enableCustomBG') ;

        var changeData = {isCustom: true} ;
        this._customBgChangeHandler.redo(changeData) ;

        expect(this.W.BackgroundManager.enableCustomBG).toHaveBeenCalled() ;
    }) ;

    it("should not record the data record on change, if it has no old/new values", function() {
        spyOn(this._customBgChangeHandler,'_recordDataChange') ;

        this._customBgChangeHandler._onChange() ;
        this._customBgChangeHandler._onChange(null) ;
        this._customBgChangeHandler._onChange({}) ;
        this._customBgChangeHandler._onChange({'someValue': 'not valid for recording'}) ;

        expect(this._customBgChangeHandler._recordDataChange).not.toHaveBeenCalled() ;
    }) ;

    it("should record the data record on change, if it has an old (bg) value", function() {
        spyOn(this._customBgChangeHandler,'_recordDataChange') ;

        this._customBgChangeHandler._onChange({'oldValue': "some OLD BG props"}) ;

        expect(this._customBgChangeHandler._recordDataChange).toHaveBeenCalled() ;
    }) ;

    it("should not record the data record on change, if it has only a new (bg) value.", function() {
        spyOn(this._customBgChangeHandler,'_recordDataChange') ;

        this._customBgChangeHandler._onChange({'newValue': "some NEW BG props"}) ;

        expect(this._customBgChangeHandler._recordDataChange).not.toHaveBeenCalled() ;
    }) ;

}) ;