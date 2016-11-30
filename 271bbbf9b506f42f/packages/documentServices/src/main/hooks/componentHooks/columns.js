/**
 * Created by talm on 18/08/15.
 */
define(['lodash',
        'documentServices/dataModel/dataModel',
        'documentServices/component/component',
        'documentServices/componentsMetaData/componentsMetaData',
        'documentServices/structure/structure',
        'documentServices/utils/utils'],
    function (_,
              dataModel,
              component,
              componentsMetaData,
              structure,
              dsUtils) {
        'use strict';

        var COLUMNS_CONTAINER_TYPE = 'wysiwyg.viewer.components.StripColumnsContainer';

        function handleColumnDeletion(ps, deletedCompPointer, deletingParent) {
            if (deletingParent) {
                return;
            }

            var columnsContainerPtr = ps.pointers.components.getParent(deletedCompPointer);
            var columnPointers = ps.pointers.components.getChildren(columnsContainerPtr);
            var numberOfColumns = columnPointers.length;

            if (numberOfColumns === 2) {
                var noMargin = {
                    rowMargin: 0,
                    columnsMargin: 0,
                    siteMargin: 0,
                    frameMargin: 0
                };
                dataModel.updatePropertiesItem(ps, columnsContainerPtr, noMargin);
            }
        }

        function deleteContainerIfHasNoMoreColumns(ps, componentPointer, deletingParent, removeArgs, deletedParentFromFull, copyDataItem, parentPointer) {
            var columnPointers = ps.pointers.components.getChildren(parentPointer);

            if (!columnPointers.length && !deletingParent) {
                component.deleteComponent(ps, parentPointer);
            }
        }

        function moveFullWidthCompsToPage(ps, columnsContainerPtr) {
            var singleColumnStripPtr = _.first(ps.pointers.components.getChildren(columnsContainerPtr));
            var stripChildren = ps.pointers.components.getChildren(singleColumnStripPtr);

            _.forEach(stripChildren, function (childComp) {
                if (dsUtils.getComponentType(ps, childComp) === COLUMNS_CONTAINER_TYPE ||
                    componentsMetaData.public.isFullWidth(ps, childComp)) {

                    structure.reparentComponentToPage(ps, childComp, true);
                }
            });
        }

        function handleSplitToColumns(ps, addedColumnPtr, columnsContainerPtr/*, compDefinitionPrototype*/) {
            var columns = ps.pointers.components.getChildren(columnsContainerPtr);
            if (columns.length === 1) { // splitting from strip to column
                moveFullWidthCompsToPage(ps, columnsContainerPtr);
            }
        }

        function handleFullWidthPropertyChange(ps, columnsContainerPtr, updatedPropertiesItem) {
            var currProperties = dataModel.getPropertiesItem(ps, columnsContainerPtr);
            if (currProperties.fullWidth && _.get(updatedPropertiesItem, 'fullWidth', currProperties.fullWidth) !== currProperties.fullWidth) {
                moveFullWidthCompsToPage(ps, columnsContainerPtr);
            }
        }

        function handleRowMarginPropertyChange(ps, columnsContainerPtr, updatedPropertiesItem) {
            var currProperties = dataModel.getPropertiesItem(ps, columnsContainerPtr);
            var newRowMargin = _.get(updatedPropertiesItem, 'rowMargin', currProperties.rowMargin);

            if (newRowMargin !== currProperties.rowMargin) {
                var columnPtrs = ps.pointers.components.getChildren(columnsContainerPtr);
                _.forEach(columnPtrs, function (columnPtr) {
                    var yPointer = ps.pointers.getInnerPointer(columnPtr, 'layout.y');
                    ps.dal.set(yPointer, newRowMargin);
                });
            }
        }

        return {
            handleFullWidthPropertyChange: handleFullWidthPropertyChange,
            handleRowMarginPropertyChange: handleRowMarginPropertyChange,
            handleSplitToColumns: handleSplitToColumns,
            handleColumnDeletion: handleColumnDeletion,
            deleteContainerIfHasNoMoreColumns: deleteContainerIfHasNoMoreColumns
        };
    });
