/**
 * @class wysiwyg.editor.components.panels.traits.SkinPartsProcessing
 *
 * This trait can be used for components that include other components which are declared like:
 *
 * def.skinParts({
 *      compPartName: {
 *          type: Constants.PanelFields.FieldName.compType,
 *          argObject: {
 *              ***
 *          },
 *          hookMethod: '_hookMethod',
 *          bindToData: 'name',
 *          bindToProperty: ['name1', 'name2', 'name3'],
 *          bindHooks: ['_valueToData', '_valueToInput']
 *     }
 * });
 *
 * It parses such declarations and creates inner components with passed settings (in argObject) and data binding if needed.
 *
 */

define.experiment.newClass('wysiwyg.editor.components.panels.traits.SkinPartsProcessing.SkinPartsProcessing', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Resources', 'W.Data']);

    def.methods({
        /** Function getSkinPartDefinition
         * Merges logic and skin definition of skin part and return result (logic definition overrides skins)
         * @param {String} partName - name of skin part
         * @return {Object} part definition
         */
        getSkinPartDefinition: function(partName) {
            var definition,
                fieldsToBind,
                partDef = this._skinPartsSchema[partName];

            if (!partDef) {
                LOG.reportError(wixErrors.CM_NO_PART, this.className, "getSkinPartParams", partName);
                return ret;
            }

            definition = this._mergeSkinPartsLogicAndSkinDefinition(partName);

            this._replaceIdsFromBindMethodsMapByTheirFunctions(definition);

            // Give component last chance to change part defintion
            if (definition.hookMethod && typeOf(this[definition.hookMethod]) == 'function') {
                this._handleHookMethod(definition);
            }

            if (definition.dataProvider) {
                this._handleDataProvider(definition);
            }

            fieldsToBind = definition.bindToData || definition.bindToProperty;

            if (fieldsToBind) {
                this._handleDataAndPropertiesBinding(definition, fieldsToBind, partName);
            }

            if (definition.visibilityCondition) {
                this._addVisibilityCondition(this._skinParts[partName], definition.visibilityCondition);
            }

            if (definition.enabledCondition) {
                this._handleEnabledCondition(partName, definition.enabledCondition);
            }

            this._translateArgObjectValues(definition);

            // return the merged definition (logic definition overrides skin)
            return definition;
        },

        _mergeSkinPartsLogicAndSkinDefinition: function(partName) {
            var defFromLogic = this._skinPartsSchema[partName] || {};
            var defFromSkin = (this._skin && this._skin.getCompPartsDefinition()[partName]) || {};
            return Object.merge({'id':partName}, defFromSkin, defFromLogic);
        },

        _replaceIdsFromBindMethodsMapByTheirFunctions: function(definition) {
            _(definition).keys().forEach(function(key) {
                this._replaceIdsByFunctionsRecursive(definition, key);
            }, this);
        },

        _replaceIdsByFunctionsRecursive: function(definition, propertyKey) {
            var propertyValue = definition[propertyKey];
            if (typeof propertyValue === 'object') {
                _(propertyValue).forEach(function(value, key) {
                    this._replaceIdsByFunctionsRecursive(propertyValue, key);
                }, this);
            }
            else if (typeof propertyValue === 'string' && propertyValue.indexOf('#fnc') === 0) {
                definition[propertyKey] = (this._bindMethodsMap_ && this._bindMethodsMap_[propertyValue]) || propertyValue;
            }
        },

        _handleHookMethod: function(definition) {
            definition.argObject = definition.argObject || {};
            this[definition.hookMethod](definition);
        },

        _handleDataProvider: function(definition) {
            var dataProvider = definition.dataProvider;
            if (typeOf(definition.dataProvider) == 'function') {
                dataProvider = definition.dataProvider.apply(this);
            }
            definition.argObject = definition.argObject || {};
            definition.argObject.dataProvider = this.resources.W.Data.createDataItem({items: dataProvider, type: "list"});
        },

        _handleDataAndPropertiesBinding: function(definition, fieldsToBind, partName) {
            this.addEvent('panelFieldsReady', function() {
                if (definition.bindHooks) {
                    var inputToData = this[definition.bindHooks[0]].bind(this);
                    var dataToInput = this[definition.bindHooks[1]].bind(this);
                    this._skinParts[partName].bindHooks(inputToData, dataToInput);
                }
                this._bindFieldsToSchema(!!definition.bindToData, fieldsToBind, this._skinParts[partName]);
            }.bind(this));
        },

        _bindFieldsToSchema: function(isDataSchema, fields, part) {
            var schema = this._getSchema(isDataSchema);
            var isSingleField = this._isSingleField(fields);

            if (isSingleField) {
                if (fields === '*') {
                    part.bindToDataItem(schema);
                }
                else {
                    part.bindToDataItemField(schema, fields);
                }
            }
            else {
                part.bindToDataItemsFilteredFields(schema, fields);
            }
        },

        _getSchema: function(isDataSchema) {
            if (!isDataSchema){
                return this._previewComponent ? this._previewComponent.getComponentProperties() : this.getComponentProperties(); // is panel component?
            }

            return this._data;
//            return isDataSchema ? this._data : this._previewComponent.getComponentProperties();
        },

        _isSingleField: function(fields){
            if (typeof fields === 'string') {
                return true;
            }
            else if (_.isArray(fields)) {
                return false;
            }
            else {
                throw new Error("Invalid fields type - must be string or array");
            }
        },

        _addVisibilityCondition: function (inputLogic, visibilityPredicate) {
            var that = this;
            this._addCondition(inputLogic, function () { // this === inputLogic
                this.setCollapsed(!visibilityPredicate.apply(that));
            });
        },

        _addCondition: function (inputLogic, actionCallBack) {
            var data = this._data,
                props = this._previewComponent ? this._previewComponent.getComponentProperties() : this.getComponentProperties();

            if (data) { //a component might not have data
                data.on(Constants.DataEvents.DATA_CHANGED, inputLogic, actionCallBack);
            }

            if (props) {
                props.on(Constants.DataEvents.DATA_CHANGED, inputLogic, actionCallBack);
            }

            // run for the first time right away (in case there's default data)
            actionCallBack.call(inputLogic);
        },

        _handleEnabledCondition: function(partName, predicateFunc) {
            this.addEvent('panelFieldsReady', function() {
                this._addEnabledCondition(this._skinParts[partName], predicateFunc);
            }.bind(this));
        },

        _addEnabledCondition: function (inputLogic, visibilityPredicate) {
            var that = this;
            this._addCondition(inputLogic, function () { // this === inputLogic
                var isEnabled = visibilityPredicate.apply(that);
                if (isEnabled) {
                    this.enable();
                } else {
                    this.disable();
                }
            });
        },

        _translateArgObjectValues: function(definition) {
            var argValues = definition.argObject,
                fieldVal;

            /**
             * 'fieldsToTranslate' is added  to prevent Translator
             * from running over all of the arguments,
             * because most of them doesn't need to be translated.
             * Also 'else' (old) part of the method runs all functions from 'argsObject',
             * but some components (MediaGallery for example) are getting
             * different callbacks as arguments that shouldn't be run at this moment
             * */

             if (definition.fieldsToTranslate){
                definition.fieldsToTranslate.forEach(function(field){
                    fieldVal = argValues[field];

                    if (typeOf(fieldVal) === 'string'){
                        argValues[field] = this.resources.W.Resources.get('EDITOR_LANGUAGE', fieldVal, fieldVal);
                    } else if (typeOf(fieldVal) === 'function'){
                        argValues[field] = fieldVal.apply(this);
                    }
                }.bind(this));
            } else{ /** An old way. Leaved for compatibility */
                Object.forEach(argValues, function(value, key) {
                    switch(typeOf(value)) {
                        case 'string':
                            argValues[key] = this.resources.W.Resources.get('EDITOR_LANGUAGE', value, value);
                            break;
                        case 'function':
                            argValues[key] = value.apply(this);
                            break;
                    }
                }, this);
            }
        },

        _setAllPartsReady: function() {
            this.parent();
            this.fireEvent('panelFieldsReady');
            this.trigger('panelFieldsReady');
        },

        getCompParts: function() {
            if (this._skinParts){
                return _.filter(this._skinParts, function(skinPart){
                    return skinPart.$logic;
                });
            }

            return null;
        },

        dispose: function(){
            var comps = this.getCompParts();
            comps.forEach(function(comp){
                comp.dispose();
            });
            this.parent();
        }
    });
});
