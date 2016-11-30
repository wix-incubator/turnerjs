/** @class wysiwyg.editor.components.quickactions.BaseActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.BaseExternalActionsProvider.QuickActions', function (classDefinition, strategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.quickactions.BaseActionsProvider');

    def.resources(['W.Commands', 'W.Utils', 'W.Resources']);

    def.utilize(['wysiwyg.editor.components.quickactions.QuickAction']);

    def.methods({
        initialize: function() {
            this.parent();
            this._registerProvider();
        },

        searchPromise: function(query) {
            var self = this;

            return this.doExternalSearch(query).then(function(results) {
                var result = self._convertToQuickActionItems(results);
                return Q.resolve(result);
            });
        },

        /**
         * Search the external repository for all actions for relevant query.
         * @param query The search term
         * @param excludePermanent if set to 'true' permanent actions will be excluded.
         * @return Array of {id, name, category, command, commandParameter, icon}
         */
        doExternalSearch: function(query) {
            throw new Error('Method doExternalSearch is not implemented');
        },

        _convertToQuickActionItems: function (items) {
            var self = this;
            var actionLabel = self.resources.W.Resources.get('EDITOR_LANGUAGE', 'QUICK_ACTIONS_OPEN_ACTION');

            var result = _.map(items, function (item) {
                var quickAction = new self.imports.QuickAction(
                    item.id,
                    item.name,
                    item.category,
                    actionLabel,
                    item.icon,
                    [],
                    item.command,
                    item.commandParameter);

                return {
                    value: quickAction,
                    rating: 1
                };
            });

            return result;
        }
    });
});