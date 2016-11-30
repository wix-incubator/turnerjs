define.experiment.Class('wysiwyg.editor.managers.AddMenuDataGenerator.WixStoresLaunch', function(classDefinition, experimentStrategy) {
    var def = classDefinition;
	var strategy = experimentStrategy;

	def.methods({

		_getCategoryCommand: function (category) {
			switch (category) {
				case 'listBuilder':
					return 'WAppsEditor2Commands.CreateAppFromTemplate';
				case 'blog':
					return 'WEditorCommands.AddWixApp';
				//change the existing ecom command
				case 'ecom':
					return "WEditorCommands.AddApp";
				case 'Anchor':
					return 'WEditorCommands.AddComponent';
			}
			return 'WEditorCommands.ShowComponentCategory';
		},

		_getCategoryCommandParameter: function (category, data) {
			switch (category) {
				case 'listBuilder':
					return {
						type: "list"
					};
				case 'Anchor':
					return data.preset;
				case 'blog':
					return {
						category: "blog",
						showCategory: "blog",
						widgetId: "31c0cede-09db-4ec7-b760-d375d62101e6",
						items: data.items,
						labels: {
							active: "ADD_COMP_TITLE_blog",
							notActive: "BLOG_PANEL_SECTIONS"
						},
						appPackageName: "blog"
					};
				//add the ecom params to the command
				case 'ecom':
					return {
						type: "tpaSection",
						appDefinitionDataObj: {
							appDefinitionId: "1380b703-ce81-ff05-f115-39571d94dfcd"
						}
					};
			}
			return { category: category};
		}
	});
});
