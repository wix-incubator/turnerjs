define(["layout/util/layout"], function (layout) {
    "use strict";

    var DEFAULT_PROPERTIES = {
        layout: 'box_count',
        show_faces: 'box_count',
        action: 'like'
    };

    var FB_LIKE_SIZES_PRESETS = {
        standard: {
            like: {
                w: 250,
                h: 40
            },
            recommend: {
                w: 290,
                h: 40
            }
        },
        standard_showFaces: {
            like: {
                w: 250,
                h: 85
            },
            recommend: {
                w: 290,
                h: 85
            }
        },
        button_count: {
            like: {
                w: 170,
                h: 20
            },
            recommend: {
                w: 137,
                h: 20
            }
        },
        box_count: {
            like: {
                w: 106,
                h: 65
            },
            recommend: {
                w: 125,
                h: 65
            }
        },
        box_count_showFaces: {
            like: {
                w: 85,
                h: 65
            },
            recommend: {
                w: 125,
                h: 65
            }
        },
        button_count_showFaces: {
            like: {
                w: 137,
                h: 20
            },
            recommend: {
                w: 137,
                h: 20
            }
        }
    };

    /*
     layout - there are three options.
     standard - displays social text to the right of the button and friends' profile photos below. Minimum width: 225 pixels. Minimum increases by 40px if action is 'recommend' by and increases by 60px if send is 'true'. Default width: 450 pixels. Height: 35 pixels (without photos) or 80 pixels (with photos).
     button_count - displays the total number of likes to the right of the button. Minimum width: 90 pixels. Default width: 90 pixels. Height: 20 pixels.
     box_count - displays the total number of likes above the button. Minimum width: 55 pixels. Default width: 55 pixels. Height: 65 pixels.
     */
    function getSizeAccordingToProperties(props) {
        var selectedLayout = props ? props.layout : DEFAULT_PROPERTIES.layout;
        selectedLayout = props && props.show_faces ? selectedLayout + '_showFaces' : selectedLayout;
        var action = props ? props.action : DEFAULT_PROPERTIES.action;

        return FB_LIKE_SIZES_PRESETS[selectedLayout][action];
    }

    function measure(id, measureMap, nodesMap, siteData, structureInfo) {
        var size = getSizeAccordingToProperties(structureInfo.propertiesItem);
        measureMap.width[id] = size.w;
        measureMap.height[id] = size.h;
    }

    function patch(id, patchers, measureMap) {
        var width = measureMap.width[id];
        var height = measureMap.height[id];
        
        patchers.css(id + 'iframe', {
            width: width,
            height: height
        });
    }
    
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.WFacebookLike', [['iframe']]);
    layout.registerCustomMeasure('wysiwyg.viewer.components.WFacebookLike', measure);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.WFacebookLike', patch);

    return {};
});
