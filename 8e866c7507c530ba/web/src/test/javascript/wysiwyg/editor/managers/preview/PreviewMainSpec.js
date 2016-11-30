xdescribe("PreviewMain", function(){
    testRequire().classes('wysiwyg.editor.managers.preview.PreviewMain').
            resources('W.Viewer');
    beforeEach(function(){
        this.preview = new this.PreviewMain();
        window.setPreloaderState = function(){};
        W.PageManager = {};
        W.PageManager._hashes = {};
    });

    afterEach(function(){
        delete window.setPreloaderState;
    });
    var mockInitIframe = function(preview) {
               preview._preview = {
                   'contentWindow':{
                       '$': function() {
                       },
                       'W':{
                           Managers: {
                               getManagers:function() {
                               }
                           },
                           Viewer:{

                           },
                           Data: {
                               clearDirtyObjectsMap:function() {
                               }
                           },
                           Theme: {
                               clearDirtyObjectsMap:function() {
                               }
                           },
                           ComponentData: {
                               clearDirtyObjectsMap:function() {
                               }
                           }
                       }
                   },
                   'style':{
                       'visibility': 'hidden'
                   }
               };
               preview._previewReady = true;
           };
    describe("isPreviewDataChanged", function() {
//         itShouldThrowAnExceptionIfNotReady("isPreviewDataChanged");

        it("should call this._preview.contentWindow.W.Data.isDataChange()", function() {
            //Create mock world
            mockInitIframe(this.preview);
            this.preview._preview.contentWindow.W.Data.isDataChange = jasmine.createSpy();
            this.preview._preview.contentWindow.W.ComponentData.isDataChange = jasmine.createSpy();
            this.preview._preview.contentWindow.W.Theme.isDataChange = jasmine.createSpy();

            //Call tested method
            this.preview.isPreviewDataChanged();

            //Assertions
            expect(this.preview._preview.contentWindow.W.Data.isDataChange).toHaveBeenCalled();
            expect(this.preview._preview.contentWindow.W.ComponentData.isDataChange).toHaveBeenCalled();
            expect(this.preview._preview.contentWindow.W.Theme.isDataChange).toHaveBeenCalled();
        });
    });

    describe("clearPreviewDataChange", function() {
//        itShouldThrowAnExceptionIfNotReady("clearPreviewDataChange");

        it("should call this._preview.contentWindow.W.Data.clearDataChange()", function() {
            //Create mock world
            mockInitIframe(this.preview);
            this.preview._preview.contentWindow.W.Data.clearDataChange = jasmine.createSpy();
            this.preview._preview.contentWindow.W.ComponentData.clearDataChange = jasmine.createSpy();
            this.preview._preview.contentWindow.W.Theme.clearDataChange = jasmine.createSpy();
            //Call tested method
            this.preview.clearPreviewDataChange();

            //Assertions
            expect(this.preview._preview.contentWindow.W.Data.clearDataChange).toHaveBeenCalled();
            expect(this.preview._preview.contentWindow.W.ComponentData.clearDataChange).toHaveBeenCalled();
            expect(this.preview._preview.contentWindow.W.Theme.clearDataChange).toHaveBeenCalled();
        });
    });

    describe("_onPreviewNavigation", function() {
        describe("when targetPageId !== preview.contentWindow.W.Viewer.getCurrentPageId() && pageChangedCallback", function() {
            beforeEach(function() {
                //Create mock world
                mockInitIframe(this.preview);
                this.preview._targetPageId = 'oldTestId';
                this.preview._pageChangedCallback = jasmine.createSpy();
                this.preview._preview.contentWindow.W.Viewer.getCurrentPageId = function() {
                    return 'testId';
                };

                //Call tested method
                this.preview._onPreviewNavigation();
            });

            it("should set targetPageId to _preview.contentWindow.W.Viewer.getCurrentPageId()", function() {
                //Assertions
                expect(this.preview._targetPageId).toBe('testId');
            });

            it("should call _pageChangedCallback()", function() {
                //Assertions
                expect(this.preview._pageChangedCallback).toHaveBeenCalled();
            });

        });

        describe("when the above expression is false", function() {
            beforeEach(function() {
                //Create mock world
                mockInitIframe(this.preview);
                this.preview._targetPageId = 'oldTestId';
                this.preview._pageChangedCallback = jasmine.createSpy();
                this.preview._preview.contentWindow.W.Viewer.getCurrentPageId = function() {
                    return 'oldTestId';
                };

                //Call tested method
                this.preview._onPreviewNavigation();
            });

            it("should NOT call _pageChangedCallback()", function() {
                //Assertions
                expect(this.preview._pageChangedCallback).not.toHaveBeenCalled();
            });

        });
    });
});