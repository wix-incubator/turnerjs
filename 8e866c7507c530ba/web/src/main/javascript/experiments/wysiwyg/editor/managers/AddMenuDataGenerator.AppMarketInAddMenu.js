define.experiment.Class('wysiwyg.editor.managers.AddMenuDataGenerator.AppMarketInAddMenu', function(classDefinition, experimentStrategy) {
    /**type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods({
        _getCategoryCommand: experimentStrategy.around(function(originalFunc, category) {
            switch(category) {
                case 'appMarketLink':
                    return 'WEditorCommands.Market';
            }

            return originalFunc();
        }),

        _getCategoryCommandParameter: experimentStrategy.around(function(originalFunc, category, data) {
            switch(category) {
                case 'appMarketLink':
                    return {
                        category: category,
                        origin: 'add-panel-main'
                    };
            }

            return originalFunc();
        })
    });
});
