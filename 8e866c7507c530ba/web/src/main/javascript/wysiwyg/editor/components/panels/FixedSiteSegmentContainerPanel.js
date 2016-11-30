define.component('wysiwyg.editor.components.panels.FixedSiteSegmentContainerPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: { type : 'htmlElement'}
    });

    def.binds(['_updateCheckboxAfterPositionChange']);


    def.methods(/**
     * @lends wysiwyg.editor.components.panels.FixedSiteSegmentContainerPanel
     */{
        /**
         * @constructs
         * @param compId
         * @param viewNode
         * @param args
         */
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._panelKeys = args.panelKeys;
            this.compClassName = args.previewComponent.$className;
            this.compLogic = args.previewComponent;
            this._fixedPositionCheckbox = null; //this will be updated when it's created
        },
        _createFields:function(){
            this.injects().Data.getDataByQuery("#STYLES", this._createStylePanel);
            this.addBreakLine('10px');
            this.addInputGroupField(function (panel) {
                panel._addFixedPositionCheckbox(this);
                panel._addFixedPositionHelptext(this);
                panel._addLearnMoreLink(this);
            });
        },

        _addFixedPositionCheckbox: function(inputGroupField) {
            var compClassName = this.compClassName,
                that = this,
                compLogic = this.compLogic;
            inputGroupField.addCheckBoxField(inputGroupField._translate(this._panelKeys.checkBoxLabel, 'Fixed Position'), this._panelKeys.toolTipId)
                    .addEvent('inputChanged',function(e){
                        var pos = e.value ? 'fixed' : 'absolute';
                        compLogic.setPos(pos);
                        LOG.reportEvent(wixEvents.FIXED_POSITION_TOGGLED,{c1: compClassName, i1: e.value});
                    })
                    .runWhenReady(function(checkBox){
                        that._fixedPositionCheckbox = checkBox;
                        that._bindCheckboxToPositionChange();
                        var fakeEvent = {comp: compLogic};
                        that._updateCheckboxAfterPositionChange(fakeEvent); //forcing update of the checkbox
                });

        },

        _addFixedPositionHelptext: function(inputGroupField){
            var helpInfo = this._panelKeys.helpInfo;
            if(helpInfo){
                inputGroupField.addBreakLine('15px');
                inputGroupField.addLabel(inputGroupField._translate(helpInfo));
            }
        },

        _addLearnMoreLink: function(inputGroupField){
            inputGroupField.addInlineTextLinkField(null, null, this._translate("HELPLET_LEARN_MORE"))
                .addEvent(Constants.CoreEvents.CLICK, function() {
                    this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'COMPONENT_PANEL_FixedPositionComponents');
                }.bind(this));
        },

        _bindCheckboxToPositionChange: function(){
            if(!this._isBoundToFixedPosition){
                this.compLogic.addEvent('positionChanged', this._updateCheckboxAfterPositionChange);
            }
            this._isBoundToFixedPosition = true;
        },

        _updateCheckboxAfterPositionChange: function(e){
            var comp = e.comp;
            this._fixedPositionCheckbox.setValue(comp.isFixedPositioned());
        },

        dispose: function(){
            this.compLogic.removeEvent('positionChanged', this._updateCheckboxAfterPositionChange);
            this.parent();
        }

    });
});