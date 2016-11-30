/** @class wysiwyg.editor.managers.AddMenuDataGenerator */
define.experiment.Class('wysiwyg.editor.managers.AddMenuDataGenerator.BlinkyFormContainerEditor', function(def, strategy) {

    def.methods({
        _getCategoryCommand: function(category) {
            switch(category) {
                case 'listBuilder':
                    return 'WAppsEditor2Commands.CreateAppFromTemplate';
                case 'blog':
                    return 'WEditorCommands.AddWixApp';
                case 'Anchor':
                    return 'WEditorCommands.AddComponent';
            }
            return 'WEditorCommands.ShowComponentCategory';
        },

        _getCategoryCommandParameter: function(category, data) {
            switch(category) {
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
            }
            return { category: category};
        },

        _getComponentCommand: strategy.around(function (originalFn, data) {
            var compType = data.preset.compType || data.preset.type;

            switch (compType) {
                case 'ListBuilder':
                    return 'WAppsEditor2Commands.CreateAppFromTemplate';
                case 'FormBuilder':
                    return 'WAppsEditor2Commands.CreateFormBuilder';
                default:
                    return originalFn(data);
            }
        })
    });
});
