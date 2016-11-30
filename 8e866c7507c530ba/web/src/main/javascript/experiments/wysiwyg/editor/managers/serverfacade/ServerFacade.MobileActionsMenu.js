define.experiment.Class('wysiwyg.editor.managers.serverfacade.ServerFacade.MobileActionsMenu', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _appendQuickActionsConfiguration: function (params) {
            var quickActionsConfiguration = this.resources.W.Data.getDataByQuery('#QUICK_ACTIONS');
            params.siteMetaData.quickActions.colorScheme = quickActionsConfiguration.get('colorScheme');
            params.siteMetaData.quickActions.configuration = {
                "quickActionsMenuEnabled": quickActionsConfiguration.get('quickActionsMenuEnabled'),
                "navigationMenuEnabled": quickActionsConfiguration.get('navigationMenuEnabled'),
                "phoneEnabled": quickActionsConfiguration.get('phoneEnabled'),
                "emailEnabled": quickActionsConfiguration.get('emailEnabled'),
                "addressEnabled": quickActionsConfiguration.get('addressEnabled'),
                "socialLinksEnabled": quickActionsConfiguration.get('socialLinksEnabled'),
                "mobileActionsMenuType": quickActionsConfiguration.get('mobileActionsMenuType')
            };
        }
    });
});
