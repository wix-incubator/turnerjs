define([
    'lodash', 'wixappsCore', 'testUtils', 'react', 'reactDOM', 'wixappsCore/core/typesConverter', 'wixappsCore/proxies/comboBoxProxy', 'components'
], function(_, /** wixappsCore */wixapps, /** testUtils */testUtils, React, ReactDOM, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

	describe('ComboBox proxy', function () {

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

        var proxyData;

        var viewDef;

        beforeEach(function () {
            proxyData = {
                "_type": "OptionsList",
                optionType: "text",
                items: []
            };

            viewDef = {
                comp: {
                    name: 'ComboBox',
                    styleNS: 'default'
                }
            };
        });

        it('Create ComboBox with all available styleNS', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('ComboBox', props);
            var component = proxy.refs.component;

            // Validate default skin
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.input.ComboBoxInputSkinNoValidation');

            var ns = {
                'ecomComboBox': 'wixapps.integration.skins.ecommerce.inputs.ComboBoxInputSkin',
                'ecomShippingComboBox': 'wysiwyg.viewer.skins.appinputs.EcomComboBoxInputSkin',
                'wixAppsGui': 'wixapps.integration.skins.inputs.ComboBoxInputSkin'
            };

            _.forEach(ns, function (skin, styleNS) {
                props.viewDef.comp.styleNS = styleNS;
                proxy = testUtils.proxyBuilder('ComboBox', props);
                expect(proxy.refs.component.props.skin).toEqual(skin);
            });
        });

        it('should convert its data using typeConverter', function () {
            spyOn(typesConverter, 'selectableList').and.returnValue({});
            proxyData.items = items;
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('ComboBox', props);
            var component = proxy.refs.component;

            expect(typesConverter.selectableList).toHaveBeenCalledWith(proxyData);
            expect(component.props.compData).toEqual(typesConverter.selectableList(proxyData));
        });

        it('should call typeConverter with the placeholder if hasPrompt is true', function () {
            spyOn(typesConverter, 'selectableList').and.returnValue({});
            proxyData.items = items;
            viewDef.comp.hasPrompt = "true";
            viewDef.comp.promptText = "Prompt Text";
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            testUtils.proxyBuilder('ComboBox', props);

            expect(typesConverter.selectableList).toHaveBeenCalledWith(proxyData);

            viewDef.comp.hasPrompt = false;
            props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            testUtils.proxyBuilder('ComboBox', props);

            expect(typesConverter.selectableList).toHaveBeenCalledWith(proxyData);
        });

        it('should create ComboBoxInput with compProps with placeholder even if it\'s text is empty', function () {
            spyOn(typesConverter, 'selectableList').and.returnValue({});
            proxyData.items = items;
            viewDef.comp.hasPrompt = "true";
            viewDef.comp.promptText = "";
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
	        var proxy = testUtils.proxyBuilder('ComboBox', props);
	        expect(proxy.refs.component.props.compProp).toContain({
		        placeholder: {
			        value: -1,
			        text: viewDef.comp.promptText
		        }
	        });

            viewDef.comp.hasPrompt = false;
            props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            testUtils.proxyBuilder('ComboBox', props);

	        proxy = testUtils.proxyBuilder('ComboBox', props);
	        expect(proxy.refs.component.props.compProp).toEqual({});
        });

        it('should not display prompt if any of the items is selected', function () {
            spyOn(typesConverter, 'selectableList').and.returnValue({});
            proxyData.items = items;
            proxyData.selectedValue = items[0].value;
            viewDef.comp.hasPrompt = "true";
            viewDef.comp.promptText = "Select...";
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
	        var proxy = testUtils.proxyBuilder('ComboBox', props);
	        var component = proxy.refs.component;

	        expect(component.props.compProp).toEqual({});
        });

        it('handle selectionChanged event from the view', function () {
            var onSelectionChanged = jasmine.createSpy('onSelectionChanged');

            proxyData.items = items;
            viewDef.comp.events = {
                selectionChanged: 'onSelectionChanged'
            };

            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            props.logic.onSelectionChanged = onSelectionChanged;

            var proxy = testUtils.proxyBuilder('ComboBox', props);
            var component = proxy.refs.component;
            var item = ReactDOM.findDOMNode(component.refs[1]);

            React.addons.TestUtils.Simulate.change(item);

            expect(onSelectionChanged).toHaveBeenCalledWith(jasmine.objectContaining({payload: component.props.compData.options[0]}), undefined);
        });

        it('should translate the text of the different items', function () {
            var localize = function (text) {
                return 'translated: ' + text;
            };

            spyOn(wixapps.localizer, 'localize').and.callFake(localize);

            proxyData.items = _.clone(items);
            var props = testUtils.proxyPropsBuilder(viewDef, proxyData);
            var proxy = testUtils.proxyBuilder('ComboBox', props);

            expect(wixapps.localizer.localize.calls.count()).toEqual(items.length * 2);

            function validateTranslation(prop) {
                var compItems = _.pluck(proxy.refs.component.props.compData.options, prop);
                var expectedItems = _(proxyData.items).pluck(prop).map(localize).value();
                expect(compItems).toEqual(expectedItems);
            }

            validateTranslation('text');
            validateTranslation('description');
        });
    });
});
