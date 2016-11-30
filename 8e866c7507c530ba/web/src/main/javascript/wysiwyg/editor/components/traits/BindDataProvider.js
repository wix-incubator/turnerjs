/** @class wysiwyg.editor.components.traits.BindDataProvider */

define.Class('wysiwyg.editor.components.traits.BindDataProvider', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        initialize: function() {
        },

        bindToDataProvider: function(dataProvider) {
            if (this._dataProvider) {
                this._dataProvider.offByListener(this);
            }
            this._dataProvider = dataProvider;
            this._dataProvider.on(Constants.DataEvents.DATA_CHANGED, this, this._dataProviderUpdated);
            this._dataProviderUpdated();
        },

        getDataProvider: function() {
            return this._dataProvider;
        },

        getDataProviderItems: function() {
            return this._dataProvider.get('items');
        },

        getDataProviderItem: function(key) {
            return this._dataProvider.get('items')[key];
        },

        /**
         * Called when data provider object was changed.
         */
        _dataProviderUpdated: function() {
            this._isDataProviderValid(function(valid){
                if(!valid){
                    LOG.reportError(wixErrors.INVALID_INPUT_BIND, this.className, '_dataProviderUpdated', this._dataProvider)();
                    return;
                }else{
                    this._renderIfReady();
                    this.fireEvent(Constants.BindDataProvider.DATA_PROVIDER_CHANGED);
                }
            }.bind(this));
        },

        /**
         * checks if the provided data is valid. check the followings:
         * a. it has an 'items' array
         * b. all items are dictionaries
         * c. all items in 'items' have the exact fields (including field names)
         */
        _isDataProviderValid: function(cb) {
            var items = this.getDataProviderItems();

            // check that it has an 'items' array
            if (!(typeOf(items) == 'array')) {
                return cb(false);
            }

            //check that all items are dictionaries
            for (var i=0;i<items.length; i++) {
                if (!(typeof items[i] == 'object' || typeof items[i] == 'string') ) {
                     return cb(false);
                }
            }

            // check that all items in 'items' have the exact fields:
            // for each item, sort its keys, and check whether the resulted array is equivalent to the first item
            if (items.length) {
                if (items[0] === Constants.SelectionListInput.BREAK_LINE) {
                    return cb(false);
                }
                if(typeof items[0] == 'object'){
                    var expectedFields = Object.keys(items[0]).sort();
                    for (i=1; i<items.length; i++) {
                        if (items[i] === Constants.SelectionListInput.BREAK_LINE) {
                            continue;
                        }
                        var curFields = Object.keys(items[i]).sort();
                        if (curFields.length != expectedFields.length) {
                            return cb(false);
                        }
                        for (var j= 0; j<curFields.length; j++) {
                            if (curFields[j] != expectedFields[j]) {
                                return cb(false);
                            }
                        }
                    }
                    return cb(true);

                }else if(typeof items[0] == 'string'){
                    var expected;
                    var expectedType;
                    var validated = 1;
                    //validate that first element is a data ref element
                    if(items[0].indexOf("#") != 0){
                        return cb(false);
                    }
                    //get first data element for further comparisons

                    if(items.length == 1) {
                        return cb(true);
                    }

                    var dataManager = this._dataProvider.getDataManager();
                    dataManager.getDataByQuery(items[0], function(dataItem){
                            expected = dataItem;
                            expectedType = dataItem.getType();

                            //get the rest of the data elements
                            for(i=1; i<items.length; i++){
                                //validate that element is a data ref element
                                if(items[i].indexOf("#") != 0){
                                    return cb(false);
                                }
                                //validate that all of the data element exist and are of the same type
                                dataManager.getDataByQuery(items[i], function(dataItem){
                                    if(!dataItem || dataItem.getType() != expectedType){
                                        cb(false);
                                    }
                                    validated++;
                                    //if all items were validated call CB with true
                                    if(validated == items.length){
                                        cb(true);
                                    }
                                }.bind(this));
                            }
                        }.bind(this));
                }

            }else{
                cb(true);
            }
        }
    });
});