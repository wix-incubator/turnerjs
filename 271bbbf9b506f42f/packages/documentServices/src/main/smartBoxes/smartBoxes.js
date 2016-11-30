define([
    'lodash',
    'documentServices/component/component',
    'documentServices/structure/structure',
    'documentServices/smartBoxes/multiComponentsUtils',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/page/page'
    ], function(_, component, structure, multiComponentsUtils, componentsMetaData, page){
    'use strict';

    //TODO not tested
    function alignInContainer(ps, compPointer, alignment) {
        if (!componentsMetaData.public.isAlignable(ps, compPointer)){
            throw new Error("cannot align component");
        }
        var relativeToOuterLayout;
        var compContainer = component.getContainer(ps, compPointer);
        var containerLayout;

        if (component.isPageComponent(ps, compContainer)) {
            containerLayout = page.getLayout(ps, compContainer.id);
            relativeToOuterLayout = true;
        } else if (compContainer.id !== "masterPage") {
            containerLayout = component.layout.get(ps, compContainer);
            relativeToOuterLayout = true;
        } else {
            var viewMode = ps.pointers.components.getViewMode(compPointer);
            var pagesContainer = ps.pointers.components.getPagesContainer(viewMode);
            containerLayout = component.layout.get(ps, pagesContainer);
            relativeToOuterLayout = false;
        }
        multiComponentsUtils.alignComponentsToOuterLayout(ps, [compPointer], containerLayout, alignment, relativeToOuterLayout);
    }

    return {
        alignInContainer: alignInContainer
    };
});
