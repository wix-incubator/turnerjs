define([
    'lodash',
    'components/components/grid/core/grid',
    'components/components/grid/core/propsInspector',
    'components/components/grid/core/actions',
    'components/components/grid/core/enums'
], function (
    _,
    Grid,
    PropsInspector,
    Actions,
    enums
) {
    'use strict';

    var DataSourceType = enums.DataSourceType;
    var PaginationType = enums.PaginationType;

    describe('Grid component main controller module', function () {
        beforeEach(function(){
            this.foreign = {};
            this.grid = Grid(this.foreign); // eslint-disable-line new-cap
            spyOn(Grid, 'ensureAgGridModule').and.callFake( function (next) {
                next();
            });
        });
        describe('mutateState', function (){
            it('mutates the provided manager\'s state, ' +
               'by sequentially applying the provided list of actions', function () {
                var actions = [
                    function (state) {
                        state.A = 'A';
                        return state;
                    },
                    function (state) {
                        state.B = 'B';
                        return state;
                    },
                    function (state) {
                        state.A = 'C';
                        return state;
                    }
                ];
                this.grid.state = {A: 'a', B: 'b', C: 'c'};
                Grid.mutateState(this.grid, actions);
                expect(this.grid.state).toEqual({A: 'C', B: 'B', C: 'c'});
            });
        });
        describe('update', function (){

            function infiltrate (actionNames, fakeAction) {
                _.forEach(actionNames, function (name) {
                    spyOn(Actions, name).and.returnValue(fakeAction(name));
                });
            }

            var fakeState;

            beforeEach(function(){
                this.updateGridSpy = jasmine.createSpy();
                fakeState = [];
                spyOn(Grid, 'mutateState').and.callFake(function (grid, actions) {
                    fakeState = _.map(actions, function (action) { return action(); });
                });

                // actions with extra curry
                infiltrate([
                    'UPDATE_GRID_USING_API',
                    'CREATE_GRID',
                    'SET_DATA',
                    'HANDLE_FETCHED_DATA',
                    'UPDATE_UI_STATE',
                    'RESTORE_UI_STATE'
                    ],
                    function (name) {
                        return function () { return name; };
                    }
                );

                // other actions
                infiltrate([
                    'SAVE_CURRENT_PAGE',
                    'RESTORE_CURRENT_PAGE'
                    ],
                    _.identity
                );

                this.props = {
                    compProp: {
                        showHeader: true,
                        dataSource: {
                            type: DataSourceType.STATIC,
                            id: 0
                        },
                        pagination: {
                            rowsPerPage: 0,
                            type: PaginationType.PAGES
                        }
                    },
                    compData: {
                        revision: 0
                    }
                };
                this.nextProps = {
                    compProp: {
                        showHeader: false,
                        dataSource: {
                            type: DataSourceType.DYNAMIC,
                            id: 0
                        },
                        pagination: {
                            rowsPerPage: 1,
                            type: PaginationType.PAGES
                        }
                    },
                    compData: {
                        rows: [],
                        revision: 0
                    }
                };
            });

            it('does not mutate the state if nextProps.compProp and props.compProp are equal', function () {
                this.nextProps = this.props;
                Grid.update(this.grid, this.props, this.nextProps, {});
                expect(Grid.mutateState).not.toHaveBeenCalled();
            });

            it('mutates the state if nextProps.compProp and props.compProp are different', function () {
                Grid.update(this.grid, this.props, this.nextProps, {});
                expect(Grid.mutateState).toHaveBeenCalled();
            });

            it('only mutate the state using API calls if PropsInspector.hasOnlyApiProps', function () {
                spyOn(PropsInspector, 'hasOnlyApiProps').and.returnValue(true);
                Grid.update(this.grid, this.props, this.nextProps, {});
                expect(fakeState).toContain('UPDATE_GRID_USING_API');
                expect(fakeState).not.toContain('CREATE_GRID');
            });

            it('creates a new agGrid instance and mutate its state using API calls if PropsInspector is NOT ApiOnly', function () {
                spyOn(PropsInspector, 'hasOnlyApiProps').and.returnValue(false);
                Grid.update(this.grid, this.props, this.nextProps, {});
                expect(fakeState).toContain('UPDATE_GRID_USING_API');
                expect(fakeState).toContain('CREATE_GRID');
            });

            it('when updating using API calls, ' +
               'UPDATE_GRID_USING_API should be passed the list of changed properties', function () {
                spyOn(PropsInspector, 'hasOnlyApiProps').and.returnValue(true);
                Grid.update(this.grid, this.props, this.nextProps, {});
                expect(Actions.UPDATE_GRID_USING_API).toHaveBeenCalledWith(this.nextProps.compProp, this.nextProps);
            });

            it('saves and restores current page when a new grid instance is created', function () {
                spyOn(PropsInspector, 'hasOnlyApiProps').and.returnValue(false);
                Grid.update(this.grid, this.props, this.nextProps, {});
                expect(fakeState).toContain('SAVE_CURRENT_PAGE');
                expect(fakeState).toContain('RESTORE_CURRENT_PAGE');
            });
        });
    });
    /* eslint-enable new-cap */
});
