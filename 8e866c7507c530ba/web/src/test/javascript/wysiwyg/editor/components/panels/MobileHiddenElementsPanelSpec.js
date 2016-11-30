describe('MobileHiddenElementsPanelSpec', function() {

    testRequire().components('wysiwyg.editor.components.panels.MobileHiddenElementsPanel');

    beforeEach(function() {
        var args = {} ;
        this.panelLogic = new this.MobileHiddenElementsPanel("panel-component-id", new Element("div"), args) ;
    }) ;

    it("Should ensure the hidden elements panel is instantiated", function() {
        expect(this.panelLogic).not.toBeNull() ;
        expect(this.panelLogic).toBeDefined() ;
    });

    it('Should reload the page components list when switching a page', function(){
       spyOn(this.panelLogic, "_populatePageCompList");
        this.panelLogic._handlePageChange();
       expect(this.panelLogic._populatePageCompList).toHaveBeenCalled();
    });

    it('Should not reload the "On all pages" list when switching a page', function(){
        spyOn(this.panelLogic, "_populateAllPagesCompList");
        spyOn(this.panelLogic, "_populatePageCompList");

        this.panelLogic._handlePageChange();
        expect(this.panelLogic._populateAllPagesCompList).not.toHaveBeenCalled();
    });

    xdescribe('"Page" Section actions', function(){

        it('Should update with one item when hiding a component', function(){
            expect(false).toBeTruthy();
        });

        it('Should update with a container item and all its inner components when hiding a container', function(){
            expect(false).toBeTruthy();
        });
    });
    xdescribe('"On all pages" Section actions', function(){
        it('Should update with one item when hiding a component', function(){
            expect(false).toBeTruthy();

        });

        it('Should update with a container item and all its inner components when hiding a container', function(){
            expect(false).toBeTruthy();

        });

        it('Should remove the item from list when clicking its "eye" icon', function(){
            expect(false).toBeTruthy();

        });

        it('Should re-add a component to the stage when clicking its "eye" icon in the list', function(){
            expect(false).toBeTruthy();

        })
    });

    xdescribe('"Reorder Page" button', function(){
        it('Should set reorder command and params to "Reorder" button', function(){
            var button = this.panelLogic._skinParts.reorderButton;
            expect(button.getCommandName()).toBe('WEditorCommands.ReorderCurrentMobilePageLayout');
            expect(button.getCommandParameter()).toBeEquivalentTo({scope: 'currentPage'});
        });

        it('Should disable the "Undo Reorder" after re-adding another component', function(){
            expect(false).toBeTruthy();
        });

        it('Should disable the "Undo Reorder" after moving or resizing another component', function(){
            expect(false).toBeTruthy();
        });

        it('Should disable the "Undo Reorder" after reloading the view (move to desktop and back again or reset layout)', function(){
            expect(false).toBeTruthy();
        });

        it('Should disable the "Undo Reorder" after changing to another page', function(){
            expect(false).toBeTruthy();
        });
    });
});
