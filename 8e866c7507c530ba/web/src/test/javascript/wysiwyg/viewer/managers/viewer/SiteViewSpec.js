describe('SiteView', function(){
    testRequire()
        .classes('wysiwyg.viewer.managers.viewer.SiteView', 'wysiwyg.viewer.managers.pages.data.LocalDataResolver', 'wysiwyg.viewer.managers.pages.data.RemoteDataResolver')
        .resources('W.Viewer', 'W.Config');

    describe('preview mode', function(){
        beforeEach(function(){
            var siteDataMock = {'masterPage': {}, 'pages': []};
            this._dataResolver = new this.LocalDataResolver(siteDataMock);
            this.W.Config.env.$isEditorViewerFrame = true;
        });

        describe('desktop site view', function(){
            beforeEach(function(){
                this._classLogic = new this.SiteView(this.W.Viewer, this._dataResolver, 'DESKTOP');
                spyOn(this._classLogic._pageManager, 'loadSite');
            });
            describe('initiateSite', function(){
                describe('in case site was never saved', function(){
                    beforeEach(function(){
                        spyOn(this._dataResolver, 'isStructureExists').andReturn({
                            then: function(callback){callback(true)}
                        });
                        spyOn(this.W.Config, 'siteNeverSavedBefore').andReturn(true);
                    });
                    it('should load all pages', function(){
                        this._classLogic.initiateSite();

                        expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(true);
                    });
                });
                describe("in case mobile structure doesn't exist", function(){
                    beforeEach(function(){
                        spyOn(this._dataResolver, 'isStructureExists').andReturn({
                            then: function(callback){callback(false)}
                        });
                        spyOn(this.W.Config, 'siteNeverSavedBefore').andReturn(false);
                    });
                    it('should load all pages', function(){
                        this._classLogic.initiateSite();

                        expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(true);
                    });
                });
                describe("in case site was saved and mobile structure exists", function(){
                    beforeEach(function(){
                        spyOn(this._dataResolver, 'isStructureExists').andReturn({
                            then: function(callback){callback(true)}
                        });
                        spyOn(this.W.Config, 'siteNeverSavedBefore').andReturn(false);
                    });
                    it('should load only first page and master page', function(){
                        this._classLogic.initiateSite();

                        expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(false);
                    });
                });
            });
        });

        describe('mobile site view', function(){
            beforeEach(function(){
                this._classLogic = new this.SiteView(this.W.Viewer, this._dataResolver, 'MOBILE');
                spyOn(this._classLogic._pageManager, 'loadSite');
            });
            describe('initiateSite', function(){
                describe('in case site was never saved', function(){
                    beforeEach(function(){
                        spyOn(this._dataResolver, 'isStructureExists').andReturn({
                            then: function(callback){callback(true)}
                        });
                        spyOn(this.W.Config, 'siteNeverSavedBefore').andReturn(true);
                    });
                    it('should load all pages', function(){
                        this._classLogic.initiateSite();

                        expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(true);
                    });
                });
                describe("in case site was saved and mobile structure exists", function(){
                    beforeEach(function(){
                        spyOn(this._dataResolver, 'isStructureExists').andReturn({
                            then: function(callback){callback(true)}
                        });
                        spyOn(this.W.Config, 'siteNeverSavedBefore').andReturn(false);
                    });
                    it('should load only first page and master page', function(){
                        this._classLogic.initiateSite();

                        expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(false);
                    });
                });
            });
        });
    });

    describe('viewer mode', function(){
        beforeEach(function(){
            var siteDataMock = {'pageList': {'masterPage': [], 'pages': []}};
            this._dataResolver = new this.RemoteDataResolver(siteDataMock);
            this.W.Config.env.$isEditorViewerFrame = false;
        });

        describe('desktop site view', function(){
            beforeEach(function(){
                this._classLogic = new this.SiteView(this.W.Viewer, this._dataResolver, 'DESKTOP');
                spyOn(this._classLogic._pageManager, 'loadSite');
            });
            describe('initiateSite', function(){
                beforeEach(function(){
                    spyOn(this._dataResolver, 'isStructureExists').andReturn({
                        then: function(callback){callback(true)}
                    });
                });
                it('should load only first page and master page', function(){
                    this._classLogic.initiateSite();

                    expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(false);
                });
            });
        });

        describe('mobile site view', function(){
            beforeEach(function(){
                this._classLogic = new this.SiteView(this.W.Viewer, this._dataResolver, 'MOBILE');
                spyOn(this._classLogic._pageManager, 'loadSite');
            });
            describe('initiateSite', function(){
                beforeEach(function(){
                    spyOn(this._dataResolver, 'isStructureExists').andReturn({
                        then: function(callback){callback(true)}
                    });
                });
                it('should load only first page and master page', function(){
                    this._classLogic.initiateSite();

                    expect(this._classLogic._pageManager.loadSite).toHaveBeenCalledWith(false);
                });
            });
        });
    });
});