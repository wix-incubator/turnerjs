/**
 * created by Omri
 * Date: 12/2/11
 * Time: 11:41 AM
 */
/**@class wysiwyg.editor.components.traits.BindValueToData*/
define.Class('wysiwyg.editor.components.traits.BindValueToData', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.binds([
        '_updateDataFieldFromInput',
        '_updateDataObjectFromInput',
        '_updateDataFilteredFieldFromInput',
        '_updateDataFromInputRemappedFields'
    ]);

    def.resources(['W.Classes', 'W.Utils', 'W.UndoRedoManager']);

    def.methods({

        initialize:function () {
            this._isPreset = true;
            this._dataChangedHandler = this._trivialMethod;
            this._inputChangedHandler = this._trivialMethod;
            // set trivial hooks
            this.bindHooks();
        },

        /**
         * <b>Should be overridden</b> by classes that implement BindValueToData
         * @param value
         * @param isPreset
         */
        setValue:function (value, isPreset) {
            this._value = value;
            this.fireEvent('inputChanged', {value:value});
        },

        /**
         * Returns the value of the input field.
         * <b>Should be overridden</b> by classes that implement BindValueToData
         */
        getValue:function () {
            return this._value;
        },

        /**
         * Binds the input to a data field (key) of a data item
         * @param {DataItemBase} dataItem a data item to bind to
         * @param {String} dataFieldName key name in the data item to bind to
         */
        bindToDataItemField:function (dataItem, dataFieldName) {
            this._removeDataListeners();
            this.setDataItem(dataItem);
            this.bindToField(dataFieldName);
        },


        /**
         * binds the input value fields in <i>fieldMapOrArray</i> to the respective data fields
         * Example:
         * @param {DataItemBase} dataItem a data item to bind to
         * @param {Array/Object} fieldMapOrArray
         */
        bindToDataItemsFilteredFields:function (dataItem, fieldMapOrArray) {
            this._removeDataListeners();
            this.setDataItem(dataItem);
            this._dataFieldsFilter = this.getFilterArray(fieldMapOrArray);
            this.bindToFilteredFields(fieldMapOrArray);
        },

        /**
         *
         * @param filedMapOrArray
         */
        bindToFilteredFields:function (filedMapOrArray) {
            this._removeDataListeners();
            var DataItemBase = this.resources.W.Classes.get('core.managers.data.DataItemBase');
            this._dataFieldsFilter = DataItemBase.getFieldsFilterArray(filedMapOrArray);
            this._addListeners(this._updateInputFromDataFilteredFields, this._updateDataFilteredFieldFromInput);
            this._dataChangedHandler();
        },


        /**
         *
         * @param {DataItemBase} dataItem
         * @param {Object} dataToValueKeysMapping a map where the key is the field name in the data item, and the value is its counterpart in the value
         */
        bindToDataItemsRemappedFields:function (dataItem, dataToValueKeysMapping) {
            this._removeDataListeners();
            this.setDataItem(dataItem);
            this.bindRemappedFields(dataToValueKeysMapping);
        },

        /**
         *
         * @param {Object} dataToValueKeysMapping a map where the key is the field name in the data item, and the value is its counterpart in the value
         */
        bindRemappedFields:function (dataToValueKeysMapping) {
            this._removeDataListeners();
            this._fieldsRemapping = dataToValueKeysMapping;
            this._addListeners(this._updateInputFromDataRemappedFields, this._updateDataFromInputRemappedFields);
            this._dataChangedHandler();
        },

        _getRemappedData:function (rawData, keyMapping, reverseDirection) {
            var result = {};
            rawData = rawData || {};
            Object.forEach(keyMapping, function (keyInData, keyInValue) {
                if (reverseDirection) {
                    result[keyInValue] = rawData[keyInData];
                } else {
                    result[keyInData] = rawData[keyInValue];
                }
            });

            return result;
        },


        /**
         * Binds the input to a data item (as a hole data unit with no regard to a specific field)
         * @param dataItem dataItem {DataItemBase} a data item to bind to
         */
        bindToDataItem:function (dataItem) {
            this._removeDataListeners();
            this.setDataItem(dataItem);
            this._addListeners(this._updateInputFromDataObject, this._updateDataObjectFromInput);
            this._dataChangedHandler();
        },

        /**
         * Binds the input to a data field (key) of the current data item
         * @param dataFieldName key name in the data item to bind to
         */
        bindToField:function (dataFieldName) {
            if (this._data) {
                this._removeDataListeners();
                this._dataFieldName = dataFieldName;
                this._addListeners(this._updateInputFromDataField, this._updateDataFieldFromInput);
                var eventInfo = {'data': {
                    'dataItem': this._data,
                    'field': dataFieldName
                }};
                this._dataChangedHandler(eventInfo);
            } else {
                LOG.reportError(wixErrors.INVALID_INPUT_BIND, this.className, 'bindToField', 'data not set', dataFieldName);
            }
        },

        /**
         * Sets the hooks (input/data manipulation functions) for the binding and sets a value from the data
         * <b>NOTE: inputToDataHook and dataToInputHook must be inversed</b>
         * so that <code>x = inputToDataHook(dataToInputHook(x)) = dataToInputHook(inputToDataHook(x))</code>
         * otherwise setting in any direction may cause an infinite update loop
         * @param {Function} inputToDataHook optional - input to data manipulation hook. the input value is passed as an argument, the return value is set to the data field
         * @param {Function} dataToInputHook optional - input to data manipulation hook. the data field value is passed as an argument, the return value is set to the input
         */
        bindHooks:function (inputToDataHook, dataToInputHook) {
            this._inputToDataHook = typeof inputToDataHook == 'function' ? inputToDataHook : this._trivialHook;
            this._dataToInputHook = typeof dataToInputHook == 'function' ? dataToInputHook : this._trivialHook;
            this._dataChangedHandler();
        },

        /**
         * setDataItem override which also sets _isPreset to the value of dataItem.getMeta('isPreset')
         * @param dataItem {DataItemBase}
         */
        setDataItem:function (dataItem) {
            this._removeDataListeners();
            this.parent(dataItem);
            this._data = dataItem;
            this._isPreset = dataItem && !!dataItem.getMeta('isPreset');
        },

        /**
         * removes event listeners from the current data item, if one is defined
         */
        _removeDataListeners:function () {
            if (this._data) {
                this._data.offByListener(this);
            }
            this.removeEvents('inputChanged');

            this._dataChangedHandler = this._trivialMethod;
            this._inputChangedHandler = this._trivialMethod;
        },

        /**
         * adds event handlers to the data item and input
         * @param {Function} dataChangedHandler
         * @param {Function} inputChangedHandler
         */
        _addListeners:function (dataChangedHandler, inputChangedHandler) {
            this._dataChangedHandler = dataChangedHandler;
            this._inputChangedHandler = inputChangedHandler;
            if (this._data) {
                this._data.on(Constants.DataEvents.DATA_CHANGED, this, dataChangedHandler);
            }
            this.addEvent('inputChanged', inputChangedHandler);
        },

        /**
         * adds event listeners for data item binding (with no data field)
         */
        _addFilteredFieldsChangeListeners:function () {
            this._data.on(Constants.DataEvents.DATA_CHANGED, this, this._updateInputFromDataFilteredFields);
            this.addEvent('inputChanged', this._updateDataFilteredFieldFromInput);
        },

        /**
         * a trivial default hook that doesn't do any manipulation
         * @param data
         */
        _trivialHook:function (data) {
            return data;
        },

        _trivialMethod:function () {
        },

        /**
         * sets the data field value to the current input value
         */
        _updateDataFieldFromInput:function (e) {
            var newValue = this._inputToDataHook(this.getValue());
            var oldValue = this._data.get(this._dataFieldName);
            if (newValue !== oldValue) {

                var dataChangeSupportedByURM = this.injects().UndoRedoManager.checkIfDataChangeSupportedByURM(e);
                if (dataChangeSupportedByURM) {
                    this.injects().UndoRedoManager.startTransaction();
                }

                this._isPreset = false;
                this._data.set(this._dataFieldName, newValue, false, this);
            }
        },

        _hasInterestInDataChangeOnChange: function(eventInfo){
            var data = (eventInfo && eventInfo.data) || {};
            var dataItem = data.dataItem;
            var field = data.field;
            var value = data.newValue;
            return this._hasInterestInDataChange(dataItem, field, value);
        },

        _hasInterestInDataChange:function (dataItem, field, value) {
            var _isFieldIncludedInDataChange = this._isFieldIncludedInDataChange;
            if (this._dataFieldName) {
                return _isFieldIncludedInDataChange(dataItem, field, value, this._dataFieldName);
            }
            if (this._fieldsRemapping) {
                // return true if any of the remapped field names is included in the data change
                return Object.some(this._fieldsRemapping, function (valueName, dataName) {
                    return _isFieldIncludedInDataChange(dataItem, field, value, dataName);
                });
            }
            if (this._dataFieldsFilter) {
                // return true if any of the filtered fields names is included in the data change
                return this._dataFieldsFilter.some(function (dataName) {
                    return _isFieldIncludedInDataChange(dataItem, field, value, dataName);
                });
            }
            // express interest if no other condition was identified
            return true;
        },

        _isFieldIncludedInDataChange:function (dataItem, field, value, fieldNameToCheck) {
            return !field ||
                (typeof field == 'string' && field == fieldNameToCheck) ||
                (typeof field == 'object' && fieldNameToCheck in field);
        },


        /**
         * sets the input value to the value of the current data item field value
         */
        _updateInputFromDataField:function (eventInfo) {
            if (this._hasInterestInDataChangeOnChange(eventInfo)) {
                var newValue = this._dataToInputHook(this._data.get(this._dataFieldName));
                var oldValue = this.getValue();
                if (newValue !== oldValue) {
                    this.setValue(newValue, this._isPreset);
                }
            }
        },

        /**
         * sets the input value to the value of the current data item  (for hole data items)
         */
        _updateInputFromDataObject:function () {
            if (this._data) {
                var newValue = this._dataToInputHook(this._data.getData());
                var oldValue = this.getValue();
                if (!this.resources.W.Utils.isEquivalent(oldValue, newValue)) {
                    this.setValue(newValue, this._isPreset);
                }
            }
        },

        /**
         * sets the data item value to the current input value (for hole data items)
         */
        _updateDataObjectFromInput:function () {
            this._isPreset = false;
            var newData = this._inputToDataHook(this.getValue());
            var oldData = this.getDataItem().getData();
            if (!this.resources.W.Utils.isEquivalent(oldData, newData)) {
                this.getDataItem().setData(newData);
            }
        },


        /**
         * sets the data field value to the current input value
         */
        _updateDataFilteredFieldFromInput:function (e) {
            var newValue = this._inputToDataHook(this.getFilteredMap(this.getValue(), this._dataFieldsFilter));
            var oldValue = this._data.getFields(this._dataFieldsFilter);

            if (this.hasNonEqualFields(this._dataFieldsFilter, oldValue, newValue)) {

                var dataChangeSupportedByURM = this.injects().UndoRedoManager.checkIfDataChangeSupportedByURM(e);
                if (dataChangeSupportedByURM) {
                    this.injects().UndoRedoManager.startTransaction();
                }

                this._data.setFields(newValue, this);

            }
        },

        /**
         * sets the input value to the value of the current data item field value
         */
        _updateInputFromDataFilteredFields:function (eventInfo) {
            if (this._hasInterestInDataChangeOnChange(eventInfo)) {
                var rawNewValue = this._data.getFields(this._dataFieldsFilter);
                var newValue = this._dataToInputHook(rawNewValue);
                var oldValue = this.getValue();
                if (this.hasNonEqualFields(this._dataFieldsFilter, oldValue, newValue)) {
                    this.setValue(newValue, this._isPreset);
                }
            }
        },


        /**
         * sets the data field value to the current input value
         */
        _updateDataFromInputRemappedFields:function () {
            var rawValue = this._inputToDataHook(this.getValue());
            var newData = this._getRemappedData(rawValue, this._fieldsRemapping, true);
            var oldData = this._data.getFields(newData);
            if (!this.resources.W.Utils.isEquivalent(oldData, newData)) {
                this._isPreset = false;
                this._data.setFields(newData);
            }
        },

        /**
         * sets the input value to the value of the current data item field value
         */
        _updateInputFromDataRemappedFields:function (eventInfo) {
            if (this._data && this._hasInterestInDataChangeOnChange(eventInfo)) {
                var rawData = this._data.getFields(this._fieldsRemapping);
                var newData = this._dataToInputHook(rawData);
                var newValue = this._getRemappedData(newData, this._fieldsRemapping);
                var oldValue = this.getValue();
                if (!this.resources.W.Utils.isEquivalent(oldValue, newValue)) {
                    this.setValue(newValue, this._isPreset);
                }
            }
        },

        /**
         * template method: last chance to prevent data triggered rendering
         * if the method returns true, data change event will not cause rendering
         * @param dataItem
         * @param field
         * @param value
         */
        _preventRenderOnDataChange:function (dataItem, field, value) {
            return !this._hasInterestInDataChange(dataItem, field, value);
        },


        getFilteredMap:function (rawData, filter) {
            if (typeof rawData != 'object') {
                return rawData;
            }
            var filteredData = {};
            filter.forEach(function (key) {
                filteredData[key] = rawData[key];
            });
            return filteredData;
        },

        hasNonEqualFields:function (fieldsFilter, newValue, oldValue) {
            if (oldValue == undefined || newValue == undefined)
                return true;
            // handle simple data types support for cases of hook manipulations that transform multiple data fields into a simple input value
            if (typeof oldValue != 'object') {
                return oldValue !== newValue;
            }

            return fieldsFilter.some(function (key) {
                return newValue[key] !== oldValue[key];
            });
        },

        /**
         *
         * @param filterMapOrArray
         * @return {Array} array of keys or original array
         */
        getFilterArray:function (filterMapOrArray) {
            if (filterMapOrArray instanceof Array) {
                return filterMapOrArray;
            }
            var filterArray = [];
            for (var key in filterMapOrArray) {
                filterArray.push(key);
            }
            return filterArray;
        }
    });
});