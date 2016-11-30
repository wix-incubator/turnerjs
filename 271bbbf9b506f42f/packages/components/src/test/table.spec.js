define([
    'lodash',
    'testUtils',
    'react',
    'components/components/table/table'
], function (_, /** testUtils */testUtils, React, table) {
    'use strict';


    describe('Table component', function () {
        function getCompProps(compProp, compData) {
            compData = compData || {
                type: 'Table',
                columnsStyle: []
            };

            var props = testUtils.mockFactory.mockProps()
                .setCompData(compData)
                .setCompProp(compProp)
                .setSkin('wysiwyg.viewer.skins.table.TableComponentDefaultSkin');
            props.structure.componentType = 'wysiwyg.viewer.components.Table';

            var getDiv = function (cell, row) {
                var cellProps = {
                    key: row ? row + '_' + cell : cell
                };
                return React.DOM.div(cellProps);
            };

            props.getBodyCell = getDiv;
            props.getHeaderCell = getDiv;
            props.getFooterCell = getDiv;

            return props;
        }

        it('should call getBodyCell for every body cell', function () {
            var compProp = {
                numOfRows: 3,
                numOfColumns: 2
            };
            var props = getCompProps(compProp);
            spyOn(props, 'getBodyCell').and.callThrough();

            /** @type components.Table */
            testUtils.getComponentFromDefinition(table, props);

            // The number of calls should be rows * columns
            var expectedNumOfCalls = compProp.numOfRows * compProp.numOfColumns;
            expect(props.getBodyCell.calls.count()).toEqual(expectedNumOfCalls);

            // The correct row and column index should be pass to each call.
            _.forEach(_.range(expectedNumOfCalls), function (index) {
                var row = Math.floor(index / compProp.numOfColumns);
                var col = index % compProp.numOfColumns;
                expect(props.getBodyCell.calls.argsFor(index)).toEqual([col, row]);
            });
        });

        it('should call getHeaderCell the number columns iff compData.header is set to true', function () {
            var compProp = {
                numOfRows: 1,
                numOfColumns: 2,
                header: false
            };
            var props = getCompProps(compProp);
            spyOn(props, 'getHeaderCell').and.callThrough();

            /** @type components.Table */
            testUtils.getComponentFromDefinition(table, props);
            expect(props.getHeaderCell).not.toHaveBeenCalled();

            props.compProp.header = true;
            testUtils.getComponentFromDefinition(table, props);
            expect(props.getHeaderCell.calls.count()).toEqual(compProp.numOfColumns);
            _.forEach(_.range(compProp.numOfColumns), function (index) {
                expect(props.getHeaderCell.calls.argsFor(index)).toEqual([index]);
            });
        });

        it('should call getFooterCell the number columns iff compData.footer is set to true', function () {
            var compProp = {
                numOfRows: 1,
                numOfColumns: 2,
                footer: false
            };
            var props = getCompProps(compProp);
            spyOn(props, 'getFooterCell').and.callThrough();

            /** @type components.Table */
            testUtils.getComponentFromDefinition(table, props);
            expect(props.getFooterCell).not.toHaveBeenCalled();

            props.compProp.footer = true;
            testUtils.getComponentFromDefinition(table, props);
            expect(props.getFooterCell.calls.count()).toEqual(compProp.numOfColumns);
            _.forEach(_.range(compProp.numOfColumns), function (index) {
                expect(props.getFooterCell.calls.argsFor(index)).toEqual([index]);
            });
        });

        it('should set the columnsStyle on all the body cells but not on the header or the footer', function () {
            var compData = {
                type: 'Table',
                columnsStyle: [
                    {width: 100},
                    null,
                    {width: 200}
                ]
            };

            var compProp = {
                numOfRows: 3,
                numOfColumns: 3,
                header: true,
                footer: true
            };

            var props = getCompProps(compProp, compData);

            /** @type components.Table */
            var tableComponent = testUtils.getComponentFromDefinition(table, props);
            _.times(compProp.numOfRows, function (row) {
                _.times(compProp.numOfColumns, function (cell) {
                    var cellRefId = 'cell_' + row + '_' + cell;
                    var expectedWidth = compData.columnsStyle[cell] ? compData.columnsStyle[cell].width + 'px' : '';
                    expect(tableComponent.refs[cellRefId].style.width).toEqual(expectedWidth);
                });
            });

            _.times(compProp.numOfColumns, function (index) {
                var headerCellId = 'header_cell_' + index;
                expect(_.toArray(tableComponent.refs[headerCellId].style)).toEqual([]);

                var footerCellId = 'footer_cell_' + index;
                expect(_.toArray(tableComponent.refs[footerCellId].style)).toEqual([]);
            });
        });

        it('should set height when minHeight prop is set', function () {
            var compData = {
                type: 'Table',
                columnsStyle: []
            };

            var compProp = {
                minHeight: 100,
                numOfRows: 3,
                numOfColumns: 2
            };
            var props = getCompProps(compProp, compData);

            var tableComponent = testUtils.getComponentFromDefinition(table, props);
            expect(testUtils.getStyleObject(tableComponent.refs[''])).toEqual(jasmine.objectContaining({minHeight: compProp.minHeight + 'px', width: '100%'}));
            expect(testUtils.getStyleObject(tableComponent.refs.table)).toEqual(jasmine.objectContaining({height: compProp.minHeight + 'px'}));
        });
    });
});
