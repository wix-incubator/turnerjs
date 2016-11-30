define(['zepto', 'lodash', 'utils'], function ($, _, utils) {
    'use strict';

    function patchCss(nodesMap, id, css) {
        if (nodesMap[id]) {
            $(nodesMap[id]).css(css);
        } else {
            utils.log.error('Cannot find node with id {' + id + '} to patch css. Either the node doesnt exist, or it was never measured, or it was measured undeer a different id.');
        }
    }

    function patchAttributes(nodesMap, id, attributes) {
        if (nodesMap[id]) {
            $(nodesMap[id]).attr(attributes);
        } else {
            utils.log.error('Cannot find node with id {' + id + '} to patch attributes. Either the node doesnt exist, or it was never measured, or it was measured undeer a different id.');
        }
    }

    function patchData(nodesMap, id, data) {
        if (nodesMap[id]) {
            var $node = $(nodesMap[id]);
            _.forOwn(data, function (dataVal, dataKey) {
                $node.data(dataKey, dataVal);
            });
        } else {
            utils.log.error('Cannot find node with id {' + id + '} to patch data. Either the node doesnt exist, or it was never measured, or it was measured undeer a different id.');
        }
    }


    /**
     * @typedef {function(string, object)} layout_patcher
     */

    /**
     * @typedef {{
     *  css: layout_patcher,
     *  attr: layout_patcher,
     *  data: layout_patcher
     * }} patchers
     */

    /**
     *
     * @param nodesMap
     * @returns {patchers}
     */
    function createPatchers(nodesMap) {
        return {
            css: _.partial(patchCss, nodesMap),
            attr: _.partial(patchAttributes, nodesMap),
            data: _.partial(patchData, nodesMap)
        };
    }

    return createPatchers;
});