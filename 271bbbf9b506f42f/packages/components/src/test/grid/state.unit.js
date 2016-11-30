define([
    'lodash',
    'components/components/grid/core/state'
], function (
    _,
    State
) {
    'use strict';
    /* eslint-disable new-cap */
    describe('Grid component state module', function () {
        beforeEach(function(){
            this.state = State();
        });
        describe('setGrid', function (){
            beforeEach(function(){
                this.agGridModule = {
                    Grid: jasmine.createSpy('agGrid constructor')
                };
            });
            it('destroys the old ag-grid instance if one exists', function () {
                spyOn(State, 'destroyGrid');
                State.setGrid(this.state, this.agGridModule, {}, {});
                expect(State.destroyGrid).toHaveBeenCalled();
            });
            it('creates a new ag-grid instance', function () {
                State.setGrid(this.state, this.agGridModule, {}, {});
                expect(this.agGridModule.Grid).toHaveBeenCalled();
            });
            it('stores the new ag-grid API on state.agGridApi', function () {
                var gridOptions = {};
                State.setGrid(this.state, this.agGridModule, gridOptions, {});
                expect(this.state.agGridApi).toBe(gridOptions.api);
            });
        });
        describe('destroyGrid', function (){
            beforeEach(function(){
                this.destroy = jasmine.createSpy('destroyGrid');
                this.state.agGridApi = {destroy: this.destroy};
            });
            it('destroys the old ag-grid instance if one exists', function () {
                State.destroyGrid(this.state);
                expect(this.destroy).toHaveBeenCalled();
            });
            it('nullifies the ag-grid API reference', function () {
                State.destroyGrid(this.state);
                expect(this.state.agGridApi).toBe(null);
            });
        });
        describe('DataSource', function (){
            beforeEach(function(){
                this.ds = "DataSource mock";
                this.setDatasourceSpy = jasmine.createSpy('setDatasource');
                this.state.agGridApi = {
                    setDatasource: this.setDatasourceSpy
                };
            });
            it('setDataSource calls agGrid setDatasource API method ' +
                'with the provided DataSource object', function () {
                State.setDataSource(this.state, this.ds);
                expect(this.setDatasourceSpy).toHaveBeenCalledWith(this.ds);
            });
        });
        describe('updateUsingApi', function (){
            it('calls all methods on callMap, with the args provided for them, ' +
                'using the agGridApi stored on state', function () {
                var callMap = {
                    methodA: ['A'],
                    methodB: ['B'],
                    methodC: ['C']
                };
                this.state.agGridApi = {
                    methodA: jasmine.createSpy('A'),
                    methodB: jasmine.createSpy('B'),
                    methodC: jasmine.createSpy('C')
                };
                State.updateUsingApi(this.state, callMap);
                expect(this.state.agGridApi.methodA).toHaveBeenCalledWith('A');
                expect(this.state.agGridApi.methodB).toHaveBeenCalledWith('B');
                expect(this.state.agGridApi.methodC).toHaveBeenCalledWith('C');
            });
        });
        describe('setDataFetchHandler', function (){
            it('sets state.dataFetchHandler to the one provided as parameter', function () {
                var handler = "handlerMock";
                State.setDataFetchHandler(this.state, handler);
                expect(this.state.dataFetchHandler).toBe(handler);
            });
        });
        describe('handleFetchedData', function (){
            beforeEach(function(){
                this.successCallback = jasmine.createSpy('handleFetchedData');
                this.state.dataFetchHandler = {
                    successCallback: this.successCallback
                };
                this.data = {
                    rows: [{n: 1}, {n: 2}, {n: 3}, {n: 4}, {n: 5}, {n: 6}, {n: 7}],
                    rowsCount: 23
                };
            });
            it('calls state.dataFetchHandler with the "rows" and "rowsCount" fields ' +
                'of the data parameter', function () {
                State.handleFetchedData(this.state, this.data);

                expect(this.successCallback).toHaveBeenCalledWith(this.data.rows, this.data.rowsCount);
            });
            it('slices and filters the rows with the specified filter when startRow is set on the handler', function () {
                var filter = function (o) { return o.n & 1; };
                _.assign(this.state.dataFetchHandler, {
                    filter: filter,
                    startRow: 2
                });
                var filteredRows = _.filter(this.data.rows, filter);
                var slicedRows = _.slice(filteredRows, this.state.dataFetchHandler.startRow);

                State.handleFetchedData(this.state, this.data);

                expect(this.successCallback).toHaveBeenCalledWith(
                    slicedRows,
                    filteredRows.length
                );
            });
        });
        describe('updateUIState', function (){
            it('updates the value of some state.uiState property to the supplied value', function () {
                var value = 'someValue';
                State.updateUIState(this.state, value, 'someProperty');
                expect(this.state.uiState.someProperty).toBe(value);
            });
        });
        describe('restoreUIState', function (){
            it('sets state.uiState to null before calling all API endpoints provided on callMap', function () {
                this.state.uiState = "oldUiState";
                State.restoreUIState(this.state, {});
                expect(this.state.uiState).toBeDefined(null);
            });
            it('calls State.updateUsingApi with the provided callMap', function () {
                spyOn(State, 'updateUsingApi');
                var callMap = 'callMap';
                State.restoreUIState(this.state, callMap);
                expect(State.updateUsingApi).toHaveBeenCalledWith(this.state, callMap);
            });
        });
        describe('saveCurrentPage', function () {
            it('copies current page number from agGrid\'s paginationController', function () {
                this.state.agGridApi = {paginationController: {currentPage: 37}};
                State.saveCurrentPage(this.state);
                expect(this.state.currentPage).toEqual(37);
            });
        });
        describe('restoreCurrentPage', function () {
            it('restores current page by calling agGrid paginationController\'s loadPage', function () {
                this.state.agGridApi = {
                    paginationController: {
                        currentPage: 0,
                        loadPage: jasmine.createSpy('loadPage')
                    }
                };
                this.state.currentPage = 37;
                State.restoreCurrentPage(this.state);
                expect(this.state.agGridApi.paginationController.currentPage).toEqual(37);
                expect(this.state.agGridApi.paginationController.loadPage).toHaveBeenCalled();
            });
        });
    });
    /* eslint-enable new-cap */
});
