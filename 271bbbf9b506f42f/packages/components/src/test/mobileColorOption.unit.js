define([
    'react',
    'testUtils',
    'components/components/mobileColorOption/mobileColorOption',
    'siteUtils',
    'reactDOM'
], function(
    React,
    /** testUtils */testUtils,
    mobileColorOption,
    siteUtils,
    ReactDOM) {
    'use strict';

    function getComponent(props) {
        return testUtils.getComponentFromDefinition(mobileColorOption, props);
    }

    describe('mobile color option component', function () {
        var props;

        beforeEach(function() {
            props = testUtils.mockFactory.mockProps();
            props.setCompData(props.siteData.mock.selectOptionData())
                .setSkin("ecommerce.skins.mcom.MobileColorOptionSkin");
            props.structure.componentType = 'ecommerce.integration.components.MobileColorOption';
            spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);
        });

        it("should create the component", function () {
            props.compData.text = 'red';

            var comp = getComponent(props);
            var node = ReactDOM.findDOMNode(comp);
            expect(node.style['background-color']).toEqual(props.compData.text);
        });

        it("should define functions for onClick when not disabled", function () {
            props.onClick = jasmine.createSpy('onClick');
            var comp = getComponent(props);
            React.addons.TestUtils.Simulate.click(ReactDOM.findDOMNode(comp));
            expect(props.onClick).toHaveBeenCalled();

            props.onClick.calls.reset();
            props.compData.disabled = true;
            comp = getComponent(props);
            React.addons.TestUtils.Simulate.click(ReactDOM.findDOMNode(comp));
            expect(props.onClick).not.toHaveBeenCalled();
        });

        it('should set $enabledState state according to disabled data', function () {
            props.compData.disabled = false;
            var comp = getComponent(props);
            expect(ReactDOM.findDOMNode(comp).getAttribute('data-state')).toContain('enabled');

            props.compData.disabled = true;
            comp = getComponent(props);
            expect(ReactDOM.findDOMNode(comp).getAttribute('data-state')).toContain('disabled');
        });
    });
});
