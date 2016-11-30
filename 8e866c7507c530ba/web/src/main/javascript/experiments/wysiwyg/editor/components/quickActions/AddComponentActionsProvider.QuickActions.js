/** @class wysiwyg.editor.components.quickactions.AddComponentActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.AddComponentActionsProvider.QuickActions', function (classDefinition, strategy) {

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
            var bundleReady = this.resources.W.Resources.waitForBundleReady('EDITOR_LANGUAGE');
            Q.all([this._getWordMapping(), this._getRatings(), bundleReady])
                .spread(this._createActions)
                .then(this._registerProvider);
        },

        getActions: function (query, excludePermanent) {
            var actions = excludePermanent ? _.filter(this._actions, {isPermanent: false}) : this._actions;
            return Q(actions);
        },

        _createActions: function (wordMapping, ratings) {
            wordMapping = wordMapping || {};
            var q = Q.defer();

            var self = this;
            this.resources.W.Data.getDataByQuery('#COMPONENT_CATEGORIES', function (components) {

                // Filter out all buttons that are not categories.
                var categories = _.filter(components.get('items'), function(category) {
                    return category.get('command') !== "WEditorCommands.AddWixApp";
                });

                var actions = _.reduce(categories, function (acc, category) {
                    var categoryRaw = category.getData();

                    var items = categoryRaw.items || [category];
                    var actions = _.map(items, function(item) {
                        return self._convertToQuickActionItem(item, categoryRaw, wordMapping, ratings);
                    });

                    return acc.concat(actions);
                }, []);

                self._actions = actions;
                q.resolve(actions);
            });

            return q.promise;
        },

        _convertToQuickActionItem: function (item, section, wordMapping, ratings) {
            var item = item.getData();
            var labelText = this.resources.W.Resources.get('EDITOR_LANGUAGE', item.label, item.label);
            var sectionLabelText = this.resources.W.Resources.get('EDITOR_LANGUAGE', section.label, section.label);
            var category = 'ADD';
            var actionLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'QUICK_ACTIONS_ADD_ACTION');
            var extraSearchWords = wordMapping[item.name] || [];

            // Add section name to the extra search words.
            extraSearchWords.push(sectionLabelText);
            var sectionMapping = wordMapping[section.name] || wordMapping[sectionLabelText] || [];
            extraSearchWords = extraSearchWords.concat(sectionMapping);

            return new this.imports.QuickAction(
                item.name,
                labelText,
                category,
                actionLabel,
                item.iconSrc,
                extraSearchWords,
                item.command,
                item.commandParameter,
                ratings[item.name] || 1);
        }
    });
});