/** @class wysiwyg.editor.components.MoveToFooterButton */
define.component("wysiwyg.editor.components.MoveToFooterButton", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.resources(['W.Commands', 'W.Editor', 'W.Resources']);

    def.binds(['updateButtonPosition']);

    def.statics({
        'LEFT_OFFSET': 12,
        'TOP_OFFSET': 14,
        'MOVEMENT_TOLERANCE': 10
    });

    def.methods({
        _replaceLanguageKey: function (args) {
            args.label = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'EDIT_BOX_MOVE_TO_FOOTER', 'EDIT_BOX_MOVE_TO_FOOTER');
        },

        updateButtonPosition: function(x, y){
            this.setX(x + this.LEFT_OFFSET);
            this.setY(y - this.TOP_OFFSET);
        },

        _onClick: function(event){
            this.parent(event);
            this.resources.W.Commands.executeCommand('WEditorCommands.MoveComponentToFooter', {event:event});
            var editedComp = this.resources.W.Editor.getEditedComponent();
            var compId = !editedComp.isMultiSelect ? editedComp.getID() : "multipleSelectedComponents";
            LOG.reportEvent(wixEvents.USER_CLICK_MOVE_TO_FOOTER_BUTTON, {c1: compId});
        }
    });
});