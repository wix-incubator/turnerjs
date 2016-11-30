define([
    'lodash',
    'testUtils',
    'core/components/actionsAspectActions/baseAction',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function (
    _,
    testUtils,
    BaseAction,
    triggerTypes
) {
    'use strict';

    describe('baseAction', function () {
        var ACTIONS_ADDED_LAYOUTED = triggerTypes.ACTIONS_ADDED_LAYOUTED,
            ACTIONS_REMOVED = triggerTypes.ACTIONS_REMOVED,
            supportedAction,
            unknownAction,
            baseAction;

        beforeEach(function () {
            supportedAction = testUtils.mockFactory.actionMocks.comp('supportedAction', 'someCompId');
            unknownAction = testUtils.mockFactory.actionMocks.comp('unknownAction', 'someCompId');

            baseAction = new BaseAction(testUtils.mockFactory.mockSiteAPI());
            baseAction.resetActionState = _.noop;
            baseAction.handleActionTrigger = _.noop;
            baseAction.ACTIONS_SUPPORTED = [supportedAction.name];
            baseAction.enableAction();
        });

        describe('.handleTrigger(triggerAction[, obj])', function () {
            describe('when triggerAction is ACTIONS_ADDED_LAYOUTED', function () {
                describe('when action name is supported', function () {
                    it('should add it to this._currentActions', function () {
                        baseAction.handleTrigger(ACTIONS_ADDED_LAYOUTED, {
                            'comp,someCompId,supportedAction': _.cloneDeep(supportedAction)
                        });

                        expect(baseAction._currentActions).toEqual({
                            'comp,someCompId,supportedAction': supportedAction
                        });
                    });
                });

                describe('when action name is not supported', function () {
                    it('should not add it to this._currentActions', function () {
                        baseAction.handleTrigger(ACTIONS_ADDED_LAYOUTED, {
                            'comp,someCompId,unknownAction': _.cloneDeep(unknownAction)
                        });

                        expect(baseAction._currentActions).toEqual({});
                    });
                });
            });

            describe('when triggerAction is ACTIONS_REMOVED', function () {
                describe('when there is a supported action in this._currentActions', function () {
                    beforeEach(function () {
                        baseAction._currentActions = {
                            'comp,someCompId,supportedAction': _.cloneDeep(supportedAction)
                        };
                    });

                    it('should remove it from this._currentActions', function () {
                        baseAction.handleTrigger(ACTIONS_REMOVED, {
                            'comp,someCompId,supportedAction': supportedAction
                        });

                        expect(baseAction._currentActions).toEqual({});
                    });
                });

                describe('when action is not supported', function () {
                    beforeEach(function () {
                        baseAction._currentActions = {
                            'comp,someCompId,unknownAction': _.cloneDeep(unknownAction)
                        };
                    });

                    it('should not remove it from this._currentActions', function () {
                        baseAction.handleTrigger(ACTIONS_REMOVED, {
                            'comp,someCompId,unknownAction': _.cloneDeep(unknownAction)
                        });

                        expect(baseAction._currentActions).toEqual({
                            'comp,someCompId,unknownAction': _.cloneDeep(unknownAction)
                        });
                    });
                });
            });
        });
    });
});
