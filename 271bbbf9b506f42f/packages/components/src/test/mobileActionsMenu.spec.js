define(['utils', 'lodash', 'testUtils', 'components/components/mobileActionsMenu/mobileActionsMenu'],
    function (utils, _, /**testUtils */ testUtils, mobileActionsMenuDef) {
    'use strict';

    var createMobileActionsMenu = function (props) {
        return testUtils.getComponentFromDefinition(mobileActionsMenuDef, props);
    };

    function getComponentPart(comp, property) {
        return comp.getSkinProperties()[property];
    }

    function createMockMouseEvent(type) {
        return {
            type: type,
            preventDefault: _.noop,
            stopPropagation: _.noop
        };
    }

    describe('Mobile Actions Menu - ', function () {

        var mobileActionsMenuProps;

        beforeEach(function () {
            spyOn(utils.menuUtils, 'getSiteMenuWithRender').and.returnValue([]);
            spyOn(utils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);
            mobileActionsMenuProps = testUtils.mockFactory.mockProps();
            mobileActionsMenuProps.structure.componentType = 'wysiwyg.viewer.components.MobileActionsMenu';
        });

        it("Should toggle the opened/closed state of the menu clicking on the knob", function() {
            var mobileActionsMenu = createMobileActionsMenu(mobileActionsMenuProps);
            var initiaActionMenuState = mobileActionsMenu.state.$display;

            var knobPart = getComponentPart(mobileActionsMenu, 'knob');
            knobPart.onClick(createMockMouseEvent('click'));

            var actionMenuStateAfterFirstClick = mobileActionsMenu.state.$display;
            knobPart.onClick(createMockMouseEvent('click'));

            expect(initiaActionMenuState).toBe("closed");
            expect(actionMenuStateAfterFirstClick).toBe("opened");
            expect(mobileActionsMenu.state.$display).toBe("closed");
        });

        it("Clicking the knob, should NOT trigger any other action", function() {
            var mobileActionsMenu = createMobileActionsMenu(mobileActionsMenuProps);
            spyOn(mobileActionsMenu, 'onMenuItemClick');
            spyOn(mobileActionsMenu, 'onKnobClick');

            var knobPart = getComponentPart(mobileActionsMenu, 'knob');

            knobPart.onClick(createMockMouseEvent('click'));

            expect(mobileActionsMenu.onKnobClick).toHaveBeenCalled();
            expect(mobileActionsMenu.onMenuItemClick).not.toHaveBeenCalled();
        });

        it("Should have className 'mobile-actions-menu-wrapper' on the wrapper", function(){
            var mobileActionsMenu = createMobileActionsMenu(mobileActionsMenuProps);
            expect(mobileActionsMenu.getSkinProperties().wrapper.style.className).toBe('mobile-actions-menu-wrapper');
        });
    });
});
