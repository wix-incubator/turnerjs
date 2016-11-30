define.component('wysiwyg.editor.components.panels.SettingsPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.skinParts({
        'scrollableArea': {type: 'htmlElement'}
    });

    def.fields({
        _panelName: "SETTINGS_PANEL_TITLE"
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._appType = this.injects().Config.getApplicationType();

            this._titleKey = "SETTINGS_PANEL_TITLE";
            this._descriptionKey = this._appType == Constants.WEditManager.SITE_TYPE_WEB ? "SETTINGS_PANEL_DESCRIPTION" : "SETTINGS_PANEL_DESCRIPTION_FB_MODE";
        },

        render: function () {
            this.parent();
            this._skinParts.scrollableArea.setStyle('height', '482px');
        },

        _createFields: function () {
            //Background image selector

            var subPanelListDataProvider = this._appType == Constants.WEditManager.SITE_TYPE_WEB ? '#SETTINGS_PANEL' : '#SETTINGS_PANEL_FB_MODE';

            var settingInnerComponent = this.addSelectionListInputFieldWithDataProvider(null, subPanelListDataProvider,
                {repeatersSelectable: true},
                {
                    type: 'wysiwyg.editor.components.WButton',
                    skin: 'wysiwyg.editor.skins.buttons.ButtonMenuSkin',
                    numRepeatersInLine: 1
                }
            );

            // remove selection on subpanel close
            settingInnerComponent.runWhenReady(function (contentComp) {
                this._contentComp = contentComp;
            }.bind(this));

            this.addEvent('subMenuCloses', function () {
                this._contentComp.fireEvent('subMenuCloses');
            }.bind(this));
        }
    });

});
