define([
	'lodash',
    'testUtils',
	'core/components/compActionMixin'
], function (_, testUtils, compActionMixin) {
	'use strict';

	describe('compActionMixin', function () {
		function getMockComponentDefinition() {
			return {
				mixins: [compActionMixin],
				render: function () {
					return null;
				}
			};
		}

		describe('handleAction', function () {
			beforeEach(function () {
				this.siteAPI = testUtils.mockFactory.mockSiteAPI();
				this.siteData = this.siteAPI.getSiteData();
				this.behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
				spyOn(this.behaviorsAspect, 'handleAction').and.callThrough();
			});

			it('should not handle action if it doesn\'t exist on the compActions property', function () {
				var props = testUtils.mockFactory.mockProps(this.siteData, this.siteAPI);
				var compDefinition = getMockComponentDefinition();
				var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                renderedComp.handleAction('click', props.rootId);
				expect(this.behaviorsAspect.handleAction).not.toHaveBeenCalled();
			});

			it('should call behaviorAspect with the action from compActions property and basic event data', function () {
				var props = testUtils.mockFactory.mockProps(this.siteData, this.siteAPI);
				props.compActions = {
					click: {
						type: 'comp',
						name: 'click',
						sourceId: props.id
					}
				};
				var compDefinition = getMockComponentDefinition();
				var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);

                var event = {
                    id: props.id,
                    timeStamp: jasmine.any(Number)
                };
				renderedComp.handleAction('click', event);

				expect(this.behaviorsAspect.handleAction).toHaveBeenCalledWith(props.compActions.click, event);
			});

			it('should call behaviorAspect with the action from compActions property and with the data from the event parameter', function () {
				var props = testUtils.mockFactory.mockProps(this.siteData, this.siteAPI);
				props.compActions = {
					slideChanged: {
						type: 'comp',
						name: 'slideChanged',
						sourceId: props.id
					}
				};

				var event = {
					type: 'slideChanged',
					slideNumber: 5
				};

				var expectedEvent = _.defaults({
					id: props.id,
					timeStamp: jasmine.any(Number)
				}, event);

				var compDefinition = getMockComponentDefinition();
				var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);
                renderedComp.handleAction('slideChanged', event);

				expect(this.behaviorsAspect.handleAction).toHaveBeenCalledWith(props.compActions.slideChanged, expectedEvent);
			});

			it('should keep the timeStamp of the original event if the event contains timeStamp property', function () {
				var props = testUtils.mockFactory.mockProps(this.siteData, this.siteAPI);
				props.compActions = {
					custom: {
						type: 'comp',
						name: 'custom',
						sourceId: props.id
					}
				};

				var compDefinition = getMockComponentDefinition();
				var renderedComp = testUtils.getComponentFromDefinition(compDefinition, props);

				var event = {
					type: 'custom',
					timeStamp: 12345,
					shaha: 'zu'
				};
                renderedComp.handleAction('custom', event);

				var actualEventObj = this.behaviorsAspect.handleAction.calls.argsFor(0)[1];
				expect(actualEventObj.timeStamp).toEqual(event.timeStamp);
			});
		});

	});
});
