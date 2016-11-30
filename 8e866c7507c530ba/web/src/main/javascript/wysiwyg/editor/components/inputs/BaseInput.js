define.component('wysiwyg.editor.components.inputs.BaseInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.resources(['W.Commands']);
    def.binds(['_changeEventHandler', '_stopListeningToInput', '_listenToInput', '_onToolTipMouseLeave', '_onToolTipMouseEnter']);
    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);
    def.skinParts({
        label: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] }); //Obj || Array
    def.propertiesSchemaType("");

    def.methods({
        /**
         * Initialize Input
         * Each input should get it's parameters through 'args'
         * 'labelText' is the only mandatory parameter
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._labelText = args.labelText || '';


            if(args.toolTip){
                this._toolTipId = args.toolTip.toolTipId || null;
                this._toolTipAsQuestionMark = args.toolTip.addQuestionMark || false;

                if(args.toolTip.toolTipGetter) {
                    this._getToolTipSkinPart = args.toolTip.toolTipGetter.bind(this);
                } else {
                    this._getToolTipSkinPart = function(){ return this._skinParts.label; }.bind(this);
                }

            } else {
                this._toolTipId = args.toolTipId || null;
                this._toolTipAsQuestionMark =  false;
                this._getToolTipSkinPart = function(){ return this._skinParts.view; }.bind(this);
            }
        },
        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            //Set label if present
            this.setLabel(this._labelText);
        },


        /**
         * override it if needed
         */
        isValidInput: function() {
            return true;
        },


        _onAllSkinPartsReady : function() {
            //Set change events listeners
            if(this.isEnabled()){
                this._listenToInput();
            }
            this.addToolTip(this._toolTipId);

        },

        addToolTip: function(tooltipId, addQuestionMark, tooltipSkinPart, isImageQuestionMark){
            var that=this;
            isImageQuestionMark = isImageQuestionMark !== false;
            tooltipId = tooltipId || this._toolTipId;
            if (!tooltipId) {
                return;
            }
            addQuestionMark = addQuestionMark || this._toolTipAsQuestionMark;
            tooltipSkinPart = tooltipSkinPart || this._getToolTipSkinPart();

            if(addQuestionMark){
                var iconFullPath = this.injects().Theme.getProperty("WEB_THEME_DIRECTORY") + "icons/property_panel_help_sprite.png";
                var html, style;

                if(isImageQuestionMark){
                    html = '&nbsp';
                    style = {backgroundImage: 'url(' + iconFullPath + ')'};
                } else {
                    html = '?';
                    style = {};
                }

                if(!this._tooltipIconElement){
                    this._tooltipIconElement = new Element('span', {
                        'html'  : html,
                        'class' : 'tooltipIcon',
                        'events': {
                            click: function(event){
                                event.preventDefault();
                            },
                            mouseleave: function(){
                                that.resources.W.Commands.executeCommand('Tooltip.CloseTip');
                            }
                        },
                        'styles': style
                    });
                    tooltipSkinPart.grab(this._tooltipIconElement, 'after').setStyles({'width': 'auto', 'display': 'inline-block'});
                }
                this._tooltipIconElement.addEvent('mouseenter', function(){
                        that.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id: tooltipId}, this);
                    }
                );

            } else {
                this._tooltipSkinPart = tooltipSkinPart;
                this._tooltipId = tooltipId;
                tooltipSkinPart.addEvent('mouseenter', this._onToolTipMouseEnter);
                tooltipSkinPart.addEvent('mouseleave', this._onToolTipMouseLeave);
            }
        },

        _onToolTipMouseEnter: function() {
            this.resources.W.Commands.executeCommand('Tooltip.ShowTip', {id:this._tooltipId}, this._tooltipSkinPart);
        },

        _onToolTipMouseLeave: function() {
            this.resources.W.Commands.executeCommand('Tooltip.CloseTip');
        },

        removeToolTip: function(tooltipSkinPart) {
            if (this._tooltipIconElement) {
                this._tooltipIconElement.dispose();
            }
            else {
                tooltipSkinPart.removeEvent('mouseenter', this._onToolTipMouseEnter);
                tooltipSkinPart.removeEvent('mouseleave', this._onToolTipMouseLeave);
            }
        },

        /**
         * Set the label of the input.
         * A 'hasLabel' state is set for labels with text
         * A 'noLabel' state is set for empty labels
         * @param text
         */
        setLabel: function(text){
            if (text && typeof text === 'string'){
                this._labelText = text;
                this.setState('hasLabel', 'label');
                this._skinParts.label.set('html', text);
                this._skinParts.label.uncollapse();
            }else{
                this._labelText = '';
                this.setState('noLabel', 'label');
                this._skinParts.label.set('html', '');
                this._skinParts.label.collapse();
            }
//            if(this._toolTipIcon)this._skinParts.label.adopt(this._toolTipIcon);
        },

        /**
         * Called by the data binding mechanism
         * @param txt
         */
        setTextContent : function(txt) {
            this.setLabel(txt);
        },
        /**
         * Force invocation of change event
         * @param e
         */
        fireChangeEvent: function(e){
            this._changeEventHandler(e || {});
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this._listenToInput();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this._stopListeningToInput();
        },

        setFocus:function(){
        },

        /**
         * The change event handler of the input.
         * Must fire 'inputChanged' event to communicate
         * @param e
         */
        _changeEventHandler: function(e) {
            var value = this.getValue();
            if (typeof value === 'string'){
                value = this.injects().Utils.convertToHtmlText(value);
            }
            var event = {value: value, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },

        _translate: function(key, fallback) {
            return this.injects().Resources.get('EDITOR_LANGUAGE', key, fallback);
        },

        /**
         * @override
         * Cleans up this component: disconnect it from its view and clean up the view
         * Calls a function to disconnect all input events.
         */
        dispose: function(){
            this._stopListeningToInput();
            this._removeDataListeners();
            this.parent();
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, '_listenToInput');
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, '_stopListeningToInput');
        },

        shouldHideOnMobile: function(boundSchemaType) {
            var propertyClassName = 'core.managers.data.PropertiesItem';
            if (!this._data) {
                return !boundSchemaType || boundSchemaType !== propertyClassName;
            }
            return this._data.$className !== propertyClassName;
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

