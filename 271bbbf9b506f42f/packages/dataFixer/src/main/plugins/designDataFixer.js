define(['lodash', 'coreUtils'], function(_, coreUtils) {
    'use strict';

    function isStripContainer (component) {
        return component.componentType === 'wysiwyg.viewer.components.StripContainer';
    }

    function hasDesignQuery (component) {
        return !_.isUndefined(component.designQuery);
    }

    function createMediaContainerDesignDataItem (comp, designData, designId) {
        if (_.isUndefined(designId)) {
            designId = coreUtils.guidUtils.getUniqueId("dataItem", "-");
        }
        designData[designId] = {
            id: designId,
            type: 'MediaContainerDesignData',
            metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
        };
        comp.designQuery = '#' + designId;
        return designId;
    }

    function moveDataItem (source, target, itemId) {
        target[itemId] = source[itemId];
        delete source[itemId];
        return target[itemId];
    }

    function moveBackgroundData (sourceId, targetId, source, target) {
        var componentData = source[sourceId];
        if (!_.isUndefined(componentData.background)) {
            var backgroundMediaId = componentData.background.slice(1);
            var backgroundMedia = moveDataItem(source, target, backgroundMediaId);

            if (!_.isUndefined(backgroundMedia.mediaRef)) {
                var innerMediaId = backgroundMedia.mediaRef.slice(1);
                var innerMedia = moveDataItem(source, target, innerMediaId);
                if (innerMedia.type === 'WixVideo') {
                    var posterImageId = innerMedia.posterImageRef.slice(1);
                    moveDataItem(source, target, posterImageId);
                }
                if (!_.isUndefined(innerMedia.originalImageDataRef)) {
                    var orgImage = innerMedia.originalImageDataRef.slice(1);
                    moveDataItem(source, target, orgImage);
                }
                if (!_.isUndefined(innerMedia.link)) {
                    delete innerMedia.link;
                }
            }
            if (!_.isUndefined(backgroundMedia.imageOverlay)) {
                var imageOverlayId = backgroundMedia.imageOverlay.slice(1);
                moveDataItem(source, target, imageOverlayId);
            }

            delete componentData.background;
            target[targetId].background = '#' + backgroundMediaId;
            return backgroundMediaId;
        }
    }

    function migrateToDesignData (documentData, designData, dataIdToDesignId, dataIdToBgMediaId, stripContainer) {
        var dataId = stripContainer.dataQuery.slice(1);
        var designId = createMediaContainerDesignDataItem(stripContainer, designData);
        dataIdToDesignId[dataId] = designId;
        var bgMediaId = moveBackgroundData(dataId, designId, documentData, designData);
        if (!_.isUndefined(bgMediaId)) {
            dataIdToBgMediaId[dataId] = bgMediaId;
        }
    }

    function migrateToDesignDataMobile (designData, dataIdToDesignId, dataIdToBgMediaId, stripContainer) {
        var dataId = stripContainer.dataQuery.slice(1);
        var backgroundMediaId = dataIdToBgMediaId[dataId];
        var designId = 'mobile_' + dataIdToDesignId[dataId];
        createMediaContainerDesignDataItem(stripContainer, designData, designId);
        if (!_.isUndefined(backgroundMediaId)) {
            designData[designId].background = '#' + backgroundMediaId;
        }
    }

    function fixStripContainers (components, mobileComponents, documentData, designData) {
        var dataIdToBgMediaId = {};
        var dataIdToDesignId = {};
        var stripContainers = _.filter(components, isStripContainer);

        _(stripContainers)
            .reject(hasDesignQuery)
            .forEach(_.partial(migrateToDesignData, documentData, designData, dataIdToDesignId, dataIdToBgMediaId))
            .value();

        _(mobileComponents)
            .filter(function (component) {
                return isStripContainer(component) && !hasDesignQuery(component);
            })
            .forEach(_.partial(migrateToDesignDataMobile, designData, dataIdToDesignId, dataIdToBgMediaId))
            .value();
    }

    function getChildren(structure) {
        if (!_.isUndefined(structure.components)) {
            return structure.components;
        } else if (!_.isUndefined(structure.children)) {
            return structure.children;
        }
        return [];
    }

    function flatComponents (componentsTree) {
        var stack = _.clone(componentsTree) || [];
        var flat = [];
        while (stack.length > 0) {
            var comp = stack.pop();
            flat.push(comp);
            var children = getChildren(comp);
            _.forEach(children, function(child) {
                stack.push(child);
            });
        }
        return flat;
    }

    function getComponents (pageJson) {
        return flatComponents(getChildren(pageJson.structure));
    }

    function getMobileComponents (pageJson) {
        return flatComponents(pageJson.structure.mobileComponents);
    }

    return {
        exec: function(pageJson) {
            var components = getComponents(pageJson);
            var mobileComponents = getMobileComponents(pageJson);

            pageJson.data.design_data = pageJson.data.design_data || {};
            fixStripContainers(
                components,
                mobileComponents,
                pageJson.data.document_data,
                pageJson.data.design_data
            );
        }
    };
});
