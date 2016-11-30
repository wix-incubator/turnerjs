define(['lodash'], function (_) {
    'use strict';
    /**
     * Determines from the layout and the orientation of the proxy, whether the width of the component is
     * determined by its layout (true) or by the component itself (false)
     * @param {object} styleDef The style properties of the proxy.
     * @param {string} orientation The orientation of the proxy (i.e. 'horizontal' or 'vertical')
     * @returns {boolean} true if the width determined by the layout, false if it will be determined by the component.
     */
    function isLayoutBasedWidth(styleDef, orientation) {
        // TODO: check if has zoomExpand should return true.
        var result = _.has(styleDef, 'width');

        result = result || orientation === 'vertical';
        result = result || (orientation === 'horizontal' && (_.has(styleDef, 'flex') || _.has(styleDef, 'box-flex')));

        return result;
    }

    /**
     * Determines from the layout and the orientation of the proxy, whether the height of the component is
     * determined by its layout (true) or by the component itself (false)
     * @param {object} styleDef The style properties of the proxy.
     * @param {string} orientation The orientation of the proxy (i.e. 'horizontal' or 'vertical')
     * @returns {boolean} true if the height determined by the layout, false if it will be determined by the component.
     */
    function isLayoutBasedHeight(styleDef, orientation) {
        var result = _.has(styleDef, 'height');

        result = result || orientation === 'horizontal';
        result = result || (orientation === 'vertical' && (_.has(styleDef, 'flex') || _.has(styleDef, 'box-flex')));

        return result;
    }

    return {
        isLayoutBasedWidth: isLayoutBasedWidth,
        isLayoutBasedHeight: isLayoutBasedHeight
    };
});
