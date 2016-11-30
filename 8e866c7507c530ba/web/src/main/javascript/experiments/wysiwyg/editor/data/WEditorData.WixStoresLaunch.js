define.experiment.newDataItem('TOP_TABS_WITH_ECOM.WixStoresLaunch', function (experimentStrategy) {
	return {
		type: 'PropertyList',
		items: [
			{name: 'Pages', label: 'SIDE_BTN_PAGES', labelType: 'langKey', id: 'tbPages', command: 'WEditorCommands.Pages', commandParameter: 'pagesPanel'},
			{name: 'Design', label: 'SIDE_BTN_DESIGN', labelType: 'langKey', id: 'tbDesign', command: 'WEditorCommands.Design', commandParameter: 'designPanel'},
			{name: 'Add', label: 'SIDE_BTN_ADD', labelType: 'langKey', id: 'tbAdd', command: 'WEditorCommands.ShowComponentCategories', commandParameter: 'addPanel'},
			{name: 'Market', label: 'SIDE_BTN_MARKET', labelType: 'langKey', id: 'tbMarket', command: 'WEditorCommands.Market', commandParameter: 'marketPanel', component: 'wysiwyg.editor.components.AppMarketTab'},
			{name: 'Settings', label: 'SIDE_BTN_SETTINGS', labelType: 'langKey', id: 'tbSettings', command: 'WEditorCommands.Settings', commandParameter: 'settingsPanel'},
			{name: 'Ecom', label: 'SIDE_BTN_ECOM', labelType: 'langKey', id: 'tbEcom', command: 'WEditorCommands.Ecommerce', commandParameter: 'ecommercePanel'}
		]
	}
});

define.experiment.newDataItem('TOP_TABS_MOBILE_WITH_ECOM.WixStoresLaunch', function (experimentStrategy) {
	return {
		type: 'PropertyList',
		items: [
			{name: 'Pages', label: 'SIDE_BTN_PAGES', labelType: 'langKey', id: 'tbPages', command: 'WEditorCommands.Pages', commandParameter: 'pagesPanel'},
			{name: 'Mobile Design', label: 'SIDE_BTN_MOBILE_DESIGN', labelType: 'langKey', id: 'tbMobileDesign', command: 'WEditorCommands.MobileDesign', commandParameter: 'mobileDesignPanel'},
			{name: 'Mobile Add', label: 'SIDE_BTN_ADD', labelType: 'langKey', id: 'tbMobileAdd', command: 'WEditorCommands.MobileAdd', commandParameter: 'mobileAddPanel'},
			{name: 'Mobile Market', label: 'SIDE_BTN_MARKET', labelType: 'langKey', id: 'tbMobileMarket', command: 'WEditorCommands.MobileMarket', commandParameter: 'mobileMarketPanel'},
			{name: 'Mobile Settings', label: 'SIDE_BTN_MOBILE_SETTINGS', labelType: 'langKey', id: 'tbMobileSettings', command: 'WEditorCommands.MobileSettings', commandParameter: 'mobileSettingsPanel'},
			{name: 'Mobile Ecom', label: 'SIDE_BTN_ECOM', labelType: 'langKey', id: 'tbMobileEcom', command: 'WEditorCommands.MobileEcommerce', commandParameter: 'mobileEcommercePanel'}
		]
	}
});

define.experiment.newDataItem('ECOMMERCE_SUB_PANELS.WixStoresLaunch', function (experimentStrategy) {
	return {
		type: 'PropertyList',
		items: [
			{
				'type': 'Button',
				'iconSrc': 'buttons/ManageStore.png',
				'toggleMode': false,
				'label': 'MANAGE_STORE',
				'command': 'WEditorCommands.OpenWixStoresManager',
				commandParameter: {
					origin: 'WixStoresMenuOpenStoreManager',
					appDefinitionId: "1380b703-ce81-ff05-f115-39571d94dfcd"
				}
			},
			{
				'type': 'Button',
				'iconSrc': 'buttons/AddProduct.png',
				'toggleMode': false,
				'label': 'ADD_PRODUCTS',
				'command': 'WEditorCommands.OpenWixStoresManager',
				commandParameter: {
					origin: 'WixStoresMenuAddProducts',
					appDefinitionId: "1380b703-ce81-ff05-f115-39571d94dfcd",
					state: '#/newProduct'
				}
			},
			{
				'type': 'Button',
				'iconSrc': 'buttons/AddStoreElements.png',
				'toggleMode': false,
				'label': 'ADD_WIX_STORES_ELEMENTS_TITLE',
				'command': 'WEditorCommands.ShowEcommerceGalleriesPanel',
				commandParameter: {}
			}
		]
	}
});

define.experiment.newDataItem('ECOMMERCE_GALLERIES_SUB_PANELS.WixStoresLaunch', function (experimentStrategy) {
	return {
		type: 'PropertyList',
		items: [
			{
				'type': 'Button',
				'iconSrc': 'buttons/Page-mini.png',
				'toggleMode': false,
				'label': 'ADD_WIX_STORES_GALLERY_PAGE',
				'command': 'WEditorCommands.AddMultiInstanceSection',
				commandParameter: {
					"widgetId": "1380bba0-253e-a800-a235-88821cf3f8a4",
					"appDefinitionId": "1380b703-ce81-ff05-f115-39571d94dfcd"
				}
			},
			{
				type: 'Button',
				iconSrc: 'buttons/add_gallery_01.png',
				toggleMode: false,
				label: 'ADD_WIX_STORES_GRID_GALLERY',
				command: 'WEditorCommands.AddApp',
				commandParameter: {
					"type": "tpaWidget",
					"widgetId": "13afb094-84f9-739f-44fd-78d036adb028",
					"appDefinitionDataObj": {
						"appDefinitionId": "1380b703-ce81-ff05-f115-39571d94dfcd",
						"isTPAExtension": true
					}
				}
			},
			{
				'type': 'Button',
				'iconSrc': 'buttons/add_gallery_03.png',
				'toggleMode': false,
				'label': 'ADD_WIX_STORES_SLIDER_GALLERY',
				'command': 'WEditorCommands.AddApp',
				commandParameter: {
					"type": "tpaWidget",
					"widgetId": "139a41fd-0b1d-975f-6f67-e8cbdf8ccc82",
					"appDefinitionDataObj": {
						"appDefinitionId": "1380b703-ce81-ff05-f115-39571d94dfcd",
						"isTPAExtension": true
					}
				}
			},
			{
				'type': 'Button',
				'iconSrc': 'buttons/bag-icon.png',
				'toggleMode': false,
				'label': 'ADD_WIX_STORES_SHOPPING_CART',
				'command': 'WEditorCommands.AddApp',
				commandParameter: {
					"type": "tpaWidget",
					"widgetId": "1380bbc4-1485-9d44-4616-92e36b1ead6b",
					"appDefinitionDataObj": {
						"appDefinitionId": "1380b703-ce81-ff05-f115-39571d94dfcd",
						"isTPAExtension": true
					}
				}
			}
		]
	}
});

define.experiment.dataItem('HELP_IDS.WixStoresLaunch',  function (experimentStrategy) {
	/**@type bootstrap.managers.experiments.ExperimentStrategy*/
	var strategy = experimentStrategy;

	return strategy.customizeField(function(helpIds) {
		helpIds.items['WIX_STORE_APP_Help_Icon']   = '/wixstores/help-categories';
		return helpIds ;
	}) ;
});