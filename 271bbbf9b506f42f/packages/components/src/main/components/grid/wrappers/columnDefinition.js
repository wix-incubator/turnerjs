define([
        'lodash',
        'experiment',
        'components/components/grid/core/enums',
        'components/components/grid/wrappers/newValueHandler',
        'components/components/grid/wrappers/dateFilter',
        'components/components/grid/wrappers/cellRenderers'
    ],
    function (_, experiment, enums, NewValueHandler, dateFilter, cellRenderers) {
        'use strict';

        var COMPONENT_WIDTH_PATH = 'structure.layout.width';
        var FieldType = enums.FieldType;

        function ColumnDefinition (props, column) {
            var fieldType = column.type;
            var optionsByType = ColumnDefinition.byFieldType[fieldType];
            var columnOptions = _.assign(
                {
                    colId: column.id,
                    field: column.id,
                    headerName: column.label,
                    width: ColumnDefinition.getColumnWidth(props, column),
                    hide: !column.visible,

                    valueGetter: ColumnDefinition.getValueGetter(column),
                    newValueHandler: _.partial(NewValueHandler.update, column),
                    cellRenderer: ColumnDefinition.getCellRenderer(props, column),
                    editable: ColumnDefinition.getEditable(props.compProp, optionsByType)
                },
                optionsByType
            );

            if (!experiment.isOpen('se_gridUoUEdit')) {
                _.assign(columnOptions, {editable: false});
            }

            return columnOptions;
        }

        ColumnDefinition.getValueGetter = function (column) {
            return function (params) {
                return {
                    data: _.get(params.data, column.dataPath),
                    link: _.get(params.data, column.linkPath + '_linkObj'),
                    // to make ag-grid's default filters/sorting work with nested data
                    toString: function () { return this.data.toString(); }
                };
            };
        };

        ColumnDefinition.getEditable = function (compProp, columnOptions) {
            return compProp.allowUserEditing && !_.isUndefined(columnOptions) && columnOptions.editable;
        };

        ColumnDefinition.getCellRenderer = function (props, column) {
            var fieldType = column.type;
            var cellRenderer = cellRenderers.get(fieldType, props);
            if (_.isUndefined(column.linkPath)) {
                return cellRenderer;
            }
            return cellRenderers.linkRenderer(cellRenderer, props.linkRenderInfo, props.rootNavigationInfo);
        };

        ColumnDefinition.getColumnWidth = function (props, column) {
            switch (props.compProp.columnLayout) {
                case enums.ColumnLayout.EQUAL:
                    if (props.compProp.columns.length === 0) { return 0; }
                    return _.get(props, COMPONENT_WIDTH_PATH) / props.compProp.columns.length;
                default:
                    return column.width;
            }
        };

        ColumnDefinition.byFieldType = {};

        ColumnDefinition.byFieldType[FieldType.STRING] = {
            filter: 'text',
            editable: true
        };

        ColumnDefinition.byFieldType[FieldType.NUMBER] = {
            filter: 'number',
            editable: true
        };

        function dateComparator (dateA, dateB) {
            return new Date(dateA) - new Date(dateB);
        }

        ColumnDefinition.byFieldType[FieldType.DATE] = {
            filter: dateFilter,
            comparator: dateComparator,
            editable: true
        };

        return ColumnDefinition;
    }
);
