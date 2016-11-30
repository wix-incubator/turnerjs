define([
    'lodash',
    'react',
    'reactDOM',
    'testUtils',
	'core/components/baseCompMixin'
], function (_, React, ReactDOM, testUtils, baseCompMixin) {
    'use strict';

	describe('baseCompMixin', function () {

        function getMockComponentDefinition(styles, className, attributes) {
            return {
	            mixins: [baseCompMixin.baseComp],
                render: function () {
	                var rootRefData = _.assign({style: styles, className: className}, attributes);
	                this.updateRootRefDataStyles(rootRefData);
	                var props = _.defaults({ref: 'child'}, rootRefData, this.props);

                    return React.createElement('div', props);
                }
            };
        }

        describe("styles", function () {
            it("should set the props styles if no styles in the data ref", function () {
                var compDefinition = getMockComponentDefinition();
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.style.width = 100;
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(node.style.width).toEqual('100px');
            });

            it('should set the override the prop styles with data ref styles', function () {
                var compDefinition = getMockComponentDefinition({width: 200});
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.style.width = 100;
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(node.style.width).toEqual('200px');
            });

            it('should set visibility to hidden if isHidden property is true', function () {
                var compDefinition = getMockComponentDefinition({width: 200});
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.compProp.isHidden = true;
                props.style.width = 100;
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(node.style.visibility).toEqual('hidden');
                expect(node.style.width).toEqual('200px');
            });

            it('should not set visibility if isHidden property is false', function () {
                var compDefinition = getMockComponentDefinition({width: 200});
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.compProp.isHidden = false;
                props.style.width = 100;
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(node.style.visibility).toEqual('');
                expect(node.style.width).toEqual('200px');
            });

            it("should not set visibility if isHidden property doesn't exist", function () {
                var compDefinition = getMockComponentDefinition({width: 200});
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.style.width = 100;
                delete props.compProp;
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(node.style.visibility).toEqual('');
            });

            it('should set visibility hidden if component has attribute "data-collapsed"', function(){
                var compDefinition = getMockComponentDefinition({}, '', {'data-collapsed': true});
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);

                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);

                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(node.style.visibility).toEqual('hidden');
            });

            it("should call transformRefStyle when it's exist with the expected styles and use it's return value", function () {
                var compDefinition = getMockComponentDefinition({height: 50});
                var extension = {
                    transformRefStyle: jasmine.createSpy('transformRefStyle').and.returnValue({width: 20, height: 30})
                };
                compDefinition.mixins.push(extension);
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.style.width = 100;
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(extension.transformRefStyle).toHaveBeenCalledWith(jasmine.objectContaining({width: 100, height: 50}));
                expect(node.style.width).toEqual('20px');
                expect(node.style.height).toEqual('30px');
            });
        });

        describe('classes', function () {
            it('should set refDataClassName', function () {
                var compDefinition = getMockComponentDefinition(null, 'ref-data-class-name');
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(_.toArray(node.classList)).toEqual(['ref-data-class-name']);
            });

            it('should set className from props', function () {
                var compDefinition = getMockComponentDefinition();
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.className = 'props-class-name';
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(_.toArray(node.classList)).toEqual(['props-class-name']);
            });

            it('should set both className from props and refDataClassName', function () {
                var compDefinition = getMockComponentDefinition(null, 'ref-data-class-name');
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.className = 'props-class-name';
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(_.toArray(node.classList)).toEqual(['ref-data-class-name', 'props-class-name']);
            });

            it("should call transformRefClasses when it's exist with the expected classes and use it's return value", function () {
                var compDefinition = getMockComponentDefinition(null, 'ref-data-class-name');
                var extension = {
                    transformRefClasses: jasmine.createSpy('transformRefClasses').and.returnValue('transform-class-name')
                };
                compDefinition.mixins.push(extension);
                var props = testUtils.santaTypesBuilder.getComponentProps(compDefinition);
                props.className = 'props-class-name';
                var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                var node = ReactDOM.findDOMNode(renderedComp.refs.child);
                expect(extension.transformRefClasses).toHaveBeenCalledWith('ref-data-class-name props-class-name');
                expect(_.toArray(node.classList)).toEqual(['transform-class-name']);
            });
        });

		describe('actions', function () {

            function addCompAction(props, actionName) {
                props.compActions[actionName] = {
                    type: 'comp',
                    sourceId: props.id,
                    name: actionName
                };
            }

			function getMockComponentDefinitionWithActions(actions) {
				return {
					mixins: [baseCompMixin.baseComp],
					render: function () {
						var rootRefDataStyles = actions || {};
						this.updateRootRefDataStyles(rootRefDataStyles);
						var props = _.defaults({ref: 'child'}, rootRefDataStyles, this.props);

						return React.createElement('div', props);
					}
				};
			}

			function createMouseEvent(node, type) {
				return {
					type: type,
					timeStamp: Date.now(),
					screenX: 100,
					screenY: 200,
					pageX: 15,
					pageY: 215,
					clientX: 100,
					clientY: 200,
					shiftKey: false,
					metaKey: false,
					altKey: false,
					ctrlKey: false,
					button: 0,
					buttons: 1,
					target: node,
					currentTarget: node
				};
			}

			beforeEach(function () {
				this.siteAPI = testUtils.mockFactory.mockSiteAPI();
                this.siteData = this.siteAPI.getSiteData();
				this.behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
				spyOn(this.behaviorsAspect, 'handleAction').and.callThrough();
			});

			it('should not set any action if props.compActions is empty', function () {
				var definition = getMockComponentDefinitionWithActions();
                var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
				var simpleComp = testUtils.getComponentFromDefinition(definition, props);
				var rootCompElement = ReactDOM.findDOMNode(simpleComp.refs.child);

				expect(simpleComp.props.compActions).toEqual({});
				// TODO: add the rest of the events
				_.forEach(baseCompMixin._testActionsMap, function (actionProperty) {
					var simulatedMethod = actionProperty[2].toLowerCase() + actionProperty.substring(3);
					React.addons.TestUtils.Simulate[simulatedMethod](rootCompElement);
					expect(this.behaviorsAspect.handleAction).not.toHaveBeenCalled();
				}, this);
			});

            it('should not call behavior aspect handleAction if the component is disabled', function () {
                var definition = getMockComponentDefinitionWithActions();
                var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
                addCompAction(props, baseCompMixin._testActionsMap.click);
                props.compProp.isDisabled = true;

                var simpleComp = testUtils.getComponentFromDefinition(definition, props);

                var node = ReactDOM.findDOMNode(simpleComp.refs.child);
                var mouseEvent = createMouseEvent(node, 'onClick');
                React.addons.TestUtils.Simulate.click(node, mouseEvent);
                expect(this.behaviorsAspect.handleAction).not.toHaveBeenCalled();
            });

			_.forEach(baseCompMixin._testActionsMap, function (actionProp, actionName) {
				var simulateMethod = actionProp.replace(/^on([A-Z])/, '$1');
				simulateMethod = simulateMethod[0].toLowerCase() + simulateMethod.substring(1);

				it('should handle ' + actionName + ' action when ' + simulateMethod, function () {
					var definition = getMockComponentDefinitionWithActions();
                    var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
                    addCompAction(props, actionName);

					var simpleComp = testUtils.getComponentFromDefinition(definition, props);

					var node = ReactDOM.findDOMNode(simpleComp.refs.child);
					var mouseEvent = createMouseEvent(node, simulateMethod);
					React.addons.TestUtils.Simulate[simulateMethod](node, mouseEvent);
					var handleActionArgs = this.behaviorsAspect.handleAction.calls.argsFor(0);
					var action = handleActionArgs[0];
                    var event = handleActionArgs[1];

                    // Expect the handled action name to be the registered action
                    expect(action).toEqual(props.compActions[actionName]);

					// Expect the event to contain the dom event
					expect(event).toContain(mouseEvent);
				});
			});

			it('should handle more then one action with different action names', function () {
				var definition = getMockComponentDefinitionWithActions();
                var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
                addCompAction(props, 'click');
                addCompAction(props, 'mouseenter');

				var simpleComp = testUtils.getComponentFromDefinition(definition, props);

				var node = ReactDOM.findDOMNode(simpleComp.refs.child);
				React.addons.TestUtils.Simulate.click(node, createMouseEvent(node, 'click'));
				expect(this.behaviorsAspect.handleAction).toHaveBeenCalledWith(simpleComp.props.compActions.click, jasmine.objectContaining({type: 'click'}));

				React.addons.TestUtils.Simulate.mouseEnter(node, createMouseEvent(node, 'mouseenter'));
				expect(this.behaviorsAspect.handleAction).toHaveBeenCalledWith(simpleComp.props.compActions.mouseenter, jasmine.objectContaining({type: 'mouseenter'}));
			});

			it('should call the original click event event when there is a click action for the component', function () {
				var originalClickHandler = jasmine.createSpy('originalClickHandler');

				var definition = getMockComponentDefinitionWithActions({onClick: originalClickHandler});

                var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
                addCompAction(props, 'click');

				var simpleComp = testUtils.getComponentFromDefinition(definition, props);

				var eventData = {barvaz: 'click'};
				React.addons.TestUtils.Simulate.click(ReactDOM.findDOMNode(simpleComp.refs.child), eventData);

				expect(this.behaviorsAspect.handleAction).toHaveBeenCalledWith(simpleComp.props.compActions.click, jasmine.any(Object));
				expect(originalClickHandler).toHaveBeenCalledWith(jasmine.objectContaining(eventData), jasmine.any(String));
			});

            it('should have a pointer cursor when click action is set', function () {
                var definition = getMockComponentDefinitionWithActions();

                var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
                addCompAction(props, 'click');

                var simpleComp = testUtils.getComponentFromDefinition(definition, props);
                var node = ReactDOM.findDOMNode(simpleComp.refs.child);
                expect(node.style.cursor).toEqual('pointer');
            });

            it('should not have a pointer cursor when click action is set but the component is disabled', function () {
                var definition = getMockComponentDefinitionWithActions();

                var props = testUtils.santaTypesBuilder.getComponentProps(definition, {}, this.siteData, this.siteAPI);
                addCompAction(props, 'click');
                props.compProp.isDisabled = true;

                var simpleComp = testUtils.getComponentFromDefinition(definition, props);
                var node = ReactDOM.findDOMNode(simpleComp.refs.child);
                expect(node.style.cursor).toEqual('');
            });
		});

    });
});
