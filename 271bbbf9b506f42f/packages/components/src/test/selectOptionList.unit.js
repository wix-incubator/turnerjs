define([
    'lodash',
    'testUtils',
    'react',
    'components/components/selectOptionsList/selectOptionsList',
    'siteUtils',
    'reactDOM'
],
    function(_, /** testUtils */testUtils, React, selectOptionsList, siteUtils, ReactDOM) {
    'use strict';

    describe('SelectOptionsList component', function () {
        var props, siteData, items;

        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData();
            items = _.times(4, siteData.mock.selectOptionData, siteData.mock);
            jasmine.clock().install();

            spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);
            props = testUtils.mockFactory.mockProps(siteData).setCompData(testUtils.mockFactory.dataMocks.selectableListData({
	            options: items
            })).setSkin("wixapps.integration.skins.ecommerce.options.SelectOptionsListSkin");

            props.itemClassName = 'ecommerce.integration.components.MobileTextOption';
            props.itemSkin = 'ecommerce.skins.mcom.MobileTextOptionSkin';
            props.structure.componentType = 'wysiwyg.common.components.inputs.SelectOptionsList';
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });


        function validateTooltipState(selectOptionsListComp) {
            expect(selectOptionsListComp.state.$tooltip).toEqual('displayed');

            // Move the clock more then 1500 ms. That should cause the $tooltip state to changed back to hidden.
            jasmine.clock().tick(1501);

            expect(selectOptionsListComp.state.$tooltip).toEqual('hidden');
        }

        it('Create SelectOptionsList with no selected item', function () {
            /** @type components.SelectOptionsList */
            var selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);
            var actual = ReactDOM.findDOMNode(selectOptionsListComp.refs.itemsContainer).children;

            expect(actual.length).toEqual(items.length);
            _.forEach(items, function (itemData, index) {
                var item = selectOptionsListComp.refs[index];
                expect(item.props).toBeDefined();
                expect(item.props.skin).toEqual('ecommerce.skins.mcom.MobileTextOptionSkin');
                expect(item.props.compData).toEqual(itemData);
            });

            expect(ReactDOM.findDOMNode(selectOptionsListComp.refs.tooltip).innerHTML).toBe('');
            expect(selectOptionsListComp.state.$tooltip).toEqual('hidden');
        });

        it('Create SelectOptionsList with selected item', function () {
            var selectedIndex = 1;
	        items[selectedIndex].description = 'selected description';
	        props.selectedItem = items[selectedIndex];
            /** @type components.SelectOptionsList */
            var selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);
           var refData = selectOptionsListComp.refs;
            var children = ReactDOM.findDOMNode(refData.itemsContainer).children;
            expect(children.length).toEqual(items.length);
            _.forEach(items, function (itemData, index) {
                expect(refData[index].props.selected).toEqual(index === selectedIndex);
            });

            expect(refData.tooltip).toBeDefined();
            expect(ReactDOM.findDOMNode(refData.tooltip).innerHTML).toBe(props.selectedItem.description);

            // Validate that the css state of the tooltip should be changed to hidden after 1500 ms
            validateTooltipState(selectOptionsListComp);
        });

        it('Select item by clicking it', function () {
            var onSelectionChange = jasmine.createSpy('onSelectionChange');
            props.onSelectionChange = onSelectionChange;

            /** @type components.SelectOptionsList */
            var selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);

            expect(selectOptionsListComp.props.selectedItem).toBeUndefined();

            var itemNode = ReactDOM.findDOMNode(selectOptionsListComp.refs[1]);
            React.addons.TestUtils.Simulate.click(itemNode);

            expect(onSelectionChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: items[1]}), jasmine.any(String));
        });

        it('Change component props and validate the changes', function () {
            /** @type components.SelectOptionsList */
            var selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);

            expect(selectOptionsListComp.props.selectedItem).toBeUndefined();
            expect(selectOptionsListComp.state.$tooltip).toEqual('hidden');

            // Update the property of the selected item.
	        items[1].description = 'item description';
            props.selectedItem = items[1];
            selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);
            validateTooltipState(selectOptionsListComp);
        });

        it('Change validity of the component', function () {

            /** @type components.SelectOptionsList */
            var selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);

            // Validate default value of validity it 'valid'
            expect(selectOptionsListComp.state.$validity).toEqual('valid');

            props.valid = false;
            selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);
            expect(selectOptionsListComp.state.$validity).toEqual('invalid');

            props.valid = true;
            selectOptionsListComp = testUtils.getComponentFromDefinition(selectOptionsList, props);
            expect(selectOptionsListComp.state.$validity).toEqual('valid');
        });
    });
});
