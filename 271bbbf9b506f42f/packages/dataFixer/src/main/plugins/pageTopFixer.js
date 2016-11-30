/**
 * Created by alexandergonchar on 11/24/14.
 */
define([], function() {
    'use strict';

    return {
        /**
         * Implicitly sets page top to 0
         * @param pageJson
         */
        exec: function(pageJson) {
            pageJson.structure = pageJson.structure || {};
            pageJson.structure.layout = pageJson.structure.layout || {};
            pageJson.structure.layout.y = 0;
        }
    };
});