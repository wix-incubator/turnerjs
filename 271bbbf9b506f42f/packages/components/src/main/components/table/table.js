define(['lodash', "core", "react"], function (_, /** core */ core, React) {
    "use strict";

    var mixins = core.compMixins;

    function getTableBody() {
        var tableRows = _.times(this.props.compProp.numOfRows, function (rowIndex) {
            var cells = _.times(this.props.compProp.numOfColumns, function (index) {
                var cell = this.props.getBodyCell(index, rowIndex);
                var ref = 'cell_' + rowIndex + '_' + index;
                var props = {
                    style: this.props.compData.columnsStyle[index],
                    ref: ref,
                    key: (cell && cell.props.key) || ref
                };
                return React.DOM.td(props, cell);
            }, this);

            return React.DOM.tr({key: 'row_' + rowIndex, ref: 'row_' + rowIndex}, cells);
        }, this);

        var spacer = React.DOM.tr({key: 'row_spacer', ref: 'row_spacer', className: this.classSet({spacer: true})}, React.DOM.td({colSpan: '100%'}));
        tableRows.push(spacer);

        return tableRows;
    }

    function getHeaderFooterCellsContent(isHeader) {
        var prefix = isHeader ? 'header' : 'footer';
        var createCellFunc = isHeader ? this.props.getHeaderCell : this.props.getFooterCell;

        return _.times(this.props.compProp.numOfColumns, function (index) {
            var cell = createCellFunc(index);
            var ref = prefix + '_cell_' + index;
            var props = {
                ref: ref,
                key: (cell && cell.props.key) || ref
            };
            return React.DOM.td(props, cell);
        });
    }

    /**
     * @class components.Table
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "Table",
        mixins: [mixins.skinBasedComp],

        propType: {
            /**
             * Gets the columnIndex and rowIndex
             * @type {function(number, number): ReactComponent}
             */
            getBodyCell: React.PropTypes.func.isRequired,

            /**
             * Gets the columnIndex
             * @type {function(number): ReactComponent}
             */
            getHeaderCell: React.PropTypes.func.isRequired,

            /**
             * Gets the columnIndex
             * @type {function(number): ReactComponent}
             */
            getFooterCell: React.PropTypes.func.isRequired
        },

        getSkinProperties: function () {
            var skinParts = {
                tableBody: {children: getTableBody.call(this)}
            };

            if (this.props.compProp.minHeight) {
                skinParts[''] = {
                    style: {minHeight: this.props.compProp.minHeight, width: '100%'}
                };
                skinParts.table = {
                    style: {height: this.props.compProp.minHeight}
                };
            }

            if (this.props.compProp.header) {
                skinParts.tableHeader = {
                    children: React.DOM.tr({key: 'row_header'}, getHeaderFooterCellsContent.call(this, true))
                };
            }

            if (this.props.compProp.footer) {
                skinParts.tableFooter = {
                    children: React.DOM.tr({key: 'row_footer'}, getHeaderFooterCellsContent.call(this, false))
                };
            }

            return skinParts;
        }
    };
});
