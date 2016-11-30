/** @class wysiwyg.editor.components.panels.MainEditorBar */
define.experiment.component('wysiwyg.editor.components.panels.MainEditorBar.QuickActions', function (componentDefinition, experimentStrategy) {

    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.resources(['W.Resources']);

    def.fields({
        _searchInput: null
    });

    def.methods({
        _getAvailableWidth: function() {
            var pagesDropDown = this._skinParts.pagesDropDown.getViewNode();
            var dropdownRight = pagesDropDown.getLeft() + pagesDropDown.getWidth();
            var leftMostInputGroup = this._skinParts.content.getElement('[comp*=InputGroup]');
            return leftMostInputGroup ? leftMostInputGroup.getLeft() - dropdownRight : 300;
        },

        _addMainEditorBarActionButtons: strategy.before(function(){
            if (this.resources.W.Resources.getLanguageSymbol() === 'en') {
                this._addSearchInput();
            }
        }),

        _changeButtonsVisibilityByDevice: function(viewerDeviceMode){
            switch (viewerDeviceMode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this._componentEditActionsGroup.copy.collapse();
                    this._componentEditActionsGroup.paste.collapse();
                    this._generalEditActionsGroup.grid.collapse();
                    if (this._searchInput) {
                        this._searchInput.getHtmlElement().collapse();
                    }
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this._componentEditActionsGroup.copy.uncollapse();
                    this._componentEditActionsGroup.paste.uncollapse();
                    this._generalEditActionsGroup.grid.uncollapse();
                    if (this._searchInput) {
                        this._searchInput.getHtmlElement().uncollapse();
                    }
                    break;
            }
        },

        _updateSearchPanelWidth: function (searchPanel) {
            var width = this._getAvailableWidth();
            searchPanel.updateAvailableWidth(width);
        },

        _addSearchInput: function() {
            var self = this;
            this._searchInput = this._addField(
                'wixapps.integration.components.quickactions.SearchPanel',
                'skins.core.InlineSkin'
            ).runWhenReady(function(logic) {
                    self.resource.getResourceValue('W.Preview', function(previewManager) {
                        previewManager.getPreviewManagersAsync(function(managers) {
                            self._updateSearchPanelWidth(logic);
                            var siteView = managers.Viewer.getSiteView('DESKTOP');
                            siteView.addEvent(siteView.SCREEN_RESIZE_EVENT, function() {
                                self._updateSearchPanelWidth(logic);
                            });
                        }, this);
                    });
                });
        }
    });
});