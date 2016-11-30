define(['lodash', 'utils', 'documentServices/wixapps/utils/pathUtils', 'documentServices/wixapps/services/types', 'wixappsCore'], function (_, utils, pathUtils, types, wixappsCore) {
    'use strict';

    var ERROR_TYPE_DOES_NOT_EXIST = 'Type does not exist';
    var ERROR_CANNOT_CREATE_VIEWS_WITH_DUPLICATE_IDS = 'Cannot created multiple views with the same type, name & format';
    var ERROR_VIEW_DOES_NOT_EXIST = 'View does not exist';
    var ERROR_MUST_PROVIDE_VIEW_DEF = 'Must provide a view definition';

    var VIEW_TYPE_ARRAY = 'Array';

    function throwError(errorMessage) {
        throw new Error(errorMessage);
    }

    // Should stay internal to ensure uniqueness of view IDs
    function createViewWithName(ps, viewDef, name) {
        if (viewDef.forType !== VIEW_TYPE_ARRAY && !types.getType(ps, viewDef.forType)) {
            throw new Error(ERROR_TYPE_DOES_NOT_EXIST);
        }
        var newView = _.cloneDeep(viewDef);
        replaceNestedValue(newView, viewDef.name, name);
        newView.name = name;
        var newViewId = getViewId(newView.forType, newView.name, newView.format);
        ps.dal.full.setByPath(pathUtils.getViewPath(newViewId), newView);
        return newViewId;
    }

    function getViewId(type, name, format) {
        return wixappsCore.viewsUtils.getViewId(type, name, format);
    }

    function replaceNestedValue(source, oldValue, newValue) {
        _.forEach(source, function (innerValue, key) {
            if (_.isObject(innerValue)) {
                replaceNestedValue(innerValue, oldValue, newValue);
            } else if (innerValue === oldValue) {
                source[key] = newValue;
            }
        });
    }

    function verifyUniqueViewIds(viewDefs, viewName) {
        var viewIds = _.map(viewDefs, function (viewDef) {
            return getViewId(viewDef.forType, viewName, viewDef.format);
        });
        if (_.uniq(viewIds).length < viewIds.length) {
            throw new Error(ERROR_CANNOT_CREATE_VIEWS_WITH_DUPLICATE_IDS);
        }
    }

    function getIdsForViewsByName(ps, viewName) {
        var allViewIds = ps.dal.getKeysByPath(pathUtils.getBaseViewsPath());
        return _.filter(allViewIds, function(viewId) {
            return wixappsCore.viewsUtils.getViewNameFromId(viewId) === viewName;
        });
    }

    /**
     * Get a map of all views with the given name
     * @param ps Private Services
     * @param {string} viewName
     * @returns {Object} Map of all views with the given name
     */
    function getAllViewsByName(ps, viewName) {
        var viewIdsWithName = getIdsForViewsByName(ps, viewName);
        var viewsWithName = _.map(viewIdsWithName, function(viewId) {
            return ps.dal.getByPath(pathUtils.getViewPath(viewId));
        });
        return _.zipObject(viewIdsWithName, viewsWithName);
    }

    /**
     * Create a new view from a given definition
     * @param ps Private Services
     * @param {Object} viewDef
     * @returns {string} ID of the created view
     */
    function createView(ps, viewDef) {
        var viewName = (viewDef.name || 'viewDef') + '_' + utils.guidUtils.getUniqueId();
        return createViewWithName(ps, viewDef, viewName);
    }

    /**
     * Create multiple view definitions that will have the same view name
     * @param ps Private Services
     * @param {Object[]} viewDefs array of view definitions
     * @returns {string[]} Array of IDs of the created views
     * @throws Throws an error the given view definitions have colliding IDs (type, name & format)
     */
    function createViewsWithSameName(ps, viewDefs) {
        var viewName = (viewDefs[_.keys(viewDefs)[0]].name || 'viewDef') + '_' + utils.guidUtils.getUniqueId();
        verifyUniqueViewIds(viewDefs, viewName);
        return _.map(viewDefs, function (viewDef) {
            return createViewWithName(ps, viewDef, viewName);
        });
    }

    /**
     * Get a view definition by its ID
     * @param ps Private Services
     * @param {string} viewId
     * @returns {Object} The requested view definition
     */
    function getViewById(ps, viewId) {
        return ps.dal.getByPath(pathUtils.getViewPath(viewId));
    }

    /**
     * Get a view definition by its ID
     * @param ps Private Services
     * @param {string} type
     * @param {string} viewName
     * @param {string} format
     * @returns {Object} The requested view definition
     */
    function getView(ps, type, viewName, format) {
        return getViewById(ps, getViewId(type, viewName, format));
    }

    /**
     * Delete all view definitions with the given name
     * @param {object} ps Private Services
     * @param {string} viewName
     */
    function deleteAllViewsByName(ps, viewName) {
        var viewIdsWithName = getIdsForViewsByName(ps, viewName);
        _.forEach(viewIdsWithName, function(viewId) {
            ps.dal.full.removeByPath(pathUtils.getViewPath(viewId));
        });
    }

    /**
     * Replace the view with the given ID with a given view definition (after chaning its name and type)
     * @param {object} ps Private Services
     * @param {string} viewId
     * @param {object} viewDefTemplate - is being changed during replacement
     */
    function replaceView(ps, viewId, viewDefTemplate) {
        if (!viewDefTemplate) {
            throwError(ERROR_MUST_PROVIDE_VIEW_DEF);
        }
        var existingView = getViewById(ps, viewId) || throwError(ERROR_VIEW_DOES_NOT_EXIST);
        replaceNestedValue(viewDefTemplate, viewDefTemplate.name, existingView.name);
        viewDefTemplate.forType = existingView.forType;

        ps.dal.full.setByPath(pathUtils.getViewPath(viewId), viewDefTemplate);
    }

    function setValueInView(ps, type, viewName, pathInView, value, format) {
        var viewId = getViewId(type, viewName, format);
        var viewPath = pathUtils.getViewPath(viewId);
        ps.dal.full.setByPath(viewPath.concat(pathInView), value);
    }

    return {
        getAllViewsByName: getAllViewsByName,
        createView: createView,
        createViewsWithSameName: createViewsWithSameName,
        getViewById: getViewById,
        getView: getView,
        deleteAllViewsByName: deleteAllViewsByName,
        replaceView: replaceView,
        setValueInView: setValueInView
    };
});
