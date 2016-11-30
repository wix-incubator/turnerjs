/**@class  wysiwyg.editor.components.panels.base.InputFieldProxy*/
define.Class('wysiwyg.editor.components.panels.base.InputFieldProxy', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_onFieldReady', '_onFieldWixified', '_executeOrAddToQueue']);

    /**@lends wysiwyg.editor.components.panels.base.InputFieldProxy*/
    def.methods({
        /**
         * creates an input proxy
         * @param {HTMLElement} element a component view to bind when ready
         * @param {DataItemBase} dataItem default data item to bind to
         * @param {DataItemWithSchema} propertiesDataItem default properties data item to bind to
         * @param {DataItemWithSchema} themeDataItem default theme data item to bind to
         * @constructor
         * @memberOf InputFieldProxy
         * @class InputFieldProxy
         */
        initialize: function (element, dataItem, propertiesDataItem, themeDataItem, dataProvider) {
            this._wixefyMethodsCallsQueue = [];
            this._methodCallsQueue = [];
            this._callbacks = [];
            this._dataItem = dataItem;
            this._propertiesDataItem = propertiesDataItem;
            this._themeDataItem = themeDataItem;
            this._dataProvider = dataProvider;
            this._isBound = false;
            this._isHooked = false;
            this._enableDisableUpdateOn = true;

            var view = element.getViewNode && element.getViewNode();
            if (view) {
                this._htmlElement = view;
                this._onFieldWixified();
                this._onFieldReady();
            }
            else {
                this._htmlElement = element;
                element.addEvent(Constants.ComponentEvents.WIXIFIED, this._onFieldWixified);
                element.addEvent(Constants.ComponentEvents.READY, this._onFieldReady);
            }
        },

        omitEnableDisableUpdate: function() {
            this._enableDisableUpdateOn = false;
            return this;
        },

        isEnableDisableUpdateOn: function() {
            return this._enableDisableUpdateOn;
        },

        isReady: function () {
            var logic = this._htmlElement.getLogic && this._htmlElement.getLogic();
            if (!logic) {
                return false;
            }
            return logic.isReady();
        },


        /**
         * returns true iff the correlating (base) Input is valid
         */
        isValidInput: function () {
            return this._htmlElement.getLogic().isValidInput();
        },


        /**
         *
         * @param {String} propertyName
         * @return {InputFieldProxy} self
         * @memberOf InputFieldProxy
         */
        bindToProperty: function (propertyName) {
            return this._bindToField(this._propertiesDataItem, propertyName);
        },

        /**
         *
         * @param {String} themePropertyName
         * @return {InputFieldProxy} self
         * @memberOf InputFieldProxy
         */
        bindToThemeProperty: function (themePropertyName) {
            return this._bindToField(this._themeDataItem, themePropertyName);
        },

        /**
         * ???
         * @param {Object} dataToValueFieldsMap a map where the key is the field name in the data item, and the value is its counterpart in the value
         */
        bindToRemappedThemeProperties: function (dataToValueFieldsMap) {
            return this._bindToRemappedFields(this._themeDataItem, dataToValueFieldsMap);
        },

        /**
         * ???
         * @param {Object} dataToValueFieldsMap a map where the key is the field name in the data item, and the value is its counterpart in the value
         */
        bindToRemappedDataFields: function (dataToValueFieldsMap) {
            return this._bindToRemappedFields(this._dataItem, dataToValueFieldsMap);
        },


        /**
         * ???
         */
        bindToDataItemAndFilterFromDataProvider: function (excludeList) {
            if (this._isBound) {
                // todo: add reporting
                LOG.reportError();
                throw new Error("this input is already bound");
            }
            return this._executeOrAddToQueue('bindToDataItemAndFilterFromDataProvider', [this._themeDataItem, excludeList]);
        },

        /**
         *
         * @param {Array} dataFields data field names
         */
        bindToFields: function (dataFields) {
            return this._bindToFilteredFields(this._dataItem, dataFields);
        },

        /**
         * Bind a single input component to a single data field
         * @param dataField
         */
        bindToField: function (dataField) {
            return this._bindToField(this._dataItem, dataField);
        },

        /**
         * Bind a single input component to a full data object
         * @param {DataItemBase} dataItem
         */
        bindToDataItem: function (dataItem) {
            return this._bindToDataItem(dataItem);
        },

        /**
         * Binds the <b>data item (not raw data!)</b> of the proxied element to the value of some other input <i>baseInputOrInputProxyToBindTo</i>
         * or its proxy, so that
         * @param baseInputOrInputProxyToBindTo
         */
        bindDataItemToValueOf: function (baseInputOrInputProxyToBindTo) {
            return baseInputOrInputProxyToBindTo.addEvent('inputChanged', function (event) {
                this.setDataItem(event.value);
            }.bind(this));
        },

        /**
         * Hook functions to manipulate values between data (or property etc.) and
         * and the bound input component.
         * The functions get the raw data/input value and returns a manipulated value
         * @param {Function} inputToDataHook
         * @param {Function} dataToInputHook
         */
        bindHooks: function (inputToDataHook, dataToInputHook) {
            if (this._isHooked) {
                // todo: add reporting
                LOG.reportError();
                throw new Error("this input is already bound");
            }
            this._isHooked = true;
            return this._executeOrAddToQueue("bindHooks", arguments, true);
        },

        /**
         * add a simple event to an input component
         * @param type
         * @param callback
         */
        addEvent: function (type, callback) {
            return this._executeOrAddToQueue("addEvent", arguments);
        },

        /**
         * Set initial value of an input component.
         * NOTE: if an input is bound to data or property it will most likely get it's
         * initial value from the binding process.
         * @param val
         */
        setValue: function (val) {
            return this._executeOrAddToQueue("setValue", arguments);
        },


        /**
         * Set initial value of an input component.
         * NOTE: if an input is bound to data or property it will most likely get it's
         * initial value from the binding process.
         * @param val
         */
        getValue: function (val) {
            var logic = this._getTargetLogic();
            if (logic) {
                return logic.getValue();
            } else {
                return undefined;
            }
        },

        /**
         * sets the data item of the proxied input.
         * @param {DataItemBase} dataItem
         */
        setDataItem: function (dataItem) {
            return this._executeOrAddToQueue('setDataItem', arguments);
        },

        /**
         * Disable an input component on creation
         */
        disable: function () {
            return this._executeOrAddToQueue("disable", arguments);
        },

        /**
         * Enable an input component on creation (Most likely the component's default)
         */
        enable: function () {
            return this._executeOrAddToQueue("enable", arguments);
        },

        /**
         * set focus on input component on creation
         */
        setFocus: function () {
            return this._executeOrAddToQueue("setFocus", arguments);
        },

        /**
         * collapse an input component on creation
         */
        collapse: function () {
            return this._executeOrAddToQueue("collapse", arguments);
        },

        /**
         * uncollapse an input component on creation (Most likely the component's default)
         */
        uncollapse: function () {
            return this._executeOrAddToQueue("uncollapse", arguments);
        },

        /**
         * Get the view node of the component
         */
        getHtmlElement: function () {
            return this._htmlElement;
        },

        /**
         * Run a funtion when the input component is ready
         * @param {Function} callback
         */
        runWhenReady: function (callback) {
            var logic = this._getTargetLogic();
            if (logic) {
                callback(logic) ;
            } else {
                this._callbacks.push(callback);
            }

            return this;
        },

        selectItemAtIndex: function (index) {
            return this._executeOnWixified("selectItemAtIndex", arguments);
        },

        selectFirst: function () {
            return this.selectItemAtIndex(0);
        },

        createFieldsAfterDataUpdate: function () {
            return this._executeOnWixified('dontCreateFieldsOnNextDataUpdate');
        },

        _getTargetLogic: function (dontEnforceReady) {
            var logic = this._htmlElement.getLogic && this._htmlElement.getLogic();
            if (!dontEnforceReady && logic) {
                return logic.isReady() && logic;
            }
            return logic;
        },

        _bindToField: function (dataItem, dataField, inputToDataHook, dataToInputHook) {
            if (this._isBound) {
                LOG.reportError();
                throw new Error("this input is already bound");
            }
            this._isBound = true;
            this._boundTo = dataItem;

            if (this._dataProvider) {
                var optionList = [];
                var fieldSchema = dataItem.getFieldSchema(dataField);
                var fieldSchemaEnum = fieldSchema && fieldSchema['enum'];
                if (fieldSchemaEnum) {
                    var prefix = fieldSchema['langsPrefix'] ? fieldSchema['langsPrefix'] : 'Types.' + dataItem.getType();

                    for (var i = 0; i < fieldSchemaEnum.length; i++) {
                        var enumEntry = fieldSchemaEnum[i];
                        var name = fieldSchema['langsKey'] ? fieldSchema['langsKey'] : prefix + "." + dataField;
                        var label = W.Resources.get('EDITOR_LANGUAGE', name + "." + enumEntry);
                        optionList.push({value: enumEntry, label: label});
                    }
                }

                this._dataProvider.set('items', optionList);
            }
            this._executeOrAddToQueue('bindToDataItemField', arguments);
            return this;
        },

        bindToDataItemField: function (dataItem, dataFieldName, inputToDataHook, dataToInputHook) {
            var inputProxy = this._bindToField(dataItem, dataFieldName) ;
            if (inputToDataHook || dataToInputHook) {
                inputProxy.bindHooks(inputToDataHook, dataToInputHook);
            }
            return inputProxy ;
        },

        _bindToFilteredFields: function (dataItem, filter) {
            if (this._isBound) {
                // todo: add reporting
                LOG.reportError();
                throw new Error("this input is already bound");
            }
            this._isBound = true;
            this._executeOrAddToQueue('bindToDataItemsFilteredFields', arguments);
            return this;
        },


        _bindToRemappedFields: function () {
            if (this._isBound) {
                // todo: add reporting
                LOG.reportError();
                throw new Error("this input is already bound");
            }
            this._isBound = true;
            this._executeOrAddToQueue('bindToDataItemsRemappedFields', arguments);
            return this;
        },

        _bindToDataItem: function () {
            if (this._isBound) {
                // todo: add reporting
                LOG.reportError();
                throw new Error("this input is already bound");
            }
            this._isBound = true;
            this._executeOrAddToQueue('bindToDataItem', arguments);
            return this;
        },


        /**
         * executes a method of  this._htmlElement.getLogic by method name in the logic scope.
         * if the logic is not created yet or of the proxied component is not ready yet, the method will be executed once the component is ready
         * @param methodName
         * @param args {Array} arguments
         * @param skipToHeadOfQueue {Boolean} if true, and the method can't be executed immediately, it is added to the head of the queue rather then the end
         */
        _executeOrAddToQueue: function (methodName, args, skipToHeadOfQueue, queue) {
            // get the logic if it's available and ready
            var logic = this._getTargetLogic(!!queue);
            if (logic) {
                logic[methodName].apply(logic, args);
            } else {
                queue = queue || this._methodCallsQueue;
                if (skipToHeadOfQueue) {
                    queue.unshift({method: methodName, args: args});
                } else {
                    queue.push({method: methodName, args: args});
                }
            }
            return this;
        },

        _executeOnWixified: function (methodName, args, skipToHeadOfQueue) {
            this._executeOrAddToQueue(methodName, args, skipToHeadOfQueue, this._wixefyMethodsCallsQueue);
            return this;
        },

        _onFieldWixified: function () {
            this._wixefyMethodsCallsQueue.forEach(function (item) {
                this._executeOrAddToQueue(item.method, item.args, false, this._wixefyMethodsCallsQueue);
            }.bind(this));
        },

        /**
         *  this._htmlElement componentReady handler
         */
        _onFieldReady: function () {
            var logic = this._getTargetLogic(false);
            this._methodCallsQueue.forEach(function (item) {
                this._executeOrAddToQueue(item.method, item.args);
            }.bind(this));
            this._callbacks.forEach(function (callback) {
                callback(logic);
            });
        },

        //        dispose:function() {
        //            var logic = this._getTargetLogic();
        //            if (logic && logic.dispose) {
        //                logic.dispose();
        //            } else {
        //                this._htmlElement.destroy();
        //            }
        //        },

        dispose: function () {
            return this._executeOrAddToQueue("dispose", arguments);
        },

        showValidationMessage: function (val) {
            return this._executeOrAddToQueue("showValidationMessage", arguments);
        },

        resetInvalidState: function () {
            return this._executeOrAddToQueue("resetInvalidState", arguments);
        },

        //        dispose:function() {
        //            this._htmlElement.destroy();
        //        },

        renderIfNeeded: function () {
            var comp = this._getTargetLogic();
            if (comp) {
                comp.renderIfNeeded();
            }
        },

        selectItemAtIndexAndUpdate: function (index) {
            return this._executeOnWixified("selectItemAtIndexAndUpdate", arguments);
        },

        getBoundSchemaType: function() {
            return this._isBound && this._boundTo && this._boundTo.getOriginalClassName();
        },

        hideOnMobile: function() {
            return this._executeOrAddToQueue('hideOnMobile');
        }
    });
});
