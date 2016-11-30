define.component('wysiwyg.editor.components.CommentsViewModeBox', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.binds(['_hideComments']);

    def.resources(['W.Resources']);

    def.skinParts({
        buttons  : { type: 'htmlElement'},
        hideCommentsButton  : { type: 'htmlElement'},
        label    : { type: 'htmlElement'},
        labelSuffix : { type: 'htmlElement'}
    });

    def.states({
        mode: ['hidden', 'displayed']
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._commentsManager = args.commentsManager;
        },

        _onRender: function() {
            this._skinParts.label.textContent = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'VIEW_COMMENTS_MODE_LABEL','To hide all comments,');
            this._skinParts.hideCommentsButton.textContent = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'VIEW_COMMENTS_MODE_BUTTON','click here');
            this._skinParts.labelSuffix.textContent = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'VIEW_COMMENTS_MODE_SUFFIX','');
            this._skinParts.hideCommentsButton.addEvent('click', this._hideComments);
        },

        _hideComments: function(){
            LOG.reportEvent(wixEvents.EXIT_COMMENTS_VIEW_MODE);
            this._commentsManager.exitViewCommentsMode(true);
        },

        showBox: function(){
            this.setState('displayed', 'mode');
        },

        hideBox: function(){
            this.setState('hidden', 'mode');
        }
    });
});
