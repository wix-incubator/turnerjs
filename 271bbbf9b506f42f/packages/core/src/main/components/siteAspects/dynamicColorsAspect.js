define(['core/core/siteAspectsRegistry', 'lodash'],
    function (siteAspectsRegistry, _) {
        "use strict";

        function getCompLayoutFromMeasureMap(id) {
            var measureMap = this.aspectSiteAPI.getSiteData().measureMap;
            if (measureMap) {
                return {
                    top: measureMap.absoluteTop[id],
                    left: _.get(measureMap, 'custom[' + id + '].backgroundLeft', 0) + measureMap.absoluteLeft[id],
                    height: measureMap.height[id],
                    width: _.get(measureMap, 'custom[' + id + '].backgroundWidth', measureMap.width[id])
                };
            }

            return {};
        }

        function didElementLayoutChange(elementInfo, elementNewLayout) {
            return !_.isEqual(_.pick(elementInfo, 'height', 'top', 'left', 'width'), elementNewLayout);
        }

        function updateElementInfoLayout(info) {
            var elementLayout = getCompLayoutFromMeasureMap.call(this, info.id);

            if (didElementLayoutChange(info, elementLayout)) {
                _.assign(info, elementLayout);
                info.isDirty = true;
            }
        }

        function updateAllElementsInfoLayout() {
            _.forEach(this.colorElementInfo, updateElementInfoLayout, this);
        }

        function clearDirty(elementInfos) {
            _.forEach(elementInfos, function(info) {
                delete info.isDirty;
            });
        }

        function notifyObservers(value) {
            _.forEach(this.observers, function(observer) {
                observer(value);
            }, this);
        }

        function notifyObserversOnLayoutChanges() {
            updateAllElementsInfoLayout.call(this);

            var updatedElementsInfo = _.filter(this.colorElementInfo, 'isDirty');
            if (updatedElementsInfo.length) {
                notifyObservers.call(this, updatedElementsInfo);
                clearDirty(updatedElementsInfo);
            }
        }

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function DynamicColorsAspect(aspectSiteAPI) {
            this.aspectSiteAPI = aspectSiteAPI;
            this.colorElementInfo = {};
            this.observers = [];

            aspectSiteAPI.registerToDidLayout(notifyObserversOnLayoutChanges.bind(this));
        }

        DynamicColorsAspect.prototype = {
            updateInformation: function(id, info) {
                var currentInfo = this.colorElementInfo[id];
                var newInfo = _.assign({id: id}, currentInfo, info);
                updateElementInfoLayout.call(this, newInfo);

                if (!_.isEqual(newInfo, currentInfo)) {
                    this.colorElementInfo[id] = newInfo;
                    notifyObservers.call(this, [newInfo]);
                    clearDirty([newInfo]);
                }
            },
            getInformation: function(id) {
                if (id) {
                    return _.cloneDeep(this.colorElementInfo[id]);
                }
                return _.cloneDeep(this.colorElementInfo);
            },
            registerObserver: function(observer) {
                this.observers.push(observer);
            },
            unregisterObserver: function(observer) {
                _.pull(this.observers, observer);
            }
        };

        siteAspectsRegistry.registerSiteAspect('dynamicColorElements', DynamicColorsAspect);
    });
