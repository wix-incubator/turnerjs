define(['lodash',
    'testUtils',
    'fake!core/siteRender/SiteAspectsSiteAPI',
        'definition!core/components/siteAspects/actionsAspect',
        'core/components/actionsAspectActions/bgScrubAction',
        'core/components/actionsAspectActions/screenInAction',
        'core/components/actionsAspectActions/loadAction',
        'core/components/actionsAspectActions/modeChangeAction',
        'core/components/actionsAspectActions/pageTransitionAction',
        'core/components/actionsAspectActions/exitAction',
        'core/components/actionsAspectActions/triggerTypesConsts',
        'experiment'],
    function (_, testUtils, SiteAspectsSiteAPIFake, actionsAspectDef, bgScrubAction, screenInAction, loadAction, modeChangeAction, pageTransitionAction, exitAction, triggerTypes, experiment) {
    'use strict';

    describe('ActionAspect tests', function () {

        var actionsAspectInstance;

        var ActionsAspect;

        var aspectsRegistry = {
            registerSiteAspect: function (aspectName, aspectCons) {
                ActionsAspect = aspectCons;
            }
        };


        beforeEach(function () {
            //this._screenInAction = _.clone(screenInAction);
            //this._pageTransitionAction = _.clone(pageTransitionAction);
            this.isTabletDevice = function(){ return false;};
            this.isMobileDevice = function(){ return false;};
            this.isMobileView = function(){ return false;};
            this.getPrimaryPageId = function () {
                return "mockPageId01";
            };
            this.siteData = testUtils.mockFactory.mockSiteData();
            _.assign(this.siteData, {
                    isTabletDevice: this.isTabletDevice,
                    isMobileDevice: this.isMobileDevice,
                    isMobileView: this.isMobileView,
                    getPrimaryPageId: this.getPrimaryPageId
            });
            this.siteAPI = new SiteAspectsSiteAPIFake();
            this.siteAPI.registerToComponentDidMount = function (func) {
                func();
            };
            this.siteAPI.getSiteData = function(){ return this.siteData;}.bind(this);
            this.siteAPI.getSiteAspect = function () {
                return {isPageAllowed: function () {
                    return true;
                }};
            };

            actionsAspectDef(_, aspectsRegistry, bgScrubAction, loadAction, screenInAction, modeChangeAction, pageTransitionAction, exitAction, triggerTypes, experiment);
            actionsAspectInstance = new ActionsAspect(this.siteAPI);


            this.comp = {
                props: {
                    id: 'mockId',
                    rootId:'mockPageId01',
                    behavior:'[{"action":"mockActionName","targetId":"mockId","name":"FadeIn","playOnce":true,"duration":1.5,"delay":0,"params":{}}]'
                }
            };


        });
//        var mockSequence = function(){
//            return {
//                pause: _.noop,
//                progress: _.noop,
//                kill: _.noop,
//                clear: _.noop
//            };
//        };

        describe('ActionAspect constructor', function () {

            it('should instantiate  Actions instances ', function () {
                expect(actionsAspectInstance._actions.screenIn).toBeTruthy();
                expect(actionsAspectInstance._actions.pageTransition).toBeTruthy();
            });

        });


        describe('registerBehaviors', function () {

            it('should add behaviors of new components to behaviors list', function () {
                actionsAspectInstance.registerBehaviors(this.comp.props.id, this.comp.props.rootId, this.comp.props.behavior);
                expect(actionsAspectInstance._behaviors[0]).toBeTruthy();

            });
            it('should not add behaviors to behaviors list of previously registered components', function () {
                actionsAspectInstance.registerBehaviors(this.comp.props.id, this.comp.props.rootId, this.comp.props.behavior);
                actionsAspectInstance.registerBehaviors(this.comp.props.id, this.comp.props.rootId, this.comp.props.behavior);
                expect(actionsAspectInstance._behaviors.length).toEqual(1);

            });
            it('should store behavior as Parsed Behavior Object ', function () {

                actionsAspectInstance.registerBehaviors(this.comp.props.id, this.comp.props.rootId, this.comp.props.behavior);
                expect(actionsAspectInstance._behaviors[0].pageId).toBeTruthy();

            });

            it('should propagate behaviors to all actions instances', function () {
                var spyPropagateBehaviours = [];
                _.forEach(actionsAspectInstance._actions, function (action) {
                    spyPropagateBehaviours.push(spyOn(action, 'handleBehaviorsUpdate'));
                });
                actionsAspectInstance.registerBehaviors(this.comp.props.id, this.comp.props.rootId, this.comp.props.behavior);
                _.forEach(spyPropagateBehaviours, function (spyed) {
                    expect(spyed).toHaveBeenCalled();

                });


            });
        });

        describe('ActionAspect enable / disable / execute / _propagateTrigger', function () {

            it('should call enableAction of the relevant Action instance', function () {
                var enableAction = spyOn(actionsAspectInstance._actions.screenIn, 'enableAction');
                actionsAspectInstance.enableAction('screenIn');
                expect(enableAction).toHaveBeenCalled();
            });
            it('should call disableAction of the relevant Action instance', function () {
                var disableAction = spyOn(actionsAspectInstance._actions.screenIn, 'disableAction');
                actionsAspectInstance.disableAction('screenIn');
                expect(disableAction).toHaveBeenCalled();
            });
            it('should call executeAction of the relevant Action instance', function () {
                var executeAction = spyOn(actionsAspectInstance._actions.screenIn, 'executeAction');
                actionsAspectInstance.executeAction('screenIn');
                expect(executeAction).toHaveBeenCalled();

            });

            it('should propagate trigger to all actions instances', function () {
                var spyPropagateTriggers = [];
                _(actionsAspectInstance._actions)
                .filter(function (action) {
                    return _.includes(action.ACTION_TRIGGERS, triggerTypes.PAGE_CHANGED);
                })
                .forEach(function (action) {
                    spyPropagateTriggers.push(spyOn(action, 'handleTrigger'));
                })
                .commit();
                actionsAspectInstance._propagateTrigger(triggerTypes.PAGE_CHANGED);
                _.forEach(spyPropagateTriggers, function (spyed) {
                    expect(spyed).toHaveBeenCalledWith(triggerTypes.PAGE_CHANGED);

                });
            });

        });

        describe('pageTransitionAction enableAction', function () {
            it('should set isEnabled to true', function () {
                actionsAspectInstance.enableAction('pageTransition');
                expect(actionsAspectInstance._actions.pageTransition._isEnabled).toBeTruthy();
            });
        });
        describe('pageTransitionAction disableAction', function () {
            it('should set isEnabled to false', function () {
                actionsAspectInstance.disableAction('pageTransition');
                expect(actionsAspectInstance._actions.pageTransition._isEnabled).toBeFalsy();
            });
        });

        describe('pageTransitionAction handleTrigger', function () {
            it('should do nothing for unknown trigger types', function () {
                var executeAction = spyOn(actionsAspectInstance._actions.pageTransition, 'executeAction');
                actionsAspectInstance._actions.pageTransition._lastVisitedPageId = 'mockPageId02';
                actionsAspectInstance._actions.pageTransition.handleTrigger('unknownTrigger');
                expect(executeAction).not.toHaveBeenCalled();
            });

            it('should do nothing when there was no page change', function () {
                var executeAction = spyOn(actionsAspectInstance._actions.pageTransition, 'executeAction');
                actionsAspectInstance._actions.pageTransition._lastVisitedPageId = 'mockPageId01';
                actionsAspectInstance._actions.pageTransition.handleTrigger(triggerTypes.DID_LAYOUT);
                expect(executeAction).not.toHaveBeenCalled();
            });
            it('should set page transition duration to zero and transition name to "NoTransition" if Action is disabled', function () {

            });
        });

        describe('pageTransitionAction executeAction', function () {
            it('should not execute page transition  if this is the first visited page', function () {
            });
        });

    });

});
