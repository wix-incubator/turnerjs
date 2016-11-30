describeExperiment({RedirectFeature301: "New"}, "Redirect301Manager", function(){

    testRequire().
        classes('wysiwyg.editor.managers.Redirect301Manager').
        resources("W.Data", "W.Theme");

    beforeEach(function(){
        this._redirect301Manager = new this.Redirect301Manager();
    });

    it("Should check that the Redirect301Manager was created.", function() {
        expect(this._redirect301Manager).toBeDefined();
    });

    it("Should filter 301 rows according to pages", function() {
        var externalUriMappings   = [{fromExternalUri: '/gaga', toWixUri: 'baga'}];
        spyOn(this._redirect301Manager, '_getExternalUriMappings').andReturn(externalUriMappings);
        var pagesDataItem = {type: 'Page'};
        var externalUriDataItemWithId = this.W.Data.addDataItemWithId(null, externalUriMappings);
        var pageDataItemWithId = this.W.Data.addDataItemWithId(null, pagesDataItem);
        spyOn(this._redirect301Manager, '_getMenuData').andReturn(pageDataItemWithId);
        spyOn(this._redirect301Manager, '_getPageDataFromItem').andReturn(pageDataItemWithId) ;
        this._redirect301Manager._dataItem = this.W.Data.addDataItemWithId(null, externalUriMappings);
        this._redirect301Manager._filter301RowsAccordingToPages();
        var mappingArr = this._redirect301Manager._dataItem.get("externalUriMappings");
        expect(mappingArr.length).toBe(1);
    });
});
