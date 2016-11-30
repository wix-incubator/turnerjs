/**
 * @class wysiwyg.viewer.components.traits.FixedComponentTrait
 *
 */
define.Class('wysiwyg.viewer.components.traits.FixedComponentTrait', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;


    def.resources(['W.Config', 'W.Commands']);
    def.binds(['_updateLayoutOnRender']);
    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);

            var layoutPosition = this.getLayoutPosition();
            this.setPos(layoutPosition);

            if(this.resources.W.Config.env.isPublicViewer() || this.resources.W.Config.env.$isEditorlessPreview){
                this.applyPos();
            } else{ //listen to editor <--> preview mode change so that we can affect the fixed position accordingly
                this._listenToEditModeChanged();
                this.addEvent(Constants.ComponentEvents.RENDER, this._updateLayoutOnRender);
            }
        },

        _updateLayoutOnRender: function(){
            this.removeEvent(Constants.ComponentEvents.RENDER, this._updateLayoutOnRender);
            if(!this.shouldBeFixedPosition()){ // see my comments in WOH-6081 for details why this if is here
                this.applyPos('absolute');
            }
        },

        /**
         * Listen to changing edit mode so that we can turn on the fixed position for preview if needed, but keep it off for editor.
         * @private
         */
        _listenToEditModeChanged: function(){
            this.resources.W.Commands.registerCommandAndListener("WPreviewCommands.WEditModeChanged", this, this._toggleFixedPositionByEditMode);
        },

        /**
         * @desc toggles the fixed position on for preview (if the property is set) and off for editor
         * @private
         */
        _toggleFixedPositionByEditMode: function(){
            if(this.shouldBeFixedPosition()){
                this.applyPos();
            }else{
                this.applyPos('absolute');
            }
        },

        /**
         * this indicates if the component should currently be shown in fixed position- meaning if it's fixed and is in preview or public
         * @returns {boolean}
         */
        shouldBeFixedPosition: function(){
            return this.isFixedPositioned() && this.resources.W.Config.env.isInInteractiveViewer();
        },
        /**
         * @desc indicates that the component implementing this trait can be fixed position
         * @returns {boolean}
         */
        canBeFixedPosition: function(){
            return true;
        }
    });
});