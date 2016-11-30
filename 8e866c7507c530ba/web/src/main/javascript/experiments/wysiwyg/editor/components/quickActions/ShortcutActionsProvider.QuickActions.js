/** @class wysiwyg.editor.components.quickactions.ShortcutActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.ShortcutActionsProvider.QuickActions', function (classDefinition, strategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.quickactions.BaseLocalActionsProvider');

    def.binds(['_createActions']);

    def.resources(['W.Data', 'W.Resources']);

    def.utilize([
        'wysiwyg.editor.components.quickactions.QuickAction'
    ]);


    def.fields({
        _actions: []
    });

    def.methods({
        initialize: function () {
            this.parent();
            this._createActions().then(this._registerProvider);
        },

        getActions: function (query, excludePermanent) {
            var actions = excludePermanent ? _.filter(this._actions, {isPermanent: false}) : this._actions;
            var updatedActions = _.map(actions, function(action) {
                if (action.updateWithQuery) {
                    action.updateCommandParameters(query);
                }
                return action;
            });
            return Q(updatedActions);
        },

        _createActions: function () {
            var self = this;
            return this.resources.W.Resources.waitForBundleReady('EDITOR_LANGUAGE')
                .then(function() {
                    var q = Q.defer();
                    self.resources.W.Data.getDataByQuery('#QUICK_ACTIONS_SHORTCUTS', function (quickActions) {
                        var items = quickActions.get('items');
                        var category = 'SHORTCUTS';
                        var ratingFactor = 1; //TODO: get from data
                        var actions = _.map(items, function (item) {
                            var title = self.resources.W.Resources.get('EDITOR_LANGUAGE', item.title);
                            var actionLabel = item.action || self.resources.W.Resources.get('EDITOR_LANGUAGE', 'QUICK_ACTIONS_OPEN_ACTION');
                            return new self.imports.QuickAction(
                                item.title,
                                title,
                                item.category || category,
                                actionLabel,
                                item.icon,
                                item.extraSearchWords,
                                item.command,
                                item.commandParameter,
                                ratingFactor,
                                item.isPermanent,
                                item.updateWithQuery,
                                item.queryParameterName
                            );
                        });

                        self._actions = actions;
                        q.resolve();
                    });
                    return q.promise;
                });
        }
    });

});