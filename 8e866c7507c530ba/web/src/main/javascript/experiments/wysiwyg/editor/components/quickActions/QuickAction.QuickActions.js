/** @class wysiwyg.editor.components.quickactions.QuickAction */
define.experiment.newClass('wysiwyg.editor.components.quickactions.QuickAction.QuickActions', function (classDefinition, strategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Data']);

    def.statics({
        Ratings: {
            RATING_MAX: 1,
            RATING_AVERAGE: 5,
            RATING_LOW: 10
        }
    });

	def.fields({
        id: null,
        title: null,
        category: '',
        action: null,
        iconSrc: '',
        _extraSearchWords: [],
        _ratingFactor: 1,
        isPermanent: false,
        updateWithQuery: false,
        queryParameterName: null
    });

	def.methods({
        initialize: function (id, title, category, action, iconSrc, extraSearchWords, command, commandParameter, ratingFactor, isPermanent, updateWithQuery, queryParameterName) {
            this.id = id;
            this.title = title;
            this.category = category;
            this.action = action || '';
            this.iconSrc = iconSrc || '';
            this._setExtraSearchWords(title, extraSearchWords);
            this.command = command || '';
            this.commandParameter = commandParameter;
            this._ratingFactor = ratingFactor ? 1 / ratingFactor : 1;
            this.isPermanent = isPermanent || false;
            this.updateWithQuery = updateWithQuery || false;
            this.queryParameterName = queryParameterName || null;
        },

        _getExtraSearchWordsForOriginalWord: function(word) {
            word = word.toLowerCase();
            var extraSearchItems = null;
            this.resources.W.Data.getDataByQuery('#QUICK_ACTIONS_EXTRA_SEARCH_WORDS', function (info) {
                extraSearchItems = info.get('items');
            });

            var result = [];

            if (_.has(extraSearchItems, word)) {
                result = extraSearchItems[word];
            }

            return result;
        },

        _setExtraSearchWords: function (title, extraSearchWords) {
            this._extraSearchWords = this._getExtraSearchWordsForOriginalWord(title);
            if (this.title.contains(' ')) {
                _.each(title.split(' '), function (word) {
                    var extraSearchWords = this._getExtraSearchWordsForOriginalWord(word);
                    if (extraSearchWords.length) {
                        this._extraSearchWords = this._extraSearchWords.concat(extraSearchWords);
                    }
                }.bind(this));
            }

            _.each(extraSearchWords, function (word) {
                this._extraSearchWords.push(word);
                var extraSearchWords = this._getExtraSearchWordsForOriginalWord(word);
                this._extraSearchWords = this._extraSearchWords.concat(extraSearchWords);
            }.bind(this));

            this._extraSearchWords = _.unique(_.map(this._extraSearchWords, function (w) { return w.toLowerCase(); }));
        },

        getRating: function (query) {
            if (this.isPermanent) {
                return this.Ratings.RATING_MAX * this._ratingFactor;
            }

            // escape regexp characters
            query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            var startsWithRegex = new RegExp('^' + query, 'i');
            if (startsWithRegex.test(this.title)) {
                return this.Ratings.RATING_MAX * this._ratingFactor;
            }

            var containsRegex = new RegExp(query, 'i');
            if (containsRegex.test(this.title)) {
                return this.Ratings.RATING_AVERAGE * this._ratingFactor;
            }

            var found = _.any(this._extraSearchWords, function (word) {
                return containsRegex.test(word);
            });

            if (found) {
                return this.Ratings.RATING_LOW * this._ratingFactor;
            }

            return null;
        },

        updateCommandParameters: function (query) {
            if (this.updateWithQuery) {
                if (this.queryParameterName) {
                    this.commandParameter[this.queryParameterName] = query;
                }
                else {
                    this.commandParameter = query;
                }
            }
        },

        toObject: function() {
            return {
                id: this.id,
                title: this.title,
                action: this.action,
                icon: this.iconSrc,
                command: this.command,
                commandParameter: this.commandParameter,
                category: this.category
            };
        }
    });
});