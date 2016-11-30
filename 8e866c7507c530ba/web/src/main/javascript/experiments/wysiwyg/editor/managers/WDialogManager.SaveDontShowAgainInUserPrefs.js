define.experiment.Class('wysiwyg.editor.managers.WDialogManager.SaveDontShowAgainInUserPrefs', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    //def.resources(['W.Editor']);

    def.methods({

        initialize: strategy.after(function(compId, viewNode, args) {
            this._previewReadyCommand = W.Commands.registerCommandAndListener('PreviewIsReady', this, this._onPreviewIsReady, null, true);
            W.Commands.registerCommandAndListener("EditorCommands.gotoSitePage", this, this.getUserPrefsDataAndUpdate);
            W.Commands.registerCommandAndListener("WEditorCommands.BeforeSaveUserPrefs", this, this._saveUserDataToPrefs);
        }),

        _onPreviewIsReady:function(){
            this._UPH = W.Editor.userPreferencesHandler;
            this._previewReadyCommand.unregisterListener(this);
            this.getUserPrefsDataAndUpdate();
        },

        getUserPrefsDataAndUpdate: function(){
            var pageId = "masterPage";  // will be saved globally and not per page, because some of elements could be locked and shown on all pages
            this._UPH.getData('dont_show_again', {key: pageId})
                .then(function(data){
                    this._listOfDialogs = data;
                }.bind(this));
        },

        _saveUserDataToPrefs: function(){
            this._UPH.setData('dont_show_again', this._listOfDialogs, {key: 'masterPage'});
        },

        _updateListOfDialogs:function(dialogName, params){
            this._lastDialogName = dialogName;
        },

        setNotificationDialogShowAgainStatus:function(dialogName, showAgain){
            if(!showAgain){
                this._listOfDialogs[dialogName] = 1;
            }
            else if(this._listOfDialogs[dialogName]){
                delete this._listOfDialogs[dialogName];
            }
        },

        _isNotificationDialogCanBeShownAgain:function(dialogName, marginOfViolations, showAgainSelection){
            if(!this._shouldBeShownAfterNumberOfViolations(marginOfViolations)){
                return false;
            }
            if( typeOf(showAgainSelection)==="boolean" && showAgainSelection===true && this._listOfDialogs[dialogName]) {
                return false;
            }
            return true;
        }
    });
});
