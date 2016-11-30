describe('Backgrounds Version Handler', function() {

    testRequire().
        classes('wysiwyg.editor.managers.background.BackgroundVersionHandler').
        resources("W.Data", "W.Theme", "W.Commands");

    beforeEach(function() {
        W.Preview = W.Preview || {};
        var resources           = {'W': {'Data': W.Data, 'Theme': W.Theme, 'Commands': W.Commands, 'Preview': W.Preview}};

        spyOn(W.Preview, 'getPreviewManagers').andReturn(resources.W) ;

        var getMockMeta = function (name) {
            return this[name] ;
        };

        var setMockMeta = function(name, value, fireEvent) {
            this[name]= value ;
        };

        this.mockCustomBGs = {
            "CustomBGD-page1": {'schemaVersion': '1.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},

            "CustomBGD-page2": {'schemaVersion': '2.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},
            "CustomBGM-page2": {'schemaVersion': '3.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},

            "CustomBGD-page3": {'schemaVersion': '3.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},
            "CustomBGM-page3": {'schemaVersion': '3.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},

            "CustomBGM-page4": {'schemaVersion': '2.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},

            "CustomBGD-page5": {'schemaVersion': '1.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}},
            "CustomBGM-page5": {'schemaVersion': '1.0', getMeta: getMockMeta, setMeta: setMockMeta, markDataAsDirty: function(){}}
        } ;

        this.pages = {
            "page5": {"pageBackgrounds": {"desktop": {ref:"CustomBGD-page5"}, "mobile": {ref:"CustomBGM-page5"}}},
            "page3": {"pageBackgrounds": {"desktop": {ref:"CustomBGD-page3"}, "mobile": {ref:"CustomBGM-page3"}}},
            "page1": {"pageBackgrounds": {"desktop": {ref:"CustomBGD-page1"}, "mobile": {ref:""}}},
            "page4": {"pageBackgrounds": {"desktop": {ref:""}, "mobile": {ref:"CustomBGM-page4"}}},
            "page2": {"pageBackgrounds": {"desktop": {ref:"CustomBGD-page2"}, "mobile": {ref:"CustomBGM-page2"}}}
        } ;

        this.isUpgraded12       = false ;
        this.isUpgraded23       = false ;
        this.isUpgraded34       = false ;
        this.isUpgraded45       = false ;
        var self = this ;
        this.upgradeFunctions    = {
            "2.0": function upgrader23(pagesIds, device){self.isUpgraded23 = true ;},
            "3.0": function upgrader34(pagesIds, device){self.isUpgraded34 = true ;},
            "1.0": function upgrader12(pagesIds, device){self.isUpgraded12 = true ;},
            "4.0": function upgrader45(pagesIds, device){self.isUpgraded45 = true ;}
        };
        this.bgVersionHandler   = new this.BackgroundVersionHandler(resources, this.upgradeFunctions) ;

        spyOn(this.bgVersionHandler, '_getPageDataItem').andCallFake(function(pageId) {
            var pageDataItem = self.pages[pageId] ;
            if(pageDataItem) {
                pageDataItem.get = function(name) {
                    if(!name) {
                        return null ;
                    } else if(name.substr("page")) {
                        return pageDataItem[name] ;
                    } else if(name.substr("CustomBG")) {
                        return {'metaData': {'schemaVersion': self.mockCustomBGs[name]}};
                    }
                    return null ;
                };
            }
            return pageDataItem ;
        }) ;
    }) ;


    it("Should check that the Background Version Handler was created.", function() {
        expect(this.bgVersionHandler).toBeDefined() ;
    }) ;

    it("should return a map of version to page ids according to the page version and the target version", function() {
        var self = this ;
        spyOn(W.Data, 'getDataByQuery').andCallFake(function(query) {
            return self.pages[query] || self.mockCustomBGs[query] ;
        });
        var pagesIds = _.keys(this.pages);

        var pagesVersions = this.bgVersionHandler._getPagesIdsToUpgradeBackground(pagesIds, "3.0") ;

        expect(pagesVersions).toBeDefined() ;
        expect(_.isEmpty(pagesVersions)).toBeFalsy();
        expect(_.toArray(pagesVersions).length).toBe(2);
        expect(pagesVersions["1.0"].length).toBe(2);
        expect(pagesVersions["2.0"].length).toBe(2);
        expect(pagesVersions["3.0"]).toBeFalsy() ;
    }) ;

    it("should upgrade the given pages bg data to its given target", function() {
        var self = this ;
        spyOn(W.Data, 'getDataByQuery').andCallFake(function(query) {
            return self.pages[query] || self.mockCustomBGs[query] ;
        });

        var targetVersion = "3.0" ;

        var versionToPagesIds = {};
        this.bgVersionHandler._upgradeBackgroundPerPageData(versionToPagesIds, targetVersion) ;
        this.bgVersionHandler._upgradeBackgroundPerPageData(null, targetVersion) ;
        this.bgVersionHandler._upgradeBackgroundPerPageData(versionToPagesIds, null) ;
        expect(this.isUpgraded12).toBeFalsy() ;
        expect(this.isUpgraded23).toBeFalsy() ;
        expect(this.isUpgraded34).toBeFalsy() ;
        expect(this.isUpgraded45).toBeFalsy() ;



        versionToPagesIds = {
            "1.0": ["page1", "page5"],
            "2.0": ["page2", "page4"],
            "3.0": ["page3"],
            "4.0": ["page44"]
        };
        this.bgVersionHandler._upgradeBackgroundPerPageData(versionToPagesIds, targetVersion) ;

        expect(this.isUpgraded12).toBeTruthy() ;
        expect(this.isUpgraded23).toBeTruthy() ;
        expect(this.isUpgraded34).toBeFalsy() ;
        expect(this.isUpgraded45).toBeFalsy() ;

        var customBG = null ;
        for(customBG in this.mockCustomBGs) {
            expect(this.mockCustomBGs[customBG].schemaVersion).toBe(targetVersion) ;
        }
        // attempt "down-grade"
        this.bgVersionHandler._upgradeBackgroundPerPageData(versionToPagesIds, "1.0") ;

        for(customBG in this.mockCustomBGs) {
            expect(this.mockCustomBGs[customBG].schemaVersion).toBe(targetVersion) ;
        }

        // attempt "upgrade the version again!"
        targetVersion = "4.0" ;
        this.bgVersionHandler._upgradeBackgroundPerPageData(versionToPagesIds, targetVersion) ;

        expect(this.isUpgraded34).toBeTruthy() ;
        for(customBG in this.mockCustomBGs) {
            expect(this.mockCustomBGs[customBG].schemaVersion).toBe(targetVersion) ;
        }
    }) ;

});