define(['lodash', 'siteUtils', 'wixappsCore'], function (_, siteUtils, /** wixappsCore */ wixApps) {
    'use strict';

    var typesConverter = wixApps.typesConverter;
    var baseCompositeProxy = wixApps.baseCompositeProxy;

    function getCellDefinition(index, type) {
        var columnsDefinition = this.getCompProp('columns');
        return columnsDefinition[index][type];
    }

    function getItemKey(row, column, childViewDef) {
        return [row, column, this.getViewDefProp('id', childViewDef)].join('_');
    }

    function getHeaderFooterCell(column, type) {
        var childViewDef = getCellDefinition.call(this, column, type);
        if (!childViewDef) {
            return null;
        }

        return this.renderChildProxy(childViewDef, getItemKey.call(this, type, column, childViewDef));
    }

    /**
     * @class proxies.Table
     * @extends proxies.mixins.baseComposite
     */
    return {
        mixins: [baseCompositeProxy],

        getBodyCell: function (column, row) {
            var childViewDef = getCellDefinition.call(this, column, 'item');
            var dataPath = _.compact(['this', this.getCompProp('rowsDataArray'), String(row)]);
            var childContextId = row + '_' + column;
            var props = this.getChildProxyProps(childViewDef, dataPath, {});
            props.proxyParentId = this.props.viewDef.id + "_" + childContextId;

            return this.renderChildProxy(childViewDef, getItemKey.call(this, row, column, childViewDef), null, props);
        },

        getHeaderCell: function (index) {
            return getHeaderFooterCell.call(this, index, 'header');
        },

        getFooterCell: function (index) {
            return getHeaderFooterCell.call(this, index, 'footer');
        },

        renderProxy: function () {
            var componentType = "wysiwyg.viewer.components.Table";
            var props = this.getChildCompProps(componentType);
            var columnsDefinition = this.getCompProp('columns');
            var rowsDataItems = this.getDataByPath(_.compact(['this', this.getCompProp('rowsDataArray')]));
            props.compData = typesConverter.table(columnsDefinition);

            props.compProp = {
                minHeight: this.getCompProp('minHeight'),
                numOfRows: rowsDataItems.length,
                numOfColumns: columnsDefinition.length,
                header: _.some(columnsDefinition, 'header'),
                footer: _.some(columnsDefinition, 'footer')
            };

            props.getBodyCell = this.getBodyCell;
            props.getHeaderCell = this.getHeaderCell;
            props.getFooterCell = this.getFooterCell;

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
