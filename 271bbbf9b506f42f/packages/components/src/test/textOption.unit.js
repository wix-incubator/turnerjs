define(['testUtils', 'components/components/textOption/textOption', 'siteUtils'], function (testUtils, textOption, siteUtils) {
    'use strict';

    function getComponent(props) {
        return testUtils.getComponentFromDefinition(textOption, props);
    }

    describe('text option component', function () {
        var props;

        beforeEach(function(){
            if (!props) {
              props = testUtils.mockFactory.mockProps();
              props.setCompData(props.siteData.mock.selectOptionData())
              .setSkin("wixapps.integration.skins.ecommerce.options.TextOptionSkin");
              props.structure.componentType = 'wysiwyg.viewer.components.inputs.TextOption';
            }

            spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);
        });

        it("should create the component", function () {
            var textOptionComp = getComponent(props);
            var refData = textOptionComp.getSkinProperties();
            expect(refData).toBeDefined();
            expect(refData[""]).toBeDefined();
            expect(refData.tooltip).toBeDefined();
        });

        it("should define functions for onMouseOver and onMouseLeave when enabled", function () {
            var textOptionComp = getComponent(props);
            var refData = textOptionComp.getSkinProperties();
            expect(refData[""].onMouseEnter).toBeDefined();
            expect(refData[""].onMouseLeave).toBeDefined();
        });

        it("should not define root functions when disabled", function () {
            props.compData.disabled = true;
            var textOptionComp = getComponent(props);
            var refData = textOptionComp.getSkinProperties();
            expect(refData[""]).toBeUndefined();
        });
    });
});
