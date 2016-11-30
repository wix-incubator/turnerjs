define(['react', 'lodash', 'santaProps/utils/propsSelectorsUtils', 'santaProps/propsBuilder/propsBuilderUtil'], function (React, _, propsSelectorsUtils, propsBuilderUtil) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var stringOrNumber = React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
    ]);

    var structure = applyFetch(React.PropTypes.shape({
        componentType: React.PropTypes.string.isRequired,
        dataQuery: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
        ]),
        propertyQuery: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
        ]),
        designQuery: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
        ]),
        behaviorQuery: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
        ]),
        components: React.PropTypes.array,
        skin: React.PropTypes.string,
        styleId: React.PropTypes.string,
        id: React.PropTypes.string,
        type: React.PropTypes.string
    }), function (state, props) {
        return props.structure;
    });

    var style = applyFetch(React.PropTypes.shape({
        bottom: stringOrNumber,
        height: stringOrNumber,
        left: stringOrNumber,
        position: React.PropTypes.string,
        right: stringOrNumber,
        top: stringOrNumber,
        width: stringOrNumber
    }), function (state, props) {
        return propsBuilderUtil.getStyle(props.structure.layout, state.siteAPI, props.structure.id);
    });

    var compProp = applyFetch(React.PropTypes.object, function (state, props) {
        return propsBuilderUtil.getCompProp(state.siteAPI, props.structure.id, props.structure.propertyQuery, props.rootId);
    });

    var compData = applyFetch(React.PropTypes.object, function (state, props) {
        return propsBuilderUtil.getCompData(state.siteAPI, props.structure.id, props.structure.dataQuery, props.rootId);
    });

    var compDesign = applyFetch(React.PropTypes.object, function (state, props) {
        return propsBuilderUtil.getCompDesign(state.siteAPI, props.structure.id, props.structure.designQuery, props.rootId);
    });

    var compActions = applyFetch(React.PropTypes.object, function (state, props) {
        return state.siteAPI.getSiteAspect('behaviorsAspect').getActions('comp', props.structure.id);
    });

    var compTheme = applyFetch(React.PropTypes.object, function (state, props) {
        return state.siteData.getAllTheme()[props.structure.styleId];
    });

    var styleId = applyFetch(React.PropTypes.string, function (state, props) {
        return propsBuilderUtil.getStyleId(props.structure, state.stylesMap);
    });

    var compBehaviors = applyFetch(React.PropTypes.oneOfType([
        React.PropTypes.array,
        React.PropTypes.object
    ]), function (state, props) {
        var behaviorsAspect = state.siteAPI.getSiteAspect('behaviorsAspect');
        return behaviorsAspect.extractBehaviors(props.structure && props.structure.id);
    });

    var compStaticBehaviors = applyFetch(React.PropTypes.oneOfType([React.PropTypes.array]), function (state, props) {
        var behaviorsQuery = _.get(props, 'structure.behaviorQuery');

        return _.get(state.siteData.getDataByQuery(behaviorsQuery, props.rootId, state.siteData.dataTypes.BEHAVIORS), 'items');
    });

    var skin = applyFetch(React.PropTypes.string, function (state, props) {
        return propsBuilderUtil.getSkin(props.structure, state.siteData);
    });

    var id = applyFetch(React.PropTypes.string, propsSelectorsUtils.idSelector);

    var rootId = applyFetch(React.PropTypes.string, function (state, props) {
        return props.rootId;
    });

    var rootNavigationInfo = applyFetch(React.PropTypes.shape({
        pageId: React.PropTypes.string.isRequired,
        title: React.PropTypes.string,
        pageAdditionalData: React.PropTypes.string,
        pageItemId: React.PropTypes.string,
        pageItemAdditionalData: React.PropTypes.string,
        anchorData: React.PropTypes.string
    }), function (state, props) {
        return props.rootNavigationInfo;
    });

    var currentUrlPage = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.getCurrentUrlPageId();
    });


    return {
        structure: structure,
        id: id,
        key: id,
        ref: id,
        refInParent: id,
        /** @deprecated */
        pageId: rootId,
        rootId: rootId,
        rootNavigationInfo: rootNavigationInfo,
        currentUrlPageId: currentUrlPage,
        styleId: styleId,
        skin: skin,
        style: style,
        compBehaviors: compBehaviors,
        compStaticBehaviors: compStaticBehaviors,
        compData: compData,
        compDesign: compDesign,
        compProp: compProp,
        compActions: compActions,
        theme: compTheme
    };

});
