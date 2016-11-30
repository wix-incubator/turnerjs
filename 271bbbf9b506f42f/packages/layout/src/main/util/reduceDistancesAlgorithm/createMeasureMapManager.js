define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var DEFAULT_MIN_HEIGHT = 5;

    function getRotatedHeight(height, width, angleInDegrees){
        return utils.boundingLayout.getBoundingHeight({height: height, width: width, rotationInDegrees: angleInDegrees});
    }

    function getRotatedY(y, height, width, angleInDegrees){
        return utils.boundingLayout.getBoundingY({y: y, height: height, width: width, rotationInDegrees: angleInDegrees});
    }

    function getRotatedCompsDiffMap(measureMap, flatDataMap){
        return _(flatDataMap)
            .pick(function(component){
                return _.get(component, 'layout.rotationInDegrees');
            })
            .mapValues(function(component, compId){
                var measuredTop = measureMap.top[compId];
                var measuredHeight = measureMap.height[compId];
                var measuredWidth = measureMap.width[compId];

                var rotatedHeight = getRotatedHeight(measuredHeight, measuredWidth, component.layout.rotationInDegrees);
                var rotatedY = getRotatedY(measuredTop, measuredHeight, measuredWidth, component.layout.rotationInDegrees);

                return {
                    heightDiff: rotatedHeight - measuredHeight,
                    yDiff: rotatedY - measuredTop
                };
            }).value();
    }

    function MeasureMapManager(measureMap, flatDataMap){

        var measuredData = measureMap;
        var rotatedCompsDiffMap = getRotatedCompsDiffMap(measureMap, flatDataMap);

        function getRotatedTopDiff(componentId){
            return _.get(rotatedCompsDiffMap, [componentId, 'yDiff'], 0);
        }

        function getRotatedHeightDiff(componentId){
            return _.get(rotatedCompsDiffMap, [componentId, 'heightDiff'], 0);
        }

        _.merge(this, {
            get: function(){
                return measuredData;
            },
            getComponentTop: function(componentId){
                if (_.isUndefined(measuredData.top[componentId])){
                    return undefined;
                }

                return measuredData.top[componentId] + getRotatedTopDiff(componentId);
            },
            getComponentHeight: function(componentId){
                if (_.isUndefined(measuredData.height[componentId])){
                    return undefined;
                }

                if (measuredData.collapsed[componentId]){
                    return 0;
                }

                return measuredData.height[componentId] + getRotatedHeightDiff(componentId);
            },
            getComponentMinHeight: function(componentId){
                if (measuredData.collapsed[componentId]){
                    return 0;
                }

                return _.max([measuredData.minHeight[componentId], DEFAULT_MIN_HEIGHT]);
            },
            getContainerHeightMargin: function(componentId){
                return measuredData.containerHeightMargin[componentId] || 0;
            },
            isCollapsed: function(componentId){
                return Boolean(measuredData.collapsed[componentId]);
            },
            isShrinkableContainer: function(componentId){
                return Boolean(measuredData.shrinkableContainer[componentId]);
            },
            getComponentWidth: function(componentId){
                return measuredData.width[componentId];
            },
            getClientSize: function(){
                return {
                    width: measuredData.clientWidth,
                    height: measuredData.clientHeight
                };
            },
            setComponentTop: function(componentId, top){
                //note: this is the logic from the old editor, and if a bottom_bottom or bottom_parent anchor would make a rotated component grow, this would not actually work correctly (it is incorrect math).
                // This is the calculation we have for backwards compatibility... - Etai
                measuredData.top[componentId] = top - getRotatedTopDiff(componentId);
            },
            setComponentHeight: function(componentId, height) {
                //note: this is the logic from the old editor, and if a bottom_bottom or bottom_parent anchor would make a rotated component grow, this would not actually work correctly (it is incorrect math).
                // This is the calculation we have for backwards compatibility... - Etai
                measuredData.height[componentId] = height - getRotatedHeightDiff(componentId);
            }
        });
    }

    return function createMeasureMapManager(measureMap, flatDataMap){
        return new MeasureMapManager(measureMap, flatDataMap);
    };
});
