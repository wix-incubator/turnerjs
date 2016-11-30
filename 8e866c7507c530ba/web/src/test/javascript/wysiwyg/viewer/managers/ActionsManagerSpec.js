describe( 'ActionManager', function () {

    testRequire()
        .resources('W.Actions', 'W.Viewer')

    var screenInAction = Constants.Actions.SCREEN_IN;
    var pageInAction = Constants.Actions.PAGE_IN;

    var mockData = {
        valid: {
            compId: 'boxCnt01',
            pageId: 'c66t',
            data: {
                screenIn: {
                    'boxCnt01': [
                        {
                            behavior: 'SpinIn',
                            duration: '1.5',
                            delay: 0.3,
                            params: {
                                from: {
                                    rotation: 360
                                }
                            }
                        },
                        {
                            behavior: 'FadeIn',
                            duration: '1.5',
                            delay: 0.3,
                            params: {
                            }
                        }
                    ]
                }
            }
        },

        validParsed: [
            {
                sourceId: 'boxCnt01',
                targetId: 'boxCnt01',
                pageId: 'c66t',
                behavior: 'SpinIn',
                duration: '1.5',
                delay: 0.3,
                params: {
                    from: {
                        rotation: 360
                    }
                }
            },
            {
                sourceId: 'boxCnt01',
                targetId: 'boxCnt01',
                pageId: 'c66t',
                behavior: 'FadeIn',
                duration: '1.5',
                delay: 0.3,
                params: {
                }
            }
        ],

        invalid: {
            compId: 'WRichTxt',
            pageId: 'mst01',
            data: {
                nonExistingAction: {
                    'boxCnt01': [
                        {
                            behavior: 'SpinIn',
                            duration: '1.5',
                            delay: 0.3,
                            params: {
                                from: {
                                    rotation: 360
                                }
                            }
                        }
                    ]
                }
            }
        }
    };

    function compLogicMock(compId) {
        var _compId = compId;

        return {
            'getComponentId': function () {
                return _compId
            },
            '$view': {
                addClass: function () {

                }
            }

        }
    }

    beforeEach(function () {
        this.actions = this.W.Actions._actions;
    });

    describe('ActionManager test suite', function () {

        it('The animation class action should exist', function () {
            expect(this.W.Actions.getAnimationClass()).toBeTruthy();
        });

        xit('The PageIn action should exist', function () {
            expect(this.W.Actions._isActionExists(pageInAction)).toBeTruthy();
        });

        it('The ScreenIn action should exist', function () {
            expect(this.W.Actions._isActionExists(screenInAction)).toBeTruthy();
        });

        it('The dummyAction action should not exist', function () {
            expect(this.W.Actions._isActionExists('dummyAction')).toBeFalsy();
        });


        describe('Register a component', function() {

            it('Should call removeComponentBehaviors when given a valid JSON data', function () {

                var pageId = mockData.valid.pageId,
                    data = mockData.valid.data,
                    compId = mockData.valid.compId,
                    compLogic = new compLogicMock(compId),
                    action;

                for (action in this.actions) {
                    spyOn(this.W.Actions._actions[action], 'removeComponentBehaviors');
                }

                this.W.Actions.registerComponent(pageId, compLogic, JSON.stringify(data));

                for (action in this.actions) {
                    expect(this.W.Actions._actions[action].removeComponentBehaviors).toHaveBeenCalledWith(compId);
                }

            });

            it('Should register a component given a valid JSON data', function () {

                var pageId = mockData.valid.pageId,
                    data = mockData.valid.data,
                    compId = mockData.valid.compId,
                    validParsed = mockData.validParsed,
                    compLogic = new compLogicMock(compId);

                spyOn(this.W.Actions._actions[screenInAction], 'addBehaviors');

                this.W.Actions.registerComponent(pageId, compLogic, JSON.stringify(data));

                expect(this.W.Actions._actions[screenInAction].addBehaviors).toHaveBeenCalledWith(validParsed);
            });

            it('Should register a component given a valid data object', function () {

                var pageId = mockData.valid.pageId,
                    data = mockData.valid.data,
                    compId = mockData.valid.compId,
                    validParsed = mockData.validParsed,
                    compLogic = new compLogicMock(compId);

                spyOn(this.W.Actions._actions[screenInAction], 'addBehaviors');

                this.W.Actions.registerComponent(pageId, compLogic, data);

                expect(this.W.Actions._actions[screenInAction].addBehaviors).toHaveBeenCalledWith(validParsed);
            });

            it('Should not register the component with corrupted JSON data', function () {

                var pageId = mockData.valid.pageId,
                    data = mockData.valid.data,
                    compId = mockData.valid.compId,
                    compLogic = new compLogicMock(compId);

                spyOn(this.W.Actions._actions[screenInAction], 'addBehaviors');

                this.W.Actions.registerComponent(pageId, compLogic, '// --CORRUPTED-- //' + JSON.stringify(data) + '// --CORRUPTED-- //');

                // The actions should not be registered
                expect(this.W.Actions._actions[screenInAction].addBehaviors).not.toHaveBeenCalled();
            });

            it('Should not register the component with an undefined action', function () {

                var pageId = mockData.invalid.pageId,
                    compId = mockData.invalid.compId,
                    data = mockData.invalid.data,
                    compLogic = new compLogicMock(compId),
                    action;

                spyOn(this.W.Actions, '_addBehaviorsByAction');

                // Register a component with an invalid action
                this.W.Actions.registerComponent(pageId, compLogic, data);
                expect(this.W.Actions._addBehaviorsByAction).not.toHaveBeenCalled();

            });
        });


        it('Should return all the behaviors for a specified action', function () {

            var pageId = mockData.valid.pageId,
                compId = mockData.valid.compId,
                data = mockData.valid.data,
                validParsed = mockData.validParsed,
                compLogic = new compLogicMock(compId),
                expected;

            // Our comp data has ScreenIn defined
            this.W.Actions.registerComponent(pageId, compLogic, data);

            expected = this.W.Actions.getBehaviorsForComponentAction(compId, screenInAction);

            expect(expected).toEqual(validParsed);

        });

        it('Should return all the actions for a specified component', function () {

            var actionList,
                expectedResult = {},
                pageId = mockData.valid.pageId,
                compId = mockData.valid.compId,
                data = mockData.valid.data,
                validParsed = mockData.validParsed,
                compLogic = new compLogicMock(compId);

            spyOn(this.W.Actions, 'getBehaviorsForComponentAction').andCallThrough();

            // register the comp with screenIn action
            this.W.Actions.registerComponent(pageId, compLogic, data);

            // Should return an object containing the { action : { behaviors }, .. }
            actionList = this.W.Actions.getActionsForComponent(compId);

            expect(this.W.Actions.getBehaviorsForComponentAction).toHaveBeenCalledWith(compId, screenInAction);
            expectedResult[screenInAction] = validParsed;

            expect(actionList).toEqual(expectedResult);
        });

        it('Should set the behavior on the component structure', function () {

            var compId = mockData.valid.compId,
                data = mockData.valid.data;

            spyOn(this.W.Actions, 'getActionsForComponent');
            spyOn(this.W.Viewer, 'getCompLogicById').andReturn({setBehaviors: function () {}});

            this.W.Actions.setBehaviorsForComponentAction(compId, screenInAction, data[screenInAction]);

            expect(this.W.Actions.getActionsForComponent).toHaveBeenCalledWith(compId);
        });
    });
});