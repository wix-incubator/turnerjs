define(function () {
    'use strict';

    return {

        cssStyle: {

            cssBoxShadow: [
                {
                    "inset": false,
                    "offsetX": {"unit": "em", "value": 2},
                    "offsetY": {"unit": "em", "value": 2},
                    "blurRadius": {"unit": "px", "value": 4},
                    "spreadRadius": {"unit": "px", "value": 1},
                    "color": {"red": 127, "green": 64, "blue": 83, "alpha": 0.23}
                },

                {
                    "inset": true,
                    "offsetX": {"unit": "em", "value": 2},
                    "offsetY": {"unit": "em", "value": 2},
                    "blurRadius": {"unit": "px", "value": 2},
                    "spreadRadius": {"unit": "px", "value": 1},
                    "color": {"red": 127, "green": 255, "blue": 83, "alpha": 0.37}
                }
            ],

            cssBorderRadius: {
                "topLeft": {"unit": "px", "value":20},
                "topRight": {"unit": "px", "value":30},
                "bottomRight": {"unit": "px", "value":50},
                "bottomLeft": {"unit": "px", "value":70}
            },

            cssBorder: {
                "width": {
                    "top": {"unit": "em", "value": 2},
                    "right": {"unit": "em", "value": 4},
                    "bottom": {"unit": "em", "value": 3},
                    "left": {"unit": "px", "value": 1}
                },

                "style": {
                    "top": "dotted",
                    "left": "dashed",
                    "right": "hidden",
                    "bottom": "none"
                },

                "color": {
                    "top": {"red": 127, "green": 64, "blue": 83, "alpha": 0.23},
                    "right": {"red": 23, "green": 83, "blue": 83, "alpha": 0.37},
                    "bottom": {"red": 83, "green": 37, "blue": 83, "alpha": 0.37},
                    "left": {"red": 23, "green": 23, "blue": 83, "alpha": 0.37}
                }
            }
        }
    };

});
