define.Class("wysiwyg.editor.components.richtext.BaseRichTextToolBar", function(classDefinition) {
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.fields({
        _controllerInstances: {}
    });

    def.resources(['W.Resources', 'W.Data']);

    def.methods({
        getSize: function() {
            return {x: 542, y: 60};
        },
        _initializeControllers: function (controllersDataInfo, skinParts) {
            Object.forEach(controllersDataInfo, function(controllerInfo, commandName) {
                var controllerComponent = skinParts[commandName];
                var className = controllerInfo.className;
                this._controllerInstances[commandName] = new this.imports[className](controllerInfo, controllerComponent);

                this._addTitleToSkinPart(controllerComponent, controllerInfo.toolTipKey);
            }, this);
        },
        _addTitleToSkinPart: function(component, titleKey) {
            var title = this.resources.W.Resources.get('EDITOR_LANGUAGE', titleKey);
            component.$view.title = title;
        },
        _startControllersListeners:function() {
            Object.forEach( this._controllerInstances, function(controllerInstance){
                controllerInstance.addStateChangeListener();
            }, this);
        },
        _stopControllersListeners:function(shouldReset) {
            //stop listening to editor events
            Object.forEach(this._controllerInstances, function(controllerInstance, commandName){
                if (shouldReset) {
                    try {
                        controllerInstance.resetControllersValues();
                    } catch (err) {
                        LOG.reportError(wixErrors.RICH_TEXT_RESET_CONTROLLER_FAIL, this.$className, commandName, {"desc": err.stack});
                    }
                }
                controllerInstance.removeStateChangeListener();
            }, this);
        },

        setEditorInstance: function (editorInstance, isEditorText) {
            this._editorInstance = editorInstance;
            Object.forEach( this._controllerInstances, function(controllerInstance){
                controllerInstance.setEditorInstance(editorInstance);
            });
            if (isEditorText){
                _.forEach(this._skinParts, function(skinPart, isEditorText){
                    skinPart.initializeBottomLinks && skinPart.initializeBottomLinks();
                });
            }
        },

        stopEditing: function (shouldReset) {
            if (this._editorInstance && this._editorInstance.document.getWindow().$) { //check if the ck editor frame is still in the dom
                this._stopControllersListeners(shouldReset);
            }
        },

        /*=========================DATA INIT ==========================================================*/
        //as soon as we will move to new base component, there won't be any need for the hook method
        // and then we can move it out of here!!!!!

        _createDataItem: function (definition) {
            var dataQuery = this.controllersDataInfo[definition.id].dataQuery;
            //no callback was passed because presets are available by now for sure
            var presetData = this.resources.W.Data.getDataByQuery(dataQuery);
            var items = this._createDropDownDataItems(definition.id, presetData.getData().items, this.controllersDataInfo);
            var dropDownDataId = this._createDropDownDataItem(definition.id, dataQuery, items, this.controllersDataInfo);
            definition.dataQuery = dropDownDataId;
            var defaultEntry = presetData.get('items')['default'];
            if(defaultEntry){
                var key = defaultEntry.label;
                definition.argObject.placeholderText = this.resources.W.Resources.get('EDITOR_LANGUAGE', key, key);
            }
            return definition;
        },

        _createDropDownDataItems: function(controllerName, items, controllersDataInfo) {
            var singleOptionDataItemArray = [];
            for (var item in items) {
                var itemData = items[item];
                singleOptionDataItemArray.push(this._createSingleOptionDataItem(controllerName, itemData, controllersDataInfo));
            }
            return singleOptionDataItemArray;
        },

        _createSingleOptionDataItem: function (controllerName, itemData, controllersDataInfo) {
            var singleOptionData = {};
            for (var key in itemData) {
                if (itemData.hasOwnProperty(key)) {
                    singleOptionData[key] = itemData[key];
                }
            }
            if (!singleOptionData.command) {
                singleOptionData.command = controllersDataInfo[controllerName].command;
            }
            singleOptionData.type = 'ButtonWithIcon';
            return this.resources.W.Data.createDataItem(singleOptionData, 'ButtonWithIcon');
        },
        _createDropDownDataItem: function (controllerName, dataQuery, items, controllersDataInfo) {
            var defaultOption = this._getDefaultOption(items, controllerName, controllersDataInfo);
            var dropDownDataId = dataQuery + "_dropDownData";
            var dropDownData = {type: 'SelectableList', items: items, selected: defaultOption || null};
            var id = dropDownDataId.substring(0, 1) === "#" ? dropDownDataId.substring(1) : dropDownDataId;
            define.dataItem(id, dropDownData);
            return dropDownDataId;
        },
        _getDefaultOption: function(optionDataItemArray, controllerName, controllersDataInfo) {
            return optionDataItemArray.filter(function(option) {
                var key = this._getControllerDataObjectKey(controllerName, controllersDataInfo);
                var defaultValue = controllersDataInfo[controllerName].defaultValue;
                return option.get(key) === 2 || defaultValue;
            }, this)[0];
        },
        _getControllerDataObjectKey: function (commandName, controllersDataInfo) {
            return (controllersDataInfo[commandName].presetKeysToCompDataKeysMap && controllersDataInfo[commandName].presetKeysToCompDataKeysMap.value) || 'value';
        },

        getControllerInstances: function (key) {
            return this._controllerInstances[key];
        }
        /*==================== END DATA INIT ====================================*/
    });
});