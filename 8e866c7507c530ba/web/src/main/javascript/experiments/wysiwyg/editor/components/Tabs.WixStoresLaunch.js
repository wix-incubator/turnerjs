define.experiment.component('wysiwyg.editor.components.Tabs.WixStoresLaunch', function (componentDefinition, experimentStrategy) {

	/** @type core.managers.component.ComponentDefinition */
	var def = componentDefinition;
	var strategy = experimentStrategy;

	def.statics({
		tabWidth: 50,
		tabHeight: 50,
		tabMargin: 10,
		tabHoverHeight: 50,
		tabHoverWidth: 165.5,		//this just work with .5 - pixel matherfucker
		mobileTabHoverWidth: 183.5, //this just work with .5 - pixel matherfucker
		_desktopHoverOffset : 0,
		_mobileHoverOffset : 0,
		tabHoverMargin: 5,
		baseBackgroundPosition: "-10px -10px",
		baseHoverBackgroundPosition: "-5px -5px",
		firstTimeBackgroundPosition: "-173px -5px",
		APP_MARKET_OPENED_KEY: 'openedAppMarket',
		_offset: 0,
		_hoverOffset: 0
	});

	def.resources(strategy.merge(['W.Data', 'W.TPAEditorManager']));

	def.utilize(strategy.merge([
		'tpa.editor.services.InstalledAppsOnSiteService',
		'tpa.editor.services.DashboardApiService'
	]));

	def.methods({
		initialize: strategy.after(function () {
			this._dashboardApiService = new this.imports.DashboardApiService();
			this.resources.W.Commands.registerCommandListenerByName("PreviewIsReady", this, this._onPreviewReady);
			this.resources.W.Commands.registerCommandAndListener("EditorCommands.WixStoreAdded", this, this._onWixStoreAdded);
			this.resources.W.Commands.registerCommandAndListener("EditorCommands.WixStoreRemoved", this, this._onWixStoreRemoved);
		}),

		_onPreviewReady: function () {
			var clientSpecMap = this._getClientSpecMap();
			this.resources.W.TPAEditorManager.getInstalledTpaComponents(function(compsOnSite){
				this._installedAppsOnSiteService = new this.imports.InstalledAppsOnSiteService(clientSpecMap, compsOnSite, this._dashboardApiService);
				if (this._installedAppsOnSiteService.isAppInstalledBy('1380b703-ce81-ff05-f115-39571d94dfcd')){
					this._onWixStoreAdded(true);
				}
			}.bind(this))
		},

		_onWixStoreAdded: function (notToOpenEditorMenu) {
			//should run only once
			if (!this._wixStoreExist) {
				var openEditorMenu = !notToOpenEditorMenu;
				this._originalTopTabs = this.resources.W.Data.getDataByQuery('#TOP_TABS').getData();
				this._originalTopTabsMobile = this.resources.W.Data.getDataByQuery('#TOP_TABS_MOBILE').getData();

				var topTabsWithEcom = this.resources.W.Data.getDataByQuery('#TOP_TABS_WITH_ECOM').getData();

				this._data.setData(topTabsWithEcom);
				this.resources.W.Data.addDataItem('TOP_TABS', topTabsWithEcom);
				this.resources.W.Data.addDataItem('TOP_TABS_MOBILE', this.resources.W.Data.getDataByQuery('#TOP_TABS_MOBILE_WITH_ECOM').getData());

				this.resources.W.Data.getDataByQuery('#TOP_TABS').setIsPersistent(true);
				this.resources.W.Data.getDataByQuery('#TOP_TABS_MOBILE').setIsPersistent(true);

				this._mobileHoverHorizPositionOnFirstTime = -(this.mobileTabHoverWidth * 2 + 10);
				this._hoverHorizPositionOnFirstTime = -(this.tabHoverWidth * 2 + 10);
				this._firstTimeOffset = this.tabHoverWidth * 3 + 12.5;
				this._firstTimeMobileOffset = this.mobileTabHoverWidth * 3 + 12.5;

				this._offset = ( ( this._itemsNodes.length * 2 ) - 1) * (this.tabWidth + this.tabMargin);
				this._desktopHoverOffset = (this.tabHoverWidth + this.tabHoverMargin) * 2 - this.tabHoverMargin;
				this._mobileHoverOffset = (this.mobileTabHoverWidth + this.tabHoverMargin) * 2 - this.tabHoverMargin;

				if ((this._isFirstTimeUser() && this._firstTimeRender)){
					this.baseBackgroundPosition = "-" + this._firstTimeOffset + "px -5px";
					this.mobileFirstTimeBackgroundPosition = "-" + this._firstTimeMobileOffset + "px -5px";
					this.firstTimeBackgroundPosition = this.baseBackgroundPosition;
				} else {
					this.baseBackgroundPosition = "-" + (this._offset + 10) + "px -10px";
				}
				this.getViewNode().setStyle("background-position", this.baseBackgroundPosition);
				if (openEditorMenu) {
					//this._waitForStupidMenu();
					setTimeout(function () {
						this.resources.W.Commands.executeCommand("WEditorCommands.Ecommerce");
					}.bind(this), 0);
				}
				this._wixStoreExist = true;
			}
		},


		_onWixStoreRemoved: function () {
			this._data.setData(this._originalTopTabs);
			this.resources.W.Data.addDataItem('TOP_TABS', this._originalTopTabs);
			this.resources.W.Data.addDataItem('TOP_TABS_MOBILE', this._originalTopTabsMobile);

			this._offset = 0;
			this._mobileHoverHorizPositionOnFirstTime = -5;
			this._hoverHorizPositionOnFirstTime = -5;
			this._desktopHoverOffset = 0;
			this._mobileHoverOffset = 0;
			this.baseBackgroundPosition = "-10px -10px";
			this.resources.W.Commands.executeCommand("WEditorCommands.Pages");
			this._wixStoreExist = false;
		},

		_onFirstTimeUserTabSelect:strategy.after(function () {
			this.baseBackgroundPosition = "-" + (this._offset + 10) + "px -10px";
		}),

		_getBackgroundPositionForSelection: function (tabLogic) {
			var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view) + 1;
			var bgPosHorz = -(tabIndex * (this.tabWidth + this.tabMargin) + this._offset + 10);
			return this._bgPos(bgPosHorz, -10);
		},

		_getBackgroundPosition: function (tabLogic) {
			var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view) + 1;
			var tabsCount = this._itemsNodes.length;
			var btnBodyWidth = (tabIndex + tabsCount) * this.tabWidth;
			var btnMarginWidth = (tabIndex + tabsCount) * this.tabMargin;
			var bgPosHorz = -(btnMarginWidth + btnBodyWidth) - this._offset - 10;
			var bgPosVert = -10;
			return this._bgPos(bgPosHorz, bgPosVert);
		},

		_getHoverBackgroundPosition: function (tabLogic) {
			this._hoverOffset = this._getHoverOffset();
			var tabIndex = this._itemsNodes.indexOf(tabLogic.ui._view);
			var btnBodyHeight = tabIndex * this.tabHeight;
			var btnMarginWidth = tabIndex * this.tabHoverMargin;
			var bgPosVert = -(btnMarginWidth + btnBodyHeight) - 5;
			var bgPosHorz = -5 - this._hoverOffset;
			return this._bgPos(bgPosHorz, bgPosVert);
		},

		_getHoverOffset: function () {
			var isMobileViewer = (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE);
			return (isMobileViewer) ? this._mobileHoverOffset : this._desktopHoverOffset;
		}
	});
});
