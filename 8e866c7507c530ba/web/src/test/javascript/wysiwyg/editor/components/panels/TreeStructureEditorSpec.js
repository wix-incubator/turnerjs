describe('TreeStructureEditorSpec', function() {

    beforeEach(function() {
        define.dataSchema('MenuItem', {text: "string", refId: "ref", items: "list"});
        this.rawData = {
            id:"testMainMenu",
            type:"Menu",
            items:[
                {refId:'pageA', type:'MenuItem', items:[
                    {refId:'pageA1', type:'MenuItem', items:[]}
                ]},
                {refId:'pageB', type:'MenuItem', items:[
                    {refId:'pageB1', type:'MenuItem', items:[
                        {refId:'pageB11', type:'MenuItem', items:[]}
                    ]}
                ]},
                {refId:'pageC', type:'MenuItem', items:[]}
            ]
        }

        this.data = W.Data.createDataItem(this.rawData, 'Menu');

        ComponentsTestUtil.buildComp(
            'wysiwyg.editor.components.panels.navigation.TreeStructureEditor',
            'wysiwyg.editor.skins.panels.TreeStructureEditorSkin', this.data);
    });

    describe('test functionality', function() {
        it('createTreeItemsFromDataItems', function() {
            var logic = this.compLogic;
            spyOn(logic, '_createSingleTreeItem');
            spyOn(logic, 'createTreeItemsFromDataItems').andCallThrough();

            logic.createTreeItemsFromDataItems(this.data.get('items'));
            expect(logic._createSingleTreeItem).toHaveBeenCalledXTimes(6);
            expect(logic.createTreeItemsFromDataItems).toHaveBeenCalledXTimes(4);
        });

        it('test _addItemToTree calls _createSingleTreeItem', function() {
            var newItem = this.data.getItemByRefId('pageB11');
            var logic = this.compLogic;
            spyOn(logic, '_createSingleTreeItem');
            logic._addItemToTree(newItem);
            expect(logic._createSingleTreeItem).toHaveBeenCalled();
        });

        it('test removeItemFromTree', function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, getItemLevel: function(){return 0;}};
            var item2 = {ref:'item2', dispose:function(){}, getItemLevel: function(){return 0;}};
            var item3 = {ref:'item3', dispose:function(){}, getItemLevel: function(){return 0;}};
            logic._treeButtons = [item1, item2, item3];
            logic._findButtonByData = function(){return item2}
            logic._findButtonIndex = function(){return 1};
            logic._getSubItems = function(){return []};
            logic.drawPanel = function(){};

            spyOn(logic, '_findButtonByData').andCallThrough();
            spyOn(logic, '_findButtonIndex').andCallThrough();
            spyOn(logic, '_getSubItems').andCallThrough();
            spyOn(logic, 'drawPanel').andCallThrough();

            logic._removeItemFromTree('item2');

            expect(logic._findButtonByData).toHaveBeenCalledWithEquivalentOf('item2');
            expect(logic._findButtonIndex).toHaveBeenCalledWithEquivalentOf( {ref:'item2', dispose:function(){}, getItemLevel: function(){return 0;}});
            expect(logic._getSubItems).toHaveBeenCalledWithEquivalentOf({ref:'item2', dispose:function(){}, getItemLevel: function(){return 0;}});
            expect(logic.drawPanel).toHaveBeenCalled();
            expect(logic._treeButtons.length).toBeEquivalentTo(2);
        });

        xit('test moveItemInTree calls all functions', function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){}};
            logic._treeButtons = [item1, item2, item3];
            logic._findButtonByData = function(){return item2}
            logic._findButtonIndex = function(){return 1};
            logic._reorderSingleItem = function(){return []};

            spyOn(logic, '_findButtonByData').andCallThrough();
            spyOn(logic, '_findButtonIndex').andCallThrough();
            spyOn(logic, '_reorderSingleItem').andCallThrough();

            logic._moveItemInTree('item2', 0);

            expect(logic._findButtonByData).toHaveBeenCalledWithEquivalentOf('item2');
            expect(logic._findButtonIndex).toHaveBeenCalledWithEquivalentOf( item2);
            expect(logic._reorderSingleItem).toHaveBeenCalled();
        })

    })

    describe('test updatePanel', function() {
        it('test call _addItemToTree', function() {
            var logic = this.compLogic;
            spyOn(logic, '_addItemToTree');
            logic.updatePanel({cause:'CREATED_AND_ADDED'});
            expect(logic._addItemToTree).toHaveBeenCalled();
        });

        it('test call _removeItemFromTree', function() {
            var logic = this.compLogic;
            spyOn(logic, '_removeItemFromTree');
            logic.updatePanel({cause:'DELETE'});
            expect(logic._removeItemFromTree).toHaveBeenCalled();

        });

        it('test call _moveItemInTree', function() {
            var logic = this.compLogic;
            spyOn(logic, '_moveItemInTree');
            logic.updatePanel({cause:'MOVE'});
            expect(logic._moveItemInTree).toHaveBeenCalled();

        });
    })

    xdescribe("test _locateDropIndexes", function(){
        it("test for dragging a subItem", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){return true;}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){}};
            logic._treeButtons = [item1, item2, item3];
            logic._getSubItems = function(){return []};

            var result = logic._locateDropIndexes(item2);

            expect(result.length).toBeEquivalentTo(3)
        })

        it("test for dragging an item with up subItems case 1", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item2, item3];
            logic._getSubItems = function(){return [item3]};

            var result = logic._locateDropIndexes(item2, "UP");

            expect(result.length).toBeEquivalentTo(2)
        })

        it("test for dragging an item with subItems up case 2", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item4, item2, item3];
            logic._getSubItems = function(){return [item3]};
            
            var result = logic._locateDropIndexes(item2, "UP");

            expect(result.length).toBeEquivalentTo(2)
        })

        it("test for dragging an item with subItems down case 1", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item4, item2, item3];
            logic._getSubItems = function(){return [item3]};

            var result = logic._locateDropIndexes(item2, "UP");

            expect(result.length).toBeEquivalentTo(2)
        })
    })

    xdescribe("test tree reorder", function(){
        it("test _reorderWithSubItems moving to invalid location", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){return true}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item2, item3, item4];
            logic._getSubItems = function(){return [item2]};
            spyOn(logic, '_moveSingleItem');
            spyOn(logic, '_reorderSubItems');

            logic._reorderWithSubItems(item1,1,0);
            expect(logic._moveSingleItem).toHaveBeenCalledXTimes(0)
            expect(logic._reorderSubItems).toHaveBeenCalledXTimes(0)
        })

        it("test _reorderWithSubItems moving down", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){return true}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item2, item3, item4];
            logic._getSubItems = function(){return [item2]};
            spyOn(logic, '_moveSingleItem');
            spyOn(logic, '_reorderSubItems');

            logic._reorderWithSubItems(item1,2,0);
            expect(logic._moveSingleItem).toHaveBeenCalledWith(3,0)
            expect(logic._reorderSubItems).toHaveBeenCalledWith([item2], 3, 0);
        })

        it("test _reorderWithSubItems moving up", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){return true}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item2, item3, item4];
            logic._getSubItems = function(){return [item4]};
            spyOn(logic, '_moveSingleItem');
            spyOn(logic, '_reorderSubItems');

            logic._reorderWithSubItems(item3,0,1);
            expect(logic._moveSingleItem).toHaveBeenCalledWith(0,1)
            expect(logic._reorderSubItems).toHaveBeenCalledWith([item4], 0, 1);
        })

        it("test _reorderSubItems moving down", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){return true}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){}};
            logic._treeButtons = [item1, item2, item3, item4];
            logic._getSubItems = function(){return [item2,item3]};
            spyOn(logic, '_moveSingleItem');

            logic._reorderSubItems([item2,item3],3,0);
            expect(logic._moveSingleItem).toHaveBeenCalledXTimes(2);
        })

        it("test _reorderSubItems moving up", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item2, item3, item4];
            logic._getSubItems = function(){return [item3,item4]};
            spyOn(logic, '_moveSingleItem');

            logic._reorderSubItems([item2,item3],0,1);
            expect(logic._moveSingleItem).toHaveBeenCalledWith(1, 2);
            expect(logic._moveSingleItem).toHaveBeenCalledXTimes(2, 3);
            expect(logic._moveSingleItem).toHaveBeenCalledXTimes(2);
        })

        it("test _reorderSingleItem move an item that has not children to an index of an item that is not a sub child and does not have children", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            logic._treeButtons = [item1, item2];
            spyOn(logic, '_moveSingleItem');

            logic._reorderSingleItem(item1,0,1);

            expect(logic._moveSingleItem).toHaveBeenCalledWith(0,1)
        })

        it("test _reorderSingleItem move an item that has not children and is not a sub item into a list of subItems", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            var item4 = {ref:'item4', dispose:function(){}, isSubItem:function(){}};
            logic._treeButtons = [item1, item2, item3, item4];
            spyOn(logic._dragHandler, 'setAsSubItem');
            spyOn(logic, '_moveSingleItem');

            logic._reorderSingleItem(item1,2,0);
            expect(logic._dragHandler.setAsSubItem).toHaveBeenCalledWith(true);
            expect(logic._moveSingleItem).toHaveBeenCalledWith(2,0)
        })

        it("test _reorderSingleItem move an item is a subItem to be first", function(){
            var logic = this.compLogic;
            var item1 = {ref:'item1', dispose:function(){}, isSubItem:function(){}};
            var item2 = {ref:'item2', dispose:function(){}, isSubItem:function(){}};
            var item3 = {ref:'item3', dispose:function(){}, isSubItem:function(){return true}};
            logic._treeButtons = [item1, item2, item3];
            spyOn(logic._dragHandler, 'setAsParentItem');
            spyOn(logic, '_moveSingleItem');

            logic._reorderSingleItem(item3,0,2);
            expect(logic._dragHandler.setAsParentItem).toHaveBeenCalled();
            expect(logic._moveSingleItem).toHaveBeenCalledWith(0,2)
        })

        

    })

});