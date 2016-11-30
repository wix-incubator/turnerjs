define([
    'lodash',
    'testUtils',
    'siteUtils/customDataResolvers/behaviorsListDataResolver'
], function(_, testUtils, behaviorsListDataResolver) {
    'use strict';

    describe('behaviorsListDataResolver', function () {

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.getData = this.siteData.dataResolver.getDataByQuery.bind(this, this.siteData.pagesData, 'masterPage', 'masterPage', this.siteData.dataTypes.BEHAVIORS);
        });

        it('should call behaviorsListDataResolver for data of type "ObsoleteBehaviorsList"', function () {
            var spy = spyOn(behaviorsListDataResolver, 'resolve');
            var behaviorItem = testUtils.mockFactory.behaviorMocks.widget.runCode('someCompId', 'someFunc', 'targetId');
            var behaviorsList = testUtils.mockFactory.behaviorMocks.behaviorsList(JSON.stringify(behaviorItem));
            this.siteData.addBehaviors(behaviorsList);

            this.getData(behaviorsList.id);

            expect(spy).toHaveBeenCalledWith(behaviorsList, jasmine.any(Function));
        });

        it('should parse behaviorsList (single behavior)', function () {
            var behaviorItem = testUtils.mockFactory.behaviorMocks.widget.runCode('someCompId', 'someFunc', 'targetId');
            var behaviorsList = testUtils.mockFactory.behaviorMocks.behaviorsList(JSON.stringify([behaviorItem]));
            this.siteData.addBehaviors(behaviorsList);

            var result = this.getData(behaviorsList.id);

            expect(_.get(result, 'items.0')).toEqual(behaviorItem);
        });
    });
});
