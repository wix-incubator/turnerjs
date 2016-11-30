/**
 * Created by alexandreroitman on 07/11/2016.
 */

define(['lodash'], function (_) {
    "use strict";

    var WARNING = 'warning';
    var ERROR = 'error';

    var DEPRECATED_COMPONENTS = {
        'wysiwyg.viewer.components.StripContainer': {
            deprecated: WARNING,
            message: 'This component will be deprecated'
        }
    };

    return {
        isComponentDeprecated: function (compType) {
            return _.get(DEPRECATED_COMPONENTS, [compType, 'deprecated']) === ERROR;
        },

        shouldWarnForDeprecation: function (compType) {
            return _.get(DEPRECATED_COMPONENTS, [compType, 'deprecated']) === WARNING;
        },

        getDeprecationMessage: function (compType) {
            return compType + '|' + _.get(DEPRECATED_COMPONENTS, [compType, 'message']);
        }
    };
});
