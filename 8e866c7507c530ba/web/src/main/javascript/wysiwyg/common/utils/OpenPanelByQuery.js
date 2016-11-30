define.Class('wysiwyg.common.utils.OpenPanelByQuery', function (classDefinition,experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(['_executeCommandByQueryValue']);

    def.resources(['W.Commands', 'W.Utils']);

    def.methods({

        initialize: function (scope, functionName) {
            this._query = null;
            this._previewReadyCommand = this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._openPanelByQueryValue, null, true);
            this._mobileViewModeReadyCommand = this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SecondaryPreviewReady", this, this._onMobileViewModeReady, null, true);
        },

        _openPanelByQueryValue: function(){
            this._previewReadyCommand.unregisterListener(this);

            var queryValue = this._getValueByQueryParam('openpanel');

            if (queryValue.indexOf('mobile') === 0){
                this._openMobileViewMode();
            } else {
                this._mobileViewModeReadyCommand.unregisterListener(this);
                this._executeCommandByQueryValue(queryValue);
            }
        },

        _onMobileViewModeReady: function(){
            this._mobileViewModeReadyCommand.unregisterListener(this);
            var queryValue = this._getValueByQueryParam('openpanel');
            if (queryValue.length > 'mobile'.length){
                _.defer(this._executeCommandByQueryValue, queryValue);
            }
        },

        _executeCommandByQueryValue: function(queryValue){
			queryValue = this._filterQueryValue(queryValue);

            switch (queryValue){
                case 'pages':
                    this._executeCommand('pagesPanel', 'Pages');
                    break;
                case 'add':
                    this._executeCommand('addPanel', 'ShowComponentCategories');
                    break;
                case 'gallery':
                    this._executeCommand('gallery', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'buttons_menus':
                    this._executeCommand('buttons', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'ecom':
                    this._executeCommand('ecom', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'design':
                    this._executeCommand('designPanel', 'Design');
                    break;
                case 'background':
                    this._executeCommand('designPanel', 'ShowBackgroundDesignPanel', 'Design');
                    break;
                case 'colors':
                    this._executeCommand('designPanel', 'ShowColorsPanel', 'Design');
                    break;
                case 'fonts':
                    this._executeCommand('designPanel', 'ShowFontsPanel', 'Design');
                    break;
                case 'siteaddress':
                    this._executeCommand('settingsPanel', 'ShowSiteName', 'Settings');
                    break;
                case 'seo':
                    this._executeCommand('settingsPanel', 'ShowSEO', 'Settings');
                    break;
                case 'social':
                    this._executeCommand('settingsPanel', 'ShowSocial', 'Settings');
                    break;
                case 'statistics':
                    this._executeCommand('settingsPanel', 'ShowStatistics', 'Settings');
                    break;
                case 'favicon':
                    this._executeCommand('settingsPanel', 'ShowFaviconAndThumbnail', 'Settings');
                    break;
                case 'market':
                    this._executeMarketCommand();
                    break;
                case 'mobilehidden':
                    this._executeCommand(null, 'MobileHiddenElements');
                    break;
                case 'mobiledesign':
                    this._executeCommand(null, 'MobileDesign');
                    break;
                case 'mobilebkg':
                    this._executeCommand(null, 'ShowMobileBackgroundEditorPanel', 'MobileDesign');
                    break;
                case 'mobileview':
                    this._executeCommand(null, 'ShowMobileViewSelector', 'MobileSettings');
                    break;
                case 'mobileactionbar':
                    this._executeCommand(null, 'ShowMobileQuickActionsView', 'MobileSettings');
                    break;
                case 'blog':
                    this._executeCommand({showCategory:"blog",widgetId:"31c0cede-09db-4ec7-b760-d375d62101e6"}, 'AddWixApp');
                    break;
                case 'image':
                    this._executeCommand('image', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'text':
                    this._executeCommand('text', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'media':
                    this._executeCommand('media', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'shapesandlines':
                    this._executeCommand('areas', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'socialcomponents':
                    this._executeCommand('social', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'apps':
                    this._executeCommand('widgets', 'ShowComponentCategory', 'ShowComponentCategories');
                    break;
                case 'settings':
                    this._executeCommand('settingsPanel', 'Settings');
                    break;
                case 'mobilesettings':
                    this._executeCommand(null, 'MobileSettings');
                    break;
                case 'openfeedme':
                    this._executeCommand(null, 'openFeedbackDialog');
                    break;
                default:
                    break;
            }
        },

        _executeMarketCommand: function() {
            var context = {};
            if(this._query['openpanel']) {
                var tokens = this._query['openpanel'].split(':');
                if(tokens.length === 2) {
                    context.searchTag = tokens[1];
                } else if(tokens.length === 3) {
                    context.appDefIdTag = tokens[2];
                } else {
                    context = {searchTag: ''};
                }
            }
            this.resources.W.Commands.executeCommand('WEditorCommands.Market', context);
        },

        _filterQueryValue: function(queryValue) {
            if (queryValue.indexOf(':') > -1) {
                queryValue  = queryValue.split(':')[0] || queryValue;
            }
            return queryValue;
        },

        _getValueByQueryParam: function(queryParam){
            if (!this._query){
                this._query = this.resources.W.Utils.getQueryStringAsObject();
            }
            if (this._query && this._query[queryParam]){
                var queryValue = this._query[queryParam].toLowerCase();
                var queryValueDecoded = decodeURIComponent(queryValue);

                return queryValueDecoded;
            }
            return '';
        },

        _executeCommand: function(panelName, panelCommandName, panelParentParentCommandName){
            if (panelParentParentCommandName){
                this.resources.W.Commands.executeCommand('WEditorCommands.' + panelParentParentCommandName, panelName);
            }
            this.resources.W.Commands.executeCommand('WEditorCommands.' + panelCommandName, panelName);
        },

        _openMobileViewMode: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.SetViewerMode', {mode: 'MOBILE', src: 'queryParam'}, this);
        }
    });
});
