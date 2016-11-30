define([
    'components/components/grid/core/propsInspector',
    'components/components/grid/core/enums'
], function (
    PropsInspector,
    enums
) {
    'use strict';

    var PaginationType = enums.PaginationType;

    describe('Grid component PropsInspector module', function () {
        /* eslint-disable new-cap */

        describe('PropsInspector', function () {
            it('returns an object containing the key-value pairs in nextProps which are different from the ones in props', function () {
                var props = {
                    compProp: {headerHeight: 23, rowHeight: 100, showHeader: false},
                    compData: {revision: 0}
                };
                var nextProps = {
                    compProp: {headerHeight: 37, rowHeight: 100, showHeader: true},
                    compData: {revision: 1}
                };
                var returnValue = PropsInspector(props, nextProps);
                expect(returnValue).toEqual({props: {headerHeight: 37, showHeader: true}, dataChanged: true});
            });

            it('ignores properties not listed in PropsInspector.agGridAffectingProps', function () {
                var props = {
                    compProp: {a: 'a', b: 'b', showHeader: true, c: 'c'},
                    compData: {revision: 0}
                };
                var nextProps = {
                    compProp: {a: 'A', b: 'b', showHeader: false, c: 'C'},
                    compData: {revision: 0}
                };
                var returnValue = PropsInspector(props, nextProps);
                expect(returnValue).toEqual({props: {showHeader: false}, dataChanged: false});
            });
        });

        describe('hasOnlyApiProps', function () {
            it('returns true if the props contained in a diff can all be updated using ag-grid API', function () {
                expect(PropsInspector.hasOnlyApiProps({props: {columns: [], headerHeight: 23}})).toEqual(true);
                expect(PropsInspector.hasOnlyApiProps({props: {columns: [], cellar: 'door'}})).toEqual(false);
            });
        });

        describe('didDataSourceChange', function () {
            it('returns true if data source or pagination are on the PropsInspector', function () {
                expect(PropsInspector.didDataSourceChange({props: {dataSource:{}, cellar: 'door'}})).toEqual(true);
                expect(PropsInspector.didDataSourceChange({props: {pagination:{}, cellar: 'door'}})).toEqual(true);
                expect(PropsInspector.didDataSourceChange({props: {cellar: 'door'}})).toEqual(false);
            });
        });

        describe('didDataChange', function () {
            it('returns true if data revision changed', function () {
                var diff1 = PropsInspector({compProp:{}, compData:{revision:37}}, {compProp:{}, compData:{revision:37}});
                var diff2 = PropsInspector({compProp:{}, compData:{revision:23}}, {compProp:{}, compData:{revision:37}});
                expect(PropsInspector.didDataChange(diff1)).toEqual(false);
                expect(PropsInspector.didDataChange(diff2)).toEqual(true);
            });
        });

        describe('hasPagesPagination', function () {
            it('returns true when pagination type is PAGES', function () {
                expect(PropsInspector.hasPagesPagination({compProp: {pagination: {type: PaginationType.PAGES}}})).toEqual(true);
            });

            it('returns false when pagination type is not PAGES', function () {
                expect(PropsInspector.hasPagesPagination({compProp: {pagination: {type: PaginationType.NONE}}})).toEqual(false);
                expect(PropsInspector.hasPagesPagination({compProp: {pagination: {type: PaginationType.SCROLL}}})).toEqual(false);
            });
        });

        describe('didUIPropsChange', function () {
            it('returns true if UI related properties changed', function () {
                var diff1 = PropsInspector({compProp:{userFilter: {name: 'filter'}}, compData:{}}, {compProp:{userFilter: {name: 'filtur'}}, compData:{}});
                var diff2 = PropsInspector({compProp:{}, compData:{}}, {compProp:{}, compData:{}});
                expect(PropsInspector.didUIPropsChange(diff1)).toEqual(true);
                expect(PropsInspector.didUIPropsChange(diff2)).toEqual(false);
            });
        });

        describe('isEmpty', function () {
            it('returns false if data changed', function () {
                var diff1 = PropsInspector({compProp:{}, compData:{revision:37}}, {compProp:{}, compData:{revision:37}});
                var diff2 = PropsInspector({compProp:{}, compData:{revision:23}}, {compProp:{}, compData:{revision:37}});
                expect(PropsInspector.isEmpty(diff1)).toEqual(true);
                expect(PropsInspector.isEmpty(diff2)).toEqual(false);
            });

            it('returns false if props changed', function () {
                var diff1 = PropsInspector({compProp:{headerHeight: 35}, compData:{}}, {compProp:{headerHeight: 45}, compData:{}});
                var diff2 = PropsInspector({compProp:{}, compData:{}}, {compProp:{}, compData:{}});
                expect(PropsInspector.isEmpty(diff1)).toEqual(false);
                expect(PropsInspector.isEmpty(diff2)).toEqual(true);
            });
        });
        /* eslint-enable new-cap */
    });
});
