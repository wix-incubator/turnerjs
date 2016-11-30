define([
        'lodash',
        'components/components/grid/apiCallMaps/updateApiCallMap',
        'components/components/grid/apiCallMaps/uiStateApiCallMap',
        'components/components/grid/core/enums'
    ],
    function (_, UpdateApiCallMap, UiStateApiCallMap, Enums) {
        'use strict';

        function shouldColumnsPropChange (props) {
            return props.compProp.columnLayout === Enums.ColumnLayout.EQUAL;
        }

        function PropsInspector (props, nextProps) {

            var propsToUpdate = _(nextProps.compProp)
                .pick(PropsInspector.agGridAffectingProps)
                .reduce(function(diff, value, key) {
                    if (!_.isEqual(value, props.compProp[key])) {
                        diff[key] = value;
                    }
                    return diff;
                }, {});

            propsToUpdate = _.reduce(PropsInspector.propChangeTests, function (result, propChangeTest){
                if (propChangeTest.test(nextProps)) {
                    var changedProp = {};
                    changedProp[propChangeTest.mappedProp] = nextProps.compProp[propChangeTest.mappedProp];
                    _.assign(result, changedProp);
                }

                return result;
            }, propsToUpdate);

            return {
                props: propsToUpdate,
                dataChanged: props.compData.revision !== nextProps.compData.revision
            };
        }

        PropsInspector.propChangeTests = [
            {
                test: shouldColumnsPropChange,
                mappedProp: 'columns'
            }
        ];

        PropsInspector.agGridAffectingProps = [
            'allowUserEditing',
            'allowUserFiltering',
            'allowUserSorting',
            'columnLayout',
            'columns',
            'dataSource',
            'dateFormat',
            'headerHeight',
            'heightLayout',
            'horizontalAlignment',
            'linkTarget',
            'pagination',
            'rowHeight',
            'showHeader',
            'userFilter',
            'userSelection',
            'userSelectionType'
        ];

        PropsInspector.apiProperties = UpdateApiCallMap.propertyUpdateOrder;

        PropsInspector.hasOnlyApiProps = function (processedProps) {
            return _(processedProps.props)
                .keys()
                .difference(PropsInspector.apiProperties)
                .isEmpty();
        };

        PropsInspector.didDataSourceChange = function (processedProps) {
            return _.has(processedProps.props, 'dataSource') || _.has(processedProps.props, 'pagination');
        };

        PropsInspector.didDataChange = function (processedProps) {
            return processedProps.dataChanged;
        };

        PropsInspector.didUIPropsChange = function (processedProps) {
            return !_(processedProps.props)
                .keys()
                .intersection(UiStateApiCallMap.uiProperties)
                .isEmpty();
        };

        PropsInspector.isEmpty = function (processedProps) {
            return _.isEmpty(processedProps.props) && !processedProps.dataChanged;
        };

        PropsInspector.hasPagesPagination = function (props) {
            return props.compProp.pagination.type === Enums.PaginationType.PAGES;
        };

        return PropsInspector;
    }
);
