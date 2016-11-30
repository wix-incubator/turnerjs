describe("Unit test for the Custom BGs selection panel.", function() {

    testRequire().components('wysiwyg.editor.components.dialogs.PagesBackgroundCustomizer') ;

    beforeEach(function() {
        var viewElement = new Element('div') ;
        var args = {dialogWindow: {addEvent: function(){}}} ;
        this._dialog = new this.PagesBackgroundCustomizer('some-id', viewElement, args) ;

        W.Viewer.Data = W.Data ;
        W.Viewer.getCurrentPageId = function() {return "pageId1";} ;
        spyOn(W.Preview, 'getPreviewManagers').andReturn({'Viewer': W.Viewer, 'Data': W.Data}) ;
        spyOn(W.Data, 'getDataByQuery').andCallFake(function(query) {
            return {
                get: function(key) {
                    if(key === "title") {
                        return "page-title-" + key ;
                    } else {
                        return query ;
                    }
                }
            } ;
        }) ;
    }) ;

    it("Should make sure that the Pages Background Customizer dialog is defined.", function() {
        expect(this._dialog).toBeDefined() ;
    }) ;

    it("should check that the pages hierarchy empty if no items are given.", function() {
        var items       = [] ;
        var treeModel   = [] ;
        treeModel       = this._dialog._createTreeModel(items, treeModel, 10) ;

        expect(treeModel).not.toBeNull() ;
        expect(treeModel.length).toBe(0) ;
    }) ;

    it("should check that the pages hierarchy is displayed properly in the BG dialog.", function() {
        spyOn(this._dialog, '_getHomePageId').andReturn('masterPage') ;

        var MockPageItem = function MockPageItem(refId, items) {
            this._data = {} ;
            this._data['refId'] = refId ;
            this._data['items'] = items ;
            this.get = function(key) {
                return this._data[key] ;
            } ;
        } ;

        var pageItem4   = new MockPageItem('pageId4', []) ;
        var pageItem3   = new MockPageItem('pageId3', []) ;
        var pageItem2   = new MockPageItem('pageId2', []) ;
        var pageItem1   = new MockPageItem('pageId1', [pageItem2, pageItem3, pageItem4]) ;

        var items       = [pageItem1] ;
        var treeModel   = [] ;
        treeModel       = this._dialog._createTreeModel(items, treeModel, 10) ;

        expect(treeModel).not.toBeNull() ;
        expect(treeModel.length).toBe(1) ;
        expect(treeModel[0].children.length).toBe(3) ;
    }) ;

}) ;
