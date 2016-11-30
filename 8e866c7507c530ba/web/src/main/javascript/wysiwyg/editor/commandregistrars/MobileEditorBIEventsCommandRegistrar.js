define.Class('wysiwyg.editor.commandregistrars.MobileEditorBIEventsCommandRegistrar', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy ;

    def.resources(['W.Commands']) ;

    def.methods({
        registerCommands: function() {
            var cmdmgr = this.resources.W.Commands ;
            cmdmgr.registerCommandAndListener("WEditorCommands.ShowMobileViewSelector",         this,   this._reportBIEventOnShowMobileViewPanel);
            cmdmgr.registerCommandAndListener("WEditorCommands.SetViewerMode",                  this,   this._reportBISetViewerMode);
            cmdmgr.registerCommandAndListener("WEditorCommands.ReorderCurrentMobilePageLayout", this,   this._reportBIReorderLayout);
            cmdmgr.registerCommandAndListener("WEditorCommands.ReaddDeletedMobileComponent",    this,   this._reportBIRestoreRemovedComponent);
        },

        _reportBIEventOnShowMobileViewPanel: function (params) {
            params = params || {"src": "menu"};
            LOG.reportEvent(wixEvents.MOBILE_EDITOR_MOBILE_VIEW_PANEL_SHOW, {"c1": params.src});
        },

        _reportBISetViewerMode: function (params) {
            params = params || {};
            var logMessage = (params.mode === Constants.ViewerTypesParams.TYPES.DESKTOP) ? wixEvents.EDITOR_SWITCH_TO_DESKTOP_MODE : wixEvents.EDITOR_SWITCH_TO_MOBILE_MODE;
            LOG.reportEvent(logMessage, {"c1":params.src});
        },

        _reportBIReorderLayout: function () {
            LOG.reportEvent(wixEvents.MOBILE_EDITOR_REORDER_LAYOUT);
        },

        _reportBIRestoreRemovedComponent: function (params) {
            LOG.reportEvent(wixEvents.MOBILE_EDITOR_RESTORE_DELETED_COMPONENT, {"c1": params.id});
        }
    }) ;
}) ;



