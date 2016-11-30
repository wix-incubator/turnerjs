define([
    'components/components/grid/wrappers/columnDefinition',
    'components/components/grid/core/enums'
], function (
    ColumnDefinition,
    enums
) {
    'use strict';
    describe('Grid component ColumnDefinition', function () {

        describe('getEditable', function () {
            it('returns false when allowUserEditing is false in the compProp', function () {
                var editable = ColumnDefinition.getEditable({allowUserEditing: false}, {editable: true});
                expect(editable).toEqual(false);
            });

            it('returns false when columnOptions is undefined', function () {
                var editable = ColumnDefinition.getEditable({allowUserEditing: true});
                expect(editable).toEqual(false);
            });

            it('returns false when columnOptions.editable is false', function () {
                var editable = ColumnDefinition.getEditable({allowUserEditing: true}, {editable: false});
                expect(editable).toEqual(false);
            });

            it('returns true when both compProp.allowUserEditing and columnOptions.editable are true', function () {
                var editable = ColumnDefinition.getEditable({allowUserEditing: true}, {editable: true});
                expect(editable).toEqual(true);
            });
        });

        describe('getValueGetter', function () {
            it('returns a value getter that returns an object containg data and link retrieved using column.dataPath/linkPath', function () {
                var valueGetter = ColumnDefinition.getValueGetter({
                    dataPath: 'cellar',
                    linkPath: 'url'
                });
                var row = {cellar: 'door', url_linkObj: 'cellar.door'};
                var value = valueGetter({data: row});
                expect(value.data).toEqual(row.cellar);
                expect(value.link).toEqual(row.url_linkObj);
                expect(value.toString()).toEqual(value.data.toString());
            });
        });

        describe('getColumnWidth', function () {
            it('returns column.width when column layout is not ColumnLayout.EQUAL', function () {
                var columnWidth = ColumnDefinition.getColumnWidth(
                    {compProp: {columnLayout: enums.ColumnLayout.MANUAL}},
                    {width: 37}
                );
                expect(columnWidth).toEqual(37);
            });

            it('divides component layout width over number of columns when column layout is ColumnLayout.EQUAL', function () {
                var columnWidth = ColumnDefinition.getColumnWidth(
                    {
                        compProp: {
                            columnLayout: enums.ColumnLayout.EQUAL,
                            columns: [{}, {}, {}]
                        },
                        structure: {
                            layout: {width: 111}
                        }
                    },
                    {}
                );
                expect(columnWidth).toEqual(37);
            });

            it('returns 0 when column layout is ColumnLayout.EQUAL but there are no columns', function () {
                var columnWidth = ColumnDefinition.getColumnWidth(
                    {
                        compProp: {
                            columnLayout: enums.ColumnLayout.EQUAL,
                            columns: []
                        }
                    },
                    {}
                );
                expect(columnWidth).toEqual(0);
            });
        });
    });
    /* eslint-enable new-cap */
});
