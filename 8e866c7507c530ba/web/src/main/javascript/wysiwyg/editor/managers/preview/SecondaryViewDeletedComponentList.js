/** @class wysiwyg.editor.managers.preview.SecondaryViewDeletedComponentList */
define.Class('wysiwyg.editor.managers.preview.SecondaryViewDeletedComponentList', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Utils']);

    /** @lends wysiwyg.editor.managers.preview.SecondaryViewDeletedComponentList*/
    def.methods({
        initialize: function(preview, layoutAlgorithms) {
            this._pageIdToDeletedCompsMap = {};
            this._viewerName = preview;
            this._layoutAlgorithms = layoutAlgorithms;
            this._lastReaddComponent = null;
            W.Commands.registerCommandAndListener("WEditorCommands.RemoveComponentsFromDeletedComponentMap", this, this.removeFromMap);
        },

        populateMapWithStructureDifferences: function(serializedMainStructure, serializedSecondaryStructure, onMerge) {
            _.map(serializedMainStructure.pages, function(serializedPage, pageId){
                this.populateListByPageWithStructureDifferences(pageId, serializedMainStructure, serializedSecondaryStructure, onMerge);
            }, this);

            this.populateListByPageWithStructureDifferences('masterPage', serializedMainStructure, serializedSecondaryStructure, onMerge);
        },

        populateListByPageWithStructureDifferences: function(pageId, serializedMainStructure, serializedSecondaryStructure, onMerge){
            var componentsExistingInMainButNotInSecondary =  this._layoutAlgorithms.getComponentsExistingInWebsiteButNotInMobile(serializedMainStructure, serializedSecondaryStructure);
            var componentsExistingInMainPageButNotInSecondary = componentsExistingInMainButNotInSecondary[pageId] || [];
            if(onMerge){
                var secondarySerializedPage = (pageId === 'masterPage') ? serializedSecondaryStructure[pageId] : serializedSecondaryStructure.pages[pageId];
                var hiddenMobileOnlyComponentIdsInPage = secondarySerializedPage ? this._layoutAlgorithms.getHiddenMobileOnlyComponentIds(secondarySerializedPage) : [];
                var pageHiddenComponentArray = _.union(componentsExistingInMainPageButNotInSecondary, hiddenMobileOnlyComponentIdsInPage);//or concat?
                this.setListByPage(pageId, pageHiddenComponentArray);
            }
            else {
                this.setListByPage(pageId, componentsExistingInMainPageButNotInSecondary);
            }
        },

        getMap: function() {
            return this._pageIdToDeletedCompsMap;
        },

        getListByPage: function(pageId) {
            return this._pageIdToDeletedCompsMap[pageId];
        },

        setMap: function(map) {
            this._pageIdToDeletedCompsMap = {};
            _.forEach(map, function(compIdList, pageId){
                this.setListByPage(pageId, compIdList, true);
            }, this);

            this._notifyDeletedCompMapChanged(map);
        },

        setListByPage: function(pageId, list, dontNotifyOnListChange) {
            var changedMap = {};
            if (_.isEqual(this._pageIdToDeletedCompsMap[pageId], list)){
                return;
            }

            this._pageIdToDeletedCompsMap[pageId] = _.uniq(list);
            if (!dontNotifyOnListChange) {
                changedMap[pageId] = this._pageIdToDeletedCompsMap[pageId];
                this._notifyDeletedCompMapChanged(changedMap);
            }
        },

        _notifyDeletedCompMapChanged: function(map) {
            var commandParams = {
                'updatedMap': map,
                'viewerName': this._viewerName
            };
            W.Commands.executeCommand('WEditorCommands.DeletedComponentsListUpdated', commandParams);
        },

        updateListByPage: function(pageId, componentDataList) {
            var deleted = this._getIdsFromCompList(componentDataList);
            this._pageIdToDeletedCompsMap[pageId] = this._pageIdToDeletedCompsMap[pageId] || [];
            var updatedList = this._pageIdToDeletedCompsMap[pageId].concat(deleted);
            this.setListByPage(pageId, updatedList);
        },

        /*
        verify that there all components in the map exist in the secondary structure, and removes them otherwise
         */
        validateMap: function(serializedMainStructure, serializedSecondaryStructure) {
            var mainStructureExistingComponents = this._getSerializedStructureComponents(serializedMainStructure);
            var secondaryStructureExistingComponents = this._getSerializedStructureComponents(serializedSecondaryStructure);
            var componentsExistingInMainButNotInSecondaryMap = this._getDiffBetweenStructures(mainStructureExistingComponents, secondaryStructureExistingComponents);
            var hiddenMobileOnlyComponentIdMap = this._getHiddenMobileOnlyComponentIdMap(serializedSecondaryStructure);

            this._filterComponentIdListFromNotReadyForMobile(componentsExistingInMainButNotInSecondaryMap, serializedMainStructure);
            var updatedMap  = this.resources.W.Utils.deepMergeObjects(hiddenMobileOnlyComponentIdMap, componentsExistingInMainButNotInSecondaryMap);
            this.setMap(updatedMap);
        },

        _getSerializedStructureComponents: function(serializedStructure) {
            var ret = {};
            ret['masterPage'] = this._layoutAlgorithms.getStructureComponentIds(serializedStructure.masterPage);
            _.forOwn(serializedStructure.pages, function(pageStructure) {
                ret[pageStructure.id] = this._layoutAlgorithms.getStructureComponentIds(pageStructure);
            }.bind(this));
            return ret;
        },

        _getDiffBetweenStructures: function(mainStructureCompIdMap, secondaryStructureCompIdMap) {
            var diff = {};
            _.forEach(mainStructureCompIdMap, function(compIdArr, pageId) {
                diff[pageId] = _.difference(compIdArr, secondaryStructureCompIdMap[pageId]);
            });
            return diff;
        },

        _getHiddenMobileOnlyComponentIdMap: function (serializedSecondaryStructure) {
            var hiddenMobileOnlyComponentIdMap = {};
            hiddenMobileOnlyComponentIdMap['masterPage'] = this._layoutAlgorithms.getHiddenMobileOnlyComponentIds(serializedSecondaryStructure.masterPage);
            _.forOwn(serializedSecondaryStructure.pages, function (pageStructure) {
                hiddenMobileOnlyComponentIdMap[pageStructure.id] = this._layoutAlgorithms.getHiddenMobileOnlyComponentIds(pageStructure);
            }.bind(this));
            return hiddenMobileOnlyComponentIdMap;
        },

        _filterComponentIdListFromNotReadyForMobile: function(pageIdToCompIdsMap, serializedMainStructure) {
            this._layoutAlgorithms.filterComponentIdListFromNotReadyForMobile(pageIdToCompIdsMap.masterPage, serializedMainStructure.masterPage);
            _.forOwn(serializedMainStructure.pages, function(pageStructure) {
                this._layoutAlgorithms.filterComponentIdListFromNotReadyForMobile(pageIdToCompIdsMap[pageStructure.id], pageStructure);
            }.bind(this));
        },

        removeFromMap: function(componentIdList) {
            //we assume that all deleted components are from the same page (currently there is no other possibility)
            var pageId = this._getDeletedComponentPageId(_.first(componentIdList));
            this.removeFromListByPage(componentIdList, pageId);
        },

        _getDeletedComponentPageId: function(componentId) {
            return _.findKey(this._pageIdToDeletedCompsMap, function(compIdArr){
                return compIdArr.indexOf(componentId) > -1;
            });
        },

        removeFromListByPage: function(componentIdList, pageId) {
            var listAfterRemoval = _.difference(this._pageIdToDeletedCompsMap[pageId], componentIdList);
            this.setListByPage(pageId, listAfterRemoval);
        },

        getLastReaddedComponent: function() {
            return this._lastReaddComponent;
        },

        setLastReaddedComponent: function(compId) {
            this._lastReaddComponent = compId;
        },

        _getIdsFromCompList: function(compList){
            var idList = [];
            var id = '';
            for (var i = 0; i < compList.length; i++){
                //TODO: Tom / Alissa, remove this when ComponentSerializer will return unprefixed ids
                id = this._getCompLogicalID(compList[i].id);
                idList.push(id);
                if (compList[i].components){
                    idList = idList.concat(this._getIdsFromCompList(compList[i].components));
                }
            }
            return idList;
        },

        _getCompLogicalID: function(domId){
            var idPrefix = Constants.ViewerTypesParams.DOM_ID_PREFIX[this._viewerName];

            if(idPrefix){
                return domId.replace(idPrefix, '');
            }
            return domId;
        }
    });
});