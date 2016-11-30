define([
    'utils',
    'documentServices/dataModel/dataModel'
], function (
    utils,
    dataModel
) {
    'use strict';

    var TYPE_OF_MAIN_CONTAINER_INSIDE_POPUP = 'wysiwyg.viewer.components.PopupContainer';

    function getPopupContainer(ps, popupPagePointer) {
        var childrenPointers, candidateType, candidatePointer;

        childrenPointers = ps.pointers.components.getChildren(popupPagePointer);

        if (childrenPointers.length > 1) {
            throw new Error('More than one child of the popup page was found. A popup page must have only single direct child of type ' +
                TYPE_OF_MAIN_CONTAINER_INSIDE_POPUP);
        }
        if (childrenPointers.length < 1) {
            throw new Error('No direct child of the popup page was found');
        }

        candidatePointer = childrenPointers[0];
        candidateType = ps.dal.get(ps.pointers.getInnerPointer(candidatePointer, 'componentType'));

        if (candidateType !== TYPE_OF_MAIN_CONTAINER_INSIDE_POPUP) {
            throw new Error('Direct child of the popup is of type ' + candidateType + '. Expected type: ' + TYPE_OF_MAIN_CONTAINER_INSIDE_POPUP);
        }

        return candidatePointer;
    }

    function isPopupContainer(componentType) {
        return componentType === utils.constants.POPUP.POPUP_CONTAINER.COMPONENT_TYPE;
    }

    function isPopupFullWidth(ps, popupPointer) {
        var popupContainerPointer = getPopupContainer(ps, popupPointer);
        var popupContainerProps = dataModel.getPropertiesItem(ps, popupContainerPointer);

        return popupContainerProps.alignmentType === 'fullWidth';
    }

    function isPopup(ps, pageId) {
        if (pageId === 'masterPage') {
            return false;
        }

        var pageDataItemPointer = ps.pointers.data.getDataItemFromMaster(pageId);

        return ps.dal.get(ps.pointers.getInnerPointer(pageDataItemPointer, 'isPopup'));
    }

    return {
        getPopupContainer: getPopupContainer,
        isPopupContainer: isPopupContainer,
        isPopupFullWidth: isPopupFullWidth,
        isPopup: isPopup
    };
});
