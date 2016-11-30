define.experiment.Class('wysiwyg.editor.managers.preview.MultipleViewersHandler.ExitMobileModeEditorToggle', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.merge(['_selectAndShowExitMobileButton','_secondaryPreviewReady']));

    def.resources([]);

    /** @lends wysiwyg.editor.managers.preview.MultipleViewersHandler */
    def.methods({
        initialize: strategy.after(function(preview) {
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.AddExitMobileModeButton", this, this._addExitMobileModeButton);
            this._secondaryPreviewReadyCommand = W.Commands.registerCommand("WEditorCommands.SecondaryPreviewReady");
        }),

        _getExitMobileButton: function () {
            var button = W.Preview.getCompByID("EXIT_MOBILE");
            return button || null;
        },

        // EXPERIMENT: override
        _addExitMobileModeButton: function () {
            this._secondaryPreviewReadyCommand.registerListener(this, this._secondaryPreviewReady);

            var btn = this._getExitMobileButton();
            if(!btn) {
                var viewerName = this.resources.W.Config.env.$viewingDevice;
                var mainSerializedStructure = this._viewersInfo[Constants.ViewerTypesParams.TYPES.DESKTOP].siteStructureSerializer._getSerializedStructure();
                var secondarySerializedStructure = this._viewersInfo[viewerName].siteStructureSerializer._getSerializedStructure();

                this._layoutAlgorithms.addMobileOnlyComponentToStructure('EXIT_MOBILE', secondarySerializedStructure.masterPage);
                this._updateViewer(Constants.ViewerTypesParams.TYPES.MOBILE, secondarySerializedStructure);

                LOG.reportEvent(wixEvents.MOBILE_EXIT_MOBILE_MODE_BUTTON_ADD_COMPONENT);

                W.UndoRedoManager.clear();
            } else {
                this._selectAndShowExitMobileButton();
            }
        },

        _secondaryPreviewReady: function () {
            this._secondaryPreviewReadyCommand.unregisterListener(this, this._secondaryPreviewReady);
            this._selectAndShowExitMobileButton();
        },

        _selectAndShowExitMobileButton: function () {
            clearTimeout(this._scrollToButtonTO);
            this._scrollToButtonTO = setTimeout(function(){
                var btn = this._getExitMobileButton();
                if(btn) {
                    W.Editor.setSelectedComp(btn.$logic);
                    if (W.Editor.getEditedComponent()) {
                        W.Editor.openComponentPropertyPanels();
                        document.body.scrollTop = btn.getTop() + btn.getHeight();
                    }
                }
                clearTimeout(this._scrollToButtonTO);
            }.bind(this), 300);
        }
    });

});