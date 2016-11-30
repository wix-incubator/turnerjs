define.Class('wysiwyg.editor.managers.WComponentSerializer', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('bootstrap.utils.Events');

    def.methods({
        initialize: function(idPrefix) {

            this._initGlobalResources();
            this._getSiteSerializationCompClasses();
            this._isReady = true;
            this._idPrefix = idPrefix || '';

            this._prepareReverseMigrationMap();
        },

        //after this will stop being a global instance, we can initialize it after we have preview, there is no use for it before..
        _initGlobalResources: function() {
            var self = this;
            this._globals = {};
            this._globals.classes = this.injects().Classes;
            resource.getResourceValue('W.Preview', function(value) {
                self._globals.preview = value;
            });
            //            this._globals.preview = this.resources.W.Preview;
            this._globals.utils = this.injects().Utils;
            this._globals.commands = this.injects().Commands;
        },

        _getSiteSerializationCompClasses: function() {
            var self = this;
            resource.getResourceValue('W.Preview', function(preview){
                preview.getPreviewManagersAsync(function(previewManagers){
                    var previewCompoents = previewManagers.Components;
                    //Save a reference to Page class definition for serialization purposes
                    previewCompoents.getComponent("core.components.Page", function (classDef) {
                        self._pageClass = classDef;
                    });

                    //Just removed the reference to Container class definition
                }, this);
            });
        },

        isReady: function() {
            return this._isReady;
        },

        clone: function() {
            return new this.$class();
        },

        _isPageNode: function(itemLogic) {
            return instanceOf(itemLogic, this._pageClass);
        },

        serializeComponent: function(componentNode, serializeData, componentToExclude) {
            var itemLogic = componentNode.getLogic();
            //dead comps shouldn't be copy pasted and stuff like that
            if (itemLogic.IS_DEAD && serializeData) {
                return {IS_DEAD: true};
            }
            var serializedItem = {};
            var skinName,
                compStyle,
                compsStyleData,
                compsRawStyleData;
            // Type
            serializedItem.componentType = this.unmigrateToOldName(componentNode.get("comp"));
            if (this._isPageNode(itemLogic)) {
                serializedItem.type = "Page";
            }
            else if (itemLogic.IS_CONTAINER) {
                serializedItem.type = "Container";
            }
            else {
                serializedItem.type = "Component";
            }

            // Id
            serializedItem.id = this._getComponentId(componentNode.get('id'));

            // Skin and style
            if (componentNode.get('styleId')) {
                serializedItem.styleId = componentNode.get('styleId');

                compStyle = itemLogic.getStyle();
                if (serializeData && compStyle.getIsCustomStyle()) {
                    compsStyleData = compStyle.getDataItem();
                    compsRawStyleData = this._extractDataObject(compsStyleData).data;
                    serializedItem.styleData = Object.clone(compsRawStyleData);
                }

                skinName = compStyle ? compStyle.getSkinClassName() : componentNode.get('skin');
            }
            else {
                skinName = componentNode.get('skin');
                // fallback to first skin in #SKINS (WSkinEditorData)
                if (!skinName) {
                    skinName = W.Editor.getDefaultSkinForComp(serializedItem.componentType);
                }
            }

            serializedItem.skin = this.unmigrateToOldName(skinName) || "mobile.core.skins.InlineSkin";

            // Layout
            serializedItem.layout = this._getComponentLayout(itemLogic);

            if (!serializeData) {
                // Data Query
                var dataQuery = componentNode.get('dataquery');
                if (dataQuery) {
                    serializedItem.dataQuery = dataQuery;
                }

                // property Query
                var propertyQuery = componentNode.get('propertyQuery');
                if (propertyQuery) {
                    // BUG FIX: Drop leading hash signs
                    var pq = propertyQuery.replace(/^(#+)/gi, '');
                    serializedItem.propertyQuery = pq;
                }
            }
            else {
                var extractedDataObject;
                if (!itemLogic.isUsingExternalData()) {
                    //Add component's data
                    extractedDataObject = this._extractDataObject(itemLogic.getDataItem());
                }
                else {
                    serializedItem.uID = componentNode.get('dataQuery');
                }

                if (extractedDataObject) {
                    serializedItem.data = extractedDataObject.data;
                    serializedItem.dataRefs = extractedDataObject.dataRefs;
                    serializedItem.dataId = serializedItem.data.id;

                    delete serializedItem.data.id;
                }

                //Add component's props
                var extractedPropObject = this._extractDataObject(itemLogic.getComponentProperties());
                if (extractedPropObject) {
                    serializedItem.props = extractedPropObject.data;
                    serializedItem.propsId = serializedItem.props.id;

                    delete serializedItem.props.id;
                }
            }

            // Child components
            if (itemLogic.hasChildren()) {
                serializedItem.components = this.serializeComponents(itemLogic.getChildComponents(), serializeData, componentToExclude);
            }

            this.serializeBehaviors(serializedItem, componentNode);
            this.serializeSocialActivity(serializedItem, componentNode);

            return serializedItem;
        },

        _getComponentId: function(id) {
            if (this._idPrefix) {
                return id.replace(this._idPrefix, '');
            }
            return id;
        },

        serializeBehaviors: function(serializedItem, componentNode) {
            var itemLogic = componentNode.$logic,
                behaviors = itemLogic.getBehaviors();

            if (behaviors) {
                serializedItem.behaviors = JSON.stringify(behaviors);
            }
        },

        serializeSocialActivity: function(serializedItem, componentNode){},

        serializeComponents: function(componentNodes, serializeData, componentToExclude) {
            var filteredComponentNodes, serializedComponents = [];
            componentToExclude = this._excludeVolatileComponentsCheck(componentToExclude);
            filteredComponentNodes = this._getFilteredComponentNodes(componentNodes, componentToExclude);
            filteredComponentNodes.forEach(function(componentNode) {
                serializedComponents.push(this.serializeComponent(componentNode, serializeData, componentToExclude));
            }, this);

            return serializedComponents;
        },

        _getFilteredComponentNodes: function(componentNodes, componentToExclude) {
            return _.filter(componentNodes, function(node) {
                return !componentToExclude(node) && this._validateComponent(node); //changed the conditions order, so that unwixified pages won't break on _validateComponent
            }, this);
        },

        _excludeVolatileComponentsCheck: function(originalcomponentToExcludeFunction) {
            originalcomponentToExcludeFunction = originalcomponentToExcludeFunction || function() {
                return false;
            };
            return function(componentNode) {
                if (!componentNode.getLogic) {
                    return true;
                }
                var itemLogic = componentNode.getLogic();
                return (!!itemLogic.isVolatile) || originalcomponentToExcludeFunction(componentNode);
            };
        },

        _getComponentLayout: function(componentLogic) {
            var ret = this._getLayoutDataFromComponentLogic(componentLogic);

            var anchors;
            var hGroupAnchors;
            var i = 0;

            if (componentLogic) {
                anchors = componentLogic.getAnchors();
                hGroupAnchors = componentLogic.getHorizontalGroup();
            }

            var serializedAnchors = [];
            if (anchors && anchors.length > 0) {
                for (i = 0; i < anchors.length; i++) {
                    if (!anchors[i].toComp.getIsDisposed()) {
                        var anchor = this._globals.preview.getPreviewManagers().Layout.serializeAnchor(anchors[i]);
                        anchor.targetComponent = this._getComponentId(anchor.targetComponent);
                        serializedAnchors.push(anchor);
                    }
                    else {
                        this._globals.utils.debugTrace("WComponentSerializer", "_getComponentLayout", "anchors[i].toComp.isDisposed()==true");
                    }
                }
            }

            if (hGroupAnchors && hGroupAnchors.length && hGroupAnchors[0].fromComp === componentLogic) {
                for (i = 1; i < hGroupAnchors.length; i++) {
                    var hAnchor = this._globals.preview.getPreviewManagers().Layout.serializeAnchor(hGroupAnchors[i]);
                    hAnchor.targetComponent = this._getComponentId(hAnchor.targetComponent);
                    serializedAnchors.push(hAnchor);
                }
            }
            ret.anchors = serializedAnchors;
            return ret;
        },

        _getLayoutDataFromComponentLogic: function(componentLogic) {
            var ret;
            if (componentLogic) {
                ret = {
                    x: componentLogic.getX(),
                    y: componentLogic.getY(),
                    width: componentLogic.getWidth(),
                    height: componentLogic.getHeight(),
                    scale: componentLogic.getScale ? componentLogic.getScale() : undefined,
                    rotationInDegrees: componentLogic.getAngle ? componentLogic.getAngle() : undefined,
                    fixedPosition: false
                };

                if (componentLogic.canBeFixedPosition() && componentLogic.getLayoutPosition() === 'fixed') {
                    ret.fixedPosition = true;
                }
            }
            else {
                ret = {x: 0, y: 0, width: 0, height: 0, scale: 1, angle: 0};
            }
            return ret;
        },

        _extractDataObject: function(data) {
            if (!data) {
                return null;
            }
            var rawData = data.getData();

            var extractedData = {};
            var dataRefs = {};

            Object.each(rawData, function(item, key) {
                var fieldType = data.getFieldType ? data.getFieldType(key) : null;

                //TODO: We need to be able to use static class constants (or enum) instead of magic strings. this is not currently possible with WClass
                switch (fieldType) {
                    case "ref":

                        /***************************************************************************
                         * This is the only change - don't try to get the data if the ref is falsy *
                         ***************************************************************************/
                        if (item) {
                            //Get referenced data object and extract it's contents
                            var dataObj = data.getDataManager().getDataByQuery(item);
                            dataRefs[key] = this._extractDataObject(dataObj);
                        }
                        break;

                    case "refList":

                        var ref = {"isList": true, "items": []};
                        dataRefs[key] = ref;

                        //Get referenced data objects and extract their contents
                        var dataObjList = data.getDataManager().getDataByQueryList(item);
                        Object.each(dataObjList, function(_item, key, object) {
                            ref.items.push(this._extractDataObject(_item));
                        }, this);

                        break;

                    default:

                        extractedData[key] = item;
                }
            }, this);

            return {"data": extractedData, "dataRefs": dataRefs};
        },

        _prepareReverseMigrationMap: function() {
            this._reverseMigrationMap = {};
            var migrationMap = define.Class.$nameOverrides;
            for (var key in migrationMap) {
                var value = migrationMap[key];
                this._reverseMigrationMap[value] = key;
            }
        },

        unmigrateToOldName: function(value) {
            if (this._reverseMigrationMap[value]) {
                return this._reverseMigrationMap[value];
            }
            else {
                return value;
            }
        },
        _validateComponent: function(componentNode, errorOriginClass, errorOriginMethod) {
            var hasLogic = this.hasLogic(componentNode),
                hasView = '';

            if (hasLogic) {
                hasView = this.hasView(componentNode);
            }

            if (!hasLogic || !hasView) {
                var identifier = {
                    id: componentNode.getAttribute('id'),
                    comp: componentNode.getAttribute('comp'),
                    skin: componentNode.getAttribute('skin')
                };
                identifier = JSON.stringify(identifier);
                var failures = [];
                if (!hasLogic) {
                    failures.push('noLogic');
                }
                if (!hasView) {
                    failures.push('noView');
                }
                errorOriginClass = errorOriginClass || "WComponentSerializer";
                errorOriginMethod = errorOriginMethod || "serializeComponents";
                var errorMessage = "id:" + identifier + ";errors:" + failures.join(',') + ';caller:' + errorOriginMethod;
                LOG.reportError(wixErrors.FAILED_COMPONENT_SERIALIZATION,
                    errorOriginClass,
                    errorOriginMethod,
                    {c1: errorMessage});
            }
            return hasLogic && hasView;
        },
        hasLogic: function(node) {
            return !!(node.getLogic && node.getLogic() && node.$logic);
        },
        hasView: function(node) {
            var logic = node.$logic;
            return !!(logic._view && logic.getViewNode && logic.getViewNode());
        }
    });

});
