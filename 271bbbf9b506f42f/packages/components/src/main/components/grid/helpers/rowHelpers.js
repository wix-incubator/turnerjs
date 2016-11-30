define([
        'lodash'
    ],
    function (_) {
        'use strict';

        var RowHelpers = {
            createRow: function (columns, rowData, editColumnId, editValue) {
                var formattedRow = {};
                _.forEach(columns, function (col){
                    var data = _.get(rowData, col.dataPath);
                    if (editValue && col.id === editColumnId) { data = editValue; }
                    _.set(formattedRow, col.dataPath, data);
                });

                return formattedRow;
            },

            getRowIndex: function (props, row) {
                return _.findIndex(props.compData.rows, row);
            }
        };

        return RowHelpers;
    }
);
