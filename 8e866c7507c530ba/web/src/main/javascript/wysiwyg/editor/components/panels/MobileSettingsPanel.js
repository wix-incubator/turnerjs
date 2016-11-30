define.component('wysiwyg.editor.components.panels.MobileSettingsPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.skinParts({
        'scrollableArea': {type: 'htmlElement'}
    });

    def.fields({
        _panelName: "MOBILE_SETTINGS_PANEL_TITLE"
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._titleKey = "MOBILE_SETTINGS_PANEL_TITLE";
            this._descriptionKey = "MOBILE_SETTINGS_PANEL_DESCRIPTION";
        },

        render: function () {
            this.parent();
            this._skinParts.scrollableArea.setStyle('height', '500px');
        },

        _createFields: function () {
            //Background image selector

            var subPanelListDataProvider = '#MOBILE_SETTINGS_PANEL';

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
