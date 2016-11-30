define.Class('wysiwyg.editor.managers.componentdeserializer.WComponentDeserializer', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.utilize(['core.managers.components.BCComponentDeserializer']);

    def.methods(/** @lends wysiwyg.editor.managers.componentdeserializer.WComponentDeserializer */{

        /**
         * @constructs
         */
        initialize:function () {
            this._desirealizer = new this.imports.BCComponentDeserializer();

            this._isReady = true;
        },

        isReady:function () {
            return this._isReady;
        },

        clone:function () {
            return new this.$class();
        },

        _repositionComponents: function (componentDescriptions, parentComponentNode, pasteToAnotherPage) {
            var componentsRightPositions = componentDescriptions.map(function (compDesc) {
                return parentComponentNode.getPosition().x + compDesc.layout.x + compDesc.layout.width;
            });
            var rightMostBorderAbsPosition = Math.max.apply(null, componentsRightPositions);

            var positionOffset = Constants.WComponentDeserializer.POSITION_OFFSET;
            if (!pasteToAnotherPage) {
                componentDescriptions.each(function (compDesc) {
                    compDesc.layout.y += positionOffset;
                    compDesc.layout.x += rightMostBorderAbsPosition + positionOffset < window.innerWidth ? positionOffset : 0;
                });
            }
            componentDescriptions.each(this._handleComponentPositionExceedingPageBottom.bind(this));
            return componentDescriptions;
        },

        _addPreviewDataItemWithId: function (id, data, dataRef) {
            for (var fieldName in dataRef) {
                if (!dataRef[fieldName].isList) {
                    var refData = dataRef[fieldName];
                    var dataRefId = refData.data.id;
                    var addedDataQuery = this._addPreviewDataItemWithId(dataRefId, refData.data, refData.dataRefs);
                    data[fieldName] = addedDataQuery;
                }
                else {
                    var items = dataRef[fieldName].items;
                    // go over data, create data items and collect if refs
                    var refList = [];
                    for (var j = 0; j < items.length; ++j) {
                        var itemData = items[j].data;
                        var dataRefId = itemData.id;
                        var itemDataRefs = items[j].dataRefs;
                        var addedItemDataQuery = this._addPreviewDataItemWithId(dataRefId, itemData, itemDataRefs);
                        refList.push(addedItemDataQuery);
                    }

                    // Add ref list to main data
                    data[fieldName] = refList;
                }
            }

            // Create main data
            return this._createPreviewPresetDataWithId(data, id);
        },

        _addPreviewPropItemWithId:function (data, propId) {
            // Clone preset data - need to be clone because the actual data is used by data item
            data = Object.clone(data);

            // Add meta data object if not set and
            if (!data.metaData) {
                data.metaData = {};
            }

            // Create data item
            return "#" + W.Preview.getPreviewManagers().ComponentData.addDataItemWithId(propId, data).getData().id;
        },

        _createPreviewPresetDataWithId: function (presetData, dataId) {
            // Clone preset data - need to be clone because the actual data is used by data item
            presetData = Object.clone(presetData);
            // Create data item
            return "#" + W.Preview.getPreviewManagers().Data.addDataItemWithId(dataId, presetData).getData().id;
        },

        _fixIdAndGenerateMap:function(componentDescriptions){
            var components = this._flattenComponentsTrees(componentDescriptions);
            var idMap = {};
            components.forEach(function(comp){ idMap[comp.id] = comp.htmlId; });
            return idMap;
        },

        _handleAnchorsOnWixified:function(componentDescriptions, idMap, keepOriginalAnchors){
            var fixAnchorTargetComponent = function(anchor){
                anchor.targetComponent = idMap[anchor.targetComponent] || anchor.targetComponent;
                return anchor;
            };
            var anchorThatNeedToBeCopied = function(anchor){
                return idMap[anchor.targetComponent] || keepOriginalAnchors;
            };
            this._flattenComponentsTrees(componentDescriptions).forEach(function(compDesc){
                var oldAnchors = compDesc.layout.anchors ? compDesc.layout.anchors.slice() : [];
                var anchors =  oldAnchors.filter(anchorThatNeedToBeCopied).map(Object.clone).map(fixAnchorTargetComponent);
                var component = W.Preview.getHtmlElement(idMap[compDesc.id]).getLogic();
                W.Preview.getPreviewManagers().Layout.attachSavedAnchorsToComponent(component, anchors);
            }.bind(this));
        },

        /** check that when pasting a component, its bottom isnt lower than
         the page bottom, since we don't want components which are not shown in all
         pages to be placed in the footer area. if this the case, place the
         component as low as possible while trying not to exceed page size.
         (if the component is bigger than the page, put the component on y=0, and enlarge the page) **/
        _handleComponentPositionExceedingPageBottom:function (componentDescription) {
            var componentBottom = componentDescription.layout.y + componentDescription.layout.height;
            var curPageComponent = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().getLogic();
            var curPageHeight = curPageComponent.getHeight();
            if (componentBottom > curPageHeight) {
                componentDescription.layout.y = curPageHeight - componentDescription.layout.height;
                if (componentDescription.layout.y < 0) {
                    componentDescription.layout.y = 0;
                    curPageComponent.setHeight(componentDescription.layout.height);
                }
            }
        },

        _fixComponentDescriptionData: function (componentDescription, keepOriginalComponentIds) {
            var compName = componentDescription.componentType.substr(componentDescription.componentType.lastIndexOf('.') + 1);
            var prefix = Constants.components.DEFAULT_PREFIX;

            componentDescription.htmlId = keepOriginalComponentIds ?
                componentDescription.id :
                W.Preview.getPreviewManagers().Utils.getUniqueId();

            if (componentDescription.data) {
                if (keepOriginalComponentIds){
                    componentDescription.uID = this._addPreviewDataItemWithId(componentDescription.dataId, componentDescription.data, componentDescription.dataRefs);
                } else {
                    componentDescription.uID = W.Editor._addPreviewDataItem(prefix, componentDescription.data, componentDescription.dataRefs);
                }
                delete componentDescription.dataQuery;
            }

            //Dont remove this ugly hack with out talking to the ugly hacker AKA nadav
            componentDescription.htmlId = (W.Editor.isPageComponent(componentDescription.componentType)) ?
                componentDescription.uID.replace('#', '') :
                componentDescription.htmlId;

            componentDescription.dataQuery = componentDescription.dataQuery || componentDescription.uID;

            if(!componentDescription.props) {
                componentDescription.propsID = componentDescription.propsID;
            } else {
                if(keepOriginalComponentIds){
                    componentDescription.propsID = this._addPreviewPropItemWithId(componentDescription.props, componentDescription.propsId);
                } else {
                    componentDescription.propsID = this._addPreviewPropItem(componentDescription.props, prefix);
                }
            }

            //StylePerComponent - if this component has a custom style, we create the style from the serialized data, and override the style id (which will now contain the new comp id)
            if (componentDescription.styleData && componentDescription.styleData.styleType === "custom") {

                var updateCompId = function(skin) {
                    // When the style is ready, attach it to the component.
                    skin.setCompId(componentDescription.htmlId);
                };

                var newStyleId;
                if(keepOriginalComponentIds){
                    newStyleId = W.Preview.getPreviewManagers().Theme.createStyleFromDataWithId(componentDescription.styleData, componentDescription.styleId, undefined, updateCompId);
                } else {
                    newStyleId = W.Preview.getPreviewManagers().Theme.createStyleFromData(componentDescription.styleData, componentDescription.htmlId, undefined, updateCompId);
                }

                componentDescription.styleId = newStyleId;
            }

            if (componentDescription.components) {
                componentDescription.components = componentDescription.components.map(function (childComp) {
                    return this._fixComponentDescriptionData(childComp, keepOriginalComponentIds);
                }.bind(this));
            }

            return componentDescription;
        },

        _flattenComponentsTrees: function (comps) {
            if (!comps) {
                return [];
            }
            return comps.reduce(function (comps, comp) {
                return comps.concat(this._flattenComponentsTrees(comp.components));
            }.bind(this), comps.slice());
        },

        _retrieveAllStyles:function(componentsDescription, stylesRetrievedCallback){
            var unretrievedStylesCount = 0;
            var that = this;
            var helpers = {
                isStyleAvailable: function(style){
                    return W.Preview.getPreviewManagers().Theme.isStyleAvailable(style);
                },

                invalidateStyle: function(style){
                    W.Preview.getPreviewManagers().Theme.invalidateStyle(style);
                },

                allStylesForComponentsAreReady: function(){
                    if(unretrievedStylesCount === 0){
                        stylesRetrievedCallback(componentsDescription);
                    }
                },

                createStyleForComponent: function(comp){
                    var dfd = Q.defer();
                    var skin = this._getSkinForStyle(comp);

                    W.Preview.getPreviewManagers().Theme.createStyle(comp.styleId, comp.componentType, skin, function (style) {
                        unretrievedStylesCount--;
                        dfd.resolve();
                    });

                    return dfd.promise;
                }.bind(that),

                checkStylesValidityAfterItWasFound:  function(components){
                    var dfd = Q.defer();
                    var styles = components.map(function(comp) { return comp.styleId; }).filter(function(style) { return !!style; });
                    var availableStyles = styles.filter(helpers.isStyleAvailable);
                    availableStyles.forEach(helpers.invalidateStyle);

                    var componentsWithUnavailableStyles = components.filter(function(comp){ return !helpers.isStyleAvailable(comp.styleId); });
                    unretrievedStylesCount += componentsWithUnavailableStyles.length;

                    if(unretrievedStylesCount > 0) {
                        var promises = componentsWithUnavailableStyles.map(helpers.createStyleForComponent);
                        Q.all(promises).then(dfd.resolve);
                    }
                    else {
                        dfd.resolve();
                    }

                    return dfd.promise;
                }
            };
            var promises = [];
            var components = this._flattenComponentsTrees(componentsDescription);
            var compStyles;
            var oldFormatComps = [];
            var newFormatComps = [];

            //Split components to new & old formats
            _.forEach(components, function(comp) {
                var compInfo = W.Preview.getPreviewManagers().Components.getComponentInformation(comp.componentType);
                if (compInfo) {//new format component
                    newFormatComps.push(comp);
                    this._setComponentStyleId(comp, compInfo.get('styles'));
                }
                else {
                    oldFormatComps.push(comp);
                }
            }, this);

            if (newFormatComps.length > 0) {
                promises.push(helpers.checkStylesValidityAfterItWasFound(newFormatComps));
            }

            if (oldFormatComps.length > 0) {
                W.Data.getDataByQuery('#STYLES', function(styleList) {
                    var styleItems = styleList.get("styleItems");
                    if (!styleList || !styleItems) {
                        promises.push(helpers.checkStylesValidityAfterItWasFound(oldFormatComps));
                    }
                    else {
                        var oldCompsWithStyleId = oldFormatComps.map(function(comp) {
                            compStyles = styleItems[comp.componentType];
                            that._setComponentStyleId(comp, compStyles);
                            return comp;
                        });
                        promises.push(helpers.checkStylesValidityAfterItWasFound(oldCompsWithStyleId));
                    }
                });
            }

            //Wait for all unavailable styles to be created
            Q.all(promises).then(helpers.allStylesForComponentsAreReady);
        },

        _setComponentStyleId: function(comp, compStyles) {
            if (compStyles && compStyles.length >= 1) {
                var defaultStyle = compStyles[0];
                comp.styleId = comp.styleId || defaultStyle;
            }
        },

        _addPreviewPropItem: function (data, idPrefix) {
            // Clone preset data - need to be clone because the actual data is used by data item
            data = Object.clone(data);

            // Add meta data object if not set and
            if (!data.metaData) {
                data.metaData = {};
            }

            // Create data item
            return "#" + W.Preview.getPreviewManagers().ComponentData.addDataItemWithUniqueId(idPrefix, data).id;
        },

        _getSkinForStyle:function (componentDescription) {
            var styleId = componentDescription.styleId;
            var skin = componentDescription.skin;
            var comp = componentDescription.componentType;

            if (styleId && W.Editor.getDefaultSkinForStyle(styleId)) {
                return W.Editor.getDefaultSkinForStyle(styleId);
            } else if (skin) {
                return skin;
            } else {
                return W.Editor.getDefaultSkinForComp(comp);
            }
        },

        _attachNewComponentToItsParent:function(parentNode, childNode){
            if(parentNode.getLogic) {
                var parentLogic = parentNode.getLogic() ;
                if(parentLogic.addChild) {
                    var childLogic = childNode.getLogic() ;
                    parentLogic.addChild(childLogic) ;
                }
            }
        },

        _createElementAppendedToParentForComponentDescription:function(parentComponentNode) {
            if(parentComponentNode && parentComponentNode.ownerDocument){
                var componentNode = parentComponentNode.ownerDocument.createElement('div');
                parentComponentNode.appendChild(componentNode);
                return componentNode;
            }
        },

        createAndAddComponents:function (parentComponentNode, componentDescriptions, pasteToAnotherPage, autoSelect, callBack, firstLevelComponentCallback, keepOriginalComponentIds, keepOriginalAnchors, dontReposition) {
            componentDescriptions = _.filter(componentDescriptions, function(compData){
                return !compData.IS_DEAD;
            });

            var repositionBeforeDesirealization = function(comps){
                return this._repositionComponents(comps, parentComponentNode, pasteToAnotherPage);
            }.bind(this);

            var fixComponentData = function(comp){
                comp.node = this._createElementAppendedToParentForComponentDescription(parentComponentNode );
                return this._fixComponentDescriptionData(comp, keepOriginalComponentIds);
            }.bind(this);

            var handleComponentsAfterTheyAreCreated = function(logics){
                var nodes = logics.map(function(logic){ return logic.getViewNode(); });
                nodes.forEach(function(node){
                    this._attachNewComponentToItsParent(parentComponentNode, node);
                }.bind(this));

                if (autoSelect) {
                    W.Editor.setSelectedComps(logics);
                }
                W.Preview.getPreviewManagers().Layout.enforceAnchors(logics, false);

                (callBack || function(){})(nodes);
                (firstLevelComponentCallback || function(){})(nodes);

                this._handleAnchorsOnWixified(componentDescriptions, idMap, keepOriginalAnchors);

                W.Preview.getPreviewManagers().Data.flagDataChange();
            }.bind(this);

            componentDescriptions = componentDescriptions.map(fixComponentData);
            if(!dontReposition){
                componentDescriptions = repositionBeforeDesirealization(componentDescriptions);
            }

            var idMap = this._fixIdAndGenerateMap(componentDescriptions);

            this._retrieveAllStyles(componentDescriptions, function(components){
                this._desirealizer.deserializeComponents(components, handleComponentsAfterTheyAreCreated);
            }.bind(this));
        },

        createAndAddComponent:function (parentComponentNode, componentDescription, pasteToAnotherPage, autoSelect, styleId, callBack) {
            if(componentDescription.IS_DEAD){
                return null;
            }
            if (autoSelect == undefined) {
                autoSelect = true;
            }

            var prepareComponents = function(component){
                var comp = Object.clone(component);
                comp = this._moveComponentIfNotPasteInAnotherPageAndReturnOriginal(pasteToAnotherPage, comp, parentComponentNode);
                this._handleComponentPositionExceedingPageBottom(comp);
                comp.node =  this._createElementAppendedToParentForComponentDescription(parentComponentNode );
                comp = this._fixComponentDescriptionData(comp);
                comp.styleId = comp.styleId || styleId;
                return comp;
            }.bind(this);

            var handleComponentsAfterCreation = function(logic, node) {
                if (!autoSelect) {
                    this._attachNewComponentToItsParent(parentComponentNode, node);
                } else {
                    this._handleUndoRedoTransactionForComponentAddition(logic, parentComponentNode);
                    this._attachNewComponentToItsParent(parentComponentNode, node);
                    this._createAndAddComponentCallback(logic);
                }
                if(logic.isContainer && logic.isContainer()){
                    var childrenLogic = logic.getChildComponents().map(function(c) { return c.$logic; });
                    W.Preview.getPreviewManagers().Layout.enforceAnchors(childrenLogic, false);
                    this._handleAnchorsOnWixified(comp.components, idMap, true);
                }
                (callBack || function(){})(logic);
            }.bind(this);

            var comp = prepareComponents(componentDescription);
            var idMap = this._fixIdAndGenerateMap([comp]);

            this._retrieveAllStyles([comp], function(components){
                this._desirealizer.deserialize(components[0], handleComponentsAfterCreation);
            }.bind(this));

            return comp;
        },

        _moveComponentIfNotPasteInAnotherPageAndReturnOriginal: function (pasteToAnotherPage, componentDescription, parentComponentNode) {
            var parentComponentLogic = parentComponentNode.getLogic();
            var parentOffset = parentComponentLogic.getInlineContentContainer().getPosition();
            var componentCenter = W.Preview.editorToPreviewCoordinates({ x: (window.getWidth() / 2), y: (window.getHeight() / 2) });
            componentCenter.x -= parentOffset.x; componentCenter.y -= parentOffset.y;
            var positionOffset = Constants.WComponentDeserializer.POSITION_OFFSET * W.Editor.getNumOfNewComponentsWithoutComponentMovement() || 0;

            if (!pasteToAnotherPage) {
                componentDescription.layout.x = Math.round(componentCenter.x - (componentDescription.layout.width / 2));
                componentDescription.layout.y = Math.round(componentCenter.y - (componentDescription.layout.height / 2)) + positionOffset;

                var componentRightBorderAbsPosition = parentComponentNode.getPosition().x + componentDescription.layout.x + componentDescription.layout.width;
                if (componentRightBorderAbsPosition + positionOffset < window.innerWidth) {
                    componentDescription.layout.x += positionOffset;
                }

                W.Editor.incrementNumOfNewComponentsWithoutComponentMovement();
            }
            return componentDescription;
        },

        _createAndAddComponentCallback:function (compLogic) {
            W.Editor.setSelectedComp(compLogic);
            W.Editor.openComponentPropertyPanels(null, false, W.Editor.isForcePropertyPanelVisible());
        },

        _handleUndoRedoTransactionForComponentAddition:function(compLogic, parentComponentNode){
            var changedComponentData = W.CompSerializer.serializeComponents([compLogic.getViewNode()], true);
            var data = {
                changedComponentIds:[compLogic.getComponentId()],
                oldState:{
                    parentId:null,
                    changedComponentData:null
                },
                newState:{
                    parentId:parentComponentNode.getLogic()._compId,
                    changedComponentData:changedComponentData
                }
            };

            W.CompDeserializer.fireEvent('onComponentAdd', {data: data});
            W.UndoRedoManager.endTransaction();
        }
    });

});
