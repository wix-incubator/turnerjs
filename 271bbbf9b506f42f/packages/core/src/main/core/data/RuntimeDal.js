define(['lodash', 'utils', 'experiment'], function (_, utils, experiment) {
    'use strict';


    var clientRectProperties = ['height', 'width'];
    var DATA_TYPES = utils.constants.DATA_TYPES;

	var CONSTANTS_TYPES_TO_REFS_TYPES = {
		data: 'document_data',
		props: 'component_properties',
        connections: 'connections_data',
		design: 'design_data'
	};

    var EMPTY_VALUE = {
        components: {}
    };

    var COMPONENTS_ROOT = ['runtime', 'components'];

    function compRoot(compId) {
        return COMPONENTS_ROOT.concat([compId]);
    }
    // references
    function compState(compId) {
        return compRoot(compId).concat('state');
    }
    // runtime overrides
    function compOverrides(compId) {
        return compRoot(compId).concat('overrides');
    }
    function compProps(compId) {
        return compOverrides(compId).concat('props');
    }
    function compData(compId) {
        return compOverrides(compId).concat('data');
    }
    function compDesign(compId) {
        return compOverrides(compId).concat('design');
    }
    function compLayout(compId) {
        return compOverrides(compId).concat('layout');
    }
    function actionsAndBehaviors(compId) {
        return compOverrides(compId).concat('actionsBehaviors');
    }

    function popupsInfo(popupId) {
        return ['runtime', 'popups', popupId];
    }

	function get(siteData, path, defaultValue) {
        var value = _.get(siteData, path, defaultValue);
        return _.cloneDeep(value);
    }

    function containsObject(container, obj) {
        return _.isEqual(obj, _.pick(container, _.keys(obj)));
    }

    function resetPointersWhenDisplayedJsonChanged() {
        this._compPointers = {};
    }

    /**
     * Site Data Access Layer for manipulating data in the viewer
     * @constructor
     */
    function RuntimeDal(siteData, siteDataApi, displayedDal, pointers) {
        this._siteData = siteData;
        this._siteDataApi = siteDataApi;
        this._pointers = pointers;
        this._displayedDal = displayedDal;
        this._changeListeners = [];
        this._compPointers = {};
        this.snapshotId = 0;
        this._roots = [];

	    // This is because the ctor is being called without parameters when require fake
	    if (this._siteDataApi) {
		    this._siteDataApi.registerDisplayedJsonUpdateCallback(resetPointersWhenDisplayedJsonChanged.bind(this));
	    }

        // displayedDal is mandatory but the require plugin "fake!" is calling the ctor without any params
        if (this._displayedDal && !this._displayedDal.isPathExist(COMPONENTS_ROOT)) {
            this.reset();
        }

        _.bindAll(this);
    }

    function genericSetter(compId, valueUpdates, runtimePath, valueGetter, changeNotificationType) {
        var previousValue = valueGetter(compId);
        var runtimeValue = _.get(this._siteData, runtimePath, {});
        _.set(this._siteData, runtimePath, _.assign({}, runtimeValue, valueUpdates));

        if (!containsObject(previousValue, valueUpdates)) {
            var changeObject = {type: changeNotificationType, value: valueUpdates};
            notifyListeners.call(this, compId, changeObject);
        }

        return ++this.snapshotId;
    }

    function notifyListeners(compId, changeObject) {
        _.forEach(this._changeListeners, function (listenerCallback) {
            listenerCallback(compId, changeObject);
        });
    }

    function getOriginalDataItem(compId, queryProp, dataType) {
        var compPointer = getCompPointer.call(this, compId);
        if (!compPointer) {
            return null;
        }

        var queryId = this._displayedDal.get(this._pointers.getInnerPointer(compPointer, queryProp));
        if (!queryId) {
            return null;
        }

        var dataPointer = this._pointers.data.getItem(dataType, queryId.replace('#', ''), getPageId.call(this, compPointer));
        var data = this._displayedDal.get(dataPointer);
        return this._siteData.resolveData(data, getPageId.call(this, compPointer), CONSTANTS_TYPES_TO_REFS_TYPES[dataType]);
    }

    function getOriginalActionsBehaviors(compId) {
        var behaviorsData = getOriginalDataItem.call(this, compId, 'behaviorQuery', DATA_TYPES.behaviors);
        return _.get(behaviorsData, 'items');
    }

    function getOriginalConnectionsItem(compId) {
        if (experiment.isOpen('connectionsData')) {
            var compPointer = getCompPointer.call(this, compId);
            if (!compPointer) {
                return null;
            }
            var connectionQuery = this._siteDataApi.document.getFullStructureProperty(compPointer, 'connectionQuery');
            if (!connectionQuery) {
                return null;
            }

            var dataType = DATA_TYPES.connections;
            var pageId = getPageId.call(this, compPointer);
            var connectionPointer = this._pointers.data.getItem(dataType, connectionQuery.replace('#', ''), pageId);
            var connection = this._displayedDal.get(connectionPointer);
            var resolvedConnection = this._siteData.resolveData(connection, pageId, CONSTANTS_TYPES_TO_REFS_TYPES[dataType]);
            return resolvedConnection.items;
        }
    }

	function getPageId(pointer) {
		return this._pointers.full.components.getPageOfComponent(pointer).id;
	}

    function resetOverridesIfNeeded() {
        if (_.isEmpty(this._compPointers)) {
            return;
        }

        var currentRoots = this._siteData.getAllPossiblyRenderedRoots();
        var currentComps = _.keys(this._compPointers);
        var compPointer = this._compPointers[currentComps[0]];
        var currentViewMode = this._pointers.components.getViewMode(compPointer);

        if (currentViewMode !== this._siteData.getViewMode()) {
            this._displayedDal.setByPath(COMPONENTS_ROOT, {});
            this._compPointers = {};
        } else if (!_.isEqual(currentRoots, this._roots)) {
            var allComps = this._displayedDal.getKeysByPath(COMPONENTS_ROOT);
            var redundantOverrides = _(allComps).difference(currentComps).map(compRoot).value();
            _.forEach(redundantOverrides, this._displayedDal.removeByPath, this._displayedDal);
        }

        this._roots = currentRoots;
    }

    function getCompPointer(compId) {
        resetOverridesIfNeeded.call(this);
        var compPointer = this._compPointers[compId];
        if (compPointer && this._displayedDal.isExist(compPointer)) {
            return compPointer;
        }

		syncAllComponents.call(this);
		return this._compPointers[compId];
	}

    function syncAllComponents() {
        this._compPointers = _(this._siteData.getAllPossiblyRenderedRoots())
            .map(function (rootId) {
                var root = this._pointers.full.components.getPage(rootId, this._siteData.getViewMode());
                return root ? [root].concat(this._pointers.full.components.getChildrenRecursively(root)) : [];
            }, this)
            .flatten()
            .indexBy('id')
            .value();
    }

    _.assign(RuntimeDal.prototype, {

        registerChangeListener: function (listenerCallback) {
            this._changeListeners.push(listenerCallback);
        },

        getCompStructure: function (compId) {
            var compPointer = getCompPointer.call(this, compId);
            var compStructure = compPointer && this._displayedDal.get(compPointer);

            if (compStructure) {
                compStructure.layout = this.getCompLayout(compId);
            }

            return compStructure;
        },

        /**
         * THIS METHOD SHOULD BE IN USE ONLY BY compStateMixin TO UPDATE THE STORE, IT DOESN'T UPDATE THE COMPONENT REAL STATE
         *
         * Set partial state of the component.
         * @param {string} compId The component id
         * @param {object} newState The updated partial state
         */
        setCompState: function (compId, newState) {
            var previousState = this.getCompState(compId);
            var path = compState(compId);
            _.set(this._siteData, path, _.assign({}, previousState, newState));

            if (!containsObject(previousState, newState)) {
                var changeObject = {type: 'stateChange', value: this.getCompState(compId)};
                notifyListeners.call(this, compId, changeObject);
            }
            return ++this.snapshotId;
        },

        /**
         * Removes the state of the component
         * @param {String} compId The component id
         */
        removeCompState: function (compId) {
            var rootCompPath = compRoot(compId);

            var comp = _.get(this._siteData, rootCompPath);
            if (comp) {
                delete comp.state;
            }
        },

        /**
         * Get the component runtime state
         * @param {string} compId The component id
         * @returns {object} The component state
         */
        getCompState: function (compId) {
            return get(this._siteData, compState(compId));
        },

        /**
         * Get the component runtime type
         * @param compId
         * @returns {String}
         */
        getCompType: function (compId) {
	        var compPointer = getCompPointer.call(this, compId);
	        return this._siteDataApi.document.getFullStructureProperty(compPointer, 'componentType');
        },

        getCompLayout: function (compId) {
	        var compPointer = getCompPointer.call(this, compId);
	        var originalLayout = compPointer && this._displayedDal.get(this._pointers.getInnerPointer(compPointer, 'layout'));
	        var runtimeLayout = get(this._siteData, compLayout(compId));
	        return runtimeLayout ? _.defaults(runtimeLayout, originalLayout) : originalLayout;
        },

        updateCompLayout: function (compId, newLayout) {
            return genericSetter.call(this, compId, newLayout, compLayout(compId), this.getCompLayout.bind(this), 'layoutChange');
        },

        getCompDesign: function (compId) {
            var originalData = getOriginalDataItem.call(this, compId, 'designQuery', DATA_TYPES.design);
            var runtimeData = get(this._siteData, compDesign(compId));
            return runtimeData ? _.defaults(runtimeData, originalData) : originalData;
        },

        setCompDesign: function (compId, newDesign) {
            return genericSetter.call(this, compId, newDesign, compDesign(compId), this.getCompDesign.bind(this), 'designChange');
        },

        getCompData: function (compId) {
            var originalData = getOriginalDataItem.call(this, compId, 'dataQuery', DATA_TYPES.data);
	        var runtimeData = get(this._siteData, compData(compId));
	        return runtimeData ? _.defaults(runtimeData, originalData) : originalData;
        },

        setCompData: function (compId, newData) {
            return genericSetter.call(this, compId, newData, compData(compId), this.getCompData.bind(this), 'dataChange');
        },

        getCompConnections: function (compId) {
            return getOriginalConnectionsItem.call(this, compId) || [];
        },

        getCompProps: function (compId) {
            var originalProps = getOriginalDataItem.call(this, compId, 'propertyQuery', DATA_TYPES.prop);
	        var runtimeProps = get(this._siteData, compProps(compId));
            return runtimeProps ? _.defaults(runtimeProps, originalProps) : originalProps;
        },

        setCompProps: function (compId, newProps) {
            return genericSetter.call(this, compId, newProps, compProps(compId), this.getCompProps.bind(this), 'propsChange');
        },

        getActionsAndBehaviors: function (compId) {
            var originalActionsBehaviors = getOriginalActionsBehaviors.call(this, compId) || [];
            var runtimeActionsBehaviors = get(this._siteData, actionsAndBehaviors(compId), []);
            return originalActionsBehaviors.concat(runtimeActionsBehaviors);
        },

        addActionsAndBehaviors: function (compId, newActionsAndBehaviors) {
            var runtimePath = actionsAndBehaviors(compId);
            var existingActionsBehaviors = _.get(this._siteData, runtimePath, []);
            _.set(this._siteData, runtimePath, existingActionsBehaviors.concat(newActionsAndBehaviors));

            return ++this.snapshotId;
        },

        removeActionsAndBehaviors: function (compId, predicateObject) {
            var runtimePath = actionsAndBehaviors(compId);
            var existingActionsBehaviors = _.get(this._siteData, runtimePath, []);
            _.remove(existingActionsBehaviors, predicateObject);
            _.set(this._siteData, runtimePath, existingActionsBehaviors);
            return ++this.snapshotId;
        },

        getCompName: function(compId) {
            var compConnections = this.getCompConnections(compId);
            var wixCodeConnection = _.get(compConnections, [0, 'type']) === 'WixCodeConnectionItem' && compConnections[0];
            return wixCodeConnection ? wixCodeConnection.role : compId;
        },

        getBoundingClientRect: function(compId) {
            var measureMap = this._siteData.measureMap;
            if (measureMap) {
                return _.transform(clientRectProperties, function (acc, prop) {
                    acc[prop] = measureMap[prop][compId];
                }, {});
            }
            return _.pick(this.getCompLayout(compId), clientRectProperties);
        },

        getPageId: function(compId) {
            var compPointer = getCompPointer.call(this, compId);
            if (!compPointer) {
                return null;
            }
            return getPageId.call(this, compPointer);
        },

        getParentId: function(compId) {
	        var compPointer = getCompPointer.call(this, compId);
	        var parentPointer = compPointer && this._pointers.full.components.getParent(compPointer);
            return parentPointer && parentPointer.id;
        },

        isDisplayed: function(compId) {
	        var compPointer = getCompPointer.call(this, compId);
            return !!compPointer && this._displayedDal.isExist(compPointer);
        },

		hasBeenPopupOpened: function (popupId) {
			return _.get(this._siteData, popupsInfo(popupId), false);
		},

		markPopupAsBeenOpened: function (popupId) {
			_.set(this._siteData, popupsInfo(popupId), true);
		},

        reset: function () {
            this._displayedDal.setByPath(['runtime'], EMPTY_VALUE);
        },

        getDynamicPageData:function(){
            return this._siteData.getDynamicPageData();
        }
	});

    return RuntimeDal;
});
