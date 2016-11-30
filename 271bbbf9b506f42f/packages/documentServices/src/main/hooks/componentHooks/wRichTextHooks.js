/**
 * Created by talm on 18/08/15.
 */
define(['lodash', 'documentServices/dataModel/dataModel', 'utils'], function (_, dataModel, utils) {
    'use strict';

    function setLinksCustomData(ps, compPointer, customStructureData) {
        var compData = dataModel.getDataItem(ps, compPointer);
        if (_.has(compData, 'linkList') && compData.linkList.length > 0) {
            customStructureData.linkList = compData.linkList;
        }
        return {success: true, description: 'Added text links to the custom component structure'};
    }

    function updateComponentData(ps, compPointer, fixedText, newLinks) {
        var compData = dataModel.getDataItem(ps, compPointer);
        compData.text = fixedText;
        compData.linkList = newLinks;
        dataModel.updateDataItem(ps, compPointer, compData);
    }

    function duplicateLinksDataItems(ps, compPointer, compDefinition) {
        if (!compDefinition.custom) {
            return {success: true, description: 'Duplicated text links data items'};
        }

        //fix links and refernces
        var newLinks = _.cloneDeep(compDefinition.custom.linkList);
        var fixedText = compDefinition.data.text;
        _.forEach(newLinks, function(linkData) {
            if (linkData.id) {
                var newId = utils.guidUtils.getUniqueId("link", "-");
                //replace old link ref in the html text string with the new one
                fixedText = fixedText.replace('#' + linkData.id, '#' + newId);
                linkData.id = newId;
            }
        });

        updateComponentData(ps, compPointer, fixedText, newLinks);
        return {success: true, description: 'Duplicated text links data items'};
    }

    return {
        setLinksCustomData: setLinksCustomData,
        duplicateLinksDataItems: duplicateLinksDataItems
    };
});
