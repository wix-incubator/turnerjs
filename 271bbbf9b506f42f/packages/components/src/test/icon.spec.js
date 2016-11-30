define(['testUtils', 'react', 'components/components/icon/icon', 'reactDOM'],
    function(/** testUtils */ testUtils, React, icon, ReactDOM) {
    'use strict';

    function getComponent (props) {
        return testUtils.getComponentFromDefinition(icon, props);
    }

    describe('icon component', function () {

        var props;

        beforeEach(function() {
            if (!props) {
                props = testUtils.mockFactory.mockProps().setCompData({
                  src: "http://static.parastorage.com/services/wixapps/2.399.1/javascript/wixapps/apps/faq/images/arrow8_down.png",
                  title: "",
                  width: 8,
                  height: 8
                }).setSkin("wixapps.integration.skins.IconSkin");
                props.structure.componentType = 'wixapps.integration.components.Icon';
            }
        });

        it("should create the component", function () {
            var iconComp = getComponent(props);
            var refData = iconComp.getSkinProperties();
            expect(refData).toBeDefined();
            expect(refData.img).toBeDefined();
        });

        it("should toggle the comp state on click on img", function(){
           var iconComp = getComponent(props);
           expect(iconComp.state.isIconClicked).toBe(false);
            React.addons.TestUtils.Simulate.click(ReactDOM.findDOMNode(iconComp.refs.img));
           expect(iconComp.state.isIconClicked).toBe(true);
        });
    });
});
