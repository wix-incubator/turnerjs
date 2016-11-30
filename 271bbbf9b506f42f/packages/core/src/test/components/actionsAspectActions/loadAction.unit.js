define([
    'lodash',
    'testUtils',
    'core/components/actionsAspectActions/loadAction',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function (
    _,
    testUtils,
    LoadAction,
    triggerTypes
) {
    'use strict';

    describe('LoadAction', function () {
        var handleActions,
            loadAction;

        beforeEach(function () {
            loadAction = new LoadAction(testUtils.mockFactory.mockSiteAPI());
            loadAction.enableAction();
            loadAction.executeOnNextTick = function (callback) {
                callback();
            };

            handleActions = jasmine.createSpy('handleActions');
            spyOn(loadAction._aspectSiteAPI, 'getSiteAspect').and.callFake(function (name) {
                if (name === 'behaviorsAspect') {
                    return {handleActions: handleActions};
                }
            });
        });

        function whenCompIdIs(compId) {
            var isSiteStructure = compId === 'masterPage';

            describe('when source component is a ' +
                (isSiteStructure ? 'site structure' : 'regular component'), function () {

                describe('when an action added', function () {
                    beforeEach(function () {
                        var map = _buildLoadActionMap(compId);
                        loadAction.handleTrigger(triggerTypes.ACTIONS_ADDED_LAYOUTED, map);
                    });

                    describe('and then load-related trigger is called', function () {
                        beforeEach(function () {
                            loadAction.handleTrigger(triggerTypes.SITE_READY);
                        });

                        it('should handle an action', function () {
                            _expectActionHandled(compId);
                        });

                        describe('and then it is called again', function () {
                            it('should not handle that action for the 2nd time', function () {
                                handleActions.calls.reset();
                                loadAction.handleTrigger(triggerTypes.PAGE_RELOADED);

                                expect(handleActions).toHaveBeenCalledWith([], {action: 'load'});
                            });
                        });

                        describe('and when action is being removed but not specifically', function () {
                            beforeEach(function () {
                                loadAction.handleTrigger(triggerTypes.ACTIONS_REMOVED, {});
                            });

                            describe('and then it is added again', function () {
                                beforeEach(function () {
                                    loadAction.handleTrigger(triggerTypes.ACTIONS_ADDED_LAYOUTED, _buildLoadActionMap(compId));
                                });

                                describe('and then a load-related trigger is called', function () {
                                    beforeEach(function () {
                                        handleActions.calls.reset();
                                        loadAction.handleTrigger(triggerTypes.PAGE_RELOADED);
                                    });

                                    if (isSiteStructure) {
                                        it('should handle an action again', function () {
                                            _expectActionHandled(compId);
                                        });
                                    } else {
                                        it('should not handle an action again', function () {
                                            expect(handleActions).toHaveBeenCalledWith([], {action: 'load'});
                                        });
                                    }
                                });
                            });
                        });

                        describe('when action is removed and added again, and then a load-related trigger is called', function () {
                            beforeEach(function () {
                                var map = _buildLoadActionMap(compId);

                                loadAction.handleTrigger(triggerTypes.ACTIONS_REMOVED, _.cloneDeep(map));
                                loadAction.handleTrigger(triggerTypes.ACTIONS_ADDED_LAYOUTED, _.cloneDeep(map));

                                handleActions.calls.reset();
                                loadAction.handleTrigger(triggerTypes.PAGE_RELOADED);
                            });

                            it('should handle an action again', function () {
                                _expectActionHandled(compId);
                            });
                        });
                    });
                });
            });

            function _buildLoadActionMap() {
                var action = testUtils.mockFactory.actionMocks.comp('load', compId);
                var key = [action.type, compId, action.name].join(':');

                return _.set({}, key, action);
            }

            function _expectActionHandled() {
                expect(handleActions).toHaveBeenCalledWith([{
                    type: 'comp',
                    name: 'load',
                    sourceId: compId
                }], {action: 'load'});
            }
        }

        whenCompIdIs('someCompId');
        whenCompIdIs('masterPage');
    });
});
