define(['testUtils', 'siteUtils', 'components/components/colorOption/colorOption'], function (/** testUtils */ testUtils, siteUtils, colorOption) {
    'use strict';

    function getComponent (props) {
        return testUtils.getComponentFromDefinition(colorOption, props);
    }

    describe('color option component', function () {

        var props;

        beforeEach(function(){
            props = props || testUtils.mockFactory.mockProps()
            .setCompData(testUtils.mockFactory.dataMocks.selectOptionData());
            props.structure.componentType = 'wysiwyg.viewer.components.inputs.ColorOption';

            spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);
        });
        it("should create the component", function () {
            var colorOptionComp = getComponent(props);
            var refData = colorOptionComp.getSkinProperties();
            expect(refData).toBeDefined();
            expect(refData[""]).toBeDefined();
            expect(refData.tooltip).toBeDefined();
        });

        it("should define functions for onMouseOver and onMouseLeave when enabled", function () {
            var colorOptionComp = getComponent(props);
            var refData = colorOptionComp.getSkinProperties();
            expect(refData[""].onMouseEnter).toBeDefined();
            expect(refData[""].onMouseLeave).toBeDefined();
        });

        it("should not define functions for onMouseOver and onMouseLeave when disabled", function () {
            props.compData.disabled = true;
            var colorOptionComp = getComponent(props);
            var refData = colorOptionComp.getSkinProperties();
            expect(refData[""].onMouseEnter).toBeUndefined();
            expect(refData[""].onMouseLeave).toBeUndefined();
        });
    });
});
