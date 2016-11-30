define([
    'lodash',
    'siteUtils',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/component/component',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/component/componentCode'
], function (_, siteUtils, wixCodeLifecycleService, component, componentDetectorAPI, componentCode) {
    'use strict';

    function generateNicknamesForComponent(ps, compToAddPointer) {
        if (wixCodeLifecycleService.isProvisioned(ps)) {
            var pagePointer = component.isPageComponent(ps, compToAddPointer) ? compToAddPointer : component.getPage(ps, compToAddPointer);
            var viewMode = ps.pointers.components.getViewMode(pagePointer);
            componentCode.generateNicknamesForPages(ps, [pagePointer.id], viewMode);
        }
    }

    function deleteNicknameFromComponentIfInvalid(ps, compPointer, containerPointer) {
        if (wixCodeLifecycleService.isProvisioned(ps) && component.getType(ps, compPointer) !== 'Page') {
            var pagePointer = component.isPageComponent(ps, containerPointer) ? containerPointer : component.getPage(ps, containerPointer);
            _.forEach(ps.pointers.components.getChildrenRecursivelyRightLeftRootIncludingRoot(compPointer), function (comp) {
                var nickname = componentCode.getNickname(ps, comp);
                if (componentCode.hasComponentWithThatNickname(ps, pagePointer, nickname, comp)) {
                    componentCode.removeNickname(ps, comp);
                }
            });
        }
    }

    function removeNicknameFromSerializedComponentIfInvalid(ps, compPointer, containerPointer, compDefinitionPrototype) {
        if (wixCodeLifecycleService.isProvisioned(ps) && compDefinitionPrototype.type !== 'Page' && compDefinitionPrototype.connections) {
            var pagePointer = component.isPageComponent(ps, containerPointer) ? containerPointer : component.getPage(ps, containerPointer);
            var wixCodeConnection = _.find(compDefinitionPrototype.connections.items, {type: 'WixCodeConnectionItem'});
            if (wixCodeConnection && componentCode.hasComponentWithThatNickname(ps, pagePointer, wixCodeConnection.role, compPointer)) {
                _.remove(compDefinitionPrototype.connections.items, wixCodeConnection);
            }
        }
    }

    return {
        generateNicknamesForComponent: generateNicknamesForComponent,
        removeNicknameFromSerializedComponentIfInvalid: removeNicknameFromSerializedComponentIfInvalid,
        deleteNicknameFromComponentIfInvalid: deleteNicknameFromComponentIfInvalid
    };
});
