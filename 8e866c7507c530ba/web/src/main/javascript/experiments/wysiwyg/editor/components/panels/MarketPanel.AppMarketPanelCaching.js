define.experiment.component('wysiwyg.editor.components.panels.MarketPanel.AppMarketPanelCaching', function(componentDefinition, experimentStrategy) {
    /**type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.Editor', 'W.Commands']));

    def.statics({
        APP_MARKET_OPENED_KEY: 'openedAppMarket'
    });

    def.methods({
        _renderIframe: strategy.around(function (originalMethod) {
            if (this._skinParts.iframe.src !== "about:blank") {
                return;
            }

            originalMethod();
        })
    });
});
