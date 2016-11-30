define.component("wysiwyg.viewer.components.TableComponent", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['wysiwyg.viewer.utils.ComponentSequencer']);

    def.skinParts({
        'tableBody':{ type:'htmlElement' },
        'tableHeader':{'type':'htmlElement', 'optional':true},
        'tableFooter':{'type':'htmlElement', 'optional':true},
        'table':{'type':'htmlElement', 'optional':true}
    });

    def.propertiesSchemaType('TableComponentProperties');
    def.binds(['_createBodyRow', '_createHeaderCell', '_createFooterCell', '_createBodyCell', '_addSpacerRow']);
    def.dataTypes(['list', 'Table']);

    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._rowsSequencer = new this.imports.ComponentSequencer();
            this._rowsSequencer.resolveItem = this._createBodyRow;
            this._rowsSequencer.addEvent('productionFinished', this._addSpacerRow);
            this._bodyCellSequencingHook = args.SequencingHook;
            this._headerFooterCellSequencingHook = args.HeaderFooterSequencingHook || args.SequencingHook;
        },

        _onAllSkinPartsReady:function (skinParts) {
            this.parent(skinParts);
            var minHeight = this.getComponentProperty('minHeight');
            if (minHeight) {
                this.setMinH(minHeight);
            }
            if (this.getDataItem()) {
                this._populateTable();
            }
        },
        _onComponentPropertyChange:function (property, value) {
            if (property === 'minHeight') {
                this.setMinH(value);
            }
        },
        setMinH:function (value) {
            if (this._skinParts) {
                this._skinParts.table.setStyle('height', value + 'px');
            }
            this.parent(value);
            this.setHeight(value);
        },

        _onDataChange:function (dataItem, field, value) {
            if (this._skinParts) {
                if (field == 'minHeight') {
                    this.setMinH(value.minHeight || value);
                } else {
                    this._populateTable();
                    this.fireEvent('autoSized', { ignoreLayout:false });
                }
            }
            this.parent(dataItem, field, value);
        },

        _populateTable:function () {
            var dataItem = this.getDataItem();

            this._rowsSequencer.createComponents(this._skinParts.tableBody, dataItem.get('items'));

            if (dataItem.hasField('header')) {
                var headerRow = this._createRow(dataItem.get('header'), this._createHeaderCell);
                this._skinParts.tableHeader.empty().adopt(headerRow);
            }
            else {
                this._skinParts.tableHeader.removeFromDOM();
            }
            if (dataItem.hasField('footer')) {
                var footerRow = this._createRow(dataItem.get('footer'), this._createFooterCell);
                this._skinParts.tableFooter.empty().adopt(footerRow);
            }
            else {
                this._skinParts.tableFooter.removeFromDOM();
            }
        },

        _createBodyRow:function (rowData) {
            return this._createRow(rowData, this._createBodyCell);
        },

        _createRow:function (rowData, createCellMethod) {
            var tr = new Element('tr');
            var cellsSequencer = new this.imports.ComponentSequencer();
            cellsSequencer.resolveItem = createCellMethod;
            cellsSequencer.createComponents(tr, rowData);
            return tr;
        },

        _createHeaderCell:function (cellData, index, dataList) {
            return this._createCell(cellData, index, dataList, 'th', this._headerFooterCellSequencingHook);
        },

        _createFooterCell:function (cellData, index, dataList) {
            return this._createCell(cellData, index, dataList, 'td', this._headerFooterCellSequencingHook);
        },

        _createBodyCell:function (cellData, index, dataList) {
            return this._createCell(cellData, index, dataList, 'td', this._bodyCellSequencingHook);
        },

        _createCell:function (cellData, index, dataList, tagName, createElementFunction) {
            var td = new Element(tagName);
            var contentElement = createElementFunction(cellData, index, dataList);
            if (contentElement) {
                td.grab(contentElement);
            }
            var styleData = cellData.styleData;
            if (styleData) {
                for (var key in styleData) {
                    td.setStyle(key, styleData[key]);
                }
            }
            return td;
        },

        _addSpacerRow:function () {
            var tr = new Element('tr', {'class':'spacer'});
            var td = new Element('td', {'colspan':'100%'});
            tr.adopt(td);
            this._skinParts.tableBody.adopt(tr);
            this.fireEvent('autoSized', {ignoreLayout:false});
        }
    });
});
