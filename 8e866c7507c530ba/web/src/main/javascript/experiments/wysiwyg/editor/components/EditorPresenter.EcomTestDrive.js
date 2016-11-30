define.experiment.component("wysiwyg.editor.components.EditorPresenter.EcomTestDrive", function(classDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function () {
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenEcomMigrationDialog", this, this.openEcomMigrationDialog);
        }),

        openEcomMigrationDialog: function(args) {
            if(_.contains(_.pluck(editorModel.permissionsInfo.loggedInUserRoles, 'role'), 'owner')){
                var rootNode = this.$view;

                var popupCompName, popupSkinName;

                popupCompName = 'ecommerce.integration.components.editor.EcomMigrationDialog';
                popupSkinName = 'ecommerce.skins.editor.dialogs.EcomMigrationDialogSkin';

                var viewNode = new Element("div");
                var compBuilder = new this.imports.ComponentBuilder(viewNode);
                compBuilder.
                withType(popupCompName).
                withSkin(popupSkinName).
                withArgs(args).
                onWixified(function(childCompLogic) {
                    childCompLogic._view.insertInto(rootNode);
                }).
                create();
            }
        }
    });
});
