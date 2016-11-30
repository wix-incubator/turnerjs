define([
    'lodash',
    'animations'
], function (
    _,
    animations
) {
    'use strict';

    function setScroll(ps, x, y) {
        if (ps.siteAPI.isPopupOpened()){
            var popupRootDOMNode = window.document.getElementById('POPUPS_ROOT');

            popupRootDOMNode.scrollLeft = x;
            popupRootDOMNode.scrollTop = y;
        } else {
            window.scrollTo(x, y);
        }
    }

    function getScroll(ps) {
        if (ps.siteAPI.isPopupOpened()){
            var popupRootDOMNode = window.document.getElementById('POPUPS_ROOT');

            return {
                x: _.get(popupRootDOMNode, 'scrollLeft', 0),
                y: _.get(popupRootDOMNode, 'scrollTop', 0)
            };
        }

        return {
            x: _.isFinite(window.pageXOffset) ? window.pageXOffset : window.scrollX,
            y: _.isFinite(window.pageYOffset) ? window.pageYOffset : window.scrollY
        };
    }

    function setScrollAndScale(x, y, scale, duration, originLeft) {
        var sequence = animations.sequence();
        var left = !_.isUndefined(originLeft) ? originLeft.toString() : '50%';
        sequence
            .add(animations.animate('BaseNone', '#SITE_ROOT', 0, 0, {transformOrigin: left + ' 0'}), 0)
            .add(animations.animate('BaseScale', '#SITE_ROOT', duration, 0, {
                to: {scale: scale},
                clearProps: scale === 1 ? 'transform, transform-origin' : ''
            }), 0)
            .add(animations.animate('BaseScroll', '#SITE_ROOT', duration, 0, {x: x, y: y}), 0);

        return sequence.get();
    }

    return {
        setScrollAndScale: setScrollAndScale,
        setScroll: setScroll,
        getScroll: getScroll
    };
});
