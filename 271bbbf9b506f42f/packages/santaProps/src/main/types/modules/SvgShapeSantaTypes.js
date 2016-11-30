define(['lodash', 'react', 'santaProps/utils/propsSelectorsUtils', 'santaProps/propsBuilder/propsBuilderUtil'],
    function (_, React, propsSelectorsUtils, propsBuilderUtil) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var svgString = applyFetch(React.PropTypes.string, function (state, props) {
        var siteShapes = state.siteData.svgShapes;
        var skinName = propsBuilderUtil.getSkin(props.structure, state.siteData);

        if (siteShapes) {
            var shape = siteShapes[skinName];
            if (shape) {
                return shape;
            }
        }
        return null;
    });

    return {
        string: svgString
    };

});
