define.component('wysiwyg.editor.components.panels.TinyMenuPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.resources(['W.Commands']);

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.utilize(['wysiwyg.editor.components.FixedMenuEditorHandler']);

    def.dataTypes(['Menu']);

    def.binds(['_onShowPreview']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this._previewComponent = args.previewComponent;
            this._fixedMenuHandler = new this.imports.FixedMenuEditorHandler(this._previewComponent);
            this.parent(compId, viewNode, args);
        },
        _createFields: function(){
            this.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(1);

                var resources = this.injects().Resources;
                var bg = 'radiobuttons/radio_button_states.png';
                var bgDimensions = {w: '35px', h: '33px'};

                var menuAlignOptions = {
                    options: [
                        {value: 'left', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/left.png'},
                        {value: 'center', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/center.png'},
                        {value: 'right', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/right.png'}
                    ],
                    display: 'inline',
                    defaultValue: '',
                    group: ''
                };

                this.addRadioImagesField(resources.get('EDITOR_LANGUAGE', 'MOBILE_TEXT_ALIGN_LABEL') + ":", menuAlignOptions.options, menuAlignOptions.defaultValue, menuAlignOptions.group, menuAlignOptions.display).bindToProperty('direction');
                this.addInlineTextLinkField(null, this._translate('MOBILE_TEXT_ALIGN_LABEL_START'), " " + this._translate('MOBILE_TEXT_ALIGN_PREVIEW_LINK') + " ", this._translate('MOBILE_TEXT_ALIGN_LABEL_END'), null, null, null, null).addEvent(Constants.CoreEvents.CLICK, panel._onShowPreview);
            });
            this._createFixedMenuInputGroup();
            this.addStyleSelector();
        },

        _onShowPreview: function() {
            this.resources.W.Commands.executeCommand('WEditorCommands.WSetEditMode', {editMode: "PREVIEW"});
        },

        _createFixedMenuInputGroup: function() {
            var panel = this;
            this.addInputGroupField(function(){
                this.addCheckBoxField(this._translate('MOBILE_FIXED_MENU_CHECKBOX'))
                    .runWhenReady(panel._fixedMenuHandler._setCheckBoxAccordingToPosition)
                    .addEvent('inputChanged', panel._fixedMenuHandler._onFixedPositionChanged);

                this.addBreakLine('8px');

                this.addLabel(this._translate('MOBILE_FIXED_MENU_LABEL'));

                this.addInlineTextLinkField(null, null, this._translate("HELPLET_LEARN_MORE"))
                    .addEvent(Constants.CoreEvents.CLICK, function() {
                        this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'COMPONENT_PANEL_FixedTinyMenu');
                    }.bind(this));
            });
        },

        getStyleButtonLabel: function() {
            return "MOBILE_MENU_CHOOSE_STYLE_TITLE";
        },

        dispose: function() {
            this._previewComponent.offByListener(this._fixedMenuHandler);
            this.parent();
        }
    });
});