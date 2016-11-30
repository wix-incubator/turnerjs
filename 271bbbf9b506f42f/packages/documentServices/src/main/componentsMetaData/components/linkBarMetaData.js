define(['lodash', 'documentServices/dataModel/dataModel'], function (_, dataModel) {
    'use strict';

    return {
        resizableSides: [],
        defaultMobileProperties: {
            iconSize: 35,
            spacing: 15
        },

        mobileConversionConfig: {
            fixedSize: function(ps, component, pageId) {
                var properties = ps.dal.get(ps.pointers.data.getPropertyItem(component.propertyQuery, pageId));
                var data = dataModel.getDataItemById(ps, component.dataQuery.replace('#', ''), pageId);
                var numberOfLinks = _.get(data, ['items', 'length'], 0);
                var iconSize = _.get(properties, 'iconSize', 0);
                var spacing = _.get(properties, 'spacing', 0);
                var orientation = _.get(properties, 'orientation', 'HORIZ');
                var mainAxis = iconSize * numberOfLinks + spacing * (numberOfLinks - 1);
                var crossAxis = iconSize;
                var horizontal = orientation === 'HORIZ';
                return {width: horizontal ? mainAxis : crossAxis, height: horizontal ? crossAxis : mainAxis};
            }
        }
    };
});
