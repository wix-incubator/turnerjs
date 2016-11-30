/**
 * @Class wysiwyg.editor.components.panels.MultiSelectProxyPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.MultiSelectProxyPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel', 'getIsRelative', '_align', '_matchBoth', '_distributeBoth', '_setCheckboxState']);

    def.dataTypes(['']);

    /**
     * @lends wysiwyg.editor.components.panels.MultiSelectProxyPanel
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._checkboxState = false;
        },

        getIsRelative:function () {
            return this._relativeCheckBox.getValue();
        },

        wrapUpAlignments:function () {
            var msp = this._previewComponent; // the multiselect component that was created around the selected components
            msp.setSelectedComps(msp.getSelectedComps()); // sets all components in new position
            msp.fireEvent('autoSizeChange'); // refresh MSP size
        },

        _align:function (e) {
            var msp = this._previewComponent; // the multiselect component that was created around the selected components
            W.UndoRedoManager.startTransaction();
            W.AlignmentTools.arrangeComponents(msp.getSelectedComps(), e.value.command, this._checkboxState);
            W.UndoRedoManager.endTransaction();
            this.wrapUpAlignments();
        },

        _matchBoth:function (e) {
            var msp = this._previewComponent;
            W.UndoRedoManager.startTransaction();
            W.AlignmentTools.arrangeComponents(msp.getSelectedComps(), W.AlignmentTools.AlignmentCommands.HSIZE, false); //the 'relative to parent' is not applied to the size matching commands
            W.AlignmentTools.arrangeComponents(msp.getSelectedComps(), W.AlignmentTools.AlignmentCommands.VSIZE, false);
            W.UndoRedoManager.endTransaction();
            this.wrapUpAlignments();
        },

        _distributeBoth:function (e) {
            var msp = this._previewComponent;
            W.UndoRedoManager.startTransaction();
            W.AlignmentTools.arrangeComponents(msp.getSelectedComps(), W.AlignmentTools.AlignmentCommands.HDISTR, this._checkboxState);
            W.AlignmentTools.arrangeComponents(msp.getSelectedComps(), W.AlignmentTools.AlignmentCommands.VDISTR, this._checkboxState);
            W.UndoRedoManager.endTransaction();
            this.wrapUpAlignments();
        },

        _createFields:function () {
            var resources = this.injects().Resources;
            var path = 'radiobuttons/alignment/';
            var alignSkin = "alignButton";

            this.addInputGroupField(function (panel) {
                this.addLabel(resources.get('EDITOR_LANGUAGE', 'MULTI_SELECT_ALIGN') + ":", null, null, null, null, null, "Element_Settings_Align_ttid");
                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(3);
                    this.addButtonField(null, null, false, path + 'left.png', alignSkin, null, "Element_Settings_Left_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.LEFT}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'center.png', alignSkin, null, "Element_Settings_Center_H_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.HCENTER}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'right.png', alignSkin, null, "Element_Settings_Right_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.RIGHT}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'top.png', alignSkin, null, "Element_Settings_Under_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.UP}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'middle.png', alignSkin, null, "Element_Settings_Center_V_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.VCENTER}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'bottom.png', alignSkin, null, "Element_Settings_Above_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.DOWN}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                }, 'skinless');

                this.addLabel(resources.get('EDITOR_LANGUAGE', 'MULTI_SELECT_DISTRIBUTE') + ":", null, null, null, null, null, "Element_Settings_Distribute_ttid");

                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(3);
                    this.addButtonField(null, null, false, path + 'dist_horiz.png', alignSkin, null, "Element_Settings_Horizontal_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.HDISTR}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'dist_vert.png', alignSkin, null, "Element_Settings_Vertical_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.VDISTR}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'dist_both.png', alignSkin, null, "Element_Settings_Both_ttid").addEvent(Constants.CoreEvents.CLICK, panel._distributeBoth);
                }, 'skinless');

                this.addCheckBoxField(resources.get('EDITOR_LANGUAGE', 'MULTI_SELECT_RELATIVE_TO_PARENT')).addEvent('inputChanged', panel._setCheckboxState);
            });

            this.addInputGroupField(function (panel) {
                this.addLabel(resources.get('EDITOR_LANGUAGE', 'MULTI_SELECT_MATCH_SIZE') + ":", null, null, null, null, null, "Element_Settings_Match_Size_ttid");
                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(3);
                    this.addButtonField(null, null, false, path + 'match_width.png', alignSkin, null, "Element_Settings_To_width_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.HSIZE}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'match_height.png', alignSkin, null, "Element_Settings_To_height_ttid").setValue({command:W.AlignmentTools.AlignmentCommands.VSIZE}).addEvent(Constants.CoreEvents.CLICK, panel._align);
                    this.addButtonField(null, null, false, path + 'match_both.png', alignSkin, null, "Element_Settings_To_both_ttid").addEvent(Constants.CoreEvents.CLICK, panel._matchBoth);
                }, 'skinless');
            });

            var animationButton = this.addAnimationButton();
            if (animationButton) {
                animationButton.hideOnMobile();
            }
        },

        _setCheckboxState:function () {
            this._checkboxState = !this._checkboxState;
        }
    });
});