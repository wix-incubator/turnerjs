define(['lodash', 'mediaContainer/utils/cssItem/cssItem'],
    function (_, CSSItem) {
        'use strict';

        function renderDesign (cssStyle) {
            return _(cssStyle)
                .keys()
                .filter(function (key) {
                    return !_.isNull(cssStyle[key]) && _.has(CSSItem, key);
                })
                .reduce(function (style, key) {
                    return CSSItem[key](style, cssStyle[key]);
                }, {});
        }

        return {
            renderDesign: renderDesign
        };
    }
);
