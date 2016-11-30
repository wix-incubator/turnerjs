define.component('wysiwyg.editor.components.panels.base.BaseComponentPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Resources', 'W.Data', 'W.Config', 'W.Commands', 'W.Utils']);

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_isInputBoundToProperty', '_areAllFieldSetInputsHidden', '_hideNode', 'getPanelInputs']);

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._onFieldsReadyQueue = [];
        },

        _tryCreatingComponentParts: function () {
            var compHasNoData = this.getAcceptableDataTypes().indexOf('') >= 0;
            var isDataReady = this._data || compHasNoData;
            if (this._skinPartElements && isDataReady) {
                if (this._skinPartElements.content) {
                    this._skinPartElements.content.collapse(); //in order to avoid ugly jumps
                }
                this._loadComponentParts();
            }
        },

        _setAllPartsReady: function () {
            if (this._allComponentPartsReady) {
                return;
            }
            this._allComponentPartsReady = true;
            this._registerDataBindings();
            this._registerSkinPartCommands();
            this._applySizeLimitsIfNeeded();
            this._onAllSkinPartsReady(this._skinParts);
            this._onAllPanelFieldsReady();

            this._renderIfReady();
            if (this._skinParts.content) {
                this._skinParts.content.uncollapse();
            }
        },

        _onAllPanelFieldsReady: function () {
            this._setChangeStyleButtonListener();
            this._setAnimationButtonListener();

            _.forEach(this._onFieldsReadyQueue, function (item) {
                item.method.apply(this, item.args);
            }, this);

            this._hidePanelFieldsInMobileMode();
        },

        render: function() {
            this._hidePanelFieldsInMobileMode();
        },

        _hidePanelFieldsInMobileMode: function() {
            if (this._isMobile()) {
                _(this._skinParts)
                    .reject(this._isInputBoundToProperty)
                    .forEach(this._hideNode);

                _(this.getViewNode().getElements('fieldset')
                    .filter(this._areAllFieldSetInputsHidden)
                    .forEach(this._hideNode));
            }
        },

        _isMobile: function() {
            return this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
        },

        _isInputBoundToProperty: function(panelInput) {
            return !this._isComponent(panelInput) || (panelInput._data && panelInput._data.$className === 'core.managers.data.PropertiesItem');
        },

        _isComponent: function(element) {
            return !!element._view;
        },

        _areAllFieldSetInputsHidden: function (fieldSetNode) {
            var fieldSetInputs = _.filter(fieldSetNode.getElements('[skinpart][comp]'), function (element) {
                return this._isInputComponent(element.$logic);
            }, this);
            return _.every(fieldSetInputs, function (element) {
                return !element.isDisplayed();
            });
        },

        _hideNode: function(node) {
            node = node._view || node;
            node.setStyle('display', 'none');
        },

        getPanelInputs: function () {
            if (!this._skinParts) {
                return null;
            }
            return _.filter(this._skinParts, function (skinPart) {
                return this._isInputComponent(skinPart);
            }, this);
        },

        _isInputComponent: function (skinPart) {
            return skinPart._view && skinPart.isInstanceOfClass('wysiwyg.editor.components.inputs.BaseInput');
        },

        getPanelInputsAsync: function (callback) {
            this._onFieldsReadyQueue.push({method: callback, args: [this.getPanelInputs()]});
        },

        changeInputDataProvider: function (inputLogic, newDataProvider) {
            if (typeOf(newDataProvider) === 'function') {
                newDataProvider = newDataProvider.apply(this);
            }
            var dataProviderItem = this.resources.W.Data.createDataItem({items: newDataProvider, type: "list"});
            inputLogic.bindToDataProvider(dataProviderItem);
        },

        _setChangeStyleButtonListener: function () {
            var changeStyleButton = this._skinParts.changeStyle;
            if (!changeStyleButton) {
                return;
            }
            changeStyleButton.addEvent(Constants.CoreEvents.CLICK, function () {
                var pos = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.view);
                var cmd = this.resources.W.Commands.getCommand("WEditorCommands.ChooseComponentStyle");
                cmd.execute({editedComponentId: this._previewComponent.getComponentId(), left: pos.x});
            }.bind(this));
        },

        _setAnimationButtonListener: function () {
            var button = this._skinParts.addAnimation;
            if (!button) {
                return;
            }

            button.on(Constants.CoreEvents.CLICK, button, function () {
                this.resources.W.Commands.executeCommand('WEditorCommands.ShowAnimationDialog');
            });

            button.setButtonLabel(this._getAnimationLabel());
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.AnimationUpdated', this, function () {
                button.setButtonLabel(this._getAnimationLabel());
            });

        },

        _getAnimationLabel: function () {
            var hasBehaviors = !!this._previewComponent.getBehaviors();
            var label = this.resources.W.Resources.get('EDITOR_LANGUAGE', hasBehaviors ? 'FPP_EDIT_ANIMATION_LABEL' : 'FPP_ADD_ANIMATION_LABEL');
            return label;
        },

        /** Function getComponentPartDefinition
         * Merges logic and skin definition of skin part and return result (logic definition overrides skins)
         * @param {String} partName - name of skin part
         * @return {Object} part definition
         */
        getSkinPartDefinition: function (partName) {
            var definition,
                fieldsToBind,
                partDef = this._skinPartsSchema[partName];
            if (!partDef) {
                LOG.reportError(wixErrors.CM_NO_PART, this.className, "getSkinPartParams", partName);
                return null;
            }

            definition = this._mergeSkinPartsLogicAndSkinDefinition(partName);

            this._replaceIdsFromBindMethodsMapByTheirFunctions(definition);

            // Give component last chance to change part defintion
            if (definition.hookMethod && typeOf(this[definition.hookMethod]) === 'function') {
                this._handleHookMethod(definition);
            }
            if (definition.dataProvider) {
                this._handleDataProvider(definition);
            }

            fieldsToBind = definition.bindToData || definition.bindToProperty;
            if (fieldsToBind) {
                this._onFieldsReadyQueue.push({method: this._bindDataAndProperties, args: [definition, fieldsToBind, partName]});
            }

            if (definition.hideOnMobile) {
                this._onFieldsReadyQueue.push({method: this._hideFieldOnMobile, args: [partName]});
            }

            if (definition.visibilityCondition) {
                this._onFieldsReadyQueue.push({method: this._addVisibilityCondition, args: [partName, definition.visibilityCondition]});
            }

            if (definition.enabledCondition) {
                this._onFieldsReadyQueue.push({method: this._addEnabledCondition, args: [partName, definition.enabledCondition]});
            }

            this._translateArgObjectValues(definition);

            // return the merged definition (logic definition overrides skin)
            return definition;
        },

        _bindDataAndProperties: function (definition, fieldsToBind, partName) {
            if (definition.bindHooks) {
                var inputToData = this[definition.bindHooks[0]].bind(this);
                var dataToInput = this[definition.bindHooks[1]].bind(this);
                this._skinParts[partName].bindHooks(inputToData, dataToInput);
            }
            this._bindFieldsToSchema(!!definition.bindToData, fieldsToBind, this._skinParts[partName]);
        },

        _hideFieldOnMobile: function (fieldName) {
            this._skinParts[fieldName].hideOnMobile();
        },

        _mergeSkinPartsLogicAndSkinDefinition: function (partName) {
            var defFromLogic = this._skinPartsSchema[partName] || {};
            var defFromSkin = (this._skin && this._skin.getCompPartsDefinition()[partName]) || {};
            return Object.merge({'id': partName}, defFromSkin, defFromLogic);
        },

        _replaceIdsFromBindMethodsMapByTheirFunctions: function (definition) {
            _(definition).keys().forEach(function (key) {
                this._replaceIdsByFunctionsRecursive(definition, key);
            }, this);
        },

        _replaceIdsByFunctionsRecursive: function (definition, propertyKey) {
            var propertyValue = definition[propertyKey];
            if (typeof propertyValue === 'object') {
                _(propertyValue).forEach(function (value, key) {
                    this._replaceIdsByFunctionsRecursive(propertyValue, key);
                }, this);
            }
            else if (typeof propertyValue === 'string' && propertyValue.indexOf('#fnc') === 0) {
                definition[propertyKey] = (this._bindMethodsMap_ && this._bindMethodsMap_[propertyValue]) || propertyValue;
            }
        },

        _handleHookMethod: function (definition) {
            definition.argObject = definition.argObject || {};
            definition = this[definition.hookMethod](definition);
        },

        _handleDataProvider: function (definition) {
            var dataProvider = definition.dataProvider;
            if (typeOf(definition.dataProvider) === 'function') {
                dataProvider = definition.dataProvider.apply(this);
            }
            definition.argObject = definition.argObject || {};
            definition.argObject.dataProvider = this.resources.W.Data.createDataItem({items: dataProvider, type: "list"});
        },

        _translateArgObjectValues: function (definition) {
            var argValues = definition.argObject;
            Object.forEach(argValues, function (value, key) {
                switch (typeOf(value)) {
                    case 'string':
                        argValues[key] = this.resources.W.Resources.get('EDITOR_LANGUAGE', value, value);
                        break;
                    case 'function':
                        argValues[key] = value.apply(this);
                        break;
                }
            }, this);
        },

        _bindFieldsToSchema: function (isDataSchema, fields, part) {
            var schema = this._getSchema(isDataSchema);
            var isSingleField = this._isSingleField(fields);

            if (isSingleField) {
                if (fields === '*') {
                    part.bindToDataItem(schema);
                } else {
                    part.bindToDataItemField(schema, fields);
                }
            } else {
                part.bindToDataItemsFilteredFields(schema, fields);
            }
        },

        _getSchema: function (isDataSchema) {
            return isDataSchema ? this._data : this._previewComponent.getComponentProperties();
        },

        _isSingleField: function (fields) {
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

        _addVisibilityCondition: function (partName, visibilityPredicate) {
            var that = this;
            this._addCondition(this._skinParts[partName], function () {
                //called on input logic
                this.setCollapsed(!visibilityPredicate.apply(that));
            });
        },

        _addEnabledCondition: function (partName, visibilityPredicate) {
            var that = this;
            this._addCondition(this._skinParts[partName], function () {
                //called on input logic
                var isEnabled = visibilityPredicate.apply(that);
                if (isEnabled) {
                    this.enable();
                } else {
                    this.disable();
                }
            });
        },

        _addCondition: function (inputLogic, actionCallBack) {
            if (this._data) { //a component might not have data
                this._data.on(Constants.DataEvents.DATA_CHANGED, inputLogic, actionCallBack);
            }

            var componentProperties = this._previewComponent.getComponentProperties();
            if (componentProperties) {
                componentProperties.on(Constants.DataEvents.DATA_CHANGED, inputLogic, actionCallBack);
            }

            // run for the first time right away (in case there's default data)
            actionCallBack.call(inputLogic);
        },

        enable: function () {
            this.parent();
            this._updateChildrenState(true);
        },

        disable: function () {
            this.parent();
            this._updateChildrenState(false);
        },

        _updateChildrenState: function (isEnabled) {
            //should use async mehtod because EditorUI call disable too early
            this.getPanelInputsAsync(function (panelInputs) {
                if (isEnabled) {
                    panelInputs.forEach(function (inputComp) {
                        inputComp.enable();
                    });
                } else {
                    panelInputs.forEach(function (fieldComp) {
                        fieldComp.disable();
                    });
                }
            });
        }
    });
});