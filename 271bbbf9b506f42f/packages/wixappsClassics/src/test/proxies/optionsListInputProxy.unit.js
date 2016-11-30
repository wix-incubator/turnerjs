define([
	'lodash', 'testUtils', 'react', 'reactDOM', 'wixappsClassics/ecommerce/proxies/optionsListInputProxy', 'components'
], function(_, /** testUtils */testUtils, React, ReactDOM) {
    'use strict';

    describe('OptionListInput proxy', function () {

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

        it('Create OptionListInputProxy with default comp and skin', function () {
            var data = {
                "_type": "OptionsList",
                optionType: "text",
                items: []
            };

            var props = testUtils.proxyPropsBuilder({}, data);
            delete props.skin;

            var optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            var optionsListInput = optionListProxy.refs.component;

            // Validate default skin
            expect(optionsListInput.props.skin).toEqual('wixapps.integration.skins.ecommerce.options.OptionsListInputSkin');
        });

        it('Create OptionListInput with selected item', function () {
            var expectedSelectedIndex = 0;
            var data = {
                "_type": "OptionsList",
                optionType: "text",
                selectedValue: items[expectedSelectedIndex].value,
                items: items
            };

            var props = testUtils.proxyPropsBuilder({}, data);
            delete props.skin;

            var optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            var optionsListInput = optionListProxy.refs.component;

	        var expectedSelectedItem = optionsListInput.props.compData.options[expectedSelectedIndex];
            expect(optionsListInput.props.selectedItem).toEqual(expectedSelectedItem);

            data.selectedValue = null;
            props.proxyData = data;
            optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            optionsListInput = optionListProxy.refs.component;
            expect(optionsListInput.props.selectedItem).toBeUndefined();
        });

        it('Validate items components type', function () {
            function validateChildComps(optionListProxy, optCompSkin) {
                var optionsListInput = optionListProxy.refs.component;
                expect(optionsListInput.refs[0].props.skin).toEqual(optCompSkin);
            }

            var data = {
                "_type": "OptionsList",
                optionType: "text",
                items: items
            };

            var props = testUtils.proxyPropsBuilder({}, data);
            delete props.skin;

            var optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            validateChildComps(optionListProxy, 'wixapps.integration.skins.ecommerce.options.TextOptionSkin');

            data.optionType = 'color';
            props.proxyData = data;
            optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            validateChildComps(optionListProxy, 'wixapps.integration.skins.ecommerce.options.ColorOptionSkin');

            var optionSkin = 'ecommerce.skins.mcom.MobileTextOptionSkin';
            var optionComp = 'ecommerce.integration.components.MobileTextOption';
            props.viewDef = {
                comp: {
                    optionSkin: optionSkin,
                    optionComp: optionComp
                }
            };
            optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            validateChildComps(optionListProxy, optionSkin);
        });

        it('handle selectionChanged event from the view', function () {
            var onSelectionChanged = jasmine.createSpy('onSelectionChanged');

            var viewDef = {
                comp: {
                    name: 'OptionsList',
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
            props.logic.onSelectionChanged = onSelectionChanged;

            var optionListProxy = testUtils.proxyBuilder('OptionsList', props);
            var optionsListInput = optionListProxy.refs.component;
            var firstItemNode = ReactDOM.findDOMNode(optionsListInput.refs[0]);
            React.addons.TestUtils.Simulate.click(firstItemNode);
	        var payload = _.pick(items[0], ['value', 'text']);
            payload.listData = data;
            expect(onSelectionChanged).toHaveBeenCalledWith(jasmine.objectContaining({payload: jasmine.objectContaining(payload)}), jasmine.any(String));
        });
    });
});
