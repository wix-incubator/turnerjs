define.component('wysiwyg.editor.components.ThumbGallery', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.SelectionListInput');
    def.resources(['W.Data']);
    def.binds(['_setRelevantDataProvider', '_nextThumb', '_prevThumb']);
    def.skinParts({
        'collection': {
            'type': 'htmlElement'
        }
    });
    def.dataTypes(['list', '']);
    def.states({prev: ['noPrev'], next: ['noNext'], 'label': ['hasLabel', 'noLabel']});
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._numToShow = (args && args.numToShow) || 4;
            this._currentIndex = 0;
            this.selectItemAtIndex(this._selectItemAtIndex);
        },

        _prepareForRender: function () {
            this._setRelevantDataProvider();
            return this.parent();
        },

        _setRelevantDataProvider: function () {
            if (!this._fullDataProvider) {
                this._fullDataProvider = this._dataProvider;
            }
            if (this._fullDataProvider.get('items')) {
                var newDPitems = [];
                var dataProviderItems = this._fullDataProvider.get('items');
                for (var i = this._currentIndex; i < this._currentIndex + this._numToShow; i++) {
                    if (dataProviderItems[i]) {
                        newDPitems.push(dataProviderItems[i]);
                    } else {
                        break;
                    }
                }

                if (this._selectedIndex >= this._currentIndex && this._selectedIndex < this._currentIndex + this._numToShow) {
                    this._selectItemAtIndex = this._selectedIndex % this._numToShow;
                } else {
                    this._selectItemAtIndex = -1;
                }

                if (this._currentIndex == 0) {
                    this.setState('noPrev', 'prev');
                } else {
                    this.removeState('noPrev', 'prev');
                }
                if (this._fullDataProvider.get('items').length > this._currentIndex + this._numToShow) {
                    this.removeState('noNext', 'next');
                } else {
                    this.setState('noNext', 'next');
                }
                this._dataProvider = this.resources.W.Data.createDataItem({'items': newDPitems, type: 'list'});
            }

        },

        selectItemAtIndex: function (index) {
            this._selectItemAtIndex = index;
            this._selectedIndex = this._selectItemAtIndex;
        },

        /**
         * implements the "abstract" method of BaseInput
         * @param newValue
         */
        setValue: function (newValue) {
            if (this._value !== newValue) {
                for (var i = 0; i < this._dataProvider.getData().items.length; i++) {
                    var skinName = this._dataProvider.getData().items[i].value;
                    var selectedSkinName = newValue.value;
                    if (skinName == selectedSkinName) {
                        this.selectItemAtIndex(i + this._currentIndex);
                    }
                }
                this._value = newValue;
                this.fireEvent('inputChanged', {value: newValue});
            }
        },

        _onAllSkinPartsReady: function (skinParts) {
            // bind clicks
            skinParts.prevButton.addEvent('click', this._prevThumb.bind(this));
            skinParts.nextButton.addEvent('click', this._nextThumb.bind(this));

        },

        _nextThumb: function (e) {
            if (this._currentIndex + this._numToShow >= this._fullDataProvider.get('items').length) {
                return;
            }
            this._currentIndex += this._numToShow;
            this._prepareForRender();
        },

        _prevThumb: function (e) {
            if (this._currentIndex - this._numToShow < 0) {
                return;
            }
            this._currentIndex -= this._numToShow;
            this._prepareForRender();
        },

        selectAtIndexAndUpdate: function (index) {
            this._selectedIndex = index;
            this._prepareForRender();
        }
    });

});
