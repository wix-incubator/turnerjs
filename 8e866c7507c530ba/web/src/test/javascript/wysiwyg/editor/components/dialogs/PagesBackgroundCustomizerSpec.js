describe("A unit test for the copying custom background dialog.", function() {

    testRequire().components('wysiwyg.editor.components.dialogs.PagesBackgroundCustomizer') ;

    beforeEach(function() {
        this.pageModel = [
            {"title": "page1", "children": null, "isSelected": false, "pageDataRef": "page1", 'pageId': "page1"},
            {"title": "page2",
                "children": [
                    {"title": "subpage21", "children": null, "isSelected": true, "pageDataRef": "subpage21", 'pageId': "subpage21"},
                    {"title": "subpage22", "children": null, "isSelected": false, "pageDataRef": "subpage22", 'pageId': "subpage22"},
                    {"title": "subpage23", "children": null, "isSelected": true, "pageDataRef": "subpage23", 'pageId': "subpage23"}
                ],
                "isSelected": true, "pageDataRef": "page2", 'pageId': "page2"
            },
            {"title": "page3", "children": null, "isSelected": false, "pageDataRef": "page3", 'pageId': "page3"},
            {"title": "page4", "children": null, "isSelected": true, "pageDataRef": "page4", 'pageId': "page4"},
            {"title": "page5", "children": null, "isSelected": false, "pageDataRef": "page5", 'pageId': "page5"}
        ] ;

        var viewNode = new Element("div") ;
        var mockArgs = {dialogWindow: {addEvent: function(){}}} ;
        this._dialog = new this.PagesBackgroundCustomizer("fake-id", viewNode, mockArgs) ;
    }) ;

    it("should make sure that the dialog is instantiated", function() {
        expect(this._dialog).toBeDefined() ;
    }) ;

    it("should create a flat list of selected nodes, from the hierarchical tree model.", function() {
        var selectedPages = this._dialog._getSelectedPageNodes(this.pageModel);

        expect(selectedPages).not.toBeNull() ;
        expect(selectedPages.length).toBe(4) ;
    }) ;

    it("should select all nodes, when all selected flag is true.", function() {
        var nodesToCheck = [] ;
        for(var i=0; i < this.pageModel.length; i++) {
            nodesToCheck.push(this.pageModel[i]) ;
        }

        var selection = true;
        this._dialog._selectAll(this.pageModel, selection, 'subpage23') ;

        while(nodesToCheck.length > 0) {
            var node = nodesToCheck.pop() ;
            if(node.pageId === 'subpage23') {
                expect(node.isSelected).toBeFalsy() ;
            } else {
                expect(node.isSelected).toBeTruthy() ;
                if(node.children && node.children.length > 0) {
                    nodesToCheck = nodesToCheck.concat(node.children) ;
                }
            }
        }
    }) ;

    it("should unselect all nodes, when all selected flag is false.", function() {
        var nodesToCheck = [] ;
        for(var i=0; i < this.pageModel.length; i++) {
            nodesToCheck.push(this.pageModel[i]) ;
        }

        var selection = false;
        this._dialog._selectAll(this.pageModel, selection) ;

        while(nodesToCheck.length > 0) {
            var node = nodesToCheck.pop() ;
            expect(node.isSelected).toBeFalsy() ;
            if(node.children && node.children.length > 0) {
                nodesToCheck = nodesToCheck.concat(node.children) ;
            }
        }
    }) ;

    it("should unselect all nodes, when all selected flag is false.", function() {
        var nodesToCheck = [] ;
        for(var i=0; i < this.pageModel.length; i++) {
            nodesToCheck.push(this.pageModel[i]) ;
        }

        this._dialog._selectAll(this.pageModel, true, 'subpage23') ;
        this._dialog._selectAll(this.pageModel, false) ;

        while(nodesToCheck.length > 0) {
            var node = nodesToCheck.pop() ;
            if(node.pageId === 'subpage23'){
                expect(node.isSelected).toBeFalsy() ;
            } else {
                expect(node.isSelected).toBeFalsy() ;
            }
            if(node.children && node.children.length > 0) {
                nodesToCheck = nodesToCheck.concat(node.children) ;
            }
        }
    }) ;

    it("should count the number of page nodes in a page Model", function() {
        var numberOfPages = -1 ;

        numberOfPages = this._dialog._getNumberOfPageNodes(null, 0) ;
        expect(numberOfPages).toBe(0) ;

        numberOfPages = this._dialog._getNumberOfPageNodes(undefined, 0) ;
        expect(numberOfPages).toBe(0) ;

        numberOfPages = this._dialog._getNumberOfPageNodes([], 0) ;
        expect(numberOfPages).toBe(0) ;

        numberOfPages = this._dialog._getNumberOfPageNodes(11, 0) ;
        expect(numberOfPages).toBe(0) ;

        numberOfPages = this._dialog._getNumberOfPageNodes("abcd", 0) ;
        expect(numberOfPages).toBe(0) ;

        numberOfPages = this._dialog._getNumberOfPageNodes(this.pageModel, 0) ;
        expect(numberOfPages).toBe(8) ;
    }) ;
}) ;