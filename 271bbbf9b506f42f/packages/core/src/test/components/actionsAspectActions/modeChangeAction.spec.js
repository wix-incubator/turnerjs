define([
    'react',
    'lodash',
    'utils',
    'testUtils',
    'core/components/actionsAspectActions/triggerTypesConsts',
    'core/components/actionsAspectActions/modeChangeAction'], function
    (React, _, utils, testUtils, triggerTypes, ModeChangeAction) {
    'use strict';

    describe('modeChangeAction', function () {
        var modeChangeAction;
        var CustomDiv = React.createClass({
            render: function(){
                return React.createElement('div');
            }
        });

        beforeEach(function () {
            var mockSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI();
            modeChangeAction = new ModeChangeAction(mockSiteAPI);
            modeChangeAction.enableAction();
        });

        describe('should only process animations with compatible registered behaviors', function() {
            describe('registered behaviors WITHOUT mode IDS', function() {
                it('should process in-animation when an in-behavior with NO mode IDs has registered (unregistered behaviors are immediately completed)', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeIn'
                    }];
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER};
                    modeChangeAction.handleBehaviorsUpdate(behaviors);

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'activated-mode1': true,
                            'activated-mode2': true
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should process out-animation when an out-behavior with NO mode IDs has registered (unregistered behaviors are immediately completed)', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        targetId: 'comp1',
                        action: 'modeOut'
                    }];
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.LEAVE};
                    modeChangeAction.handleBehaviorsUpdate(behaviors);

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'activated-mode1': false
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should process transition-animation when a transition-behavior with NO mode IDs has been registered (unregistered behaviors are immediately completed)', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeChange',
                        params: {
                            timingFunction: 'fsgdsfg'
                        }
                    }];
                    modeChangeAction.handleBehaviorsUpdate(behaviors);
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION};

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {},
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should dismiss animations for which there are no registered behaviors with compatible action (unregistered behaviors are immediately completed)', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [
                        {
                            pageId: 'currentPage',
                            targetId: 'comp1',
                            action: 'exit'
                        },
                        {
                            pageId: 'currentPage',
                            targetId: 'comp2',
                            action: 'screenIn'
                        }
                    ];
                    var compToAnimationType = {
                        'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER,
                        'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
                        'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
                    };
                    modeChangeAction.handleBehaviorsUpdate(behaviors);

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {},
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy.calls.count()).toEqual(1);
                    expect(onCompleteSpy).toHaveBeenCalledWith(compToAnimationType);
                });
            });

            describe('registered behaviors WITH mode IDS', function() {
                it('should process in-animation when a compatible behavior registered', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeIn',
                        params: {
                            modeIds: ['activated-mode1', 'activated-mode2']
                        }
                    }];
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER};
                    modeChangeAction.handleBehaviorsUpdate(behaviors);

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'activated-mode1': true,
                            'activated-mode2': true
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should process out-animation when a compatible behavior registered', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeOut',
                        params: {
                            modeIds: ['deactivated-mode1', 'deactivated-mode2']
                        }
                    }];
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.LEAVE};
                    modeChangeAction.handleBehaviorsUpdate(behaviors);

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'deactivated-mode1': false,
                            'deactivated-mode2': false
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should process transition-animation when the modeId in its registered behavior has been ACTIVATED', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeChange',
                        params: {
                            timingFunction: 'fsgdsfg',
                            modeIds: ['mode-id']
                        }
                    }];
                    modeChangeAction.handleBehaviorsUpdate(behaviors);
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION};

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'mode-id': true
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should process transition-animation when the modeId in its registered behavior has been DEACTIVATED', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [{
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeChange',
                        params: {
                            timingFunction: 'fsgdsfg',
                            modeIds: ['mode-id']
                        }
                    }];
                    modeChangeAction.handleBehaviorsUpdate(behaviors);
                    var compToAnimationType = {'comp1': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION};

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'mode-id': false
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy).not.toHaveBeenCalledWith(compToAnimationType);
                });

                it('should dismiss animations for which there are no registered behaviors with compatible action', function() {
                    var onCompleteSpy = jasmine.createSpy('onComplete');
                    var behaviors = [
                        {
                            pageId: 'currentPage',
                            targetId: 'comp1',
                            action: 'modeIn',
                            params: {
                                modeIds: ['activated-mode1', 'activated-mode2']
                            }
                        },
                        {
                            pageId: 'currentPage',
                            targetId: 'comp2',
                            action: 'modeOut',
                            params: {
                                modeIds: ['deactivated-mode1', 'deactivated-mode2']
                            }
                        },
                        {
                            pageId: 'currentPage',
                            targetId: 'comp3',
                            action: 'modeChange',
                            params: {
                                modeIds: ['not-triggered-mode-id1']
                            }
                        },
                        {
                            pageId: 'currentPage',
                            targetId: 'comp4',
                            action: 'modeIn',
                            params: {
                                modeIds: ['not-triggered-mode-id2']
                            }
                        }
                    ];
                    var compToAnimationType = {
                        'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER,
                        'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
                        'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION,
                        'comp4': utils.siteConstants.Animations.Modes.AnimationType.ENTER
                    };
                    modeChangeAction.handleBehaviorsUpdate(behaviors);

                    modeChangeAction.executeAction(triggerTypes.MODE_CHANGED_INIT, {
                        modeChanges: {
                            'activated-mode1': true,
                            'deactivated-mode1': false
                        },
                        componentAnimations: compToAnimationType,
                        transitioningComponentsPrevLayout: {},
                        pageId: 'currentPage',
                        onComplete: onCompleteSpy
                    });

                    expect(onCompleteSpy.calls.count()).toEqual(1);
                    expect(onCompleteSpy).toHaveBeenCalledWith(compToAnimationType);
                });
            });
        });

        describe('animations end', function() {
            it('should notify complete immediately for components without compatible registered behaviors', function() {
                var behaviors = [];
                var onComplete = jasmine.createSpy();
                var componentAnimations = {
                    'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER,
                    'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
                    'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
                };

                modeChangeAction.handleBehaviorsUpdate(behaviors);
                modeChangeAction.handleTrigger(triggerTypes.MODE_CHANGED_INIT, {
                    pageId: 'currentPage',
                    componentAnimations: componentAnimations,
                    transitioningComponentsPrevLayout: {
                        'comp3': {}
                    },
                    onComplete: onComplete
                });

                expect(onComplete).toHaveBeenCalledWith(componentAnimations);
            });

            it('should notify complete about initialized animations that did not start running when action is disabled', function() {
                var behaviors = [
                    {
                        pageId: 'currentPage',
                        targetId: 'comp1',
                        action: 'modeIn'
                    },
                    {
                        pageId: 'currentPage',
                        targetId: 'comp2',
                        action: 'modeOut'
                    },
                    {
                        pageId: 'currentPage',
                        targetId: 'comp3',
                        action: 'modeChange',
                        duration: 0,
                        delay: 0,
                        params: {
                            timingFunction: ''
                        }
                    }
                ];
                var onComplete = jasmine.createSpy();
                var componentAnimations = {
                    'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER,
                    'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
                    'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
                };

                modeChangeAction.handleBehaviorsUpdate(behaviors);
                modeChangeAction.handleTrigger(triggerTypes.MODE_CHANGED_INIT, {
                    pageId: 'currentPage',
                    componentAnimations: componentAnimations,
                    transitioningComponentsPrevLayout: {
                        'comp3': {}
                    },
                    onComplete: onComplete
                });

                expect(onComplete).toHaveBeenCalledWith({});

                modeChangeAction.disableAction();

                expect(onComplete).toHaveBeenCalledWith({'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER});
                expect(onComplete).toHaveBeenCalledWith({'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE});
                expect(onComplete).toHaveBeenCalledWith({'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION});
            });

            it('should notify complete about animations that finished executing', function() {
                var behaviors = [
                    {
                        targetId: 'comp1',
                        action: 'modeIn',
                        name: 'FadeId'
                    },
                    {
                        targetId: 'comp2',
                        action: 'modeOut',
                        name: 'FadeOut'
                    },
                    {
                        targetId: 'comp3',
                        action: 'modeChange',
                        duration: 0,
                        delay: 0,
                        params: {
                            timingFunction: ''
                        },
                        name: 'ModeMotion'
                    }
                ];
                var onComplete = jasmine.createSpy();
                var componentAnimations = {
                    'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER,
                    'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
                    'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
                };
                var mockParent = {
                    sequence: testUtils.mockSequence,
                    refs: {
                        'comp1': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv)),
                        'comp2': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv)),
                        'comp3': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv, {structure: {componentType: 'bla'}}))
                    }
                };
                spyOn(modeChangeAction, 'getComponentPage').and.returnValue(mockParent);

                modeChangeAction.handleBehaviorsUpdate(behaviors);
                modeChangeAction.handleTrigger(triggerTypes.MODE_CHANGED_INIT, {
                    pageId: 'currentPage',
                    componentAnimations: componentAnimations,
                    transitioningComponentsPrevLayout: {
                        'comp3': {}
                    },
                    onComplete: onComplete
                });

                modeChangeAction._executeAction();
                modeChangeAction.handleSequenceEnded('comp1', 'mainPage', utils.siteConstants.Animations.Modes.AnimationType.ENTER);
                modeChangeAction.handleSequenceEnded('comp2', 'mainPage', utils.siteConstants.Animations.Modes.AnimationType.LEAVE);
                modeChangeAction.handleSequenceEnded('comp3', 'mainPage', utils.siteConstants.Animations.Modes.AnimationType.TRANSITION);

                expect(onComplete).toHaveBeenCalledWith({'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER});
                expect(onComplete).toHaveBeenCalledWith({'comp2': utils.siteConstants.Animations.Modes.AnimationType.LEAVE});
                expect(onComplete).toHaveBeenCalledWith({'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION});
            });

            it('should clear CSS transitions when transition sequences finish', function() {
                var behaviors = [
                    {
                        targetId: 'comp3',
                        action: 'modeChange',
                        duration: 0,
                        delay: 0,
                        params: {
                            timingFunction: ''
                        },
                        name: 'ModeMotion'
                    }
                ];
                var onComplete = jasmine.createSpy();
                var componentAnimations = {
                    'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
                };
                var mockParent = {
                    sequence: testUtils.mockSequence,
                    refs: {
                        'comp3': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv, {structure: {componentType: 'bla'}}))
                    }
                };
                spyOn(modeChangeAction, 'getComponentPage').and.returnValue(mockParent);
                spyOn(modeChangeAction, 'clearCssTransitionFromNode');

                modeChangeAction.handleBehaviorsUpdate(behaviors);
                modeChangeAction.handleTrigger(triggerTypes.MODE_CHANGED_INIT, {
                    pageId: 'currentPage',
                    componentAnimations: componentAnimations,
                    transitioningComponentsPrevLayout: {
                        'comp3': {}
                    },
                    onComplete: onComplete
                });

                modeChangeAction._executeAction();
                modeChangeAction.handleSequenceEnded('comp3', 'mainPage', utils.siteConstants.Animations.Modes.AnimationType.TRANSITION);

                expect(modeChangeAction.clearCssTransitionFromNode).toHaveBeenCalled();
            });
        });

        describe('reverse transition animations', function() {
            it('should stop a running transition sequence on init trigger if a request for its reverse has arrived', function() {
                var behaviors = [
                    {
                        targetId: 'comp1',
                        action: 'modeIn',
                        name: 'FadeId'
                    },
                    {
                        targetId: 'comp1',
                        action: 'modeChange',
                        duration: 0,
                        delay: 0,
                        params: {
                            timingFunction: ''
                        },
                        name: 'ModeMotion'
                    },
                    {
                        targetId: 'comp2',
                        action: 'modeChange',
                        duration: 0,
                        delay: 0,
                        params: {
                            timingFunction: ''
                        },
                        name: 'ModeMotion'
                    },
                    {
                        targetId: 'comp3',
                        action: 'modeOut',
                        duration: 0,
                        delay: 0,
                        name: 'FadeOut'
                    },
                    {
                        targetId: 'comp3',
                        action: 'modeChange',
                        duration: 0,
                        delay: 0,
                        params: {
                            timingFunction: ''
                        },
                        name: 'ModeMotion'
                    }
                ];
                var onComplete = jasmine.createSpy();
                var componentAnimations = {
                    'comp1': utils.siteConstants.Animations.Modes.AnimationType.ENTER,
                    'comp2': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION,
                    'comp3': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
                };
                var mockParent = {
                    getSequence: jasmine.createSpy().and.returnValue({
                        progress: function() { return 0.5; },
                        set: function() {}
                    }),
                    stopSequence: jasmine.createSpy(),
                    sequence: testUtils.mockSequence,
                    refs: {
                        'comp1': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv)),
                        'comp2': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv, {structure: {componentType: 'bla'}})),
                        'comp3': React.addons.TestUtils.renderIntoDocument(React.createElement(CustomDiv, {structure: {componentType: 'bla'}}))
                    }
                };
                spyOn(modeChangeAction, 'getComponentPage').and.returnValue(mockParent);

                modeChangeAction.handleBehaviorsUpdate(behaviors);
                modeChangeAction.handleTrigger(triggerTypes.MODE_CHANGED_INIT, {
                    pageId: 'currentPage',
                    componentAnimations: componentAnimations,
                    transitioningComponentsPrevLayout: {
                        'comp2': {},
                        'comp3': {}
                    },
                    onComplete: onComplete
                });

                modeChangeAction._executeAction();
                var playingSequences = _.clone(modeChangeAction.playingSequences);
                modeChangeAction.handleTrigger(triggerTypes.MODE_CHANGED_INIT, {
                    pageId: 'currentPage',
                    componentAnimations: {
                        'comp1': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION,
                        'comp2': utils.siteConstants.Animations.Modes.AnimationType.TRANSITION,
                        'comp3': utils.siteConstants.Animations.Modes.AnimationType.LEAVE
                    },
                    transitioningComponentsPrevLayout: {
                        'comp1': {},
                        'comp2': {}
                    },
                    onComplete: onComplete
                });

                expect(modeChangeAction.playingSequences.comp1).toBeDefined();
                expect(modeChangeAction.playingSequences.comp2).toBeUndefined();
                expect(modeChangeAction.playingSequences.comp3).toBeDefined();
                expect(mockParent.stopSequence).not.toHaveBeenCalledWith(playingSequences.comp1.sequence.getId(), 1);
                expect(mockParent.stopSequence).toHaveBeenCalledWith(playingSequences.comp2.sequence.getId(), 1);
                expect(mockParent.stopSequence).not.toHaveBeenCalledWith(playingSequences.comp3.sequence.getId(), 1);
            });
        });

    });
});
