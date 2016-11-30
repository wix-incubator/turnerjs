/**@class wysiwyg.editor.components.CustomMenuNavigationButton */
define.experiment.component('wysiwyg.editor.components.CustomMenuNavigationButton.CustomSiteMenu', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.binds(['_onSetViewerMode']);

    def.states({
        controls: ['normalControls', 'readOnlyControls'],
        mouse: [ "up", "over", "selected", "down", "pressed" ],
        page: [ "normal", "subPage" ],
        level: [ "level0", "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8", "level9" ]
    });

    def.methods({
        _onAllSkinPartsReady: strategy.after(function () {
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._onSetViewerMode);
            this._onSetViewerMode();
        }),
        _getItemType: function () {
            return this._data.get('link') === '#CUSTOM_MENU_HEADER' ? 'header' : 'link';
        },
        _isMobile: function(){
            return this.getState('controls') === 'readOnlyControls';
        },
        _isVisible: function() {
            return this.getDataItem().isVisible(this._isMobile());
        },
        _onSetViewerMode: function (params) {
            var mode = (params && params.mode) || this.resources.W.Config.env.$viewingDevice;
            switch (mode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('readOnlyControls', 'controls');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setState('normalControls', 'controls');
                    break;
            }
            this.setIcon();
        },
        _onSettingsClicked: function () {
            this.resources.W.Commands.executeCommand("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", {data: this.getDataItem(), mobile: this._isMobile()});
        }
    });
});
