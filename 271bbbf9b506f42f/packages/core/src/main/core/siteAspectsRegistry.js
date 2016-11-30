define([], function(){
    'use strict';
    var siteAspects = {};

    /**
     * @class core.siteAspectsRegistry
     */
    return {
        /**
         *
         * @param {string} aspectName
         * @param {function(core.SiteAspectsSiteAPI)} aspectConstructor
         */
        registerSiteAspect: function(aspectName, aspectConstructor){
            siteAspects[aspectName] = aspectConstructor;
        },

        getAllAspectConstructors: function(){
            return siteAspects;
        },

        getSiteAspectConstructor: function (driverName) {
            return siteAspects[driverName];
        }
    };
});


/**
 * @name core.SiteAspectInterface
 * @interface
 * @property {function(object<string, string>): ReactComponent[]} getReactComponents gets the loaded styles map, should be used to build comp props
 * @property {function(): data.compStructure[]} getComponentStructures
 */


