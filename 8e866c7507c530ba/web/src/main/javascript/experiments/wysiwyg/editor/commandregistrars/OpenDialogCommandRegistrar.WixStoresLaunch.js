define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.WixStoresLaunch', function(classDefinition, experimentStrategy){

    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.AppStoreManager']));

    def.methods({
        registerCommands: strategy.after(function () {
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenWixStoresManager", this, this._openWixStoresManager);
        }),

        _openWixStoresManager: function (eventObj) {
            var params = {
                url: 'http://ecom.' + window.location.hostname.replace(/([a-zA-Z0-9]+.)/,"") + '/storemanager/?origin=' +eventObj.origin,
                width: '92%',
                height: '87%',
                dialogId: 'storeManager',
                appDefinitionId: eventObj.appDefinitionId
            };
            if(eventObj.state){
                params.state =  eventObj.state;
            }
            this.resources.W.AppStoreManager.provisionApp('tpaSection', eventObj.appDefinitionId, null, function(technicalData) {
                this.resources.W.Commands.executeCommand("WEditorCommands.OpenIFrameDialog", params);
            }.bind(this));
        }
    });
});