/**
 * Created by alexandergonchar on 11/24/14.
 */
define(['lodash'], function(_) {
    'use strict';

    return {
        /**
         * Converts page props to have { desktop: ..., mobile: ...} at the top level
         * @param pageJson
         */
        exec: function(pageJson) {
            var props = _.get(pageJson, ['data', 'component_properties', pageJson.structure.id]);
            var popupProps = props && props.popup;
            if (popupProps) {
                _.forEach(['desktop', 'mobile'], function (mode) {
                    var modeValue = props[mode];
                    var popupModeValue = props.popup[mode];
                    if (modeValue || popupModeValue) {
                        _.set(props, [mode, ['popup']], _.assign(modeValue || {}, popupModeValue || {}));
                    }
                });
                delete props.popup;
            }
        }
    };
});
