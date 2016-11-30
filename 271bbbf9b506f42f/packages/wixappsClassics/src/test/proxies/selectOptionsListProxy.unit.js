define([
    'lodash', 'testUtils', 'react', 'reactDOM', 'wixappsClassics/ecommerce/proxies/selectOptionsListProxy', 'components'
], function(_, /** testUtils */testUtils, React, ReactDOM) {
    'use strict';

    describe('SelectOptionsList proxy', function () {

        var items = [
            {
                "_type": "Option",
                "text": "S",
                "value": "1",
                "description": "Small",
                "enabled": true
            },
            {
                "_type": "Option",
                "text": "M",
                "value": "2",
                "description": "Medium",
                "enabled": true
            },
            {
                "_type": "Option",
                "text": "L",
                "value": "3",
                "description": "Large",
                "enabled": true
            },
            {
                "_type": "Option",
                "text": "XL",
                "value": "4",
                "description": "Extra Large",
                "enabled": true
            }
        ];

        it('Create SelectOptionsListProxy with default comp and skin', function () {
            var data = {
                "_type": "OptionsList",
                optionType: "text",
                items: []
            };
            var props = testUtils.proxyPropsBuilder({}, data);
            props.skin = null;

            var selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            var selectOptionsList = selectOptionsListProxy.refs.component;

            // Validate default skin
            expect(selectOptionsList.props.skin).toEqual('wixapps.integration.skins.ecommerce.options.SelectOptionsListSkin');
        });

        it('Create OptionListInput with selected item', function () {
            var selectedIndex = 0;
            var data = {
                "_type": "OptionsList",
                optionType: "text",
                selectedValue: items[selectedIndex].value,
                items: items
            };

            var props = testUtils.proxyPropsBuilder({}, data);
            props.skin = null;

            var selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            var selectOptionsList = selectOptionsListProxy.refs.component;

	        var expectedSelectedItem = selectOptionsList.props.compData.options[selectedIndex];
	        expect(selectOptionsList.props.selectedItem).toEqual(expectedSelectedItem);

            data.selectedValue = null;
            props.proxyData = data;
            selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            selectOptionsList = selectOptionsListProxy.refs.component;
            expect(selectOptionsList.props.selectedItem).toBeUndefined();
        });

        it('Validate items components type', function () {
            function validateChildComps(slctOptionsListProxy, optComp, optSkin) {
                var optionsListInput = slctOptionsListProxy.refs.component;
                expect(optionsListInput.refs[0].props.skin).toEqual(optSkin);
            }

            var data = {
                "_type": "OptionsList",
                optionType: "text",
                items: items
            };

            var props = testUtils.proxyPropsBuilder({}, data);
            props.skin = null;

            var selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            validateChildComps(selectOptionsListProxy, 'wysiwyg.viewer.components.inputs.TextOption', 'wixapps.integration.skins.ecommerce.options.TextOptionSkin');

            data.optionType = 'color';
            props.proxyData = data;
            selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            validateChildComps(selectOptionsListProxy, 'wysiwyg.viewer.components.inputs.ColorOption', 'wixapps.integration.skins.ecommerce.options.ColorOptionSkin');

            var optionSkin = 'ecommerce.skins.mcom.MobileTextOptionSkin';
            var optionComp = 'ecommerce.integration.components.MobileTextOption';
            props.viewDef = {
                comp: {
                    optionSkin: optionSkin,
                    optionComp: optionComp
                }
            };
            selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            validateChildComps(selectOptionsListProxy, optionComp, optionSkin);
        });

        it('handle selectionChanged event from the view', function () {
            var onSelectionChanged = jasmine.createSpy('onSelectionChanged');

            var viewDef = {
                comp: {
                    name: 'SelectOptionsList',
                    events: {
                        selectionChanged: 'onSelectionChanged'
                    }
                }
            };

            var data = {
                "_type": "OptionsList",
                optionType: "text",
                items: items
            };

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            props.skin = null;
            props.logic.onSelectionChanged = onSelectionChanged;

            var selectOptionsListProxy = testUtils.proxyBuilder('SelectOptionsList', props);
            var selectOptionsList = selectOptionsListProxy.refs.component;
            var firstItemNode = ReactDOM.findDOMNode(selectOptionsList.refs[0]);
            React.addons.TestUtils.Simulate.click(firstItemNode);

            var payload = _.pick(items[0], ['value', 'text']);
            payload.listData = data;
            expect(onSelectionChanged).toHaveBeenCalledWith(jasmine.objectContaining({payload: jasmine.objectContaining(payload)}), jasmine.any(String));
            expect(selectOptionsListProxy.proxyData.selectedValue).toEqual(items[0].value);
        });
    });
});
