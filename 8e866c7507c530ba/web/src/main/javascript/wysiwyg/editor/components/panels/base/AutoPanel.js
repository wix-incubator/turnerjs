/** @class wysiwyg.editor.components.panels.base.AutoPanel */
define.component('wysiwyg.editor.components.panels.base.AutoPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['wysiwyg.editor.components.panels.base.InputFieldProxy', 'wysiwyg.editor.utils.InputValidators', 'core.utils.css.Size']);
    def.resources(['W.Data', 'W.Editor', 'W.Resources', 'W.Commands', 'W.Preview', 'W.Utils', 'W.Components', 'W.Config']);

    def.binds([ '_createStylePanel', '_shouldHideField']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });
    /** @lends wysiwyg.editor.components.panels.base.AutoPanel */
    def.methods({
        initialize: function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._inlineItemsPerLine = Constants.AutoPanel.ALL_BLOCK;
            this._inlineItemsSpacing = 0;
            this._inlineItemVerticalAlign = 'top';
            this._componentCount = 0;
            this._currentComponentGroup = null;
            this._skinSet = args.skinSet || Constants.AutoPanel.Skins.DEFAULT;
            this._fieldsProxies = [];
            this._createFieldsOnRender = true;
            this._parentPanel = args.parentPanel || this;
            this._inputValidators = new this.imports.InputValidators();
            this._enablePropertySplit = args && args.enablePropertySplit;
        },

        dontCreateFieldsOnNextDataUpdate: function () {
            this._createFieldsOnRender = false;
        },

        //        _onAllSkinPartsReady:function() {},

        render: function () {
            if (this._createFieldsOnRender) {
                this._createFieldsOnRender = false;
                this._createFields(this._parentPanel);
                if (this._enablePropertySplit) {
                    this._hidePanelFieldsInMobileMode();
                }
            }
            this._updateChildrenState();
        },

        _hidePanelFieldsInMobileMode: function() {
            var fieldNodesToHide = this._getFieldNodesToHide();
            this._hideFieldNodes(fieldNodesToHide);
        },

        _getFieldNodesToHide: function() {
            return _(this._fieldsProxies)
                .filter(this._shouldHideField)
                .map(function(field) {return field.getHtmlElement();})
                .value();
        },

        _shouldHideField: function(inputFieldProxy) {
            var inputLogic = inputFieldProxy.getHtmlElement().$logic;
            return inputLogic && inputLogic.shouldHideOnMobile(inputFieldProxy.getBoundSchemaType());
        },

        _hideFieldNodes: function(filteredFieldNodes) {
            _.forEach(filteredFieldNodes, function(field) {
                field.$logic.collapse();
            });
        },

        _prepareForRender: function () {
            if (this._createFieldsOnRender) {
                this.disposeFields();
            }
            return this.parent();
        },

        _addField: function (compName, skinName, compArgs, dataProvider) {
            //this occurs when the a panel that was already closed is still trying to add fields to itself.
            //if the panel does not have skin parts (anymore) we should not do anything.
            if (!this._skinParts) {
                return;
            }
            var field = this.resources.W.Components.createComponent(compName, skinName, undefined, compArgs, undefined);
            field.addClass(Constants.AutoPanel.COMPONENT_CLASS);
            ++this._componentCount; // Start with 1
            this._addFieldToDom(field);
            var proxy = this._createInputProxy(field, dataProvider);
            this._fieldsProxies.push(proxy);
            return proxy;
        },

        /**
         * Dispose all panel fields
         */
        disposeFields: function () {
            this._fieldsProxies.forEach(function (item) {
                item.dispose();
            });
            this._fieldsProxies = [];
            if (this._skinParts && this._skinParts.content) {
                this._skinParts.content.empty();
            }
        },

        /**
         * Geal allpanel field proxies
         * @returns {Array}
         */
        getFields: function () {
            return this._fieldsProxies;
        },

        /**
         * Sets component data, inform component of data change and try building component parts.
         * @param {DataItemBase} dataItem - data item to set for component
         */
        setDataItem: function (dataItem) {
            this._createFieldsOnRender = true;
            this.parent(dataItem);
        },

        /**
         * set the skinSet
         * @param skinSet
         */
        setSkinSet: function (skinSet) {
            this._skinSet = Constants.AutoPanel.Skins[skinSet];
        },

        /**
         * gets the skin from the defined skinSet. if it doesn't find the required skin,
         * it recursively looks fo the skin in the skinSet's family
         * a skinNam can point to a skinClassName string or to a colletion of skin styles
         * @param skinName
         * @param skinStyle
         */
        getSkinFromSet: function (skinName, skinStyle) {
            return this._getSkinFromSet(skinName, this._skinSet, skinStyle);
        },

        /**
         * the recursive part of getSkinFromSet
         * @param skinName
         * @param skinSet
         * @param skinStyle
         */
        _getSkinFromSet: function (skinName, skinSet, skinStyle) {
            var skinClassName = null;
            var extendedSkinSet = skinSet.Extends;
            var skinSubset = skinName && skinSet[skinName];

            if (!skinSubset) {

                if (extendedSkinSet) {
                    return this._getSkinFromSet(skinName, Constants.AutoPanel.Skins[extendedSkinSet], skinStyle);
                } else {
                    return LOG.reportError(wixErrors.AUTOPANEL_SKIN_DOES_NOT_EXIST, this.className, '_getSkinFromSet', 'Skin Set: ' + skinSet + ' Skin Name: ' + skinName);
                }

            }


            if (typeof skinSubset === 'string') {
                skinClassName = skinSubset;
            }

            if (typeof skinSubset === 'object') {
                if (skinStyle && skinSubset[skinStyle]) {
                    skinClassName = skinSubset[skinStyle];
                }
                else if (skinSubset['default']) {
                    skinClassName = skinSubset['default'];
                }
                else {
                    return LOG.reportError(wixErrors.AUTOPANEL_SKIN_STYLES_DOES_NOT_EXIST, this.className, '_getSkinFromSet', 'Skin Set: ' + skinSet + ' Skin Name: ' + skinName + ' Skin Style: ' + skinStyle);
                }
            }

            return skinClassName;
        },

        /**
         * Add fields to dom, fields default layout is inline.
         * if _inlineItemsPerLine is 0: use default
         * if _inlineItemsPerLine is 1: treat as block elements, do not wrap, do not add inline behavior
         * if _inlineItemsPerLine > 1: wrap every x elements in a block wrapper
         * if addBreakLine is called, close container and start a new one
         * Inline component defined as inline in editorWeb.css
         */
        _addFieldToDom: function (field) {
            if (!field) {
                return;
            }

            var container = this._skinParts.content;
            var group = null;

            if (this._inlineItemsPerLine == Constants.AutoPanel.ALL_BLOCK) {
                field.insertInto(container);
            }
            else {
                group = this._getComponentGroup();
                // Add the component to the container
                field.addClass(Constants.AutoPanel.INLINE_CLASS);
                field.setStyle('vertical-align', this._inlineItemVerticalAlign);
                field.insertInto(group);

                //If it's time to break a line
                if (this._componentCount % this._inlineItemsPerLine == 0) {
                    this._addNewComponentGroup();
                    //If not, add the defined spacing to the element
                    // (we don't want the spacing to be defined on the last element in line)
                } else {
                    field.setStyle('margin-right', this._inlineItemsSpacing + 'px');
                }
            }
        },

        _getComponentGroup: function () {
            return this._currentComponentGroup || this._addNewComponentGroup();
        },

        _addNewComponentGroup: function (marginTop, borderTop, paddingTop) {
            this._currentComponentGroup = null;
            this._currentComponentGroup = new Element('div', {
                'class': Constants.AutoPanel.GROUP_CLASS,
                styles: {
                    'marginTop': marginTop || 0,
                    'paddingTop': paddingTop || 0,
                    'borderTop': borderTop || 'none'
                }
            });
            this._currentComponentGroup.insertInto(this._skinParts.content);
            return this._currentComponentGroup;
        },

        addBreakLine: function (marginTop, borderTopCss, paddingTop) {
            this._componentCount = 0;
            return this._addNewComponentGroup(marginTop, borderTopCss, paddingTop);
        },

        /**
         *
         * @param field
         * @returns {InputFieldProxy}
         */
        _createInputProxy: function (field, dataProvider) {
            var properties;
            if (this._previewComponent) {
                properties = this._previewComponent.getComponentProperties();
            }
            var managers = this.resources.W.Preview.getPreviewManagers();
            var themeData = managers && managers.Theme.getDataItem();

            return new this.imports.InputFieldProxy(field, this._data, properties, themeData, dataProvider);
        },

        _createDataProvider: function (compArgs) {
            var dataProvider = this.resources.W.Data.createDataItem({items: compArgs, type: "list"});
            return dataProvider;
        },
        /**
         * Set how many items are allowed to appear in one line.
         * @param num number of maximum items per line
         * @param spacing the space in pixels between them
         */
        setNumberOfItemsPerLine: function (num, spacing, verticalAlign) {
            this._inlineItemsPerLine = parseInt(num, 10) || 0;
            this._inlineItemsSpacing = parseInt(spacing, 10) || 0;
            this._inlineItemVerticalAlign = verticalAlign || 'top';
        },
        /**
         * Add an "Add/Edit Animation" button
         * @returns {*}
         */
        addAnimationButton: function () {
            var componentCommands = this.resources.W.Editor.getComponentMetaData(this._previewComponent) || {};
            if (componentCommands.general && componentCommands.general.animation === false){
                return;
            }

            return this.addInputGroupField(function (panel) {
                this.addButtonField(null, '', null, null, 'withArrow', false, false, 'WEditorCommands.ShowAnimationDialog')
                    .runWhenReady(function(logic){
                        W.Commands.registerCommandListenerByName('WEditorCommands.AnimationUpdated', logic, function(){
                            if (this._isDisposed){
                                W.Commands.unregisterListener(this);
                            } else {
                                this.setButtonLabel(panel._getAnimationLabel());
                            }
                        });
                        logic.setButtonLabel(panel._getAnimationLabel());
                    });
            });
        },

        _getAnimationLabel: function(){
            //TODO: this should be done through ActionsManager
            var hasBehaviors = !!this._previewComponent.getBehaviors();
            var label = W.Resources.get('EDITOR_LANGUAGE', hasBehaviors ? 'FPP_EDIT_ANIMATION_LABEL' : 'FPP_ADD_ANIMATION_LABEL');
            return label;
        },

        /**
         * Adds a custom component to the panel and wrap it with InputFieldProxy.
         * @param compName {String} The component full name.
         * @param skinName {String} The skin to use for the component.
         * @param compArgs {Object} The component arguments.
         * @return {InputFieldProxy} The proxy of the new created component.
         */
        addCustomComponent: function (compName, skinName, compArgs) {
            return this._addField(
                compName,
                skinName,
                compArgs
            );
        },

        /**
         * Add a title component
         * @param label
         * @param color
         * @param skinGroup
         * @returns {*}
         */
        addTitle: function (label, color, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Label',
                this.getSkinFromSet('Title', skinGroup),
                {
                    labelText: label,
                    color: color
                }
            );
        },

        /**
         * Add a label component
         * @param label
         * @param styles
         * @param skinGroup
         * @param spriteSrc
         * @param spriteOffset
         * @param spriteSize
         * @param toolTipId
         * @param labelStyles
         * @returns {*}
         */
        addLabel: function (label, styles, skinGroup, spriteSrc, spriteOffset, spriteSize, toolTipId, labelStyles) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Label',
                this.getSkinFromSet('Label', skinGroup),
                {
                    labelText: label,
                    styles: styles,
                    labelStyles: labelStyles,
                    spriteSrc: spriteSrc,
                    spriteOffset: spriteOffset,
                    spriteSize: spriteSize,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add a sub label component (Same as Label, different skins set)
         * @param label
         * @param color
         * @param skinGroup
         * @returns {*}
         */
        addSubLabel: function (label, color, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Label',
                this.getSkinFromSet('SubLabel', skinGroup),
                {
                    labelText: label,
                    color: color
                }
            );
        },

        addHtmlIslandField: function (width, height, htmlContent, params) {
            // NOTE: the tooltipId works differently than other tooltips for this component.
            // See the HtmlIsland component and compare it to BaseInput if you need a different implementation
            return this._addField(
                'wysiwyg.editor.components.inputs.HtmlIsland',
                this.getSkinFromSet('HtmlIsland'),
                {
                    width: width,
                    height: height,
                    htmlContent: htmlContent,
                    styles: params.styles,
                    toolTip: params.toolTip
                }
            );
        },

        /**
         * Add a Button
         * @param label
         * @param buttonLabel
         * @param toggleMode
         * @param iconObj
         * @param skinGroup
         * @param minWidth
         * @param toolTipId
         * @param command
         * @param commandParameter
         * @returns {*}
         */
        addButtonField: function (label, buttonLabel, toggleMode, iconObj, skinGroup, minWidth, toolTipId, command, commandParameter) {
            if (!iconObj || typeof iconObj === 'string') {
                iconObj = {iconSrc: iconObj};
            }
            return this._addField(
                'wysiwyg.editor.components.inputs.ButtonInput',
                this.getSkinFromSet('ButtonInput', skinGroup),
                {
                    labelText: label,
                    buttonLabel: buttonLabel,
                    toggleMode: toggleMode,
                    iconSrc: iconObj.iconSrc,
                    iconSize: iconObj.iconSize,
                    spriteOffset: iconObj.spriteOffset,
                    minWidth: minWidth,
                    toolTip: {
                        addQuestionMark: false,
                        toolTipId: toolTipId,
                        toolTipGetter: function () {
                            return this._skinParts.view;
                        }
                    },
                    command: command,
                    commandParameter: commandParameter
                }
            );
        },
        /**
         * Add an inline text link component (text ... button ... text)
         * @param label
         * @param prefixText
         * @param buttonLabel
         * @param postfixText
         * @param toggleMode
         * @param iconSrc
         * @param skinGroup
         * @param command
         * @param commandParameter
         * @param style
         * @returns {*}
         */
        addInlineTextLinkField: function (label, prefixText, buttonLabel, postfixText, toggleMode, iconSrc, skinGroup, command, commandParameter, style) {
            return this._addField(
                'wysiwyg.editor.components.inputs.InlineTextLinkInput',
                this.getSkinFromSet('InlineTextLinkInput', skinGroup),
                {
                    labelText: label,
                    prefixText: prefixText,
                    buttonLabel: buttonLabel,
                    postfixText: postfixText,
                    toggleMode: toggleMode,
                    iconSrc: iconSrc,
                    command: command,
                    commandParameter: commandParameter,
                    style: style
                }
            );
        },

        /**
         * Add an inline text link component (text ... button ... text) without spaces
         * @param prefixText
         * @param buttonLabel
         * @param postfixText
         * @param isPreTextSpace
         * @param isPostTextSpace
         * @returns {*}
         */
        addInlineTextLinkFieldWithoutSpaces: function (prefixText, buttonLabel, postfixText, isPreTextSpace, isPostTextSpace) {
            return this._addField(
                'wysiwyg.editor.components.inputs.InlineTextLinkInput',
                this.getSkinFromSet('InlineTextLinkInput', null),
                {
                    prefixText: prefixText,
                    buttonLabel: buttonLabel,
                    postfixText: postfixText,
                    noSpaces: {preText: !isPreTextSpace, postText: !isPostTextSpace}
                }
            );
        },

        /**
         * Add a list editor button
         * @param buttonLabel
         * @param listData
         * @param galleryConfigID
         * @param startingTab
         * @param source
         * @returns {*}
         */
        addListEditorButton: function (buttonLabel, listData, galleryConfigID, startingTab, source) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ListEditorButton',
                this.getSkinFromSet('ListEditorButton'),
                {
                    buttonLabel: buttonLabel,
                    listData: listData,
                    galleryConfigID: galleryConfigID,
                    startingTab: startingTab,
                    source: source
                }
            );
        },

        /**
         * Add input group (inner auto panel)
         * @param createFieldsFunc
         * @param skinGroup
         * @param collapseLabel
         * @param expandLabel
         * @param sizeInfo
         * @param align
         * @param useCollapseButton
         * @param collapseAtStart
         * @param styles
         * @returns {*}
         */
        addInputGroupField: function (createFieldsFunc, skinGroup, collapseLabel, expandLabel, sizeInfo, align, useCollapseButton, collapseAtStart, styles) {

            var newCompArgs = {
                createFieldsFunc: createFieldsFunc,
                useCollapseButton: useCollapseButton,
                collapseAtStart: collapseAtStart,
                groupData: this._data,
                previewComponent: this._previewComponent,
                collapseLabel: collapseLabel,
                expandLabel: expandLabel,
                align: align,
                styles: styles,
                parentPanel: this._parentPanel,
                enablePropertySplit: this._enablePropertySplit
            };
            if (sizeInfo) {
                newCompArgs.width = sizeInfo.width;
                newCompArgs.height = sizeInfo.height;
                newCompArgs.padding = sizeInfo.padding;
            }

            return this._addField(
                'wysiwyg.editor.components.inputs.InputGroup',
                this.getSkinFromSet('InputGroup', skinGroup),
                newCompArgs
            );
        },

        /**
         *
         * @param title
         * @param createFieldsFunc
         * @param {{showSeparator: boolean, collapseAtStart: boolean}} options
         */
        addCollapsibleInputGroup: function(title, createFieldsFunc, options){

            var compArgs = {
                createFieldsFunc: createFieldsFunc,
                collapseAtStart: options.collapseAtStart,
                groupData: this._data,
                previewComponent: this._previewComponent,
                parentPanel: this._parentPanel,
                showSeparator: options.showSeparator,
                title: title,
                eventOnToggle: options.eventOnToggle

            };

            return this._addField(
                'wysiwyg.editor.components.inputs.CollapsibleInputGroup',
                this.getSkinFromSet('CollapsibleInputGroup', 'default'), //should be extended to allow skingroup if more are added
                compArgs
            );
        },

        /**
         * Add an input group with an icon
         * @param iconSrc
         * @param iconSizes
         * @param showBorder
         * @param showSeparator
         * @param createFieldsFunc
         * @param skinGroup
         * @param collapseLabel
         * @param expandLabel
         * @param sizeInfo
         * @param align
         * @param useCollapseButton
         * @param collapseAtStart
         * @param styles
         * @returns {*}
         */
        addInputGroupFieldWithIcon: function (iconSrc, iconSizes, showBorder, showSeparator, createFieldsFunc, skinGroup, collapseLabel, expandLabel, sizeInfo, align, useCollapseButton, collapseAtStart, styles) {

            var newCompArgs = {
                iconSrc: iconSrc,
                iconSizes: iconSizes,
                showBorder: showBorder,
                showSeparator: showSeparator,
                createFieldsFunc: createFieldsFunc,
                useCollapseButton: useCollapseButton,
                collapseAtStart: collapseAtStart,
                groupData: this._data,
                previewComponent: this._previewComponent,
                collapseLabel: collapseLabel,
                expandLabel: expandLabel,
                align: align,
                styles: styles,
                parentPanel: this._parentPanel
            };
            if (sizeInfo) {
                newCompArgs.width = sizeInfo.width;
                newCompArgs.height = sizeInfo.height;
                newCompArgs.padding = sizeInfo.padding;
            }

            return this._addField(
                'wysiwyg.editor.components.inputs.InputGroupWithIcon',
                'wysiwyg.editor.skins.inputs.InputGroupWithIconSkin',
                newCompArgs
            );
        },

        addComboBoxForType: function (label) {
            var comp = this.resources.W.Editor.getSelectedComp();
            var compName = comp.className;
            var types = this.resources.W.Editor.getAvailableTypes(compName);
            var optionList = [];
            var availableCompName;

            for (availableCompName in types) {
                optionList.push({
                    value: availableCompName,
                    label: this.resources.W.Resources.get('EDITOR_LANGUAGE', availableCompName)
                });
            }

            var defaultOption = compName;// this.resources.W.Resources.get('EDITOR_LANGUAGE', compName); // this comp
            var comboProxy = this.addComboBoxField(label, optionList, defaultOption, types.length);
            var autoPanel = this;
            comboProxy.runWhenReady(function (comboComp) {
                comboComp.addEvent('inputChanged', function (event) {
                    var keyToAddComponent = types[event.value];

                    autoPanel.resources.W.Editor.replaceCurrentComponent(this, keyToAddComponent);
                });
            });
            return comboProxy;
        },

        /**
         * Add a combo box
         * @param label
         * @param optionList
         * @param defaultValue
         * @param listSize
         * @param toolTipId
         * @returns {*}
         */
        addComboBoxField: function (label, optionList, defaultValue, listSize, toolTipId) {
            var dataProvider = this._createDataProvider(optionList);
            return this.addComboBoxFieldWithDataProvider(label, dataProvider, defaultValue, toolTipId);
        },

        /**
         * add a data based combo box
         * @param label
         * @param dataProvider
         * @param defaultValue
         * @param toolTipId
         * @returns {*}
         */
        addComboBoxFieldWithDataProvider: function (label, dataProvider, defaultValue, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ComboBox',
                this.getSkinFromSet('ComboBox'),
                {
                    labelText: label,
                    defaultValue: defaultValue,
                    dataProvider: dataProvider,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Another combo box...
         * @param label
         * @param toolTipId
         * @returns {*}
         */
        addComboBox: function (label, toolTipId) { // TODO the label should come from the dictionary as well (i.e. key is param)
            var dataProvider = this._createDataProvider([]);
            return this._addField(
                'wysiwyg.editor.components.inputs.ComboBox',
                this.getSkinFromSet('ComboBox'),
                {
                    labelText: label,
                    dataProvider: dataProvider,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                },
                dataProvider
            );
        },

        /**
         * Add a selection list input
         * @param label
         * @param optionList
         * @param listArgs
         * @param repeaterArgs
         * @returns {*}
         */
        addSelectionListInputField: function (label, optionList, listArgs, repeaterArgs) {
            var dataProvider = this._createDataProvider(optionList);
            return this.addSelectionListInputFieldWithDataProvider(label, dataProvider, listArgs, repeaterArgs);
        },

        /**
         * Add a list of radio buttons
         * @param label
         * @param optionList
         * @param defaultValue
         * @param group
         * @param display
         * @returns {*}
         */
        addRadioButtonsField: function (label, optionList, defaultValue, group, display) {
            return this._addField(
                'wysiwyg.editor.components.inputs.RadioButtons',
                this.getSkinFromSet('RadioButtons'),
                {
                    labelText: label,
                    presetList: optionList,
                    defaultValue: defaultValue,
                    group: group,
                    display: display
                }
            );
        },

        /**
         * Add a selection list input from a data provider
         * @param label
         * @param dataProvider
         * @param listArgs
         * @param repeaterArgs
         * @param skinGroup
         * @returns {*}
         */
        addSelectionListInputFieldWithDataProvider: function (label, dataProvider, listArgs, repeaterArgs, skinGroup) {
            listArgs = listArgs || {};
            listArgs.labelText = label;
            listArgs.dataProvider = dataProvider;
            listArgs.repeaterArgs = repeaterArgs;
            return this._addField(
                    (listArgs && listArgs.type) || 'wysiwyg.editor.components.inputs.SelectionListInput',
                    (listArgs && listArgs.skin) || this.getSkinFromSet('SelectionListInput', skinGroup),
                listArgs
            );
        },

        /**
         * another selection list input thing
         * @param label
         * @param dataProvider
         * @param listArgs
         * @param repeaterArgs
         * @param skinGroup
         * @param selectedIndex
         * @returns {*}
         */
        addDataItemSelectionListInputFieldWithDataProvider: function (label, dataProvider, listArgs, repeaterArgs, skinGroup, selectedIndex) {
            return this._addField(
                    (listArgs && listArgs.type) || 'wysiwyg.editor.components.inputs.DataItemSelectionListInput',
                    (listArgs && listArgs.skin) || this.getSkinFromSet('SelectionListInput', skinGroup),
                {
                    labelText: label,
                    dataProvider: dataProvider,
                    //                   numRepeatersInLine: numRepeatersInLine,
                    repeaterArgs: repeaterArgs,
                    selectedIndex: selectedIndex
                }
            );
        },

        /**
         * Add a list of styled (with icons) radio buttons
         * @param label
         * @param optionList
         * @param defaultValue
         * @param group
         * @param display
         * @returns {*}
         */
        addRadioImagesField: function (label, optionList, defaultValue, group, display) {
            return this._addField(
                'wysiwyg.editor.components.inputs.RadioImages',
                this.getSkinFromSet('RadioImages'),
                {
                    labelText: label,
                    presetList: optionList,
                    defaultValue: defaultValue,
                    group: group,
                    display: display
                }
            );
        },

        /**
         * Add a simple input
         * @param label
         * @param placeholderText
         * @param minLength
         * @param maxLength
         * @param validatorArgs
         * @param skinGroup
         * @param toolTipId
         * @param ignoreRevertToLastValidInput
         * @returns {*}
         */
        addInputField: function(label, placeholderText, minLength, maxLength, validatorArgs, skinGroup, toolTipId, ignoreRevertToLastValidInput) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Input',
                this.getSkinFromSet('Input', skinGroup),
                {
                    labelText: label,
                    placeholderText: placeholderText,
                    minLength: minLength,
                    maxLength: maxLength,
                    validatorArgs: validatorArgs,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    },
                    ignoreRevertToLastValidInput: ignoreRevertToLastValidInput
                }
            );
        },
        /**
         * Add a simple input
         * @param {{
         *        labelText: 'string',
         *        placeholderText : 'string',
         *        skinGroup: 'string',
         *        minLength: 'number',
         *        maxLength: 'number',
         *        validatorArgs: {},
         *        toolTip: 'string',
         *        ignoreRevertToLastValidInput: 'boolean',
         *        stylesForSkinParts: {}
         *      }} options
         * @returns {*}
         */
        addCustomizableInputField: function(options) {
            options.toolTip = {
                toolTipId: options.toolTip,
                addQuestionMark: true,
                toolTipGetter: function () {
                    return this._skinParts.label;
                }
            };
            return this._addField(
                'wysiwyg.editor.components.inputs.Input',
                this.getSkinFromSet('Input', options.skinGroup),
                options
            );
        },

        /**
         * Add a customizable text area
         * @param {{
         *        labelText: 'string',
         *        placeholderText : 'string',
         *        maxLength: 'number',
         *        validatorArgs: {},
         *        toolTip: 'string',
         *        height: 'number',
         *        stylesForSkinParts: {}
         *      }} options
         * @returns {*}
         */
        addCustomizableTextArea: function (options) {
            options.toolTip = {
                toolTipId: options.toolTip,
                addQuestionMark: true,
                toolTipGetter: function () {
                    return this._skinParts.label;
                }
            };
            return this._addField(
                'wysiwyg.editor.components.inputs.TextArea',
                this.getSkinFromSet('TextArea'),
                options
            );
        },

        /**
         * Add a link
         * @param label
         * @param placeholderText
         * @param changeCallBack
         * @param toolTipId
         * @returns {*}
         */
        addLinkField: function (label, placeholderText, changeCallBack, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Link',
                this.getSkinFromSet('Link'),
                {
                    labelText: label,
                    placeholderText: placeholderText,
                    previewData: this._data,
                    changeCallBack: changeCallBack,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add an input with its own submit button
         * @param label
         * @param placeholderText
         * @param minLength
         * @param maxLength
         * @param buttonLabel
         * @param iconSrc
         * @param validatorArgs
         * @param preSubmitFunction
         * @param toolTipId
         * @returns {*}
         */
        addSubmitInputField: function (label, placeholderText, minLength, maxLength, buttonLabel, iconSrc, validatorArgs, preSubmitFunction, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.SubmitInput',
                this.getSkinFromSet('SubmitInput'),
                {
                    labelText: label,
                    placeholderText: placeholderText,
                    minLength: minLength,
                    maxLength: maxLength,
                    validatorArgs: validatorArgs,
                    buttonLabel: buttonLabel,
                    iconSrc: iconSrc,
                    preSubmitFunction: preSubmitFunction,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add a text area with its own submit button
         * @param label
         * @param placeholderText
         * @param minLength
         * @param maxLength
         * @param height
         * @param buttonLabel
         * @param iconSrc
         * @param validatorArgs
         * @param preSubmitFunction
         * @returns {*}
         */
        addSubmitTextAreaField: function (label, placeholderText, minLength, maxLength, height, buttonLabel, iconSrc, validatorArgs, preSubmitFunction) {
            return this._addField(
                'wysiwyg.editor.components.inputs.SubmitTextArea',
                this.getSkinFromSet('SubmitTextArea'),
                {
                    labelText: label,
                    placeholderText: placeholderText,
                    minLength: minLength,
                    maxLength: maxLength,
                    height: height,
                    validatorArgs: validatorArgs,
                    buttonLabel: buttonLabel,
                    iconSrc: iconSrc,
                    preSubmitFunction: preSubmitFunction
                }
            );
        },

        /**
         * Add a textarea field
         * NOTE: Someone has introduce redundant 'validators' parameter, so it has been changed to 'obsoleteValidators'
         *       in order to keep the method signature intact
         * @param label
         * @param height
         * @param obsoleteValidators
         * @param maxLength
         * @param validatorArgs
         * @param skinGroup
         * @param toolTipId
         * @param placeholderText
         * @returns {*}
         */
        addTextAreaField: function (label, height, obsoleteValidators, maxLength, validatorArgs, skinGroup, toolTipId, placeholderText) {
            return this._addField(
                'wysiwyg.editor.components.inputs.TextArea',
                this.getSkinFromSet('TextArea'),
                {
                    labelText: label,
                    placeholderText: placeholderText,
                    height: height,
                    maxLength: maxLength,
                    validatorArgs: validatorArgs,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },
        /**
         * Add a Numeric Slider
         * @param label
         * @param min
         * @param max
         * @param step
         * @param hideInput
         * @param updateOnEnd
         * @param noFloats
         * @param toolTipId
         * @param units
         * @returns {*}
         */
        addSliderField: function (label, min, max, step, hideInput, updateOnEnd, noFloats, toolTipId, units) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Slider',
                this.getSkinFromSet('Slider'),
                {
                    labelText: label,
                    min: min,
                    max: max,
                    step: step,
                    hideInput: hideInput,
                    updateOnEnd: updateOnEnd,
                    noFloats: noFloats,
                    units: units,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add a slider styled using icons
         * @param label
         * @param min
         * @param max
         * @param step
         * @param hideInput
         * @param updateOnEnd
         * @param noFloats
         * @param toolTipId
         * @param units
         * @param leftIconSrc
         * @param rightIconSrc
         * @returns {*}
         */
        addSliderFieldWithIcons: function (label, min, max, step, hideInput, updateOnEnd, noFloats, toolTipId, units, leftIconSrc, rightIconSrc) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Slider',
                this.getSkinFromSet('Slider', 'withIcons'),
                {
                    labelText: label,
                    min: min,
                    max: max,
                    step: step,
                    hideInput: hideInput,
                    updateOnEnd: updateOnEnd,
                    noFloats: noFloats,
                    units: units,
                    leftIcon: leftIconSrc,
                    rightIcon: rightIconSrc,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Ad a slider with start/end labels
         * @param label
         * @param min
         * @param max
         * @param step
         * @param hideInput
         * @param updateOnEnd
         * @param noFloats
         * @param toolTipId
         * @param units
         * @param leftLabel
         * @param rightLabel
         * @returns {*}
         */
        addSliderFieldWithLabels: function (label, min, max, step, hideInput, updateOnEnd, noFloats, toolTipId, units, leftLabel, rightLabel) {
            return this._addField(
                'wysiwyg.editor.components.inputs.Slider',
                this.getSkinFromSet('Slider', 'withLabels'),
                {
                    labelText: label,
                    leftLabel: leftLabel,
                    rightLabel: rightLabel,
                    min: min,
                    max: max,
                    step: step,
                    hideInput: hideInput,
                    updateOnEnd: updateOnEnd,
                    noFloats: noFloats,
                    units: units,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },


        /**
         * Add a single checkbox
         * @param label
         * @param toolTipId
         * @param skinGroup
         * @param omitToolTipQuestionMark
         * @param toolTipGetter
         * @returns {*}
         */
        addCheckBoxField: function (label, toolTipId, skinGroup, omitToolTipQuestionMark, toolTipGetter) {
            var addToolTipQuestionMark = !omitToolTipQuestionMark;
            toolTipGetter = toolTipGetter || 'label';
            return this._addField(
                'wysiwyg.editor.components.inputs.CheckBox',
                this.getSkinFromSet('CheckBox', skinGroup),
                {
                    labelText: label,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: addToolTipQuestionMark,
                        toolTipGetter: function () {
                            if (toolTipGetter === 'view') {
                                return this._view;
                            }
                            else {
                                return this._skinParts[toolTipGetter];
                            }

                        }
                    }
                }
            );
        },

        /**
         * Add a checkbox styled with icons
         * @param label
         * @param icon
         * @param image
         * @param dimensions
         * @param skinGroup
         * @returns {*}
         */
        addCheckBoxImageField: function (label, icon, image, dimensions, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.CheckBoxImage',
                this.getSkinFromSet('CheckBoxImage', skinGroup),
                {
                    labelText: label,
                    icon: icon,
                    image: image,
                    dimensions: dimensions
                }
            );
        },

        /**
         * Add a change/add image field
         * @param label
         * @param width
         * @param height
         * @param buttonText
         * @param galleryConfigID
         * @param deleteText
         * @param skinGroup
         * @param toolTipId
         * @param callback
         * @param publicMediaFile
         * @param i18nPrefix
         * @param mgCallback
         * @param hasPrivateMedia
         * @param commandSource
         * @param componentName
         * @param startingTab
         * @returns {*}
         */
        addImageField: function (label, width, height, buttonText, galleryConfigID, deleteText, skinGroup, toolTipId, callback, publicMediaFile, i18nPrefix, mgCallback, hasPrivateMedia, commandSource, componentName, startingTab) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ImageInput',
                this.getSkinFromSet('ImageInput', skinGroup),
                {
                    labelText: label,
                    width: width,
                    height: height,
                    buttonText: buttonText,
                    galleryConfigID: galleryConfigID,
                    i18nPrefix: i18nPrefix,
                    selectionType: 'single',
                    mediaType: 'picture',
                    hasPrivateMedia: hasPrivateMedia,
                    mgCallback: mgCallback,
                    publicMediaFile: publicMediaFile,
                    deleteText: deleteText,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    },
                    commandSource: commandSource,
                    componentName: componentName,
                    startingTab: startingTab
                }
            );
        },

        /**
         * Add a change/add flash component
         * @param label
         * @param width
         * @param height
         * @param buttonText
         * @param skinGroup
         * @returns {*}
         */
        addFlashField: function (label, width, height, buttonText, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.FlashInput',
                this.getSkinFromSet('FlashInput', skinGroup),
                {
                    labelText: label,
                    width: width,
                    height: height,
                    buttonText: buttonText
                }
            );
        },

        /**
         * Add a change/add document field
         * @param label
         * @param buttonLabel
         * @param callback
         * @returns {*}
         */
        addUserDocField: function (label, buttonLabel, callback) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ButtonInput',
                'wysiwyg.editor.skins.inputs.button.ButtonInputBlueArrowSkin',
                {
                    labelText: label,
                    buttonLabel: buttonLabel,
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        galleryConfigID: 'documents',
                        publicMediaFile: 'file_icons',
                        i18nPrefix: 'document',
                        selectionType: 'single',
                        mediaType: 'document',
                        callback: callback
                    }
                }
            );
        },

        /**
         * Add a change color field
         * @param label
         * @param enableAlpha
         * @param skinGroup
         * @returns {*}
         */
        addColorField: function (label, enableAlpha, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ColorInput',
                this.getSkinFromSet('ColorInput', skinGroup),
                {
                    labelText: label,
                    enableAlpha: enableAlpha
                }
            );
        },

        /**
         * Add a color group field
         * @param colorList
         * @param skinGroup
         * @returns {*}
         */
        addColorGroupField: function (colorList, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ColorGroup',
                this.getSkinFromSet('ColorGroup', skinGroup),
                {
                    colorList: colorList
                }
            );
        },

        /**
         * Background Generators
         */
        /**
         * Add a background scroll type field
         * @param label
         * @param toolTipId
         * @returns {*}
         */
        addBgScrollField: function (label, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.bg.BgScroll',
                this.getSkinFromSet('BgScroll'),
                {
                    labelText: label,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.scrollTypes._skinParts.label;
                        }
                    }
                }
            );
        },
        /**
         * Add a background align type field
         * @param label
         * @returns {*}
         */
        addBgAlignField: function (label) {
            return this._addField(
                'wysiwyg.editor.components.inputs.bg.BgAlign',
                this.getSkinFromSet('BgAlign'),
                {labelText: label}
            );
        },
        /**
         * Add a background tile type field
         * @param label
         * @param toolTipId
         * @returns {*}
         */
        addBgTileField: function (label, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.bg.BgTile',
                this.getSkinFromSet('BgTile'),
                {
                    labelText: label,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.tileTypes._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add a background color field
         * @param label
         * @returns {*}
         */
        addBgColorField: function (label) {
            return this._addField(
                'wysiwyg.editor.components.inputs.bg.BgColor',
                this.getSkinFromSet('BgColor'),
                {labelText: label}
            );
        },
        /**
         * Add a background image field
         * @param label
         * @returns {*}
         */
        addBgImageField: function (label) {
            return this._addField(
                'wysiwyg.editor.components.inputs.bg.BgImage',
                this.getSkinFromSet('BgImage'),
                {labelText: label}
            );
        },
        /**
         * Font Generators
         */
        /**
         * Add a font preset selection field
         * @param label
         * @param buttonLabel
         * @param buttonSecondLabel
         * @param toggleMode
         * @param iconSrc
         * @returns {*}
         */
        addFontButtonField: function (label, buttonLabel, buttonSecondLabel, toggleMode, iconSrc, className) {
            return this._addField(
                'wysiwyg.editor.components.inputs.FontButtonInput',
                this.getSkinFromSet('FontButton'),
                {
                    labelText: label,
                    label: buttonLabel,
                    name: buttonSecondLabel,
                    toggleMode: toggleMode,
                    iconSrc: iconSrc,
                    className: className
                }
            );
        },
        /**
         * Add a font color filed
         * @param label
         * @param fontString
         * @returns {*}
         */
        addFontColorField: function (label, fontString) {
            return this._addField(
                'wysiwyg.editor.components.inputs.font.FontColor',
                this.getSkinFromSet('FontColor'),
                {
                    labelText: label,
                    value: fontString
                }
            );
        },
        /**
         * Add a font size field
         * @param label
         * @param fontString
         * @returns {*}
         */
        addFontSizeField: function (label, fontString) {
            return this._addField(
                'wysiwyg.editor.components.inputs.font.FontSize',
                this.getSkinFromSet('FontSize'),
                {
                    labelText: label,
                    value: fontString
                }
            );
        },
        /**
         * Add a font stye field
         * @param label
         * @param fontString
         * @returns {*}
         */
        addFontStyleField: function (label, fontString) {
            return this._addField(
                'wysiwyg.editor.components.inputs.font.FontStyle',
                this.getSkinFromSet('FontStyle'),
                {
                    labelText: label,
                    value: fontString
                }
            );
        },
        /**
         * Add font family field
         * @param label
         * @param fontString
         * @returns {*}
         */
        addFontFamilyField: function (label, fontString,showInOnLine) {
            return this._addField(
                'wysiwyg.editor.components.inputs.font.FontFamily',
                this.getSkinFromSet('FontFamily'),
                {
                    labelText: label,
                    value: fontString,
                    showLabelAndBoxOneLine:showInOnLine
                }
            );
        },
        /**
         * BorderRadius Generator
         */
        /**
         * Add a border radius field
         * @param label
         * @param radiusString
         * @returns {*}
         */
        addBorderRadiusField: function (label, radiusString) {
            return this._addField(
                'wysiwyg.editor.components.inputs.BorderRadiusInput',
                this.getSkinFromSet('BorderRadius'),
                {
                    labelText: label,
                    radiusString: radiusString
                }
            );
        },

        /**
         * Add a box shadow field
         * @param label
         * @param dialogOptions
         * @param toolTipId
         * @returns {*}
         */
        addBoxShadowField: function (label, dialogOptions, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.BoxShadowInput',
                this.getSkinFromSet('BoxShadow'),
                {
                    labelText: label,
                    hasColor: dialogOptions && dialogOptions.hasColor,
                    hasInset: dialogOptions && dialogOptions.hasInset,
                    hasDirection: dialogOptions && dialogOptions.hasDirection,
                    toolTip: {
                        toolTipId: toolTipId
                    }
                }
            );
        },

        /**
         * Add a circular slider field
         * @param label
         * @param hideInput
         * @param updateOnEnd
         * @param toolTipId
         * @returns {*}
         */
        addCircleSliderField: function (label, hideInput, updateOnEnd, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.CircleSlider',
                this.getSkinFromSet('CircleSlider'),
                {
                    labelText: label,
                    hideInput: hideInput,
                    updateOnEnd: updateOnEnd,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add a color selector field
         * @param label
         * @param colorValue
         * @param colorSource
         * @param alpha
         * @param toolTipId
         * @returns {*}
         */
        addColorSelectorField: function (label, colorValue, colorSource, alpha, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ColorSelectorField',
                this.getSkinFromSet('ColorSelectorField'),
                {
                    labelText: label,
                    colorValue: colorValue,
                    colorSource: colorSource,
                    alpha: alpha,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: false,
                        toolTipGetter: function () {
                            return this._skinParts.adjustButton;
                        }
                    }
                }
            );
        },

        addTPASettingsButton: function (buttonLabel) {

            this.addInputGroupField(function () {
                this.addButtonField(null, buttonLabel, null, null, 'blueWithArrow', null, null, 'WEditorCommands.OpenTPASettingsDialog');
            });
        },

        /**
         * Add a color selection button field
         * @param colorName
         * @param colorObj
         * @returns {*}
         */
        addColorSelectorButtonField: function (colorName, colorObj) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ColorSelectorButtonField',
                this.getSkinFromSet('ColorSelectorButton'),
                {
                    colorName: colorName,
                    colorObj: colorObj
                }
            );
        },

        /**
         * Add a font selecotr button field
         * @param fontLabel
         * @param fontName
         * @returns {*}
         */
        addFontSelectorField: function (fontLabel, fontName,propertyName) {
            return this._addField(
                'wysiwyg.editor.components.inputs.font.FontSelectorField',
                this.getSkinFromSet('FontSelectorField'),
                {
                    labelText: fontLabel,
                    fontName: fontName,
                    propertyName:propertyName
                }
            );
        },
        addFontFormatStyledField: function (label, fontString) {
            return this._addField(
                'wysiwyg.editor.components.inputs.font.FontStyledFormat',
                'wysiwyg.editor.skins.inputs.font.FontStyledFormatSkin',
                {
                    labelText: label,
                    value: fontString
                }
            );
        },

        _createStylePanel: function (styles) {
            this.addStyleSelector();
        },

        /**
         * Add a change/add audio field
         * @param label
         * @param buttonText
         * @param buttonTextWhenNoSelectedItem
         * @param defaultEmptyItemText
         * @param galleryConfigID
         * @param deleteText
         * @param skinGroup
         * @param toolTipId
         * @returns {*}
         */
        addAudioField: function (label, buttonText, buttonTextWhenNoSelectedItem, defaultEmptyItemText, galleryConfigID, deleteText, skinGroup, toolTipId) {
            return this._addField(
                'wysiwyg.editor.components.inputs.AudioInput',
                this.getSkinFromSet('AudioInput', skinGroup),
                {
                    labelText: label,
                    buttonText: buttonText,
                    buttonTextWhenNoSelectedItem: buttonTextWhenNoSelectedItem,
                    defaultEmptyItemText: defaultEmptyItemText,
                    galleryConfigID: galleryConfigID,
                    deleteText: deleteText,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add style selector field
         * @param buttonLabel
         * @param optionalTargetComponentId
         * @param skipToAdvanced
         */
        addStyleSelector: function (buttonLabel, optionalTargetComponentId, skipToAdvanced) {
            var params = {};
            var changeStyleLabel = buttonLabel || this._translate(this.getStyleButtonLabel(), "Change Style");
            var targetCompId = optionalTargetComponentId || this._previewComponent.getComponentId();

            this.addInputGroupField(function (panel) {
                this.addButtonField(null, changeStyleLabel, null, null, 'blueWithArrow')
                    .addEvent(Constants.CoreEvents.CLICK, function () {
                        var pos = W.Utils.getPositionRelativeToWindow(this._skinParts.view);
                        var cmd;
                        if (skipToAdvanced) {
                            cmd = W.Commands.getCommand("WEditorCommands.CustomizeComponentStyle");
                            params.editedComponent = this._previewComponent;
                        } else {
                            cmd = W.Commands.getCommand("WEditorCommands.ChooseComponentStyle");
                            params.editedComponentId = targetCompId;
                        }

                        params.left = pos.x;
                        cmd.execute(params);
                    });
            });
        },

        getStyleButtonLabel: function() {
            return "CHOOSE_STYLE_TITLE";
        },

        /**
         * Add a page style selector field
         * @param buttonLangKey
         * @param closeAllOtherPanels
         */
        addPageStyleSelector: function (buttonLangKey, closeAllOtherPanels) {
            var currentPageId = this.injects().Preview.getPreviewCurrentPageId();
            var buttonText = this._translate(buttonLangKey, 'Change Page Style');
            this.addStyleSelector(buttonText, currentPageId, false);
        },

        /**
         * Dispose this panel and it's fields
         */
        dispose: function () {
            this.disposeFields();
            this.parent();
        },

        /**
         * Override to create the various fields
         */
        _createFields: function (panel) {
            //Interface
        },

        /**
         * Add visibility conditions to a panel
         * @param conditions
         */
        addVisibilityConditions: function (conditions) {
            var i, len;
            for (i = 0, len = conditions.length; i < len; i++) {
                var conditionObj = conditions[i];
                this.addVisibilityCondition(conditionObj.ref, conditionObj.predicate);
            }
        },

        /**
         * Add a single visibility condition to a panel
         * @param fieldInputProxy
         * @param visibilityPredicate
         */
        addVisibilityCondition: function (fieldInputProxy, visibilityPredicate) {
            this._addCondition(fieldInputProxy, function () {
                //called on input logic
                this.setCollapsed(!visibilityPredicate());
            });
        },

        /**
         * Add enable/disable initial state to a field of a panel
         * @param fieldInputProxy
         * @param visibilityPredicate
         */
        addEnabledCondition: function (fieldInputProxy, visibilityPredicate) {
            this._addCondition(fieldInputProxy, function () {
                //called on input logic
                var isEnabled = visibilityPredicate();
                if (isEnabled) {
                    this.enable();
                } else {
                    this.disable();
                }
            });
        },

        _addCondition: function (fieldInputProxy, actionCallBack) {
            fieldInputProxy.runWhenReady(function (inputLogic) {
                if (this._data) { //a component might not have data
                    this._data.on(Constants.DataEvents.DATA_CHANGED, inputLogic, actionCallBack);
                }

                var componentProperties = this._previewComponent.getComponentProperties();
                if (componentProperties) {
                    componentProperties.on(Constants.DataEvents.DATA_CHANGED, inputLogic, actionCallBack);
                }

                // run for the first time right away (in case there's default data)
                actionCallBack.call(inputLogic);
            }.bind(this));

            return fieldInputProxy;
        },

        /**
         * enable panel
         */
        enable: function () {
            this.parent();
            this._updateChildrenState();
        },
        /**
         * disable panel
         */
        disable: function () {
            this.parent();
            this._updateChildrenState();
        },

        _updateChildrenState: function () {
            if (this._isEnabled) {
                this._fieldsProxies.forEach(function (fieldComp) {
                    if (fieldComp.isEnableDisableUpdateOn()) {
                        fieldComp.enable();
                    }
                });
            } else {
                this._fieldsProxies.forEach(function (fieldComp) {
                    if (fieldComp.isEnableDisableUpdateOn()) {
                        fieldComp.disable();
                    }
                });
            }
        },

        _translate: function (key, fallback) {
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', key, fallback);
        },


        /**
         * add dialog checkbox
         * Experiment PageSecurity.New was promoted to feature on Thu Oct 18 11:18:51 IST 2012
         * @param label
         * @param toolTipId
         * @param dialogObj
         * @returns {*}
         */
        addDialogCheckBoxField: function (label, toolTipId, dialogObj) {
            return this._addField(
                'wysiwyg.editor.components.inputs.DialogCheckBox',
                this.getSkinFromSet('DialogCheckBox'),
                {
                    checkBoxlabelText: label,
                    previewComponent: this._previewComponent,
                    dialogHeight: dialogObj.dialogHeight,
                    dialogWidth: dialogObj.dialogWidth,
                    dialogClass: dialogObj.dialogClass,
                    dialogSkin: dialogObj.dialogSkin,
                    dialogTitle: dialogObj.dialogTitle,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add an icon
         * @param spriteSrc
         * @param spriteOffset
         * @param spriteSize
         * @param toolTipId
         */
        addIcon: function (spriteSrc, spriteOffset, spriteSize, toolTipId) {
            this.addLabel('', undefined, undefined, spriteSrc, spriteOffset, spriteSize, toolTipId);
        },

        /**
         * Add a mobile preview
         * @param label
         * @param optionList
         * @param defaultValue
         * @param group
         * @param display
         * @returns {*}
         */
        addMobilePreview: function (label, optionList, defaultValue, group, display) {
            return this._addField(
                'wysiwyg.editor.components.inputs.MobilePreviewInput',
                'wysiwyg.editor.skins.inputs.MobilePreviewInputSkin',
                {
                    labelText: label,
                    presetList: optionList,
                    defaultValue: defaultValue,
                    group: group,
                    display: display
                }
            );
        },

        /**
         *
         * @param thumbnail
         * @returns {*}
         */
        addBgPresetSelector: function (thumbnail, index) {
            return this._addField(
                'wysiwyg.editor.components.inputs.bg.BgPresetSelector',
                'wysiwyg.editor.skins.inputs.bg.BgPresetSelectorSkin',
                {
                    thumbnail: thumbnail,
                    index: index
                }
            );
        },

        /**
         *
         * @param iconURL
         * @param iconSize
         * @param label
         * @returns {*}
         */
        addMobileOrDesktopViewSelectorButton: function (iconURL, iconSize, label) {
            return this._addField(
                'wysiwyg.editor.components.inputs.MobileOrDesktopViewSelectorButton',
                'wysiwyg.editor.skins.inputs.MobileOrDesktopViewSelectorButtonSkin',
                {
                    labelText: label,
                    iconSize: iconSize,
                    iconURL: iconURL
                }
            );
        },

        onBeforeShow: function () {
        },

        /**
         *
         * @param proxyInputs
         * @param inputGroup
         * @param propTitle
         * @param propName
         * @returns {*}
         */
        createColorSelector: function (proxyInputs, inputGroup, propTitle, propName) {
            var styleData = this._previewComponent.getStyle();
            var colorSource = styleData.getPropertySource(propName);
            var color = styleData.getProperty(propName);
            var alpha = styleData.getPropertyExtraParamValue(propName, 'alpha');
            var colorSelectorField = inputGroup.addColorSelectorField(
                propTitle,
                color,
                colorSource,
                alpha,
                'Edit_Style_button_to_Customize_Color_ttid'
            );

            colorSelectorField.addEvent('colorChanged', function (event) {
                var color = event.color;
                styleData.setPropertyExtraParamValue(propName, 'alpha', 1, true);
                styleData.changePropertySource(propName, color.toString(), event.source);
            }.bind(this));

            colorSelectorField.addEvent('adjustmentChanges', function (event) {
                styleData.setPropertyExtraParamValue(propName, 'alpha', event.alpha, true);
            }.bind(this));

            return colorSelectorField;
        },

        /**
         *
         * @param label
         * @param min
         * @param max
         * @param step
         * @param hideInput
         * @param propName
         * @returns {*}
         */
        createSlider: function (label, min, max, step, hideInput, propName) {
            var styleData = this._previewComponent.getStyle();
            var propertySource = styleData.getPropertySource(propName);
            var value = styleData.getProperty(propName);
            var sizeSelector = this.addSliderField(label, min, max, step, hideInput);
            var size = new this.imports.Size(value);

            sizeSelector.addEvent('inputChanged', function (event) {
                var newSize = event.value;
                if (propertySource === 'value') {
                    size.setAmount(newSize);
                    styleData.setProperty(propName, size.getCssValue());
                }
            });
            sizeSelector.setValue(size.getAmount());

            return sizeSelector;

        },

        /**
         * Add language selctor
         * @param label
         * @param lang
         * @param iconObj
         * @param toolTipId
         * @param skinGroup
         * @returns {*}
         */
        addLanguageSelectionField: function (label, lang, iconObj, toolTipId, skinGroup) {
            return this._addField(
                'wysiwyg.editor.components.inputs.LanguageSelection',
                this.getSkinFromSet('LanguageSelection', skinGroup),
                {
                    labelText: label,
                    iconObj: iconObj,
                    lang: lang,
                    toolTip: {
                        toolTipId: toolTipId,
                        addQuestionMark: false,
                        toolTipGetter: function () {
                            return this._skinParts.tooltipArea;
                        }
                    }
                }
            );
        },

        /**
         * Add change/add shape field
         * @param buttonText
         * @param mgCallback
         * @param commandSource
         * @returns {*}
         */
        addShapeField: function (buttonText, mgCallback, commandSource) {
            return this._addField(
                'wysiwyg.editor.components.inputs.ImageInput',
                this.getSkinFromSet('ImageInput', null),
                {
                    labelText: null,
                    width: null,
                    height: null,
                    buttonText: buttonText,
                    galleryConfigID: 'photos',
                    i18nPrefix: 'shape',
                    selectionType: 'single',
                    mediaType: 'picture',
                    mgCallback: mgCallback,
                    commandSource: commandSource,
                    publicMediaFile: 'shapes',
                    deleteText: false,
                    hasPrivateMedia: false,
                    toolTip: {
                        toolTipId: null,
                        addQuestionMark: true,
                        toolTipGetter: function () {
                            return this._skinParts.label;
                        }
                    }
                }
            );
        },

        /**
         * Add a readonly progress bar
         * @param label
         * @param height
         * @param color
         * @param bgImage
         * @param initialPercent
         * @param skingroup
         * @returns {*}
         */
        addProgressBar: function(label, height, color, bgImage, initialPercent, skingroup){
            return this._addField(
                'wysiwyg.editor.components.inputs.ProgressBarInput',
                this.getSkinFromSet('ProgressBarInput', skingroup),
                {
                    label: label,
                    height: height,
                    color: color,
                    bgImage: bgImage,
                    initialPercent: initialPercent
                }
            );
        },

        /**
         * Add a 'Select Background' button to panel.
         * @param buttonLabel the label of the button (optional).
         * @param senderName the 'src'' to be sent when WEditorCommands.ShowBackgroundDesignPanel is fired.
         */
        addBackgroundSelector: function(buttonLabel, senderName) {
            var changeStyleLabel = buttonLabel || this._translate('CHANGE_PAGE_BACKGROUND');

            var $this = this ;
            this.addInputGroupField(function (panel) {
                this.addButtonField(null, changeStyleLabel, null, null, 'default')
                    .addEvent(Constants.CoreEvents.CLICK, function () {
                        var pos = $this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.view);
                        $this.resources.W.Commands.executeCommand('WEditorCommands.Design') ;
                        $this.resources.W.Commands.executeCommand('WEditorCommands.ShowBackgroundDesignPanel', {src: senderName}) ;
                    });
            });
        }
    });
});
