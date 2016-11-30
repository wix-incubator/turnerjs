define([
    'lodash',
    'siteUtils',
    'testUtils',
    'react',
    'components/components/optionsListInput/optionsListInput',
    'reactDOM'
],
    function(_, siteUtils, /** testUtils */testUtils, React, optionsListInput, ReactDOM) {
    'use strict';


    describe('OptionListInput component', function () {
        var props, siteData, options;

        beforeEach(function(){
            siteData = testUtils.mockFactory.mockSiteData();
            options = _.times(3, siteData.mock.selectOptionData, siteData.mock);

            spyOn(siteUtils.compFactory, 'getCompClass').and.returnValue(testUtils.mockFactory.simpleComp);

            props = testUtils.mockFactory.mockProps(siteData).setCompData(siteData.mock.selectableListData({options: options}));
            _.assign(props, {
                itemClassName: 'wysiwyg.viewer.components.inputs.TextOption',
                itemSkin: 'wixapps.integration.skins.ecommerce.options.TextOptionSkin'
            });
            props.structure.componentType = 'wysiwyg.common.components.inputs.OptionsListInput';
        });

        it('Create an option list input of text options', function () {
            /** @type components.OptionsListInput */
            var optionsListInputComp = testUtils.getComponentFromDefinition(optionsListInput, props);
            var refData = optionsListInputComp.getSkinProperties();
            var actual = refData[''].children;
            expect(actual.length).toEqual(3);
            _.forEach(options, function (itemData, index) {
                expect(actual[index].props).toBeDefined();
                expect(actual[index].props.skin).toEqual('wixapps.integration.skins.ecommerce.options.TextOptionSkin');
                expect(actual[index].props.compData).toEqual(itemData);
            });
        });

        it('Create component and select item', function () {
            props.onSelectionChange = jasmine.createSpy('onSelectionChange');

            /** @type components.OptionsListInput */
            var optionsListInputComp = testUtils.getComponentFromDefinition(optionsListInput, props);

            expect(optionsListInputComp.props.selectedItem).toBeUndefined();

            // Click on each of the children and check that the selectedItem is the clicked child.
            _.forEach(options, function (itemData, index) {
                var firstItemNode = ReactDOM.findDOMNode(optionsListInputComp.refs[index]);
                React.addons.TestUtils.Simulate.click(firstItemNode);
                expect(props.onSelectionChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: options[0]}), jasmine.any(String));
            });
        });

        it('Create component and select item', function () {
            props.compData.items = [];
            /** @type components.OptionsListInput */
            var optionsListInputComp = testUtils.getComponentFromDefinition(optionsListInput, props);

            // Check that the default validity value is 'valid'
            expect(optionsListInputComp.state.$validity).toEqual('valid');

            props.valid = false;
            optionsListInputComp = testUtils.getComponentFromDefinition(optionsListInput, props);
            expect(optionsListInputComp.state.$validity).toEqual('invalid');

            props.valid = true;
            optionsListInputComp = testUtils.getComponentFromDefinition(optionsListInput, props);
            expect(optionsListInputComp.state.$validity).toEqual('valid');
        });
    });
});
