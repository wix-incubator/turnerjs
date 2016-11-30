/** @class wysiwyg.editor.components.quickactions.BaseActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.BaseActionsProvider.QuickActions', function (classDefinition, strategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Utils']);

    def.binds(['_registerProvider']);

    def.methods({
        initialize: function() {
        },

        _registerProvider: function() {
            var command = this.resources.W.Commands.getCommand('WEditorSearch.RegisterProvider');
            if(!command) {
                this.resources.W.Utils.callLater(this._registerProvider, [], this, 5);
                return;
            }
            command.execute(this);
        },

        /**
         * Search the repository for all actions for relevant query.
         * @param query The search term
         * @param excludePermanent if set to 'true' permanent actions will be excluded.
         * @return {Array} all the actions relevant to the query.
         */
        searchPromise: function(query, excludePermanent) {
            throw new Error('Not implemented');
        }
    });

});