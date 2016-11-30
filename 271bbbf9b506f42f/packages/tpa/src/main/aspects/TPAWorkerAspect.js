define(['lodash', 'siteUtils', 'santaProps'],
    function(_, siteUtils, santaProps) {
        "use strict";

        var getTPAWorkerStructure = function (tpaWorkerId) {
            return {
                "componentType": "tpa.viewer.classes.TPAWorker",
                "skin": "wysiwyg.viewer.skins.TPAWidgetSkin",
                "type": "Component",
                "id": tpaWorkerId
            };
        };
        var createTPAWorkerComponent = function (siteAPI, loadedStyles, tpaWorkerData) {
            var workerId = 'tpaWorker_' + tpaWorkerData.applicationId;
            var structure = getTPAWorkerStructure(workerId);
            var props = santaProps.componentPropsBuilder.getCompProps(structure, siteAPI, null, loadedStyles);
            props.compData = tpaWorkerData;

            return siteUtils.compFactory.getCompClass(structure.componentType)(props);
        };

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function TPAWorkerAspect(aspectSiteAPI) {
            this._aspectSiteAPI = aspectSiteAPI;
        }

        TPAWorkerAspect.prototype = {
            getComponentStructures: function () {
                var structures = [];
                var clientSpecMap = this._aspectSiteAPI.getSiteData().getClientSpecMap();
                var workers = this.getTPAWorkers(clientSpecMap);

                if (!_.isEmpty(workers)) {
                    var workerStructure = getTPAWorkerStructure();
                    structures.push(workerStructure);
                }

                return structures;
            },
            getTPAWorkers: function (specMap) {
                var workerSpecs = _.filter(specMap, function(spec) {
                    return _.isString(spec.appWorkerUrl) && spec.permissions && !spec.permissions.revoked;
                });

                return workerSpecs;
            },
            /**
             *
             * @param loadedStyles
             */
            getReactComponents: function (loadedStyles) {
                var clientSpecMap = this._aspectSiteAPI.getSiteData().getClientSpecMap();
                var siteAPI = this._aspectSiteAPI.getSiteAPI();
                var workerSpecs = this.getTPAWorkers(clientSpecMap);
                var workerComps = [];

                _.forEach(workerSpecs, function (workerSpec) {
                    var workerComp = createTPAWorkerComponent(siteAPI, loadedStyles, workerSpec);
                    workerComps.push(workerComp);
                });

                return workerComps;
            }
        };

        return TPAWorkerAspect;
    });
