define.component('wysiwyg.editor.components.inputs.FeedbackButton', function(componentDefinition){
    //*@type core.managers.component.ComponentDefinition

    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.resources(['W.Editor']);

    def.binds(['_updateCounter', '_hideComments', '_showComments']);
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Editor.Comments.addEvent('commentRead', this._updateCounter);
            this.resources.W.Editor.Comments.addEvent('commentCreated', this._updateCounter);
            this.resources.W.Editor.Comments.addEvent('commentDeleted', this._updateCounter);
            this.resources.W.Editor.Comments.addEvent('hideComments', this._hideComments);
            this.resources.W.Editor.Comments.addEvent('showComments', this._showComments);
        },
        _onAllSkinPartsReady: function() {
            this._updateCounter();
            this._addToolTipToSkinPart(this.$view, 'Open_Feedback_Dialog_ttid');
        },
        _updateCounter: function() {
            var unread = this.resources.W.Editor.Comments.getUnreadCommentsCounter();
            if (unread > 0) {
                this._skinParts.counter.textContent = unread;
                this._skinParts.counter.style.display = "block";
            } else {
                this._skinParts.counter.style.display = "none";
            }
        },
        _hideComments: function() {
            this.$view.style.display = "none";
        },
        _showComments: function() {
            this.$view.style.display = "block";
        }
    });
});
