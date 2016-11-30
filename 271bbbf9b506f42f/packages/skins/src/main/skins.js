/**
 * Created with IntelliJ IDEA.
 * User: avim
 * Date: 6/9/14
 * Time: 6:13 PM
 * To change this template use File | Settings | File Templates.
 */
define(['skins/util/skins', 'skins/util/skinsRenderer', 'skins/util/params'], function (skins, skinsRenderer, params) {
    'use strict';
    return {
        skins: skins,
        skinsRenderer: skinsRenderer,
        registerRenderPlugin: skinsRenderer.registerRenderPlugin,
        params: params
    };
});

