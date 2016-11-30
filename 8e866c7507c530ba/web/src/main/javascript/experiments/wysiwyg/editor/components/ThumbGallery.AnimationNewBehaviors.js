define.experiment.component('wysiwyg.editor.components.ThumbGallery.AnimationNewBehaviors', function (componentDefinition, experimentStrategy) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.binds(['_setRelevantDataProvider', '_nextThumb', '_prevThumb']);
    def.skinParts({
        'collection': {'type': 'htmlElement'},
        'buttons': {'type': 'htmlElement'},
        'prevButton': {'type': 'htmlElement'},
        'pageCount': {'type': 'htmlElement'},
        'nextButton': {'type': 'htmlElement'}
    });
    def.states({prev: ['noPrev'], next: ['noNext'], 'label': ['hasLabel', 'noLabel']});
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._numToShow = (args && args.numToShow) || 4;
            this._currentIndex = 0;
            this._paginationTotal = 1;
            this._paginationCurrent = 1;
            this.selectItemAtIndex(this._selectItemAtIndex);
        },

        updatePagination: function() {
            var items = this._fullDataProvider.get('items');
            this._paginationTotal = Math.ceil(items.length / this._numToShow);

            if (this._currentIndex === 0) {
                this.setState('noPrev', 'prev');
                this._paginationCurrent = 1;
            }
            else {
                this.removeState('noPrev', 'prev');
            }

            if (items.length > this._currentIndex + this._numToShow) {
                this.removeState('noNext', 'next');
                this._paginationCurrent = Math.ceil(this._currentIndex / this._numToShow) + 1;
            }
            else {
                this.setState('noNext', 'next');
                this._paginationCurrent = this._paginationTotal;
            }
            this._skinParts.pageCount.set('text', this._paginationCurrent + ' / ' + this._paginationTotal);

        },

        _setRelevantDataProvider: function () {
            var dataProviderItems, pageLength;
            if (!this._fullDataProvider) {
                this._fullDataProvider = this._dataProvider;
                if (this._selectedIndex < 0){
                    this._currentIndex = 0;
                } else {
                    this._currentIndex = Math.floor(this._selectedIndex / this._numToShow) * this._numToShow;
                }
            }

            dataProviderItems = this._fullDataProvider.get('items');
            if (dataProviderItems) {
                pageLength = Math.min(this._currentIndex + this._numToShow, dataProviderItems.length);
                dataProviderItems = dataProviderItems.slice(this._currentIndex, pageLength);

                if (this._selectedIndex >= this._currentIndex && this._selectedIndex < pageLength) {
                    this._selectItemAtIndex = this._selectedIndex % this._numToShow;
                } else {
                    this._selectItemAtIndex = -1;
                }

                this.updatePagination();
                this._dataProvider = this.resources.W.Data.createDataItem({'items': dataProviderItems, type: 'list'});
                this._suppressInputChangedEventOnPagination = true;
            }

        },

        _updateSelection: function(selectedItem) {
            selectedItem = selectedItem || this._selectedItem;
            if (selectedItem && selectedItem.hasState('selected') && selectedItem.hasState('up') && this._repeatersSelectable) {
                this._selectedItem = selectedItem;
                this._clearSelection();
                selectedItem.setState('selected');
            }
            if(!this._suppressInputChangedEventOnPagination){
                this.fireEvent("updateSelection");
            } else {
                this._suppressInputChangedEventOnPagination = false;
            }
        },

        _onRepeaterClick:function(event) {
            var data;
            if(event && event.data) {
                data = event.data.getData();
            }
            this._selectItem(event.target, data);
            //this._updateSelection(event.target.getLogic());
        }
    });

});
