define.component('wysiwyg.editor.components.panels.design.AdvancedStyling', function (componentDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = componentDefinition,
        CONTROLS = 'controls',
        SKIN = 'skin';

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Preview', 'W.Resources', 'W.Data', 'W.UndoRedoManager', 'W.Commands', 'W.Utils', 'W.Experiments']);

    def.utilize(['core.utils.css.BoxShadow', 'core.utils.css.Size','core.utils.css.Font', 'wysiwyg.editor.components.panels.design.AdvancedStyleChangeTracker']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.binds(['_updateSkinListDataItem', '_skinSelected', '_resetAndRebuildSkinTree', '_onDialogOpened', '_onDialogClosing','_fontSelectorCreated']);

    def.statics({LineBreak: null});

    def.dataTypes(['']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            if (args.selectedComponent) {
                this._selectedComp = args.selectedComponent;
                this._previewComponent = this._selectedComp;
            } else {
                throw new Error('args.selectedComponent is missing');

                // ToDo: report error
            }
            this._fieldTree = [];
            this._previouslySetColors = {};
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('dialogOpened', this._onDialogOpened);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            this._closeCallback = args.closeCallback || null;
            this._fontSelectorDefered = Q.defer();

            this.getViewNode().on(Constants.CoreEvents.MOUSE_ENTER, this, function() {
                W.Editor.getComponentEditBox().setState('styleChangeOpacity', 'opacityLevel');
            });
            this.getViewNode().on(Constants.CoreEvents.MOUSE_LEAVE, this, function() {
                W.Editor.getComponentEditBox().setState('fullOpacity', 'opacityLevel');
            });

            this._changeTracker = new this.imports.AdvancedStyleChangeTracker(this._previewComponent, args.undoRedoSubType);
            this._openDialogUndoRedoId = null;
            this._changeStyleListeners = {};
            this._skinGallery = null;
            this._skinGalleryLogic = null;
            this._undoRedoSubType = args.undoRedoSubType;
        },

        _onDialogOpened: function (event) {
            this._changeTracker.startTracking();
            this._openDialogUndoRedoId = this._commitDialogOpenedTransaction(event.dialog);
            W.Editor.setKeysEnabled(true);
        },

        _onDialogClosing: function (event) {
            var style = this._previewComponent.getStyle(),
                urm = this.injects().UndoRedoManager;

            this._changeTracker.stopTracking();

            if (event.result && event.result === 'CANCEL') {
                this._previouslySetColors = {};
                style.resetStyleFromData(this._changeTracker._originalStyleData, this._changeTracker._originalSkinClass);
                urm.removeTransactionAndAfter(this._openDialogUndoRedoId);
            } else {
                urm.removeTransaction(this._openDialogUndoRedoId);
            }

            W.Editor.getComponentEditBox().setState('fullOpacity', 'opacityLevel');

            if (typeof this._closeCallback === 'function') {
                this._closeCallback(event);
            }
        },

        _commitDialogOpenedTransaction: function (dialog) {
            var data = {
                    data: {
                        subType: this._undoRedoSubType,
                        changedComponentIds: [this._previewComponent.getComponentId()],
                        dialog: dialog
                    }
                },
                transOwner = {},
                urm = this.injects().UndoRedoManager,
                commands = this.injects().Commands;

            urm.startTransaction(transOwner);
            commands.executeCommand('WEditorCommands.AdvancedStylePopupOpened', data);
            return urm.endTransaction(transOwner);
        },

        _createFields: function () {
            var resources = this.injects().Resources;

            this._skinItem = this.resources.W.Data.createDataItem({'items': [], type: 'list'});
            this._skinGallery = this.addSelectionListInputFieldWithDataProvider(resources.get('EDITOR_LANGUAGE', "REPLACE_COMPONENT_SKIN"), this._skinItem,
                {
                    type: 'wysiwyg.editor.components.ThumbGallery',
                    skin: 'wysiwyg.editor.skins.ThumbGallerySkin'
                },
                {
                    type: 'wysiwyg.editor.components.ThumbGalleryItem',
                    skin: 'wysiwyg.editor.skins.ThumbGalleryItemSkin',
                    numRepeatersInLine: 4
                });

            this._skinGalleryLogic = null;
            this._skinGallery.runWhenReady(function (logic) {
                this._skinGalleryLogic = logic;
            }.bind(this));

            this._skinGallery.addEvent('inputChanged', this._skinSelected);

            this.setupComponentModeParams();
        },

        _addUIUpdaterForSkinGallery: function () {
            this._changeTracker.clearUIUpdateHandlers(SKIN);
            this._changeTracker.createFromStyleDataToUiUpdater(function styleDataChanged() {
                this._resetAndRebuildSkinTree();
                this._setSelectedSkinInGallery(this._styleData.getSkin());
                //var skinName = this._styleData.getSkin();
                //this._skinGallery.setValue({ value: skinName });
            }.bind(this), SKIN);
        },

        //Experiment StyleNS.New was promoted to feature on Mon Aug 20 19:25:59 IDT 2012
        setupComponentModeParams: function () {
            var styleName = this._selectedComp.getStyle().getId();
            this._styleSelected({value: styleName});
        },

        _styleSelected: function (event) {
            this._resetFieldTree();
            var styleName = event.value,
                compName = this._selectedComp.$className,
                that = this,
                selectedCompConfig = this.resources.W.Preview.getPreviewManagers().Components.getComponentInformation(compName),
                componentsSkins = selectedCompConfig && selectedCompConfig.get('skins'),
                skinList = {},
                wrapper,
                hasSkinGroups;

            if (componentsSkins) {
                skinList = {};
                wrapper = _(componentsSkins);
                hasSkinGroups = wrapper.some(function (skinObj) {
                    return !!skinObj.group;
                });
                skinList[compName] = wrapper
                    .filter(function (skinObj) {
                        return !hasSkinGroups || skinObj.group === that._selectedComp.skinGroup;
                    })
                    .sortBy(function (skinObj) {
                        return skinObj.index;
                    })
                    .map(function (paramObject) {
                        return _.findKey(componentsSkins, paramObject);
                    })
                    .value();

                this._getSkinListAndUpdateDataItem(skinList, styleName);
            } else {
                this.resources.W.Data.getDataByQuery("#SKINS", function (componentsSkins) {
                    if (!componentsSkins || !componentsSkins.get('components')) {
                        return this.resources.W.Utils.debugTrace("WEditor: missing component data or data list");
                    }
                    this._getSkinListAndUpdateDataItem(componentsSkins.get('components'), styleName);
                }.bind(this));
            }
        },

        _getSkinListAndUpdateDataItem: function (componentsSkins, styleName) {
            var previewThemeManager = this.injects().Preview.getPreviewManagers().Theme,
                styleAvailable,
                styleNameSpace,
                skinName;

            this._skinList = componentsSkins;
            styleAvailable = previewThemeManager.isStyleAvailable(styleName);
            if (styleAvailable) {
                previewThemeManager.getStyle(styleName, this._updateSkinListDataItem);
            } else {
                styleNameSpace = this._selectedComp.getStyleNameSpace();
                skinName = this._skinList[styleNameSpace][0];
                previewThemeManager.createStyle(styleName, styleNameSpace, skinName, this._updateSkinListDataItem);
            }
        },

        _updateSkinListDataItem: function (styleData) {
            var compName = this._selectedComp.$className,
                selectedCompConfig = this.resources.W.Preview.getPreviewManagers().Components.getComponentInformation(compName),
                skinDescriptionMap = selectedCompConfig && selectedCompConfig.get('skins');

            if (skinDescriptionMap) {
                this._updateSkinGallery(skinDescriptionMap, styleData);
            } else {
                this.resources.W.Data.getDataByQuery("#SKIN_DESCRIPTION", function (skinDescription) {
                    var skinDescriptionMap = skinDescription.get('skins');
                    this._updateSkinGallery(skinDescriptionMap, styleData);
                }.bind(this));
            }
        },

        _updateSkinGallery: function (skinDescriptionMap, styleData) {
            this._styleData = styleData;
            this._changeTracker.setStyleData(styleData);
            this._addUIUpdaterForSkinGallery();

            var styleNameSpace = this._selectedComp.getStyleNameSpace(),
                compSkins = this._skinList[styleNameSpace],
                optionList = [],
                selectedSkin = this._styleData.getSkin(),
                i,
                compSkinDescription,
                compIcon;

            if (!compSkins) {
                //todo: see how to get the component type and pass it as c1. for now, let's at least report that we got here
                LOG.reportError(wixErrors.NO_SKIN, 'AdvancedStyling', '_updateSkinGallery', 'no skins were provided for this component type!');
            } else {
                for (i = 0; i < compSkins.length; i++) {
                    if (!skinDescriptionMap[compSkins[i]]) {
                        //todo: see how to get the component type and pass it too. for now, let's at least report that we got here, and the skin name
                        LOG.reportError(wixErrors.NO_SKIN, 'AdvancedStyling', '_updateSkinGallery', 'missing skin: ' + compSkins[i]);
                        continue;
                    }
                    if (this._shouldExcludeSkinIcon(skinDescriptionMap[compSkins[i]])) {
                        continue;
                    }
                    compSkinDescription = (skinDescriptionMap[compSkins[i]] && skinDescriptionMap[compSkins[i]].description) || '';
                    compIcon = this.injects().Config.getServiceTopologyProperty('staticSkinUrl') + (skinDescriptionMap[compSkins[i]] && skinDescriptionMap[compSkins[i]].iconUrl) || '';
                    optionList[i] = {value: compSkins[i], label: compSkinDescription, iconUrl: compIcon};
                    if (selectedSkin === compSkins[i]) {
                        this._skinGallery.selectItemAtIndex(i);
                    }
                }
                this._skinItem.setData({type: 'list', 'items': optionList}, false);

                this._skinItem.setData({type: 'list', 'items': _.compact(optionList)}, false);

                //hide skins if there is only one (#WOH-959)
                if (compSkins.length === 1) {
                    this._skinGallery.collapse();
                }
            }

            this._resetAndRebuildSkinTree();

        },

        _setSelectedSkinInGallery: function (skinName) {
            var sList,
                i;

            if (!this._skinGalleryLogic) {
                return;
            }

            sList = this._skinItem.getData().items;

            for (i = 0; i < sList.length; i++) {
                if (sList[i].value === skinName) {
                    this._skinGalleryLogic.selectAtIndexAndUpdate(i);
                    return;
                }
            }
        },

        _shouldExcludeSkinIcon: function(iconParams) {
            var skinExperiment = iconParams.experimentInclude;
            return skinExperiment && !this.resources.W.Experiments.isDeployed(skinExperiment);
        },

        _skinSelected: function (event) {
            var skinName = event.value.value || event.value.getData().value,
                prop;

            this.resources.W.Preview.getPreviewManagers().Skins.getSkin(skinName, function (skin) {
                this._changeTracker.createFromUiToStyleDataUpdater(function () {
                    this._styleData.setSkin(skin);

                    //StylePerComponent: If Current color different than theme color, prefer current
                    for (prop in this._previouslySetColors) {
                        if (this._styleData.getProperty(prop)) {
                            //TODO: when merging, it's better if this code is in SkinParamMapper
                            this._styleData.changePropertySource(prop, this._previouslySetColors[prop].value, this._previouslySetColors[prop].source);
                        }
                    }
                }.bind(this))();

                this._resetAndRebuildSkinTree();
            }.bind(this));
        },

        _resetAndRebuildSkinTree: function () {
            this._resetFieldTree();
            this._buildStyleGui(this._styleData);
        },


        _buildStyleGui: function (styleData) {
            var stylePropertiesAndGroups,
                group;

            this._changeTracker.clearUIUpdateHandlers(CONTROLS);

            stylePropertiesAndGroups = this._classifyStyleProperties(styleData);

            for (group in stylePropertiesAndGroups) {
                this._createGroupTree(group, stylePropertiesAndGroups[group], styleData);
            }
            this.trigger('innerDialogResize');
        },

        _classifyStyleProperties: function (styleData) {
            var groupedProperties = {};
            var colorProperties = [];
            var fontProperties = [];
            var radiusProperties = [];
            var additionalProperties = [];
            var styleProperties = styleData.getProperties();
            for (var styleProp in styleProperties) {
                var propType = styleData.getPropertyType(styleProp);
                if (propType == Constants.SkinParamCssTypesToGeneralTypesMap.color) {
                    colorProperties.push(styleProp);
                } else if (propType == Constants.SkinParamCssTypesToGeneralTypesMap.cssFont) {
                    fontProperties.push(styleProp);
                } else if (propType == Constants.SkinParamCssTypesToGeneralTypesMap.cssBorderRadius) {
                    radiusProperties.push(styleProp);
                } else if (propType == Constants.SkinParamCssTypesToGeneralTypesMap.size || propType == Constants.SkinParamCssTypesToGeneralTypesMap.boxShadow) {
                    additionalProperties.push(styleProp);
                }
            }
            if (colorProperties.length > 0) {
                groupedProperties[Constants.AdvancedStyling.TYPE_COLORS] = colorProperties;
            }
            if (fontProperties.length > 0) {
                groupedProperties[Constants.AdvancedStyling.TYPE_FONTS] = fontProperties;
            }
            if (radiusProperties.length > 0) {
                groupedProperties[Constants.AdvancedStyling.TYPE_RADIUS] = radiusProperties;
            }
            if (additionalProperties.length > 0) {
                groupedProperties[Constants.AdvancedStyling.TYPE_ADDITIONAL] = additionalProperties;
            }

            var groups = [];
            var styleGroups = styleData.getGroups();
            for (var group in styleGroups) {
                var groupStyleData = styleGroups[group];
                if (!this._isGroupEmpty(groupStyleData)) {
                    groups.push({groupName: group, groupStyleData: groupStyleData});
                }
            }
            if (groups.length > 0) {
                groupedProperties[Constants.AdvancedStyling.TYPE_GROUPS] = groups;
            }
            return groupedProperties;
        },

        _isGroupEmpty: function (group) {
            var styleProperties = group.getProperties();
            for (var styleProp in styleProperties) {
                var type = group.getPropertyType(styleProp);
                if (type == Constants.SkinParamCssTypesToGeneralTypesMap.color ||
                    type == Constants.SkinParamCssTypesToGeneralTypesMap.cssFont ||
                    type == Constants.SkinParamCssTypesToGeneralTypesMap.cssBorderRadius ||
                    type == Constants.SkinParamCssTypesToGeneralTypesMap.size ||
                    type == Constants.SkinParamCssTypesToGeneralTypesMap.boxShadow) {
                    return false;
                }
            }
            var styleGroups = group.getGroups();
            for (var subGroup in styleGroups) {
                return this._isGroupEmpty(subGroup);
            }
            return true;
        },

        _createGroupTree: function (groupType, group, styleData) {
            //var panelContext = this;
            var groupTree;
            var typeLabel;
            var resources = this.injects().Resources;
            switch (groupType) {
                case Constants.AdvancedStyling.TYPE_COLORS:
                    typeLabel = this.addLabel(resources.get('EDITOR_LANGUAGE', "ADVANCED_COLORS"));
                    groupTree = this.addInputGroupField(function (panelContext) {
                        //StylePerComponent: pass context to build function
                        panelContext._buildColorGroup.call(this, group, styleData, panelContext._previouslySetColors, panelContext._changeTracker);
                    });
                    break;

                case Constants.AdvancedStyling.TYPE_FONTS:
                    typeLabel = this.addLabel(resources.get('EDITOR_LANGUAGE', "ADVANCED_FONTS"));
                    groupTree = this.addInputGroupField(function (panelContext) {
                        this.addBreakLine();
                        panelContext._buildFontGroup.call(this, group, styleData, panelContext._changeTracker);
                    });
                    break;
                case Constants.AdvancedStyling.TYPE_RADIUS:
                    this._buildRadiusGroups(group, styleData, this._changeTracker);
                    break;
                case Constants.AdvancedStyling.TYPE_ADDITIONAL:
                    typeLabel = this.addLabel(resources.get('EDITOR_LANGUAGE', "ADVANCED_ADDITIONAL"));
                    groupTree = this.addInputGroupField(function (panelContext) {
                        this.addBreakLine();
                        panelContext._buildAdditionalConfigsGroup.call(this, group, styleData, panelContext, panelContext._changeTracker);
                    });
                    break;
                //
                case Constants.AdvancedStyling.TYPE_GROUPS:
                    for (var i = 0; i < group.length; i++) {
                        var groupLabel = this.addLabel(group[i].groupName);
                        this._buildStyleGui(group[i].groupStyleData);
                        this._fieldTree.push(groupLabel);
                    }
                    break;

                default:
                    break;
            }

            if (groupTree) {
                this._fieldTree.push(groupTree);
            }
            if (typeLabel) {
                this._fieldTree.push(typeLabel);
            }
        },

        _buildColorGroup: function (groupItems, styleData, previouslySetColors, changeTracker) {
            var createColorSelector = function (propName) {
                var colorValue,
                    colorSource = styleData.getPropertySource(propName),
                    isChangingColor = false,
                    colorPickerLogic,
                    alphaValue,
                    eventHandler;

                colorValue = styleData.getProperty(propName);
                colorSource = styleData.getPropertySource(propName);

                //StylePerComponent: Save color values if default is different from current
                previouslySetColors[propName] = { value: colorValue, source: colorSource };

                var colorSelectorField = this.addColorSelectorField(
                    W.Resources.get('EDITOR_LANGUAGE', styleData.getPropertyLangKey(propName)),
                    colorValue,
                    colorSource,
                    styleData.getPropertyExtraParamValue(propName, 'alpha'),
                    "Edit_Style_button_to_Customize_Color_ttid"
                );

                colorPickerLogic = colorSelectorField.getHtmlElement().getLogic();

                colorSelectorField.addEvent('colorChanged', changeTracker.createFromUiToStyleDataUpdater(function (event) {
                    var color = event.color;

                    styleData.setPropertyExtraParamValue(propName, 'alpha', 1, true);
                    styleData.changePropertySource(propName, color.toString(), event.source);

                    //StylePerComponent: Save user color changes
                    previouslySetColors[propName] = { value: color.toString(), source: event.source };

                }));

                colorSelectorField.addEvent('adjustmentChanges', changeTracker.createFromUiToStyleDataUpdater(function (event) {
                    if (!isChangingColor) {
                        styleData.setPropertyExtraParamValue(propName, 'alpha', event.alpha, true);
                    }
                }));

                eventHandler = function () {
                    colorValue = styleData.getProperty(propName);
                    colorSource = styleData.getPropertySource(propName);
                    alphaValue = styleData.getPropertyExtraParamValue(propName, 'alpha');

                    colorPickerLogic.setAlpha(alphaValue);
                    colorPickerLogic.setColor(colorValue, colorSource);
                };

                changeTracker.createFromStyleDataToUiUpdater(eventHandler, CONTROLS);
            }.bind(this);

            for (var i = 0; i < groupItems.length; i++) {
                var styleProp = groupItems[i];
                createColorSelector(styleProp);
            }
        },

        getFontSelectorPromise : function (){
            return  this._fontSelectorDefered.promise;
        },
        _fontSelectorCreated: function(compLogic){
            if (compLogic._skinParts){
                this._fontSelectorDefered.resolve(compLogic);
            }
        },
        _buildFontGroup: function (groupItems, styleData, changeTracker) {
            var createFontSelector = function (fontName) {
                var selectedFont = styleData.getProperty(fontName);
                var fontLabel = this._translate(styleData.getPropertyLangKey(fontName));
                var fontSelector = this.addFontSelectorField(fontLabel, selectedFont,fontName).runWhenReady(this._parentPanel._fontSelectorCreated);
                var fontLogic = fontSelector.getHtmlElement().getLogic();

                fontSelector.addEvent('fontChanged', changeTracker.createFromUiToStyleDataUpdater(function (event) {
                    var font = event ? event.value : "";
                    if (font){
                        var source = (font && font.indexOf("font_") == -1)? "value":"theme";
                        styleData.changePropertySource(fontName, font,source);
                    }
                }));

                changeTracker.createFromStyleDataToUiUpdater(function () {
                    selectedFont = styleData.getProperty(fontName);
                    fontLogic.setFontName(selectedFont);
                }, CONTROLS);
            }.bind(this);

            for (var i = 0; i < groupItems.length; i++) {
                var styleProp = groupItems[i];
                createFontSelector(styleProp);
            }
        },

        _buildRadiusGroups: function (radProperties, styleData, changeTracker) {
            var createRadiusGroupField = function (propName) {
                var labelValue = this._translate(styleData.getPropertyLangKey(propName)) || this._translate("ADVANCED_RADIUS");
                var label = this.addLabel(labelValue);
                var ctx = this;
                var group = this.addInputGroupField(function () {
                    this.addBreakLine();
                    ctx._buildRadiusGroup.call(this, propName, styleData, changeTracker);
                });
                this._fieldTree.push(group);
                this._fieldTree.push(label);
            }.bind(this);

            for (var i = 0; i < radProperties.length; i++) {
                var radiusProp = radProperties[i];
                createRadiusGroupField(radiusProp);
            }
        },

        _buildRadiusGroup: function (propName, styleData, changeTracker) {
            var propertySource = styleData.getPropertySource(propName),
                selectedValue,
                radiusSelector,
                themeManager = this.resources.W.Preview.getPreviewManagers().Theme,
                radiusSelectorLogic;

            if (propertySource == "theme") {
                selectedValue = themeManager.getProperty(styleData.getProperty(propName));
            } else {
                selectedValue = styleData.getProperty(propName);
            }

            radiusSelector = this.addBorderRadiusField(null, selectedValue);
            radiusSelectorLogic = radiusSelector.getHtmlElement().getLogic();

            radiusSelector.addEvent('inputChanged', changeTracker.createFromUiToStyleDataUpdater(function (event) {
                var newRadius = event.value;
                if (propertySource == "theme") {
                    //Error
                }
                if (propertySource == "value") {
                    styleData.setProperty(propName, newRadius);
                }
            }));

            changeTracker.createFromStyleDataToUiUpdater(function () {
                propertySource = styleData.getPropertySource(propName);
                if (propertySource == "theme") {
                    selectedValue = themeManager.getProperty(styleData.getProperty(propName));
                } else {
                    selectedValue = styleData.getProperty(propName);
                }

                radiusSelectorLogic.setValue(selectedValue);
            }, CONTROLS);
        },

        _buildAdditionalConfigsGroup: function (groupItems, styleData, advancedStyling, changeTracker) {
            var self = advancedStyling;

            var createAdditionalConfigurationsSelector = function (propName) {
                function getValue() {
                    if (propertySource == "theme") {
                        return self.resources.W.Preview.getPreviewManagers().Theme.getProperty(styleData.getProperty(propName));
                    } else {
                        return styleData.getProperty(propName);
                    }
                }

                var propertySource = styleData.getPropertySource(propName);
                var value = getValue();
                var label = self._translate(styleData.getPropertyLangKey(propName));

                var type = styleData.getPropertyType(propName);

                switch (type) {
                    case Constants.SkinParamCssTypesToGeneralTypesMap.size:
                        var size = new self.imports.Size(value),
                            rawParam = _.find(styleData.getRawParams(), function (i) {
                                return i.id === propName;
                            }),
                            min = 0,
                            max = 15;

                        if (rawParam && rawParam.range) {
                            min = parseInt(rawParam.range.min, 10) || 0;
                            max = parseInt(rawParam.range.max, 10) || 15;
                        }

                        var sizeSelector = this.addSliderField(label, min, max, 1, false);
                        sizeSelector.setValue(size.getAmount());
                        sizeSelector.addEvent('inputChanged', changeTracker.createFromUiToStyleDataUpdater(function (event) {
                            var newSize = event.value;
                            if (propertySource == "theme") {
                                //Error
                            }
                            if (propertySource == "value") {
                                size.setAmount(newSize);
                                styleData.setProperty(propName, size.getCssValue());
                            }
                        }));

                        changeTracker.createFromStyleDataToUiUpdater(function () {
                            var value = getValue(),
                                size = new self.imports.Size(value);
                            sizeSelector.setValue(size.getAmount());
                        }, CONTROLS);

                        break;

                    case Constants.SkinParamCssTypesToGeneralTypesMap.boxShadow:
                        var isOn = styleData.getPropertyExtraParamValue(propName, 'isOn'),
                            boxShadowField = this.addBoxShadowField(label, {hasInset: false});

                        boxShadowField
                            .setValue(value, isOn)
                            .addEvent('inputChanged', changeTracker.createFromUiToStyleDataUpdater(function (event) {
                                styleData.setProperty(propName, event.value);
                                styleData.setPropertyExtraParamValue(propName, 'isOn', !!event.isOn, true);
                            }));

                        changeTracker.createFromStyleDataToUiUpdater(function () {
                            value = getValue();
                            isOn = styleData.getPropertyExtraParamValue(propName, 'isOn');

                            boxShadowField.setValue(value, isOn);
                        }, CONTROLS);

                        break;
                }
            }.bind(this);

            for (var i = 0; i < groupItems.length; i++) {
                var styleProp = groupItems[i];
                createAdditionalConfigurationsSelector(styleProp);
            }
        },

        _resetSkinCombo: function () {
            this._skinItem.setData({type: 'list', 'items': []}, false);
            // this._skinGallery.disable();
        },

        _resetFieldTree: function () {
            for (var i = 0; i < this._fieldTree.length; i++) {
                this._fieldTree[i].dispose();
            }
            this._fieldTree = [];
        }
    });
});

