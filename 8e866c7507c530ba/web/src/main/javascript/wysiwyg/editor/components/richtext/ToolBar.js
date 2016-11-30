/**
 * @class wysiwyg.editor.components.richtext.ToolBar
 */
define.component('wysiwyg.editor.components.richtext.ToolBar', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.richtext.BaseRichTextToolBar');

    def.utilize([
        'wysiwyg.editor.components.richtext.commandcontrollers.RTFontStyleDependentCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDependentCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTLinkCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTJustifyCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDropDownCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTColorCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDependentColorCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownShadowCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTImageCommand',
        'wysiwyg.editor.components.richtext.commandcontrollers.RTVideoCommand'
    ]);

    def.resources(['W.Commands', 'W.Data', 'W.Preview', 'W.Resources']);

    def.skinParts({
        dragArea: {type: Constants.ComponentPartTypes.HTML_ELEMENT},
        closeButton: {type: Constants.ComponentPartTypes.HTML_ELEMENT},
        bold: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -40}, iconSrc: 'richtext/icons.png'}},
        italic: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -60}, iconSrc: 'richtext/icons.png'}},
        underline: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -80}, iconSrc: 'richtext/icons.png'}},
        removeFormat: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -420}, iconSrc: 'richtext/icons.png'}},
        numberedlist: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -140}, iconSrc: 'richtext/icons.png'}},
        bulletedlist: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -120}, iconSrc: 'richtext/icons.png'}},
        indent: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -360}, iconSrc: 'richtext/icons.png'}},
        outdent: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -340}, iconSrc: 'richtext/icons.png'}},
        bidiltr: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -160}, iconSrc: 'richtext/icons.png'}},
        bidirtl: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -180}, iconSrc: 'richtext/icons.png'}},
        wixLink: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -440}, iconSrc: 'richtext/icons.png'}},
        wixUnlink: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -460}, iconSrc: 'richtext/icons.png'}},
        wixImage: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -480}, iconSrc: 'richtext/icons2.png'}},
        wixVideo: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -500}, iconSrc: 'richtext/icons2.png'}},
        foreColor: {type: 'wysiwyg.editor.components.ToolBarColorSelectorButton', argObject: {command: 'foreColor', showReset: true, biEvent: wixEvents.TXT_EDITOR_FONT_COLOR_OPEN}},
        backColor: {type: 'wysiwyg.editor.components.ToolBarColorSelectorButton', argObject: {command: 'backColor', showReset: true, colorValue: "#00000000", biEvent: wixEvents.TXT_EDITOR_BACKGROUND_FONT_COLOR}},
        formatBlock: {
            type: 'wysiwyg.editor.components.richtext.ToolBarDropDown',
            dataType: 'SelectableList',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.BasicFontButton', compSkin: 'wysiwyg.editor.skins.richtext.FontButtonSkin'},
                selectionOption: 0,
                label: 'TOOLBAR_DROP_DOWN_STYLES_LABEL',
                bottomLinks: {
                    bottomLeftLink:{
                        linkText:      'TOOLBAR_DROP_DOWN_FONTS_CUSTOMIZE_STYLES',
                        linkCommand:   'WEditorCommands.CustomizeFontsDirect',
                        commandParams:{
                            source: 'textEditor'
                        }
                    }
                },
                biEvent: wixEvents.TXT_EDITOR_STYLES_SELECTION_OPEN
            }
        },

        fontSize: {
            type: 'wysiwyg.editor.components.richtext.ToolBarWritableDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton'},
                selectionOption: 0,
                hasInput: true,
                defaultValue: 2,
                limits: {
                    min:6,
                    max:999
                },
                valuePost: "px",
                labelPost: " px",
                biEvent: wixEvents.TXT_EDITOR_FONT_SIZE_OPEN
            }
        },

        justify: {
            type: 'wysiwyg.editor.components.richtext.ToolBarDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                numberOfColumns: 4,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton', 'compStyleId': 'RTIconOptionButton'},
                selectionOption: 1,
                biEvent: wixEvents.TXT_EDITOR_TEXT_ALIGNMENT_OPEN
            }
        },

        letterSpacing: {
            type: 'wysiwyg.editor.components.richtext.ToolBarWritableDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton'},
                selectionOption: 0,
                defaultValue: 2,
                limits: {
                    min:-0.4,
                    max:3
                },
                valuePost: "em",
                biEvent: wixEvents.TXT_EDITOR_CHARACTER_SPACING
            }
        },

        lineHeight: {
            type: 'wysiwyg.editor.components.richtext.ToolBarWritableDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton'},
                selectionOption: 0,
                defaultValue: 2,
                limits: {
                    min:0.1,
                    max:9
                },
                valuePost: "em",
                biEvent: wixEvents.TXT_EDITOR_LINE_HEIGHT_OPEN
            }
        },

        fontFamily: {
            type: 'wysiwyg.editor.components.richtext.ToolBarWritableSelectableListDropDown',
            dataType: 'SelectableList',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton', 'compStyleId': 'RTFontOptionButton'},
                selectionOption: 0,
                label: 'TOOLBAR_DROP_DOWN_FONTS_LABEL',
                defaultValue: 2,
                bottomLinks: {
                    bottomLeftLink:{
                        linkText:'TOOLBAR_DROP_DOWN_FONTS_LANGUAGES_LINK',
                        linkCommand:'WEditorCommands.OpenCharacterSetsDialog',
                        commandParams:{
                            source: 'textEditor'
                        }
                    }
                },
                biEvent: wixEvents.TXT_EDITOR_FONT_SELECTION_OPEN
            }
        },

        dragFromRightArea: {type: Constants.ComponentPartTypes.HTML_ELEMENT},
        effects: {
            type: 'wysiwyg.editor.components.richtext.ToolBarDropDown',
            hookMethod: '_createDataItem',
            argObject: {
                allowOptionReselect: true,
                numberOfColumns: 3,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.richtext.RTEffectOptionButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEffectOptionButtonSkin'},
                selectionOption: 1,
                label: 'TOOLBAR_DROP_DOWN_EFFECTS_LABEL',
                fixedIcon: {
                    "ref": "richtext/icons.png",
                    "spriteOffset":{
                        x:-1,
                        y:-201
                    },
                    "size": {
                        "width": 20,
                        "height": 20
                    }
                },
                onFocusBIEvent: wixEvents.EFFECTS_MENU_OPEN,
                disable: (Browser.ie && Browser.version < 10)
            }
        },
        wixImage: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -480}, iconSrc: 'richtext/icons2.png'}},
        wixVideo: {type: 'wysiwyg.editor.components.WButton', argObject: {spriteOffset: {x: 0, y: -500}, iconSrc: 'richtext/icons2.png'}}
    });

    def.binds(['_enableDrag']);

    def.statics({
        controllersDataInfo: {
            bold: {command: 'bold', toolTipKey: 'TOOLBAR_BOLD_BUTTON', className: 'RTDualCommand', biEvent: wixEvents.TXT_EDITOR_BOLD},
            italic: {command: 'italic', toolTipKey: 'TOOLBAR_ITALIC_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_ITALIC},
            underline: {command: 'underline', toolTipKey: 'TOOLBAR_UNDERLINE_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_UNDERLINE},
            removeFormat: {command: 'removeFormat', toolTipKey: 'TOOLBAR_REMOVE_FORMAT_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_REMOVE_TEXT_FORMAT},
            numberedlist: {command: 'numberedlist', toolTipKey: 'TOOLBAR_NUMBERING_DROP_DOWN', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_NUMBERRING},
            bulletedlist: {command: 'bulletedlist', toolTipKey: 'TOOLBAR_BULLETS_DROP_DOWN', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_BULLETS},
            indent: {command: 'indent', toolTipKey: 'TOOLBAR_INCREASE_INDENT_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_INCREASE_INDENT},
            outdent: {command: 'outdent', toolTipKey: 'TOOLBAR_DECREASE_INDENT_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_DECREASE_INDENT},
            bidiltr: {command: 'bidiltr', defaultValue: 1, toolTipKey: 'TOOLBAR_LEFT_TO_RIGHT_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_LEFT_TO_RIGHT},
            bidirtl: {command: 'bidirtl', defaultValue: 2,toolTipKey: 'TOOLBAR_RIGHT_TO_LEFT_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_RIGHT_TO_LEFT},
            wixLink: {command: 'wixLink', toolTipKey: 'TOOLBAR_LINK_BUTTON', className: 'RTLinkCommand'},
            wixImage: {command: 'wixComp', toolTipKey: 'TOOLBAR_COMPONENT_ADD_IMAGE', className: 'RTImageCommand'},
            wixVideo: {command: 'wixComp', toolTipKey: 'TOOLBAR_COMPONENT_INSERT_VIDEO', className: 'RTVideoCommand'},
            wixUnlink: {command: 'wixUnlink', toolTipKey: 'TOOLBAR_UNLINK_BUTTON', className: 'RTDualCommand', biEvent:wixEvents.TXT_EDITOR_REMOVE_LINK},
            formatBlock: {command: 'formatBlock', dataKeyOfValueProperty: 'tag', toolTipKey: 'TOOLBAR_STYLE_DROP_DOWN', isFixedMenu: true, defaultValue: 'div', className: 'RTStyleDropDownCommand',biEvent:wixEvents.TXT_EDITOR_STYLE_SELECTED},
            fontFamily: {command: 'fontFamily', toolTipKey: 'TOOLBAR_FONT_DROP_DOWN', styleGetter: 'getFontFamilyWithFallbacks', isFixedMenu: true, className: 'RTFontStyleDependentCommand', biEvent:wixEvents.TXT_EDITOR_FONT_SELECTED},
            fontSize:   {dataQuery: '#CK_EDITOR_FONT_SIZES', command: 'fontSize', toolTipKey: 'TOOLBAR_FONT_SIZE_DROP_DOWN', styleGetter: 'getSize', isFixedMenu: false, labelUnits: 'px', className: 'RTStyleDependentCommand'},
            justify: {command: 'justify', dataKeyOfValueProperty: 'command', dataQuery: '#CK_EDITOR_JUSTIFICATION_TYPES', toolTipKey: 'TOOLBAR_JUSTIFY_DROP_DOWN', isFixedMenu: true, defaultValue: 'justifyleft', className: 'RTJustifyCommand', biEvent:wixEvents.TXT_EDITOR_TEXT_ALIGNMENT_CHOSEN},
            letterSpacing: {dataQuery: '#CK_EDITOR_LETTER_SPACING', command: 'letterSpacing', toolTipKey: 'TOOLBAR_LETTER_SPACING_DROP_DOWN', isFixedMenu: false, className: 'RTDropDownCommand', biEvent:wixEvents.TXT_EDITOR_CHARACTER_SPACING},
            lineHeight: {dataQuery: '#CK_EDITOR_LINE_HEIGHT', command: 'lineHeight', toolTipKey: 'TOOLBAR_LINE_HEIGHT_DROP_DOWN', isFixedMenu: false, className: 'RTDropDownCommand', biEvent: wixEvents.TXT_EDITOR_LINE_HEIGHT_OPEN},
            foreColor: {command: 'foreColor', defaultValue: '#000000', toolTipKey: 'TOOLBAR_FORE_COLOR_BUTTON', isFixedMenu: /*false*/true, styleGetter: 'getColor', className: 'RTStyleDependentColorCommand'},
            backColor: {command: 'backColor', defaultValue: 2, toolTipKey: 'TOOLBAR_BACK_COLOR_BUTTON', isFixedMenu: /*false*/true, styleGetter: 'getColor', className: 'RTColorCommand'},
            effects: {
                command: 'textShadow',
                dataQuery: '#CK_EDITOR_EFFECTS',
                toolTipKey: (Browser.ie && Browser.version < 10 ? "NOT_WORK_IN_IE" : "TOOLBAR_EFFECTS_DROP_DOWN"),
                isFixedMenu: true,
                className: 'RTDropDownShadowCommand'
            }
        },
        styleDependentControllers: ['fontFamily', 'fontSize', 'foreColor']
    });

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._view.addEvent('dblclick', function (evt) {
                evt.stopPropagation();
            });

            this._generateLinkIdFunc = args && args.generateLinkIdFunc;
            this._isPersistent = (args && args.isPersistent === false) ? false : true;
            this._isDraggable = (args && args.isDraggable === false) ? false : true;

            this.resources.W.Preview.getPreviewManagersAsync(function(managers){
                managers.Commands.registerCommandAndListener('W.CssCommands.CharacterSetChange', this, this._setFontsDropDownData);
            }.bind(this));
            this._isRichMedia = (args && args.isRichMedia === true) ? true : false;
        },

        _onAllSkinPartsReady: function () {
            //we do it here because we need to wait for the viewer for this
            this._initializeControllers();
            this._setFontsDropDownData();
            this._startListeningToStyleChange();

            window.addEvent(Constants.CoreEvents.RESIZE, this._enableDrag);
            this._skinParts.closeButton.addEvent('click', function () {
                this.resources.W.Commands.executeCommand('WEditorCommands.StopEditingText');
                LOG.reportEvent(wixEvents.TXT_EDITOR_CLOSE_PANEL, {c1: "X"});
            }.bind(this));
            if (this._isRichMedia) {
                this._skinParts.mediaDivider.removeClass('hiddenDivider');
                this._skinParts.wixImage.$view.setStyle('display', 'inline-block');
                this._skinParts.wixVideo.$view.setStyle('display', 'inline-block');
            }
        },

        _initializeControllers: function () {
            this.parent(this.controllersDataInfo, this._skinParts);
            var unlinkInstance = this._controllerInstances['wixUnlink'];
            this._controllerInstances['wixLink'].setExtraParameters(unlinkInstance, this._generateLinkIdFunc, this._isPersistent);
        },

        _startListeningToStyleChange: function() {
            this.styleDependentControllers.forEach(function(commandName) {
                var controllerInstance = this._controllerInstances[commandName];
                controllerInstance.startListeningToStyleChange(this._skinParts.formatBlock);
            }, this);
        },

        preStartEditing: function(stylesMapId) {
            //set missing data
            this._setStylesDropDownData(stylesMapId);

            //start listening to editor events
            this._initializeStateChangeListeners();
        },

        _initializeStateChangeListeners: function() {
            this._startControllersListeners();

            //in case style definition was changed between edit sessions
            this._initStyleDependantValues();
        },

        _initStyleDependantValues: function() {
            var styleCommand = 'formatBlock';
            var defaultValue = this.controllersDataInfo[styleCommand].defaultValue;
            var data = {sender: {state: defaultValue}};
            this._controllerInstances[styleCommand]._handleStateChange(data);
        },


        render: function () {
            this._enableDrag();
        },

        _enableDrag: function () {
            if (!this._isDraggable) {
                return;
            }
            var screenSize = window.getSize();
            var toolbarSize = this.getViewNode().getSize();
            var limits = {
                x: [10, screenSize.x - toolbarSize.x],
                y: [this.DRAG_OFFSET, screenSize.y - toolbarSize.y]
            };
            this._drag = new Drag.Move(this._skinParts.view, {
                handle: this._skinParts.dragArea,
                snap: 0,
                limit: limits
            });

            this._dragFromRight = new Drag.Move(this._skinParts.view, {
                handle: this._skinParts.dragFromRightArea,
                snap: 0,
                limit: limits
            });
        },

        _setStylesDropDownData: function (dataMapId) {
            this.resources.W.Data.getDataByQuery('#' + dataMapId, function (presetData) {
                var items = presetData.getData().items;
                var dropDownData = this._createAndSetDataItem('formatBlock', '#' + dataMapId, items);
                this._controllerInstances.formatBlock.setComponentData(dropDownData);
            }.bind(this));
        },

        _setFontsDropDownData: function () {
            this.resources.W.Preview.getPreviewManagersAsync(function(managers){
                var cssManager = managers.Css,
                    languagesFontLists = cssManager.getLanguagesFontsLists(),
                    items = {"default": {value: 2, label: "TOOLBAR_DROP_DOWN_DEFAULT_VALUE"}},
                    iconBgUrl = cssManager.getFontsListSpriteUrl(),
                    siteCharacterSets = cssManager.getCharacterSets(),
                    j;
                for (j = 0; j < cssManager.possibleCharacterSets.length; j++){
                    var currentCharacterSet = cssManager.possibleCharacterSets[j];
                    if (_.contains(siteCharacterSets, currentCharacterSet)){
                        var fontList = languagesFontLists[currentCharacterSet];
                        for (var i = 0; i < fontList.length; i++) {
                            var font = fontList[i];
                            if (font.permissions !== 'legacy'){
                                var name = font.displayName,
                                    fontFamily = font.cssFontFamily,
                                    index = font.spriteIndex + font.characterSets.indexOf(currentCharacterSet);
                                items['language_' + j + '_fontFamily_' + i] = {value: fontFamily, label: name, iconSrc: iconBgUrl, spriteOffset: {x: 0, y: index * (-24)}/*, iconSize:{width:163, height:24}*/};
                            }

                        }
                    }
                }
                var dropDownData = this._createAndSetDataItem('fontFamily', '#CK_EDITOR_FONT_NAMES', items);
                this._controllerInstances.fontFamily.setComponentData(dropDownData);
            }, this);
        },

        _createAndSetDataItem: function (controllerName, dataQuery, items) {
            var itemArray = this._createDropDownDataItems(controllerName, items, this.controllersDataInfo);
            var dataItemId = this._createDropDownDataItem(controllerName, dataQuery, itemArray, this.controllersDataInfo);
            var dataItem = this.resources.W.Data.getDataByQuery(dataItemId);
            this._skinParts[controllerName].setDataItem(dataItem);
            return dataItem;
        }
    });
});