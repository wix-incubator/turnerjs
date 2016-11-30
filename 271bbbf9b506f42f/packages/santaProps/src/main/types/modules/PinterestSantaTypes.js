define(['lodash', 'react', 'santaProps/utils/propsSelectorsUtils'], function (_, React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    function createSelector() {
        var selectors = _.initial(arguments);
        var resolver = _.last(arguments);
        return function (state, props) {
            return resolver.apply(resolver, _.map(selectors, function (selector) {
                return selector(state, props);
            }));
        };
    }

    function pinterestWidgetPostMessageAspectSelector(state) {
        return state.siteAPI.getSiteAspect('PinterestWidgetPostMessageAspect');
    }

    var shouldPresentErrorMessage = applyFetch(React.PropTypes.string,
        createSelector(pinterestWidgetPostMessageAspectSelector, propsSelectorsUtils.idSelector, function (aspect, id) {
            return aspect.shouldPresentErrorMessage(id);
        }));

    var iframeDimensions = applyFetch(React.PropTypes.shape({
        height: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired
    }), createSelector(pinterestWidgetPostMessageAspectSelector, propsSelectorsUtils.idSelector, function (aspect, id) {
        return aspect.getIframeDimensions(id);
    }));

    return {
        shouldPresentErrorMessage: shouldPresentErrorMessage,
        iframeDimensions: iframeDimensions
    };

});
