define(['lodash'], function (_) {
	'use strict';

	function getView(name, type, format) {
		var view = {
			"name": name,
			"forType": type || "Array",
			"vars": {},
			"comp": {
				"name": "VBox",
				"items": [],
				"editorData": {
					"isPaginated": true
				}
			},
			"stylesheet": [],
			"customizations": [],
			"id": _.uniqueId('view-')
		};

		return format ? _.assign(view, {format: format}) : view;
	}

	function getViews(name, type) {
		return [
			getView(name, 'Array'),
			getView(name, 'Array', 'Mobile'),
			getView(name, type),
			getView(name, type, 'Mobile')
		];
	}

	var DEFAULT_FIELDS = [
		{
			displayName: "Title",
			name: "title",
			searchable: false,
			type: "String",
			defaultValue: "Write a catchy title...",
			computed: false
		}
	];

	return {
		addAppPartCompData: function (partName, dataItemId, pageId) {
			var clientSpecMap = this.getClientSpecMapEntryByAppDefinitionId('3d590cbc-4907-4cc4-b0b1-ddf2c5edf297');
			var compData = {
				appInnerID: clientSpecMap.applicationId,
				appPartName: partName,
				id: dataItemId,
				type: 'AppBuilderComponent',
				metaData: {
					isHidden: false,
					isPreset: false,
					schemaVersion: "1.0"
				}
			};

			this.addData(compData, pageId);

			return this;
		},

		addItem: function (val) {
			var type = val._type;
			this.wixapps.appbuilder.items[type] = this.wixapps.appbuilder.items[type] || {};
			this.wixapps.appbuilder.items[type][val._iid] = val;
			return this;
		},

		addManualDataSelector: function (dataSelectorId, typeName, itemIds) {
			this.wixapps.appbuilder.descriptor.dataSelectors[dataSelectorId] = {
				id: dataSelectorId,
				forType: typeName,
				itemIds: itemIds,
				logicalTypeName: "IB.ManualSelectedList",
				dataProviderId: "wixdb"
			};

			return this;
		},

		addDataSelector: function (val) {
			this.wixapps.appbuilder.descriptor.dataSelectors[val.id] = val;
			return this;
		},

		addViews: function (val) {
			if (!_.isArray(val)) {
				val = [val];
			}

			_.forEach(val, function addView(view) {
				var id = _.compact([view.forType, view.name, view.format]).join('|');
				this.wixapps.appbuilder.descriptor.views[id] = view;
			}, this);

			return this;
		},

		addPart: function (appPartName, dataSelectorId, typeName, viewName) {
			this.wixapps.appbuilder.descriptor.parts[appPartName] = {
				'displayName': 'My items',
				'dataSelector': dataSelectorId,
				'type': typeName,
				'viewName': viewName
			};

			return this;
		},

		addFullWixappsDataForPart: function (appPartName, typeName) {
			typeName = typeName || _.uniqueId('type-');
			var dataSelector = {
				forType: typeName,
				id: _.uniqueId('selector-'),
				itemIds: [],
				logicalTypeName: "IB.ManualSelectedList"
			};

			var viewName = _.uniqueId('viewName-');
			var views = getViews(viewName, typeName);

			return this.addTypeDefinition(typeName)
				.addDataSelector(dataSelector)
				.addViews(views)
				.addPart(appPartName, dataSelector.id, typeName, viewName);
		},

		addTypeDefinition: function createType(name, displayName, fields) {
			this.wixapps.appbuilder.descriptor.types[name] = {
				version: 0,
				baseTypes: [],
				displayName: displayName || "Test Type",
				fields: fields || _.cloneDeep(DEFAULT_FIELDS),
				name: name
			};
            this.wixapps.appbuilder.items[name] = {};

			return this;
		}
	};
});
