define.experiment.component("wysiwyg.editor.components.PanelPresenter.WixStoresLaunch", function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
	var strategy = experimentStrategy;

	def.states(strategy.merge({
		panels: [
			Constants.EditorUI.CLOSED_PANELS,
			Constants.EditorUI.DESIGN_PANEL,
			Constants.EditorUI.ADD_PANEL,
			Constants.EditorUI.PAGES_PANEL,
			Constants.EditorUI.SETTINGS_PANEL,
			Constants.EditorUI.MARKET_PANEL,
			Constants.EditorUI.ECOMMERCE_PANEL,
			Constants.EditorUI.ECOMMERCE_GALLERY_PANEL,
			Constants.EditorUI.NO_MARKET_PANEL,
			Constants.EditorUI.MOBILE_DESIGN_PANEL,
			Constants.EditorUI.MOBILE_ADD_PANEL,
			Constants.EditorUI.MOBILE_SETTINGS_PANEL,
			Constants.EditorUI.MOBILE_MARKET_PANEL,
			Constants.EditorUI.MOBILE_ECOMMERCE_PANEL,
			Constants.EditorUI.MOBILE_HIDDEN_ELEMENTS_PANEL
		]
	}));

    def.skinParts(strategy.merge({
        ecommercePanel: { type: 'wysiwyg.editor.components.panels.EcommercePanel', autoCreate: false },
        mobileEcommerce: { type: 'wysiwyg.editor.components.panels.MobileEcommercePanel', autoCreate: false },
		ecommerceGalleryPanel:{ type: 'wysiwyg.editor.components.panels.EcommerceGalleryPanel', autoCreate: false }
    }));

    def.methods({
        _registerCommandsAndListeners: strategy.after(function () {
			this.resources.W.Commands.registerCommandAndListener("WEditorCommands.Ecommerce", this, this._onShowEcomPanel);
			this.resources.W.Commands.registerCommandAndListener("WEditorCommands.MobileEcommerce", this, this._onShowMobileEcomPanel);
			this.resources.W.Commands.registerCommandAndListener("WEditorCommands.ShowEcommerceGalleriesPanel", this, this._onShowEcomGalleriesPanel);
        }),

		_onShowEcomPanel: function () {
			this.hidePropertyPanel();
			this.showComponentInSidePanel(Constants.EditorUI.ECOMMERCE_PANEL, false, null, Constants.EditorUI.ECOMMERCE_PANEL);
			LOG.reportEvent(wixEvents.OPEN_EDITOR_PANEL, {c1: Constants.EditorUI.ECOMMERCE_PANEL});
		},

		_onShowMobileEcomPanel: function () {
			this._showMobilePanel("mobileEcommerce", Constants.EditorUI.MOBILE_ECOMMERCE_PANEL);
		},

		_onShowEcomGalleriesPanel: function () {
			this.showComponentInSidePanel(Constants.EditorUI.ECOMMERCE_GALLERY_PANEL, false, null, Constants.EditorUI.ECOMMERCE_GALLERY_PANEL);
		}
    });
});