define.component('wysiwyg.editor.components.inputs.CollapsibleInputGroup', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.InputGroup");

    def.skinParts({
        header: {type: 'htmlElement'},
        arrow: {type: 'htmlElement'},
        title: {type: 'htmlElement'},
        content: {type: 'htmlElement'}
    });

    def.states({
        'collapsibiliy': ['collapsed', 'uncollapsed'],
        'separator': ['hideSeparator', 'showSeparator']
    });

    def.methods/**
     * @lends wysiwyg.editor.components.inputs.CollapsibleInputGroup
     */({
        /**
         *
         * @param compId
         * @param viewNode
         * @param args
         * @constructs
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._showSeparator = args.showSeparator;
            this._title = args.title;
            this._eventOnToggle = args.eventOnToggle;
        },

        render: function(){
            this.parent();
            this.setTitle();
        },

        setTitle: function(){
            if (this._title && typeof this._title === 'string'){
                this._skinParts.title.set('html', this._title);
            }
        },
        _onAllSkinPartsReady: function(){
            this.parent();
            if(this._showSeparator) {
                this.setState('showSeparator', 'separator');
            }
            this._skinParts.header.addEvent('click', this.toggleCollapseState);
        },

        toggleCollapseState: function(){
            if (this._isCollapsed) {
                this.uncollapseGroup();
                if(this._eventOnToggle){
                    LOG.reportEvent(this._eventOnToggle, {i1: 1});
                }
            } else {
                this.collapseGroup();
                if(this._eventOnToggle){
                    LOG.reportEvent(this._eventOnToggle, {i1: 0});
                }
            }
        },

        collapseGroup: function() {
            this._skinParts.content.collapse();
            this._isCollapsed = true;
            this.setState('collapsed','collapsibiliy');
        },

        uncollapseGroup: function() {
            this._skinParts.content.uncollapse();
            this._isCollapsed = false;
            this.setState('uncollapsed','collapsibiliy');
        }
    });
});