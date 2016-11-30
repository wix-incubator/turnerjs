define(['lodash',
    'zepto',
    'documentServices/component/component',
    'documentServices/documentMode/documentModeInfo'], function (_, $, component, documentModeInfo) {
    'use strict';

    var headerCompLayout = function (placement, layout, headerLayout) {
        var compLayout = {
            y:  headerLayout.height / 2 - layout.height / 2,
            width: layout.width,
            height: layout.height
        };
        switch (placement) {
            case 'LEFT':
                return _.merge(compLayout, {
                   x: 0
                });
            case 'RIGHT':
                return _.merge(compLayout, {
                    x: headerLayout.width - layout.width
                });
            //also CENTER
            default :
                return _.merge(compLayout, {
                    x: headerLayout.width / 2 - layout.width / 2
                });
        }
    };

    var footerCompLayout = function (placement, layout, pageLayout, footerLayout) {
        var compLayout = {
            y:  pageLayout.height + footerLayout.height / 2 - layout.height / 2,
            width: layout.width,
            height: layout.height
        };
        switch (placement) {
            case 'LEFT':
                return _.merge(compLayout, {
                    x: 0
                });
            case 'RIGHT':
                return _.merge(compLayout, {
                    x: footerLayout.width - layout.width
                });
            //also CENTER
            default :
                return _.merge(compLayout, {
                    x: footerLayout.width / 2 - layout.width / 2
                });
        }
    };

    var getScreenYCenter = function (layout, pageLayout) {
        var $window = $(window);
        return ($window.height() - layout.height) / 2 + $window.scrollTop() - pageLayout.y;
    };

    var pageCompLayout = function (placement, layout, pageLayout) {
        var compLayout = {
            width: layout.width,
            height: layout.height
        };
        switch (placement) {
            case 'TOP_LEFT':
                return _.merge(compLayout, {
                    x: 0,
                    y: 0
                });
            case 'TOP_CENTER':
                return _.merge(compLayout, {
                    x: pageLayout.width / 2 - layout.width / 2,
                    y: 0
                });
            case 'TOP_RIGHT':
                return _.merge(compLayout, {
                    x: pageLayout.width - layout.width,
                    y: 0
                });
            case 'CENTER_LEFT':
                return _.merge(compLayout, {
                    x: 0,
                    y: getScreenYCenter(layout, pageLayout)
                });
            case 'CENTER_RIGHT':
                return _.merge(compLayout, {
                    x: pageLayout.width - layout.width,
                    y: getScreenYCenter(layout, pageLayout)
                });
            case 'BOTTOM_LEFT':
                return _.merge(compLayout, {
                    x: 0,
                    y: pageLayout.height - layout.height
                });
            case 'BOTTOM_CENTER':
                return _.merge(compLayout, {
                    x: pageLayout.width / 2 - layout.width / 2,
                    y: pageLayout.height - layout.height
                });
            case 'BOTTOM_RIGHT':
                return _.merge(compLayout, {
                    x: pageLayout.width - layout.width,
                    y: pageLayout.height - layout.height
                });
            //also center
            default:
                return _.merge(compLayout, {
                    x: pageLayout.width / 2 - layout.width / 2,
                    y: getScreenYCenter(layout, pageLayout)
                });
        }
    };

    var getCompLayoutFrom = function (ps, layout, optionsLayout) {
        if (optionsLayout && isValidPositionValue(optionsLayout.x) && isValidPositionValue(optionsLayout.y)) {
            var x = optionsLayout.x;
            var y = optionsLayout.y;
            if (!_.isNumber(x)) {
                x = parseInt(x, 10);
            }
            if (!_.isNumber(y)) {
                y = parseInt(y, 10);
            }
            return {
                width: optionsLayout.width,
                height: optionsLayout.height,
                x: x,
                y: y
            };
        }

        var viewMode = documentModeInfo.getViewMode(ps);

        var pageContainer = ps.pointers.components.getPagesContainer(viewMode);
        var pageLayout = component.layout.get(ps, pageContainer);
        if (layout.defaultPosition) {
            var region = layout.defaultPosition.region;
            switch (region) {
                case 'header':
                    var header = ps.pointers.components.getHeader(viewMode);
                    var headerLayout = component.layout.get(ps, header);
                    return headerCompLayout(layout.defaultPosition.placement, layout, headerLayout);

                case 'footer':
                    var footer = ps.pointers.components.getFooter(viewMode);
                    var footerLayout = component.layout.get(ps, footer);

                    return footerCompLayout(layout.defaultPosition.placement, layout, pageLayout, footerLayout);

                //also pageContainer i.e., region is page
                default:
                    return pageCompLayout(layout.defaultPosition.placement, layout, pageLayout);
            }
        } else {
            return {
                width: layout.width,
                height: layout.height,
                x: pageLayout.width / 2 - layout.width / 2,
                y: getScreenYCenter(layout, pageLayout)
            };
        }
    };

    var isValidPositionValue = function(val){
        return val !== null &&
                !isNaN(val);
    };

    return {
        getCompLayoutFrom: getCompLayoutFrom
    };
});
