/*eslint no-unused-vars:0*/
define(['lodash', 'siteUtils', 'santaProps', 'utils', 'tpa/components/tpaModal'], function (_, siteUtils, santaProps, utils, tpaModal) {
    "use strict";

    function getModalStructure() {
        return {
            "componentType": "wysiwyg.viewer.components.tpapps.TPAModal",
            "type": "Component",
            "id": utils.guidUtils.getUniqueId(),
            "skin": "wysiwyg.viewer.skins.TPAModalSkin"
        };
    }

    function getComp(structure, siteAPI, loadedStyles, data, callback) {
        var props = santaProps.componentPropsBuilder.getCompProps(structure, siteAPI, null, loadedStyles);
        props.compData = data;
        props.onCloseCallback = callback;
        props.key = structure.id;
        return siteUtils.compFactory.getCompClass(structure.componentType)(props);
    }

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function TPAModalAspect(aspectSiteApi) {
        /** @type core.SiteAspectsSiteAPI */
        this.aspectSiteApi = aspectSiteApi;
        this.modalStructure = null;
    }

    TPAModalAspect.prototype = {
        getComponentStructures: function () {
            if (this.modalStructure) {
                return [this.modalStructure];
            }
            return null;
        },

        /**
         *
         * @returns {ReactComponent[]}
         */
        getReactComponents: function (loadedStyles) {
            if (this.modalStructure) {
                return [getComp(this.modalStructure, this.aspectSiteApi.getSiteAPI(), loadedStyles, this.modalData, this.modalOnClose)];
            }
            return null;
       },

        showModal: function(data, callback) {
            if (this.aspectSiteApi.getSiteData().isMobileView()) {
                if (data.theme === 'LIGHT_BOX') {
                    this.aspectSiteApi.exitFullScreenMode();
                    this.aspectSiteApi.setSiteRootHiddenState(true);
                } else {
                    this.aspectSiteApi.enterFullScreenMode();
                    this.aspectSiteApi.setSiteRootHiddenState(false);
                }
            }

            this.modalStructure = getModalStructure();
            this.modalData = data;
            this.modalOnClose = callback;
            this.aspectSiteApi.forceUpdate();
        },

        removeModal: function () {
            if (this.aspectSiteApi.getSiteData().isMobileView()) {
                this.aspectSiteApi.exitFullScreenMode();
                this.aspectSiteApi.setSiteRootHiddenState(false);
            }
            this.modalStructure = null;
            this.aspectSiteApi.forceUpdate();
        }
    };

    return TPAModalAspect;
});
