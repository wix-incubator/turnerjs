define(['lodash',
        'coreUtils',
        'layout/util/layout',
        'layout/specificComponents/balataLayout'],
    function (_,
              utils,
              /** layout.layout*/layout,
              balataLayout) {
        'use strict';

        var balataConsts = utils.balataConsts;

        function preMeasureColumns(structureInfo, myDomNode, measureMap, nodesMap, siteData, measureStructureFunc, enforceAnchorsFunc) {
            var columnStructure = structureInfo.structure;
            var id = columnStructure.id;

            measureStructureFunc(columnStructure);
            measureMap.minHeight[id] = 0; // allow column to shrink
            measureMap.height[id] = columnStructure.layout.height;
            var changedCompsMap = enforceAnchorsFunc(columnStructure);

            if (siteData.isMobileView()) {
                measureMap.top[id] = nodesMap[id].offsetTop;
            }

            return {
                needsAdditionalInnerLayout: false,
                changedCompsMap: _.mapValues(changedCompsMap, _.constant(true))
            };
        }

        function measureStripColumnsContainer(id, measureMap, nodesMap, siteData, structureInfo) {
            var isMobileView = siteData.isMobileView();

            var children = utils.dataUtils.getChildrenData(structureInfo.structure, isMobileView);
            var childrenIds = _.map(children, 'id');

            if (isMobileView) {
                var containerHeight = 2 * structureInfo.propertiesItem.rowMargin + (children.length - 1) * structureInfo.propertiesItem.columnsMargin;

                _.forEach(childrenIds, function (childId, i) {
                    containerHeight += measureMap.height[childId];
                    measureMap.minHeight[childId] = measureMap.height[childId];

                    var isLastColumn = i === childrenIds.length - 1;

                    if (isLastColumn) {
                        measureMap.injectedAnchors[childId] = [
                            {
                                "fromComp": childId,
                                "distance": structureInfo.propertiesItem.rowMargin,
                                "topToTop": 0,
                                "originalValue": 0,
                                "type": "BOTTOM_PARENT",
                                "locked": true,
                                "targetComponent": id
                            }
                        ];
                    } else {
                        measureMap.injectedAnchors[childId] = [
                            {
                                "fromComp": childId,
                                "distance": structureInfo.propertiesItem.columnsMargin,
                                "locked": true,
                                "originalValue": 0,
                                "targetComponent": childrenIds[i + 1],
                                "topToTop": 0,
                                "type": "BOTTOM_TOP"
                            }
                        ];
                    }
                });

                measureMap.height[id] = containerHeight;
                /* todo we won't need to calculate container height manually once BALATA uses its
                 parent's size (after its been measured and enforced) in the patch phase*/
                measureMap.height[id + balataConsts.BALATA] = containerHeight;
            } else {
                var maxChildHeight = _(measureMap.height)
                    .pick(childrenIds)
                    .values()
                    .max();

                _.forEach(childrenIds, function (childId) {
                    measureMap.top[childId] = structureInfo.propertiesItem.rowMargin;
                    measureMap.minHeight[childId] = maxChildHeight;
                    measureMap.injectedAnchors[childId] = [
                        {
                            "fromComp": childId,
                            "distance": 0,
                            "originalValue": 0,
                            "type": "BOTTOM_PARENT",
                            "locked": true,
                            "targetComponent": id
                        }
                    ];
                });

                measureMap.height[id] = maxChildHeight + 2 * structureInfo.propertiesItem.rowMargin;
                measureMap.containerHeightMargin[id] = structureInfo.propertiesItem.rowMargin;
                measureMap.height[id + balataConsts.BALATA] = maxChildHeight + 2 * structureInfo.propertiesItem.rowMargin;
            }
            balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo);

            var clientRect = nodesMap[id].getBoundingClientRect();
            var balataOffset = nodesMap[id + balataConsts.BALATA].offsetLeft;

            measureMap.custom[id] = {
                absoluteLeft: clientRect.left + balataOffset,
                backgroundLeft: nodesMap[id + balataConsts.BALATA].offsetLeft,
                backgroundWidth: nodesMap[id + balataConsts.BALATA].offsetWidth
            };
        }

        function patchStripColumnsContainer(id, patchers, measureMap, structureInfo, siteData) {
            patchers.css(id, {
                height: measureMap.height[id],
                left: 0
            });
            var parentDimensions = {
                top: 0,
                left: measureMap.custom[id].backgroundLeft,
                width: measureMap.custom[id].backgroundWidth,
                height: measureMap.height[id],
                absoluteLeft: measureMap.custom[id].absoluteLeft
            };

            balataLayout.patch(id, patchers, measureMap, structureInfo, siteData, parentDimensions, true);
        }

        function measureColumn(id, measureMap, nodesMap, siteData, structureInfo) {
            measureMap.height[id + balataConsts.BALATA] = measureMap.minHeight[id];
            // even though we put the height in the premeasure,
            // there is another default measure which will take the current node height (and we dont want)
            measureMap.height[id] = measureMap.minHeight[id];
            balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo);

            var clientRect = nodesMap[id].getBoundingClientRect();
            var balataOffset = nodesMap[id + balataConsts.BALATA].offsetLeft;

            measureMap.custom[id] = {
                absoluteLeft: clientRect.left + balataOffset,
                backgroundLeft: nodesMap[id + balataConsts.BALATA].offsetLeft,
                backgroundWidth: nodesMap[id + balataConsts.BALATA].offsetWidth
            };
        }

        function patchColumn(id, patchers, measureMap, structureInfo, siteData) {
            patchers.css(id, {height: measureMap.height[id]});

            var parentDimensions = {
                top: 0,
                left: measureMap.custom[id].backgroundLeft,
                width: measureMap.custom[id].backgroundWidth,
                height: measureMap.height[id],
                absoluteLeft: measureMap.custom[id].absoluteLeft
            };
            balataLayout.patch(id, patchers, measureMap, structureInfo, siteData, parentDimensions, true);
        }

        layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.StripColumnsContainer", balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE);
        layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.Column", balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE);

        layout.registerLayoutInnerCompsFirst("wysiwyg.viewer.components.Column", preMeasureColumns, _.noop);

        layout.registerCustomMeasure("wysiwyg.viewer.components.StripColumnsContainer", measureStripColumnsContainer);
        layout.registerSAFEPatcher("wysiwyg.viewer.components.StripColumnsContainer", patchStripColumnsContainer);

        layout.registerCustomMeasure("wysiwyg.viewer.components.Column", measureColumn);
        layout.registerSAFEPatcher("wysiwyg.viewer.components.Column", patchColumn);

    });
