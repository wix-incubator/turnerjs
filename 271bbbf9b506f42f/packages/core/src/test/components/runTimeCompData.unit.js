define(['react', 'testUtils', 'core/components/runTimeCompData'], function(React, testUtils, runtimeCompData) {
    'use strict';

    function renderCompWithProps(props, node) {
        props = Object.assign(props, {displayName:'lala'});
        var runtimeCodeDef = {
            mixins: [runtimeCompData],
            render: function () { // eslint-disable-line react/display-name
                return React.createElement('div', props);
            }
        };
        return testUtils.getComponentFromDefinition(runtimeCodeDef, props, node);
    }

    describe('run time comp data', function() {

        it('updateData should call runTimeDAL.setCompData', function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();
            var oldData = {value: 'default'};
            var props = testUtils.mockFactory.mockProps(siteAPI.getSiteData(), siteAPI).setCompData(oldData);

            var runtimeComp = renderCompWithProps(props);

            var actualData = siteAPI.getRuntimeDal().getCompData(props.id);
            expect(actualData).toEqual(null);

            var newData = {value: 'updated'};
            runtimeComp.updateData(newData);

            actualData = siteAPI.getRuntimeDal().getCompData(props.id);
            expect(actualData).toEqual(newData);
        });
    });
});
