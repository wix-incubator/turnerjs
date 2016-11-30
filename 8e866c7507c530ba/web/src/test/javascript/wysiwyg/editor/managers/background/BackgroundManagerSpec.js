describe('Background Manager', function() {

    testRequire().
        classes('wysiwyg.editor.managers.background.BackgroundManager').
        resources("W.Data", "W.Theme");

    beforeEach(function() {
        this._mockPreviewManagers = {
            Data: W.Data,
            Theme: W.Theme,
            Commands: {executeCommand: jasmine.createSpy()},
            Viewer: {getPagesData: function(pageDataItem){},
                getCompLogicById: function(compId){}}
        } ;
        this.backgroundManager  = new this.BackgroundManager() ;

        spyOn(this.backgroundManager, '_getPreviewManagers').andReturn(this._mockPreviewManagers) ;

        var pageBackgrounds     = this.backgroundManager._createPageBackgrounds();
        var dataItem            = {type: 'Page'};
        var dataItemWithId      = this.W.Data.addDataItemWithId(null, dataItem) ;
        dataItemWithId.set("pageBackgrounds", pageBackgrounds) ;
        this._mockPageDataItem  = dataItemWithId ;

        spyOn(this.backgroundManager, "_getPageDataItem").andReturn(this._mockPageDataItem) ;
        spyOn(this.backgroundManager, "_getPreviewDataManager").andReturn(this.W.Data) ;
        spyOn(this.backgroundManager, "fireCustomBackgroundChanged") ;
    }) ;


    it("Should check that the Background Manager was created.", function() {
        expect(this.backgroundManager).toBeDefined() ;
    }) ;

    it("Should ensure the current page has a custom BG enabled.", function() {
        var pageId = "masterpage" ;
        var device = "DESKTOP" ;

        this.backgroundManager.enableCustomBG(pageId, device) ;

        expect(this.backgroundManager.isPageCustomBGEnabled(pageId, device)).toBeTruthy() ;
        if(!this.backgroundManager._isOnlyCustomBGSupported()) {
            expect(this._mockPreviewManagers.Commands.executeCommand).toHaveBeenCalledWith('WPreviewCommands.CustomBackgroundChanged', {'isCustom': true, 'pageId': pageId}) ;
        }
    }) ;

    it("Should ensure the current page has a custom BG disabled.", function() {
        var pageId = "masterpage" ;
        var device = "DESKTOP" ;

        this.backgroundManager.enableCustomBG(pageId, device) ;
        this.backgroundManager.disableCustomBG(pageId, device) ;

        if(!this.backgroundManager._isOnlyCustomBGSupported()) {
            expect(this.backgroundManager.isPageCustomBGEnabled(pageId, device)).toBeFalsy() ;
            expect(this._mockPreviewManagers.Commands.executeCommand).toHaveBeenCalled() ;
            expect(this._mockPreviewManagers.Commands.executeCommand).toHaveBeenCalledWith('WPreviewCommands.CustomBackgroundChanged', {'isCustom': false, 'pageId': pageId}) ;
        } else {
            expect(this.backgroundManager.isPageCustomBGEnabled(pageId, device)).toBeTruthy() ;
        }
    }) ;

    it("Should check that one can set a custom background", function() {
        spyOn(this.backgroundManager, '_getPreviewThemeManager').andReturn(this.W.Theme) ;
        spyOn(this.backgroundManager, '_getPageCustomBgOnDeviceAsCss').andReturn(function(){}) ;
        var pageId = "masterpage" ;
        var device = "DESKTOP" ;
        var customBG1 = this.backgroundManager.getCustomBGForPageOnDevice(pageId, device) ;

        var randomImgName = 'some-picture-id-' + Math.floor(Math.random() * 999) + '.png' ;
        var bgCssValue = randomImgName + " 200px 120px 0 0 200px repeat repeat fixed black" ;
        this.backgroundManager.setCustomBGOnDevicePageAndUpdateUI(pageId, device, bgCssValue) ;

        var customBG2 = this.backgroundManager.getCustomBGForPageOnDevice(pageId, device) ;
        expect(JSON.stringify(customBG1)).toBe(JSON.stringify(customBG2)) ;
        var backgroundImageDataItem2 = W.Data.getDataByQuery(customBG2.ref) ;
        expect(backgroundImageDataItem2).toBeDefined();
        expect(backgroundImageDataItem2.get('width')).toBe('200px') ;
        expect(backgroundImageDataItem2.get('attachment')).toBe('fixed') ;
        expect(backgroundImageDataItem2.get('url')).toBe(randomImgName) ;
        expect(backgroundImageDataItem2.pageIdsWithInterest[0]).toBe(pageId) ;
    });

    it("should check if a cloning of a 'pageBackgrounds' property is needed", function() {
        var pageBackgroundsThatShouldBeCloned = [{
            "desktop"   : {"custom": true,  "ref": "#abcd"},
            "mobile"    : {"custom": false, "ref": "#wxyz"}
            },
            {
                "desktop"   : {"custom": true,  "ref": null},
                "mobile"    : {"custom": false, "ref": "#wxyz"}
            },
            {
                "desktop"   : {"custom": true,  "ref": "#abcd"},
                "mobile"    : {"custom": false, "ref": undefined}
            }];

        var pageBackgroundsWhichDontNeedClone = [{
            "desktop"   : {"custom": true,  "ref": null},
            "mobile"    : {"custom": false, "ref": undefined}
        }] ;

        var isNeeded, pageBGs ;

        for(var i=0; i < pageBackgroundsThatShouldBeCloned.length; i++) {
            pageBGs     = pageBackgroundsThatShouldBeCloned[i] ;
            isNeeded    = this.backgroundManager._isBGPPCloneNeeded(pageBGs) ;
            expect(isNeeded).toBeTruthy();
        }

        for(var j=0; j < pageBackgroundsWhichDontNeedClone.length; j++) {
            pageBGs     = pageBackgroundsWhichDontNeedClone[j] ;
            isNeeded    = this.backgroundManager._isBGPPCloneNeeded(pageBGs) ;
            expect(isNeeded).toBeFalsy();
        }
    }) ;

    it("Should duplicate the 'pageBackgrounds' property of the Data Item of a duplicated page", function() {
        var data = {'id': 'abcd', 'url': 'http://somepicture.png', 'color': "{color_12}", 'background-some-prop': '1234'} ;
        spyOn(this.backgroundManager, '_getCustomBgOnDevice').andReturn({
            cloneData: function(){return _.cloneDeep(data);}
        }) ;

        var pageBackgrounds = {
            "desktop"   : {"custom": true,  "ref": "#abcd", isPreset: false},
            "mobile"    : {"custom": true,  "ref": undefined, isPreset: true}
        } ;

        var duplicatedPageBackgrounds = this.backgroundManager._duplicatePageBackgrounds('newPageId', pageBackgrounds) ;

        expect(duplicatedPageBackgrounds.desktop.custom).toBe(pageBackgrounds.desktop.custom) ;
        expect(duplicatedPageBackgrounds.desktop.isPreset).toBe(pageBackgrounds.desktop.isPreset) ;
        expect(duplicatedPageBackgrounds.desktop.ref).not.toBe(pageBackgrounds.desktop.ref) ;

        expect(duplicatedPageBackgrounds.mobile.custom).toBe(pageBackgrounds.mobile.custom) ;
        expect(duplicatedPageBackgrounds.mobile.isPreset).toBe(pageBackgrounds.mobile.isPreset) ;
        expect(duplicatedPageBackgrounds.mobile.ref).not.toBe(pageBackgrounds.mobile.ref) ;
    }) ;

    it("should return the background of the device without regard to preset if set to custom.", function(){
        var pageId                              = 'mainPage';
        var mainPageBackgrounds                 = this.backgroundManager._getOrCreatePageCustomBackgrounds(pageId);
        mainPageBackgrounds.desktop.ref         = "#fakeDesktopBgId";
        mainPageBackgrounds.desktop.custom      = true;
        mainPageBackgrounds.desktop.isPreset    = false;
        mainPageBackgrounds.mobile.ref          = "#fakeMobileBgId";
        mainPageBackgrounds.mobile.isPreset     = true;
        mainPageBackgrounds.mobile.custom       = true;

        spyOn(this.backgroundManager, '_getOrCreatePageCustomBackgrounds').andReturn(mainPageBackgrounds);
        var spy = spyOn(this.backgroundManager, '_getPageCustomBgOnDeviceAsCss');

        this.backgroundManager.getBackgroundOnPageAndDevice(pageId, 'mobile');
        expect(this.backgroundManager._getPageCustomBgOnDeviceAsCss).toHaveBeenCalledWith(pageId, 'mobile');

        spy.reset();
        this.backgroundManager.getBackgroundOnPageAndDevice(pageId, 'desktop');
        expect(this.backgroundManager._getPageCustomBgOnDeviceAsCss).toHaveBeenCalledWith(pageId, 'desktop');
    });


    describe("tests for template publishing", function() {

        it("should set the custom backgrounds of all types on all pages to preset, when publishing site as a template", function() {
            var pageBackgroundsStubs = [{
                "desktop"   : {"custom": true,  "ref": "#abcd", isPreset: false},
                "mobile"    : {"custom": false, "ref": "#wxyz", isPreset: false}
            },
                {
                    "desktop"   : {"custom": true,  "ref": null, isPreset: true},
                    "mobile"    : {"custom": false, "ref": "#wxyz", isPreset: false}
                },
                {
                    "desktop"   : {"custom": true,  "ref": "#abcd", isPreset: false},
                    "mobile"    : {"custom": false, "ref": undefined, isPreset: true}
                }];
            var mockSet    = function(key, value) {this[key] = value ;} ;
            var mockGet    = function(key) {return this[key] ;} ;
            var emptyFunc  = function() {} ;
            var pagesStubs = [] ;
            for(var k=0; k < pageBackgroundsStubs.length + 2; k++){
                pagesStubs.push({id: "page"+k, pageBackgrounds: pageBackgroundsStubs[k],
                    set: mockSet, get: mockGet, markDataAsDirty: emptyFunc}) ;
            }

            spyOn(this._mockPreviewManagers.Viewer, 'getPagesData').andReturn(pagesStubs);
            spyOn(this.backgroundManager, '_getPageCustomBackgrounds').andCallFake(function(pageId) {
                return pageBackgroundsStubs[parseInt(pageId.split("page")[1])] ;
            }) ;

            this.backgroundManager._handlePagesBGsOnPublishTemplate() ;

            for(var i=0; i < pageBackgroundsStubs.length; i++) {
                for(var device in pageBackgroundsStubs[i]) {
                    expect(pageBackgroundsStubs[i][device].isPreset).toBe(true) ;
                }
            }
        });
    });
}) ;