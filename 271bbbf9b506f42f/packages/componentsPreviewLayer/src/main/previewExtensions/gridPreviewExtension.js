define([
    'lodash',
    'previewExtensionsCore',
    'experiment'
], function (
    _,
    previewExtensionsCore,
    experiment
) {
    'use strict';

    var compType = 'wysiwyg.viewer.components.Grid';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var FieldType = Object.freeze({
        STRING: 'string',
        NUMBER: 'number',
        DATE: 'date',
        IMAGE: 'image',
        BOOLEAN: 'bool',
        RICH_TEXT: 'richText'
    });

    var DataSourceType = Object.freeze({
        STATIC: 'static',
        DYNAMIC: 'dynamic'
    });

    var ViewMode = Object.freeze({
        EDITOR: 'editor',
        PREVIEW: 'preview'
    });

    function generateDummyDataByType(fieldType) {
        var dummyData;
        switch (fieldType) {
            case FieldType.STRING:
                dummyData = 'lorem Ipsum';
                break;
            case FieldType.NUMBER:
                dummyData = Math.round(Math.random() * 100);
                break;
            case FieldType.DATE:
                dummyData = new Date();
                break;
            case FieldType.IMAGE:
                dummyData = 'image://v1/9ab0d1_39d56f21398048df8af89aab0cec67b8~mv1.png/244_68/9ab0d1_39d56f21398048df8af89aab0cec67b8~mv1.webp';
                break;
            case FieldType.BOOLEAN:
                dummyData = Math.random() > 0.5;
                break;
        }
        return dummyData;
    }

    var extension = {
        transformPropsWithPreviewDummyData: function (props, nextProps) {
            var transformedProps = nextProps;
            // Generate dummy data only while editing, not in preview mode
            if (this.isInEditorEditMode()) {
                var columns = nextProps.compProp.columns;
                var rows = nextProps.compData.rows;
                var newRows = _.cloneDeep(rows);
                var rowsWereModified = false;

                _.forEach(columns, function (column) {
                    _.forEach(newRows, function (row) {
                         if (!_.has(row, column.dataPath)) {
                            _.set(row, column.dataPath, generateDummyDataByType(column.type));
                            rowsWereModified = true;
                         }
                    });
                });

                if (rowsWereModified) {
                    transformedProps.compData.rows = newRows;
                    transformedProps.compData.revision = Date.now();
                    transformedProps.compProp.dataSource = {
                        type: DataSourceType.STATIC,
                        id: Date.now()
                    };
                }
            }
            return transformedProps;
        },



        isInEditorEditMode: function () {
            return this.props.renderFlags.componentViewMode === ViewMode.EDITOR;
        }
    };

    if (experiment.isOpen('se_grid')) {
        previewExtensionsRegistrar.registerCompExtension(compType, extension);
    }
});