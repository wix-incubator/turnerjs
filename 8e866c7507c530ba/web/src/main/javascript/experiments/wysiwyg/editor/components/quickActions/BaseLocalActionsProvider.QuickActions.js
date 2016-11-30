/** @class wysiwyg.editor.components.quickactions.BaseLocalActionsProvider */
define.experiment.newClass('wysiwyg.editor.components.quickactions.BaseLocalActionsProvider.QuickActions', function (classDefinition, strategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.quickactions.BaseActionsProvider');

    def.methods({
        initialize: function () {
            this.parent();
        },

        getActions: function (query, excludePermanent) {
            throw new Error('Not Implemented in base class');
        },

        _getWordMapping: function() {
            var q = Q.defer();

            this.resources.W.Data.getDataByQuery('#QUICK_ACTIONS_EXTRA_SEARCH_WORDS', function (data) {
                q.resolve(data.get('items'));
            }.bind(this));

            return q.promise;
        },

        _getRatings: function() {
            var q = Q.defer();

            this.resources.W.Data.getDataByQuery('#QUICK_ACTIONS_RATING', function (data) {
                q.resolve(data.get('items'));
            }.bind(this));

            return q.promise;
        },

        _searchSplitWord: function (word) {
            return this.searchPromise(word, false)
                .then(function (splitResults) {
                    _.each(splitResults, function (splitResult) {
                        splitResult.rating++;
                    });

                    return Q(splitResults);
                });
        },

        /** @override */
        searchPromise: function (query, excludePermanent) {
            var self = this;
            var results = this.getActions(query.trim(), excludePermanent)
                .then(function (actions) {
                    var results = _.reduce(actions, function (results, action) {
                        var rating = action.getRating(query);
                        if (rating !== null) {
                            results.push({value: action, rating: rating});
                        }
                        return results;
                    }, []);

                    return Q(results);
                })
                .then(function (finalResults) {
                    var words = _.compact(query.split(' '));
                    if (words.length <= 1) {
                        return Q(finalResults);
                    }

                    // Create promise for each word search results.
                    var splitSearch = _.map(words, function (word) {
                        return self._searchSplitWord(word);
                    });

                    // Wait for all split words complete and then add them to the final result list.
                    return Q.all(splitSearch).spread(function () {
                        _.each(arguments, function (splitResults) {
                            finalResults = finalResults.concat(splitResults);
                        });

                        // Remove duplicate results.
                        finalResults = _.unique(finalResults, function (item) {
                            return item.value.title + '.' + item.value.category.displayName;
                        });

                        finalResults = _.sortBy(finalResults, function (res) {
                            return res.value.title.length;
                        });

                        return Q(finalResults);
                    });
                });

            return Q.all(results).spread(function () {
                // All results from all providers.
                var joinAll = _.reduce(arguments, function (result, searchResult) {
                    return result.concat(searchResult);
                }, []);

                return Q(joinAll);
            });
        }
    });

});