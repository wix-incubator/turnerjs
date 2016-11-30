define(['lodash', 'balataCommon/utils/balataDataUtils'],
    function (_, balataDataUtils) {
    'use strict';

    function getParentCompBehaviors(parentProps) {
        var siteData = parentProps.siteData;
        var dataType = siteData.dataTypes.BEHAVIORS;
        var behaviorsQuery = _.get(parentProps, 'structure.behaviorQuery');
        return _.get(siteData.getDataByQuery(behaviorsQuery, parentProps.rootId, dataType), 'items');
    }

    return {
        createChildBalata: function(parent, overrides){
            var compData = _.get(overrides, 'compData', parent.props.compData);
            var compActions = _.get(overrides, 'compActions', parent.props.compActions);
            var behaviors = getParentCompBehaviors(parent.props);
            var extraProps = _.omit(overrides, 'compData');

            var compClass = 'wysiwyg.viewer.components.background.Balata';
            var skinData = balataDataUtils.createChildBalataSkinData(parent.props.styleId);
            var compProps = balataDataUtils.createChildBalataProps(parent.props.id, behaviors, parent.props.compDesign, compActions);

            _.merge(compProps, extraProps);

            return parent.createChildComponent(
                compData,
                compClass,
                skinData,
                compProps
            );
        }
    };
});
