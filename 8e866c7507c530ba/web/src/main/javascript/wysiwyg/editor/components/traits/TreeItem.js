/**
 * @class wysiwyg.editor.components.traits.TreeItem
 * This trait should be implemented by all items that use the TreeStructureEditor and TreeStructureDragHandler.
 * They both assume that the items in the tree have these methods.
 */
define.Class('wysiwyg.editor.components.traits.TreeItem', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
       isSubItem:function(){
             if(this.getState() == 'subItem'){
                return true;
            }
            return false;
        },

        setAsSubItem:function(){
            this.setState('subItem');
        },

        setAsParentItem:function(){
            this.setState('normal');
        }
    });
});
