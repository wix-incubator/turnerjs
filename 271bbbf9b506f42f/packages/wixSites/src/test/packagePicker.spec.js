/**
 * Created by alexandergonchar on 8/5/14.
 */
define(['testUtils', 'siteUtils', 'react', 'reactDOM', 'wixSites/components/packagePicker/packagePicker'],
    function (testUtils, siteUtils, React, ReactDOM, packagePickerComp) {
    'use strict';

    function getComponent () {
        var props = testUtils.mockFactory.mockProps()
            .setCompData({
                selectByDefault: true
            })
            .setCompProp({
                buttonTopOffset: 0,
                radioButtonGap: 0
            })
            .setSkin('wysiwyg.common.components.packagepicker.viewer.skins.PackagePickerSkin');
        props.structure.componentType = 'wysiwyg.common.components.packagepicker.viewer.PackagePicker';

        var packagePickerAspect = props.siteAPI.getSiteAspect('PackagePickerAspect');
        spyOn(packagePickerAspect, 'setSelected');
        spyOn(packagePickerAspect, 'isPackagePickerSelected');

        spyOn(siteUtils.compFactory, 'getCompClass').and.callFake(function (name) {
            return name === 'wysiwyg.common.components.InfoTip' ? React.DOM.div : null;
        });

        return testUtils.getComponentFromDefinition(packagePickerComp, props);
    }

    describe('packagePicker component', function () {
        beforeEach(function() {
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it("should call aspect setSelected when clicked radio button", function () {
            var packagePicker = getComponent();

            packagePicker.onActionClicked({preventDefault: function () {}});

            var packagePickerAspect = packagePicker.props.siteAPI.getSiteAspect('PackagePickerAspect');
            expect(packagePickerAspect.setSelected.calls.count()).toEqual(1);
        });

        xit("should show tooltip when mouse enters", function () {
            var packagePicker = getComponent();
            packagePicker.refs.tooltip.showToolTip = jasmine.createSpy('showToolTip');

            // act
            React.addons.TestUtils.Simulate.mouseEnter(ReactDOM.findDOMNode(packagePicker));

            // assert
            expect(packagePicker.refs.tooltip.showToolTip.calls.count()).toBe(1);
        });

        xit("should show tooltip when mouse enters", function () {
            var packagePicker = getComponent();
            packagePicker.refs.tooltip.closeToolTip = jasmine.createSpy('closeToolTip');

            // act
            React.addons.TestUtils.Simulate.mouseLeave(ReactDOM.findDOMNode(packagePicker));

            // assert
            expect(packagePicker.refs.tooltip.closeToolTip.calls.count()).toBe(1);
        });

        xit("should subscribe onMouseEnter and onMouseLeave", function () {
            var packagePicker = getComponent(),
                props = packagePicker.getSkinProperties()[""];

            expect(props.onMouseEnter).toEqual(packagePicker.onMouseEnter);
            expect(props.onMouseLeave).toEqual(packagePicker.onMouseLeave);
        });
    });
});
