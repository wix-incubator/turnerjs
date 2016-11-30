/**
 * this component groups together specified input components, and enables common operations on all
 * of the grouped inputs, such as collaping all the group members
 *
 * @class wysiwyg.editor.components.inputs.InputGroup
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.inputs.InputGroup', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    //note that unlike the rest of the Inputs, InputGroup extends AutoPanel (and not BaseInput)
    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.binds(['toggleCollapseState']);

    def.skinParts({
        //button: {type: 'wysiwyg.editor.components.WButton'},
        content: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'collapsibiliy': ['collapsed', 'uncollapsed']});

    def.dataTypes(['']);

    /**
     * @lends wysiwyg.editor.components.inputs.InputGroup
     */
    def.methods({
        /*
         args can have the followings:
         createFieldsFunc - the callback which creates the inputs members of the group. usually contains
         set of "this.addXField", as implemented in AutoPanel
         useCollapseButton            - iff true, the group will have a "collapse" button
         upperLineSeparator     - iff true, adds a line at the beginning at the group section
         collapseAtStart        - iff true, the default start view will be collapse.
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            if (args.width) {
                this.setWidth(args.width);
            }
            this._padding = args.padding || 0;
            this._createFields = args.createFieldsFunc || function () {
            };
            this._labels = {
                collapse: args.collapseLabel || this.injects().Resources.get('EDITOR_LANGUAGE', 'GROUP_COLLAPSE'),
                expand: args.expandLabel || this.injects().Resources.get('EDITOR_LANGUAGE', 'GROUP_EXPAND')
            };
            this._buttonLabel = this._labels.collapse;
            this._useCollapseButton = args.useCollapseButton || false;
            this._collapseAtStart = args.collapseAtStart || false;
            this._data = args.groupData || null;
            this._previewComponent = args.previewComponent;
            this._inlineAlignment = args.align || '';
            this._styles = args.styles || null;
        },

        _onAllSkinPartsReady : function() {
            if (this._useCollapseButton) {
                this._isCollapsed = false;
                //this._skinParts.button.addEvent(Constants.CoreEvents.CLICK, this.toggleCollapseState);
//            } else {
                //this._skinParts.button.hide();
            }

            this.setState('uncollapsed','collapsibiliy');

            // collapse group if this._collapseAtStart == true
            if (this._collapseAtStart) {
                this.toggleCollapseState();
            }
        },

        /**
         * @override
         */
        render: function() {
            this.parent();
            //set the button label:
            this._buttonLabel = (this._isCollapsed) ? this._labels.collapse : this._labels.expand;
            //this._skinParts.button.setLabel(this._buttonLabel);
            if (this._inlineAlignment){
                this._skinParts.content.setStyle('text-align', this._inlineAlignment);
            }
            if (this._styles){
                this._skinParts.content.setStyles(this._styles);
            }
            this._skinParts.view.setStyle('padding', this._padding);
        },


        /*
         switches between 'collape' and 'uncollapse' states of thew group
         */
        toggleCollapseState: function() {
            if (this._isCollapsed) {
                this.uncollapseGroup();
            } else {
                this.collapseGroup();
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
        },


        /**
         * @override
         * Cleans up this component: disconnect it from its view and clean up the view
         * Calls a function to disconnect all input events.
         */
        dispose: function() {
            this._stopListeningToInput();
            this.parent();
        },

        /**
         * Remove change events
         */
        _stopListeningToInput: function() {
            //this._skinParts.button.removeEvent(Constants.CoreEvents.CLICK, this.toggleCollapseState);
        },

        shouldHideOnMobile: function() {
            return _.every(this.getFields(), function(inputFieldProxy){
                var inputLogic = inputFieldProxy.getHtmlElement().$logic;
                return inputLogic && (inputLogic.shouldHideOnMobile(inputFieldProxy.getBoundSchemaType()) ||
                    inputFieldProxy.getHtmlElement().hasClass('hiddenOnMobile')); //inputs that are hidden although they're bound to properties
            });
        },

        hideOnMobile: function() {
            this.getViewNode().addClass('hiddenOnMobile');
            var isMobileMode = W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            if (isMobileMode) {
                this.collapse();
            }
        }
    });
});