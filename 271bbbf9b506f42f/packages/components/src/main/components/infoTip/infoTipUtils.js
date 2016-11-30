/**
 * Created by alexandergonchar on 8/8/14.
 */
define(['zepto'], function (zepto) {
    'use strict';
    function getTargetNodePosition(targetNode) {
        return targetNode.offset();
    }

    function calcPositionRegardlessScroll(targetNodePosition, tipNodeSizes) {
        return {
            top: targetNodePosition.top - tipNodeSizes.height,
            left: targetNodePosition.left - (tipNodeSizes.width / 2),
            right: 'auto'
        };
    }

    function correctTopBound(top, targetNodePosition, viewPortHeight, tipNodeSizes) {
        var scrollTop = zepto(window.document.body).scrollTop(),
            noSpaceAbove = top - scrollTop < 0,
            tmpTop;

        if (noSpaceAbove) {
            tmpTop = targetNodePosition.top + tipNodeSizes.height;
            // If there is no room below, use middle
            if (tmpTop > viewPortHeight + scrollTop + tipNodeSizes.height) {
                if (targetNodePosition.top < 0) {
                    tmpTop = targetNodePosition.top;
                } else {
                    /* if callerPosY is lower than scrolled page */
                    tmpTop = scrollTop;
                }
            }

            return tmpTop > 0 ? tmpTop : 0;
        }

        return top;
    }

    function correctLeftBound(left, right, targetNodePosition, viewPortWidth) {
        if (right > viewPortWidth) {
            return 'auto';
        }

        // If there is no room from left, align to right
        return left < 0 ? targetNodePosition.left : left;
    }

    function correctRightBound(right, targetNodePosition, viewPortWidth) {
        // else check that there is room to the right.
        return right > viewPortWidth ?
            targetNodePosition.left + targetNodePosition.width :
            right;
    }

    function adjustPositionToWindowBounds(pos, targetNodePosition, tipNodeSizes) {
        var
            // inner width and height are supported by IE9
            // https://developer.mozilla.org/en-US/docs/Web/API/window.innerWidth?redirectlocale=en-US&redirectslug=DOM%2Fwindow.innerWidth#Browser_compatibility
            viewPortWidth = window.innerWidth,
            viewPortHeight = window.innerHeight;

        return {
            top: correctTopBound(pos.top, targetNodePosition, viewPortHeight, tipNodeSizes),
            left: correctLeftBound(pos.left, pos.right, targetNodePosition),
            right: correctRightBound(pos.right, targetNodePosition, viewPortWidth)
        };
    }

    function adjustPositionToParentPosition(pos, tipNode) {
        var offsetTop = 0,
            offsetLeft = 0,
            tipPos,
            offsParent = tipNode.offsetParent();

        //in case info tip position is absolute (as tooltip on an element)
        if (offsParent) {
            tipPos = offsParent.offset();
            offsetTop = tipPos.top;
            offsetLeft = tipPos.left;
        }

        return {
            top: pos.top - offsetTop,
            left: pos.left - offsetLeft,
            right: pos.right === 'auto' ? pos.right : pos.right + offsetLeft
        };
    }

    function getPosition(targetNode, tipNode) {
        var targetNodePosition,
            pos,
            tipNodeSizes;

        targetNode = zepto(targetNode);
        tipNode = zepto(tipNode);

        tipNodeSizes = {
            width: tipNode.width(),
            height: tipNode.height()
        };

        targetNodePosition = getTargetNodePosition(targetNode);

        pos = calcPositionRegardlessScroll(targetNodePosition, tipNodeSizes);
        pos = adjustPositionToWindowBounds(pos, targetNodePosition, tipNodeSizes);
        pos = adjustPositionToParentPosition(pos, tipNode);

        return pos;
    }


    return {
        /**
         * Calculates position of infoTip block
         * @param {DOMElement} targetNode the element which requires info tip
         * @param {DOMElement} tipNode the node which contains info tip itself
         */
        getPosition: getPosition
    };
});
