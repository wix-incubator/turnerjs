/** @class wysiwyg.editor.components.quickactions.WixAppsActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.WixAppsActionsProvider.QuickActions', function (classDefinition, strategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.quickactions.BaseLocalActionsProvider');

    def.resources(['W.Data', 'W.Resources', 'W.Preview']);

    def.utilize([
        'wysiwyg.editor.components.quickactions.QuickAction'
    ]);

    def.binds(['_createActions']);

    def.fields({
        /* {
         action: {QuickAction},
         condition: {function}
         }
         */
        _actions: [],
        _appsManager: null
    });

	def.methods({
        initialize: function () {
            this.parent();
            var bundleReady = this.resources.W.Resources.waitForBundleReady('EDITOR_LANGUAGE');
            Q.all([this._getWordMapping(), this._getRatings(), bundleReady, this._setAppsManager()])
                .spread(this._createActions)
                .then(this._registerProvider);
        },

        getActions: function(query, excludePermanent) {
            var actions = _(this._actions)
                .filter(function(action) { return action.condition(); })
                .map('action')
                .value();

            return Q(actions);
        },

        _setAppsManager: function() {
            var q = Q.defer();

            this.resources.W.Preview.getPreviewManagersAsync(function(managers) {
                this._appsManager = managers.Apps;
                q.resolve(this._appsManager);
            }.bind(this));

            return q.promise;
        },

        _convertToQuickActionItem: function (item, section, wordMapping, ratings, onActiveInstance) {
            var item = item.getData();
            var category = 'ADD';
            var actionLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'QUICK_ACTIONS_ADD_ACTION');
            var extraSearchWords = wordMapping[item.name] || [];

            // Add section name to the extra search words.
            extraSearchWords.push(section.labelText);
            var sectionMapping = wordMapping[section.name] || wordMapping[section.labelText] || [];
            extraSearchWords = extraSearchWords.concat(sectionMapping);

            var action = new this.imports.QuickAction(
                item.name,
                item.labelText,
                category,
                actionLabel,
                item.iconSrc,
                extraSearchWords,
                item.command,
                item.commandParameter,
                ratings[item.name] || 1);

            var self = this;
            return {
                action: action,
                condition: function() {
                    var appInstance = self._appsManager.getAppByPackageName(section.commandParameter.appPackageName);
                    if(!appInstance && !onActiveInstance) {
                        return true;
                    }
                    return appInstance && (!!appInstance.getApplicationActiveState() === onActiveInstance);
                }
            };
        },

        _createActions: function (wordMapping, ratings) {
            wordMapping = wordMapping || {};
            var q = Q.defer();

            var self = this;
            this.resources.W.Data.getDataByQuery('#COMPONENT_CATEGORIES', function (components) {

                // Filter out all buttons that are not categories.
                var categories = _.filter(components.get('items'), function(category) {
                    return category.get('command') === "WEditorCommands.AddWixApp";
                });

                var actions = _.reduce(categories, function (acc, category) {
                    var categoryRaw = category.getData();

                    var quickAction = self._convertToQuickActionItem(category, categoryRaw, wordMapping, ratings, false);
                    acc.push(quickAction);

                    var actions = _.map(categoryRaw.items, function(item) {
                        return self._convertToQuickActionItem(item, categoryRaw, wordMapping, ratings, true);
                    });

                    return acc.concat(actions);
                }, []);

                self._actions = actions;
                q.resolve(actions);
            });

            return q.promise;
        }
    });

});