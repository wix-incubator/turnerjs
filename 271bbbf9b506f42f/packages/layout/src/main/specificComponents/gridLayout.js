define([
    'lodash',
    'layout/util/layout'
], function (_, layout) {
    'use strict';
    var MAX_ROWS = 200;

    var PaginationType = {
        PAGES: 'pagination',
        SCROLL: 'virtual',
        NONE: 'normal'
    };

    var HeightLayout = {
        MANUAL: 'manual',
        AUTOMATIC: 'auto'
    };

    function getNumberOfRows (structureInfo) {
        var pagination = structureInfo.propertiesItem.pagination;

        return structureInfo.dataItem.numberOfDisplayedRows ||
               (pagination && pagination.type === PaginationType.PAGES ?
                    pagination.rowsPerPage :
                    structureInfo.dataItem.rows.length);
    }

    function measureGrid (id, measureMap, nodesMap, siteData, structureInfo) {
        var gridContainer = nodesMap[id];

        measureMap.width[id] = gridContainer.offsetWidth;
        measureMap.height[id] = gridContainer.offsetHeight;

        var compProp = structureInfo.propertiesItem;
        var rowHeight = compProp.rowHeight;
        var numberOfRows = Math.min(getNumberOfRows(structureInfo), MAX_ROWS);
        var headerHeight = compProp.showHeader ? compProp.headerHeight : 0;
        var borderWidth = Number(structureInfo.styleItem.style.properties.containerBrw) || 0;
        var calculatedGridHeight = headerHeight + (numberOfRows * rowHeight) + 2 * borderWidth;

        var gridBodyContainer = gridContainer.getElementsByClassName('ag-bl-center ag-bl-full-height-center');
        if (gridBodyContainer.length) {
            var gridBody = gridContainer.getElementsByClassName('ag-body');
            gridBody[0].style.height = (gridBodyContainer[0].clientHeight - 2 * borderWidth - headerHeight) + 'px';
        }

        if (calculatedGridHeight && compProp.heightLayout === HeightLayout.AUTOMATIC) {
            measureMap.height[id] = calculatedGridHeight;
        }
    }

    layout.registerCustomMeasure('wysiwyg.viewer.components.Grid', measureGrid);
});
