define(['lodash', 'santaProps', 'core/core/siteAspectsRegistry', 'siteUtils'],
    function (_, santaProps, siteAspectsRegistry, siteUtils) {
        "use strict";

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function AddComponentAspect(aspectSiteAPI) {
            this._aspectSiteAPI = aspectSiteAPI;
            this._componentsToRender = {};
        }

        AddComponentAspect.prototype = {

            addComponent: function (key, structure, props) {
                this._componentsToRender[key] = {
                    structure: structure,
                    props: props
                };
                this._aspectSiteAPI.forceUpdate();
            },

            deleteComponent: function (key) {
                delete this._componentsToRender[key];
                this._aspectSiteAPI.forceUpdate();
            },

            getComponentStructures: function () {
                return _.pluck(this._componentsToRender, 'structure');
            },

            /**
             *
             * @param loadedStyles
             */
            getReactComponents: function (loadedStyles) {
                return _.map(this._componentsToRender, function (compInfo) {
                    var props = santaProps.componentPropsBuilder.getCompProps(compInfo.structure, this._aspectSiteAPI.getSiteAPI(), null, loadedStyles);
                    _.assign(props, compInfo.props);
                    var compClass = siteUtils.compFactory.getCompClass(compInfo.structure.componentType);
                    return compClass(props);
                }, this);
            }
        };

        siteAspectsRegistry.registerSiteAspect('addComponent', AddComponentAspect);
    });
