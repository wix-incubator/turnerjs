/** @class wysiwyg.editor.components.quickactions.AddComponentActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.HelpCenterActionsProvider.QuickActions', function (classDefinition, strategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.quickactions.BaseExternalActionsProvider');

    //def.binds(['_createActions']);

    def.resources(['scriptLoader', 'W.Config']);

    def.utilize([
        'wysiwyg.editor.components.quickactions.QuickAction'
    ]);


    def.fields({
        _actions: []
    });

    def.methods({
        initialize: function () {
            this.parent();
        },

        doExternalSearch: function(query) {
            var self = this;
            var q = Q.defer();
            var context = {
                onLoad: function(data) {
                    var videosData = _.map(data.videos, function (value, key) {
                        return self._convertToVideoExternalDataModel(value, key);
                    });
                    var faqData = _.map(data.faqs, function (value, key) {
                        return self._convertToFaqExternalDataModel(value, key);
                    });
                    q.resolve(videosData.concat(faqData));
                },
                onFailed: function() {
                    // TODO: raise BI that search failed.
                    q.resolve([]);
                }
            };
            var helpServer = this.resources.W.Config.getHelpServerUrl();
            var resource = {url: helpServer + '/search_export/' + query};
            this.resources.scriptLoader.getWithJSONP(resource, context, 'callback');

            return q.promise;
        },

        _convertToVideoExternalDataModel: function(url, title) {
            var urlRegex = new RegExp('/node/\\d+');
            var helpId = _.first(urlRegex.exec(url));
            return {
                id: url,
                name: title,
                category: 'HELP',
                command: 'WEditorCommands.ShowHelpDialog',
                commandParameter: {helpId: helpId}
            };
        },

        _convertToFaqExternalDataModel: function(url, title) {
            return {
                id: url,
                name: title,
                category: 'HELP',
                command: 'WEditorCommands.ShowHelpDialog',
                commandParameter: {helpId: url}
            };
        }
    });

});