define(
    ['lodash', 'utils', 'documentServices/wixapps/services/types', 'documentServices/wixapps/services/views', 'documentServices/wixapps/services/lists', 'documentServices/wixapps/utils/richTextFieldLayoutUtils', 'documentServices/wixapps/utils/appPart2LayoutUtils', 'documentServices/wixapps/utils/proxyUtils'],
    function (_, utils, types, views, lists, richTextFieldLayoutUtils, appPart2LayoutUtils, proxyUtils) {
        'use strict';

        var ERROR_VIEW_NOT_FOUND = 'View definition not found';
        var ERROR_TYPE_NOT_FOUND = 'Type definition not found';
        var ERROR_FIELD_SCHEMA_NOT_FOUND = 'Field schema not found';
        var ERROR_FIELD_NOT_FOUND_IN_VIEW = 'Field not found in view';
        var ERROR_GIVEN_VALUE_IS_INVALID = 'Given value is invalid';

        var REQUIRED_TYPE_DEF_FIELDS = ['name', 'displayName', 'type'];

        var COMPONENT_TYPE_RICH_TEXT = 'wysiwyg.viewer.components.WRichText';

        function throwError(errorMessage) {
            throw new Error(errorMessage);
        }

        function isFieldProxy(obj) {
            return obj.comp && (obj.comp.name === 'Field' || obj.comp.name === 'TextField');
        }

        function getProxyPropsByType(viewDef, type) {
            var proxyClass = proxyUtils.getCompProxyClass(viewDef);
            var propDefs = proxyClass.getPropDefs(type);
            var propsBasePath = type === 'compProp' ? viewDef.comp : viewDef;
            return _.mapValues(propDefs, function (propDef, propName) {
                return propsBasePath[propName] || propDef.defaultValue;
            });
        }

        function getInnerCompView(fieldInView) {
            var innerCompViewPath = ['comp', 'items', '0'];
            return utils.objectUtils.resolvePath(fieldInView, innerCompViewPath);
        }

        function getProxyProps(viewDef) {
            var compProps = getProxyPropsByType(viewDef, 'viewProp');
            var viewProps = getProxyPropsByType(viewDef, 'compProp');
            return _.assign({}, viewProps, compProps);
        }

        function getFieldPath(viewDef, fieldName) {
            return utils.objectUtils.findPath(viewDef, function (obj) {
                return obj && obj.data === fieldName && isFieldProxy(obj);
            });
        }

        function getFieldSchema(ps, listId, fieldName) {
            var type = lists.getType(ps, listId) || throwError(ERROR_TYPE_NOT_FOUND);
            return _.find(type.fields, {name: fieldName}) || throwError(ERROR_FIELD_SCHEMA_NOT_FOUND);
        }

        function getFieldInView(viewDef, fieldName) {
            return _.first(utils.objectUtils.filter(viewDef, function (obj) {
                    return obj && obj.data === fieldName && isFieldProxy(obj);
                })) || throwError(ERROR_FIELD_NOT_FOUND_IN_VIEW);
        }

        function getFieldProps(ps, fieldSchema, fieldInView) {
            var wrapperCompProps = getProxyProps(fieldInView);
            var innerCompView = getInnerCompView(fieldInView);
            var innerCompProps = _.omit(getProxyProps(innerCompView), 'hidden'); // taken from field props only
            var typeDefFieldProps = _.pick(fieldSchema, REQUIRED_TYPE_DEF_FIELDS);

            // the order matters
            var fieldProps = _.assign({},
                typeDefFieldProps,
                wrapperCompProps,
                innerCompProps, {
                    componentType: proxyUtils.getCompProxyClass(innerCompView).componentType,
                    style: proxyUtils.getStyle(ps, innerCompView)
                }
            );

            if (fieldProps.componentType === COMPONENT_TYPE_RICH_TEXT) {
                return richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(ps, fieldProps);
            }
            return fieldProps;
        }

        function replaceViewDefProps(fieldInView, propsToChange, ignoreProps) {
            var proxyClass = proxyUtils.getCompProxyClass(fieldInView);
            var allowedViewProps = _.difference(_.keys(proxyClass.getPropDefs('viewProp')), ignoreProps);
            var allowedCompProps = _.difference(_.keys(proxyClass.getPropDefs('compProp')), ignoreProps);

            _.assign(fieldInView, _.pick(propsToChange, allowedViewProps));
            _.assign(fieldInView.comp, _.pick(propsToChange, allowedCompProps));
        }

        /**
         * Get layout properties for all fields
         * @param Private Services ps
         * @param {String} listId
         * @param {String} format
         * @returns {Array}
         */
        function getAll(ps, listId, format) {
            var viewDef = lists.getItemView(ps, listId, format);
            if (!viewDef) {
                return null;
            }
            var type = lists.getType(ps, listId) || throwError(ERROR_TYPE_NOT_FOUND);
            var fieldNames = _.pluck(type.fields, 'name');
            var viewFields = utils.objectUtils.filter(viewDef, function (obj) {
                return obj && _.includes(fieldNames, obj.data) && isFieldProxy(obj);
            });
            var allFieldProps = _.map(viewFields, function (fieldInView) {
                var fieldSchema = _.find(type.fields, {name: fieldInView.data});
                return getFieldProps(ps, fieldSchema, fieldInView);
            });
            return _.sortBy(allFieldProps, function (fieldProps) {
                return fieldNames.indexOf(fieldProps.name);
            });
        }

        /**
         * Get layout properties for a specific field
         * @param Private Services ps
         * @param {String} listId
         * @param {String} fieldName
         * @param {String} format
         * @returns {Object}
         */
        function getField(ps, listId, fieldName, format) {
            var viewDef = lists.getItemView(ps, listId, format);
            if (!viewDef) {
                return null;
            }
            var fieldSchema = getFieldSchema(ps, listId, fieldName);
            var fieldInView = getFieldInView(viewDef, fieldName);
            return getFieldProps(ps, fieldSchema, fieldInView);
        }

        /**
         * Set layout properties
         * @param Private Services ps
         * @param {String} listId
         * @param {Object} newFieldProps
         * @param {String} format
         */
        function set(ps, compRef, listId, newFieldProps, format) {
            var fieldName = newFieldProps.name || throwError(ERROR_GIVEN_VALUE_IS_INVALID);
            var existingFieldProps = getField(ps, listId, fieldName, format);
            var changedFieldProps = _.omit(newFieldProps, function (value, key) {
                return _.isEqual(value, existingFieldProps[key]);
            });

            if (existingFieldProps.componentType === COMPONENT_TYPE_RICH_TEXT) {
                changedFieldProps = richTextFieldLayoutUtils.convertFieldPropsToViewDefProps(changedFieldProps, existingFieldProps);
            }

            var viewDef = lists.getItemView(ps, listId, format) || throwError(ERROR_VIEW_NOT_FOUND);
            var fieldInView = getFieldInView(viewDef, fieldName);
            var type = lists.getType(ps, listId) || throwError(ERROR_TYPE_NOT_FOUND);

            replaceViewDefProps(fieldInView, changedFieldProps, ['layout', 'style']);

            var innerCompView = getInnerCompView(fieldInView);
            replaceViewDefProps(innerCompView, changedFieldProps, ['hidden', 'style']);

            if (!_.isUndefined(changedFieldProps.style)) {
                innerCompView.comp.style = changedFieldProps.style;
            }

            var pathToFieldInView = getFieldPath(viewDef, fieldName);
            views.setValueInView(ps, type.name, viewDef.name, pathToFieldInView, fieldInView, format);
            appPart2LayoutUtils.updateAppPart2MinWidth(ps, compRef, changedFieldProps, viewDef);
        }

        return {
            getField: getField,
            getAll: getAll,
            set: set
        };
    });
