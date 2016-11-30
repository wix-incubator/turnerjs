define.experiment.component('wysiwyg.editor.components.panels.MarketPanel.PromoteAppMarketFromHtmlComp', function(componentDefinition, experimentStrategy) {
    /**type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.Editor', 'W.Commands']));

    def.methods({
        onBeforeShow: function(param) {
                   // Disable the mouse scroll of the window
            this._view.addEvent(Constants.CoreEvents.MOUSE_WHEEL,this.resources.W.Utils.stopMouseWheelPropagation);

            this._setSearchOrAppDefIdTag(param);

            var openPanelSource = this._getOpenCommandSource(param.args);

            // Add BI event for notifying opening market panel source
            LOG.reportEvent(wixEvents.APP_MARKET_OPENED, { c1: openPanelSource });

            this._renderIframe();
        },
        /**
         * Calculates the origin of the open App Market command.
         * @param args If it has args.origin, return it as the source of the command. Can be undefined if not.
         * @returns {*}
         * @private
         */
        _getOpenCommandSource: function (args) {
            if (args && args.origin) {
                return args.origin;
            }

            return this._tag ? this.OPENED_SOURCE_APP_MARKET.APP_PLACEHOLDER : this.OPENED_SOURCE_APP_MARKET.APP_MARKET_BUTTON;
        }
    });
})