define.experiment.component('wysiwyg.editor.components.panels.base.SidePanel.AppMarketPanelCaching', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy ;

    def.resources(strategy.merge(['W.Utils'])) ;

    def.methods({
        _delayedInsertPanel: function (thePanel, prevPanelName) {
            this._insertPanelContent(thePanel.className);
            this.uncollapse();

            var sp = this._skinParts;

            this._contentPanel = thePanel;
            this._contentPanel.setContainerPanel(this);
            this.setState(this._contentPanel.getPanelType(), 'panel');

            if (!thePanel) {
                this._skinParts.cancelButton.collapse();
                this._skinParts.backButton.collapse();
                return;
            }

            if (!thePanel.hasClassAncestor("SideContentPanel", true)) {
                this.injects().Utils.debugTrace("side panel content must inherit from SideContentPanel");
                return;
            }

            thePanel.getViewNode().insertInto(sp.content);
            sp.title.uncollapse();
            sp.description.uncollapse();

            this._panelTitle = thePanel.getTitle();
            this._skinParts.title.set('html', this._panelTitle);

            this._panelDescription = thePanel.getDescription();
            this._skinParts.description.set('html', this._panelDescription);

            this._helplet = thePanel.getHelplet();
            this._skinParts.helplet.setCollapsed(!this._helplet);
            if (this._helplet && !this._helpletAlreadyRegistered) {
                this._helpletAlreadyRegistered = true;
                this._skinParts.helplet.addEvent('click', function () {
                    this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', this._helplet);
                }.bind(this));
            }

            this._skinParts.cancelButton.setCollapsed(!thePanel.canCancel());
            this._skinParts.backButton.setCollapsed(!thePanel.canGoBack());

            this._manageAdditionalInfo(thePanel);

            this._setPrevPanelName(prevPanelName);

            // IE SUCKS!!! (remove this line and you'll get shit skids of shadows)
            this.resources.W.Utils.forceBrowserRepaint(null, 50, ['safari', 'ie']);
        },

        _insertPanelContent: function (panelClassName) {
            this._skinParts.content.getChildren().setStyle('display', 'none');

            var cachedContent = this._skinParts.content.querySelector('[comp= "' + panelClassName + '"]');
            if (cachedContent) {
                cachedContent.setStyle('display', 'block');
            }
        }
    });
});
