define(['lodash'], function (_) {
    'use strict';

    var spacerMap = {
        rtl: {
            vertical: {
                before: "Top",
                after: "Bottom"
            },
            horizontal: {
                before: "Right",
                after: "Left"
            }
        },
        ltr: {
            vertical: {
                before: "Top",
                after: "Bottom"
            },
            horizontal: {
                before: "Left",
                after: "Right"
            }
        }
    };

    function translateStaticSpacers(prefix, style, orientation, direction) {
        orientation = orientation || "vertical";
        direction = direction || "ltr";

        // NaN is falsy
        var spacers = {
            before: parseInt(style.spacerBefore || style.spacer, 10),
            after: parseInt(style.spacerAfter || style.spacer, 10)
        };

        if (spacers.before) {
            style[prefix + spacerMap[direction][orientation].before] = spacers.before;
        }
        if (spacers.after) {
            style[prefix + spacerMap[direction][orientation].after] = spacers.after;
        }

        return _.omit(style, ["spacer", "spacerBefore", "spacerAfter"]);
    }

    return {
        translateStaticSpacers: translateStaticSpacers.bind(null, "margin"),
        translateStaticSpacersXax: translateStaticSpacers.bind(null, "padding")
    };
});
