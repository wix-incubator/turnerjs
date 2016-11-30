/**
 * @Class wysiwyg.editor.components.inputs.SelectableListItem
 * @extends mobile.core.components.base.BaseComponent
 */
define.component('wysiwyg.editor.components.inputs.SelectableListItem', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.binds(['_onDeleteClicked','_onMoveUpClicked','_onMoveDownClicked']);

    def.skinParts({
        'img': {
            'type': 'core.components.Image',
            'dataRefField':'*'
        },
        'trashButton':{
            'type':'htmlElement'
        }
    });

    def.states({ 'selection': ['up', 'selected'], 'position': ['firstItem', 'lastItem', 'singleItem', 'middleItem'] });

    def.dataTypes(["Image"]);

    /**
     * @lends wysiwyg.editor.components.inputs.SelectableListItem
     */
    def.methods({
        _onAllSkinPartsReady: function(){
            this.parent();
            this._skinParts.trashButton.addEvent('click',this._onDeleteClicked);
            this._skinParts.upButton.addEvent('click',this._onMoveUpClicked);
            this._skinParts.downButton.addEvent('click',this._onMoveDownClicked);
        },
        _onDeleteClicked: function(ev){
            ev.stopPropagation();
            this.fireEvent(Constants.SelectionListEvents.DELETE_ITEM,this._data);
        },
        _onMoveUpClicked: function(ev){
            ev.stopPropagation();
            this.fireEvent(Constants.SelectionListEvents.MOVE_UP_ITEM,this._data);
        },
        _onMoveDownClicked: function(ev){
            ev.stopPropagation();
            this.fireEvent(Constants.SelectionListEvents.MOVE_DOWN_ITEM,this._data);
        }
    });
});