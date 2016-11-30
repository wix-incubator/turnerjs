define(['lodash', 'testUtils'], function(_, testUtils){
    'use strict';

    describe('tpaUnavailableMessageOverlay', function() {

        var mock = testUtils.mockFactory;

        var getComponent = function (props) {
            return testUtils.componentBuilder('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay', props);
        };

        var givenCompWith = function (data, style, id) {
            var siteData = {
                isViewerMode: function() {return false;}
            };
            var compProps = mock.mockProps()
                .setSkin("wysiwyg.viewer.skins.TPAUnavailableMessageOverlaySkin")
                .addSiteData(siteData, 'siteData');

            compProps.style = style;
            compProps.id = id;
            compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay';
            compProps.compData = _.merge({
                applicationId: 12,
                widgetId: 'abcd'
            }, _.clone(data || {}));
            return getComponent(compProps);
        };

        it('should contain initial state properties', function() {
            var comp = givenCompWith({}, {}, '11');
            var state = comp.getInitialState();
            expect(state.showOverlay).toBe(true);
        });
    });
});
