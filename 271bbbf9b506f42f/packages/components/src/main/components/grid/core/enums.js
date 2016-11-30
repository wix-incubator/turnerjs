define([], function () {
    'use strict';

    return {

        FieldType: Object.freeze({
            STRING: 'string',
            DATE: 'date',
            NUMBER: 'number',
            IMAGE: 'image',
            BOOLEAN: 'bool',
            RICH_TEXT: 'richText'
        }),

        SortDirection: Object.freeze({
            ASC: 'asc',
            DESC: 'desc',
            NONE: 'none'
        }),

        UserSelectionType: Object.freeze({
            NONE: 'none',
            CELL: 'cell',
            ROW: 'row'
        }),

        DataSourceType: Object.freeze({
            DYNAMIC: 'dynamic',
            STATIC: 'static'
        }),

        PaginationType: Object.freeze({
            PAGES: 'pagination',
            SCROLL: 'virtual',
            NONE: 'normal'
        }),

        HorizontalAlignment: Object.freeze({
            LEFT: 'left',
            CENTER: 'center',
            RIGHT: 'right'
        }),

        filtering: {
            NumericOperator: Object.freeze({
                EQUALS: 'EQUALS',
                NOT_EQUALS: 'NOT_EQUALS',
                LESS_THAN: 'LESS_THAN',
                LESS_OR_EQUALS: 'LESS_OR_EQUALS',
                GREATER_THAN: 'GREATER_THAN',
                GREATER_OR_EQUALS: 'GREATER_OR_EQUALS'
            }),

            StringOperator: Object.freeze({
                EQUALS: 'EQUALS',
                NOT_EQUALS: 'NOT_EQUALS',
                CONTAINS: 'CONTAINS',
                STARTS_WITH: 'STARTS_WITH',
                ENDS_WITH: 'ENDS_WITH'
            }),

            DateOperator: Object.freeze({
                LAST_X_DAYS: 'LAST_X_DAYS',
                LAST_X_WEEKS: 'LAST_X_WEEKS',
                LAST_X_MONTHS: 'LAST_X_MONTHS'
            })
        },

        ColumnLayout: Object.freeze({
            EQUAL: 'equal',
            FIT_CONTENT: 'fitContent',
            MANUAL: 'manual'
        })
    };
});
