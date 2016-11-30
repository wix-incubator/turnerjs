define(['lodash',
        'utils',
        'documentServices/componentsMetaData/componentsMetaData',
        'documentServices/structure/utils/componentLayout'],
    function (_,
              utils,
              componentsMetaData,
              componentLayout) {
        'use strict';

        var LAYOUT_PROPS = ['x', 'y', 'width', 'height', 'rotationInDegrees', 'scale', 'fixedPosition', 'anchors', 'docked', 'aspectRatio'];

        function validate(fields, isValid, type, layout) {
            _(layout) //eslint-disable-line wix-editor/prefer-filter
                .pick(fields)
                .forEach(function(value, key){
                    if (!isValid(value)) {
                        throw new Error(key + ' is not a ' + type);
                    }
                })
                .commit();
        }

        var validateNumbersInLayout = _.partial(validate, ['x', 'y', 'width', 'height', 'rotationInDegrees', 'scale'], function (v) { return !isNaN(v); }, 'number');
        var validateBooleansInLayout = _.partial(validate, ['fixedPosition'], function (v) { return typeof v === 'boolean'; }, 'boolean');
        var validateObjectsInLayout = _.partial(validate, ['docked'], _.isPlainObject, 'object');
        var validateArraysInLayout = _.partial(validate, ['anchors'], _.isArray, 'array');

        function validateOnlySupportedProperties(layout){
            var unsupportedProperties = _.omit(layout, LAYOUT_PROPS);
            if (!_.isEmpty(unsupportedProperties)){
                throw new Error('Properties are not supported in layout:' + _.keys(unsupportedProperties));
            }
        }

        function validateLayoutSchema(layout) {
            if (layout) {
                validateNumbersInLayout(layout);
                validateBooleansInLayout(layout);
                validateObjectsInLayout(layout);
                validateArraysInLayout(layout);
                validateOnlySupportedProperties(layout);
            }

            if (!_.isUndefined(layout.rotationInDegrees)) {
                layout.rotationInDegrees = utils.math.parseDegrees(layout.rotationInDegrees);
            }
        }

        function getChangedLayout(currentLayout, newLayout) {
            return _.reduce(newLayout, function (result, val, key) {
                if (_.isPlainObject(newLayout[key])) {
                    result[key] = getChangedLayout(currentLayout, newLayout[key]);
                } else if (!_.isEqual(newLayout[key], currentLayout[key])) {
                    result[key] = val;
                }
                return result;
            }, {});
        }

        function validateLayoutRestrictions(privateServices, compPointer, newLayout, currentLayout) {
            var changedLayout = getChangedLayout(currentLayout, newLayout);

            if (!_.isUndefined(changedLayout.width) && !componentsMetaData.public.isHorizontallyResizable(privateServices, compPointer)) {
                delete newLayout.width;
                //throw new Error('Cannot update width of non horizontally resizeable component');
            }

            if (!_.isUndefined(changedLayout.height) && !componentsMetaData.public.isVerticallyResizable(privateServices, compPointer)) {
                delete newLayout.height;
                //throw new Error('Cannot update height of non vertically resizeable component');
            }

            if (!_.isUndefined(changedLayout.x) && !componentsMetaData.public.isHorizontallyMovable(privateServices, compPointer)) {
                delete newLayout.x;
                //throw new Error('Cannot update x of non horizontally movable component');
            }

            if (!componentsMetaData.public.isVerticallyMovable(privateServices, compPointer)) {
                if (!(componentsMetaData.public.canMoveUp(privateServices, compPointer) && (changedLayout.y < currentLayout.y))) {
                    if (_.isUndefined(changedLayout.isFixedPosition)) {
                        delete newLayout.y;
                        //throw new Error('Cannot update y position to a lower value if the component cannot move up');
                    }
                }
            }

            if (!_.isUndefined(changedLayout.rotationInDegrees) && !componentsMetaData.public.isRotatable(privateServices, compPointer)) {
                delete newLayout.rotationInDegrees;
                //throw new Error('Cannot update rotationInDegrees of a component that cannot be rotated');
            }

            if (!_.isUndefined(changedLayout.fixedPosition) && !componentsMetaData.public.canBeFixedPosition(privateServices, compPointer)) {
                delete newLayout.fixedPosition;
                //throw new Error('Cannot set fixedPosition to true for a component that cannot be in fixed position');
            }

        }

        function resolveLayoutConflicts(mergedLayout, newLayout, positionAndSize) {
            if (newLayout.docked) {
                if (utils.layout.isHorizontallyDocked(mergedLayout)) {

                    if (newLayout.docked.hCenter) {
                        delete mergedLayout.docked.left;
                        delete mergedLayout.docked.right;
                    } else if (newLayout.docked.left || newLayout.docked.right) {
                        delete mergedLayout.docked.hCenter;
                    }

                    mergedLayout.width = positionAndSize.width;
                }
                if (utils.layout.isVerticallyDocked(mergedLayout)) {

                    if (newLayout.docked.vCenter) {
                        delete mergedLayout.docked.top;
                        delete mergedLayout.docked.bottom;
                    } else if (newLayout.docked.top || newLayout.docked.bottom) {
                        delete mergedLayout.docked.vCenter;
                    }
                    mergedLayout.height = positionAndSize.height;
                }
            }
        }

        function validateMergedLayout(mergedLayout){
            if (utils.layout.isDockToScreen(mergedLayout) && mergedLayout.fixedPosition){
                throw new Error('Dock to screen component cannot be fixed position');
            }
        }

        function getValidLayoutToUpdate(ps, compPointer, newLayout) {
            var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
            var currentLayout = ps.dal.get(layoutPointer);

            var layoutToBeMerged = _.pick(newLayout, LAYOUT_PROPS);

            validateNewDockValues(newLayout);

            if (layoutToBeMerged.docked) {
                layoutToBeMerged.docked = getMergedDockValuesToUpdate(currentLayout.docked, newLayout.docked);
            }

            validateLayoutSchema(layoutToBeMerged);
            validateLayoutRestrictions(ps, compPointer, layoutToBeMerged, currentLayout);

            var layoutDiff = getChangedLayout(currentLayout, newLayout);
            var mergedLayout = _.assign({}, currentLayout, layoutToBeMerged);
            var positionAndSize = componentLayout.getPositionAndSize(ps, compPointer, mergedLayout);
            resolveLayoutConflicts(mergedLayout, layoutDiff, positionAndSize);
            validateMergedLayout(mergedLayout);

            return mergedLayout;
        }

        function validateNewDockValues(layout) {
            if (layout.docked) {
                if (layout.docked.hCenter && (layout.docked.left || layout.docked.right)) {
                    throw new Error('cannot set both hCenter and left OR right');
                }
                if (layout.docked.vCenter && (layout.docked.top || layout.docked.bottom)) {
                    throw new Error('cannot set both vCenter and top OR bottom');
                }
            }
        }

        function getMergedDockValuesToUpdate(currentDock, newDock) {
            if (currentDock) {
                return _.merge({}, currentDock, newDock);
            }
            return newDock;
        }

        function validateLayout(ps, compPointer) {
            var layout = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout'));
            validateLayoutSchema(layout);

            if (utils.layout.isHorizontallyDocked(layout) && _.isFinite(layout.x)) {
                throw new Error("Invalid layout- a component cannot be both docked horizontally and have an x position");
            }

            if (utils.layout.isVerticallyDocked(layout) && _.isFinite(layout.y)) {
                throw new Error("Invalid layout- a component cannot be both docked vertically and have a y position");
            }

            if (utils.layout.isHorizontallyStretched(layout) && _.isFinite(layout.width)) {
                throw new Error("Invalid layout- a component cannot be both stretched (docked) horizontally and have a set width");
            }

            if (utils.layout.isVerticallyStretched(layout) && _.isFinite(layout.height)) {
                throw new Error("Invalid layout- a component cannot be both stretched (docked) vertically and have a set height");
            }
        }

        return {
            getValidLayoutToUpdate: getValidLayoutToUpdate,
            validateLayout: validateLayout
        };

    });
