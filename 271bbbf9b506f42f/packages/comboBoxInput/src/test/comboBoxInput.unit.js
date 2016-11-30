define([
    'lodash',
    'zepto',
    'testUtils',
    'react',
    'reactDOM',
    'comboBoxInput'
],
    function(_, $, /** testUtils */testUtils, React, ReactDOM, comboBoxInput) {
        'use strict';
	    describe('ComboBox component', function () {

		    var options;
            var props;

            beforeEach(function () {
	            options = [
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'AL', 'enabled': true}),
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'SV', 'enabled': true})
                ];

	            props = testUtils.mockFactory.mockProps().setCompData(testUtils.mockFactory.dataMocks.selectableListData({
		            "value": 'AL',
		            "options": options
	            })).setSkin("wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin");
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ComboBoxInput';
            });

            it('Create a combo box', function () {
                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
	            var optionElements = comboBox.refs.collection.children;

	            expect(optionElements.length).toEqual(3);

	            _.forEach(optionElements, function (itemData, index) {
		            expect(optionElements[index].text).toEqual(itemData.text);
		            expect(optionElements[index].value).toEqual(itemData.value);
                });

                expect(comboBox.refs.emptyOption).toBeUndefined();
            });

            it('should create default public state', function () {
                var comboBoxClass = React.createClass(comboBoxInput);
                expect(comboBoxClass.publicState()).toEqual({valid: true});
            });

            it('should get the public state from the css state of the component', function () {
                var comboBoxClass = React.createClass(comboBoxInput);
                expect(comboBoxClass.publicState({$validity: 'invalid'})).toEqual({valid: false});
                expect(comboBoxClass.publicState({$validity: 'valid'})).toEqual({valid: true});
            });

            it('selection should be disabled if compProp.isDisabled is true', function () {
                props.compProp.isDisabled = true;
                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

                expect(ReactDOM.findDOMNode(select).disabled).toEqual(true);
            });

            it('selection should be enabled if compProp.isDisabled doesnt exist', function () {
                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

                expect(ReactDOM.findDOMNode(select).disabled).toEqual(false);
            });

            it('selection should be enabled if compProp.isDisabled is false', function () {
                props.compProp.isDisabled = false;
                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

                expect(ReactDOM.findDOMNode(select).disabled).toEqual(false);
            });

            it('Create component and select item without onSelectionChange prop', function () {
                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

	            React.addons.TestUtils.Simulate.change(select, {target: {value: options[0].value}});
	            expect(ReactDOM.findDOMNode(select).value).toEqual(options[0].value);

	            React.addons.TestUtils.Simulate.change(select, {target: {value: options[1].value}});
	            expect(ReactDOM.findDOMNode(select).value).toEqual(options[1].value);
            });

            // This test is disabled because it fails other tests sporadically. Something inside is really broken.
            xit('when setting props from the outside, render the new selected', function (done) {
                props.onSelectionChange = function(event) {
                    var newProps = _.assign(
                        {},
                        props,
                        {compData: _.defaults({selected: event.payload.value}, props.compData)});

                    testUtils.componentBuilder('wysiwyg.viewer.components.inputs.ComboBoxInput', newProps, node, function() {
                        expect(ReactDOM.findDOMNode(select).value).toEqual(event.payload.value);
                        done();
                    });
                };

                var node = $('<div/>')[0];
                var comboBox = testUtils.componentBuilder('wysiwyg.viewer.components.inputs.ComboBoxInput', props, node);
                var select = comboBox.refs.collection;

	            expect(ReactDOM.findDOMNode(select).value).toEqual(props.compData.value);

	            React.addons.TestUtils.Simulate.change(select, {target: {value: options[1].value}});

            });

            it('Create component and select item with onSelectionChange prop', function () {
                var onSelectionChange = jasmine.createSpy('onSelectionChange');
                props.onSelectionChange = onSelectionChange;

                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

	            React.addons.TestUtils.Simulate.change(select, {target: {value: options[0].value}});
	            expect(onSelectionChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: options[0]}), undefined);

	            React.addons.TestUtils.Simulate.change(select, {target: {value: options[1].value}});
	            expect(onSelectionChange).toHaveBeenCalledWith(jasmine.objectContaining({payload: options[1]}), undefined);
            });

            it('Create component and check validity state', function () {
                /** @type components.ComboBoxInput */
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                // Check that the default validity value is 'valid'
                expect(comboBox.state.$validity).toEqual('valid');

                comboBox = testUtils.getComponentFromDefinition(comboBoxInput, _.defaults({errorMessage: "error"}, props));
                expect(comboBox.state.$validity).toEqual('invalid');

                comboBox = testUtils.getComponentFromDefinition(comboBoxInput, _.defaults({errorMessage: null}, props));
                expect(comboBox.state.$validity).toEqual('valid');
            });

            it('should always be valid in editor mode - no data-error', function() {
                props.compProp.required = true;
                props.componentViewMode = 'editor';
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                comboBox.onChange({target: {value: null}});
                var skinProperties = comboBox.getSkinProperties();
                expect(skinProperties[""]["data-error"]).toBeFalsy();

            });

            it('should always get error if form is not valid', function() {
                props.compProp.required = true;
                props.componentViewMode = 'preview';
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                comboBox.onChange({target: {value: null}});
                var skinProperties = comboBox.getSkinProperties();
                expect(skinProperties[""]["data-error"]).toBeTruthy();
            });

            describe('validate', function() {
                describe('invalid case', function(){
                    it('should return false if combobox is required, has options and has no value', function() {
                        props.compProp.required = true;
                        props.compData.value = null;
                        var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                        expect(comboBox.validate()).toBe(false);
                    });
                });

                describe('valid case', function(){
                    it('should return true if combobox has value, is required, and has options', function() {
                        props.compProp.required = true;
                        var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                        expect(comboBox.validate()).toBe(true);
                    });

                    it('should return true if combobox is not required', function() {
                        props.compProp.required = false;
                        props.compData.value = null;
                        var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                        expect(comboBox.validate()).toBe(true);
                    });

                    it('should return true if combobox has no options', function() {
                        props.compProp.required = true;
                        props.compData.value = null;
                        props.compData.options = [];

                        var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                        expect(comboBox.validate()).toBe(true);
                    });
                });


            });

            it('should add an empty item when there is no item that equal the selected value', function () {

                /** @type components.ComboBoxInput */
                props.compData.value = -1;
                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
	            var optionElements = comboBox.refs.collection.children;

	            expect(optionElements.length).toEqual(props.compData.options.length + 1);
                expect(comboBox.refs.placeholder).toBeDefined();
            });

			it('should have same number of children as the number of enabled items in compData', function() {
				props.compData.value = -1;
				props.compData.options.push(testUtils.mockFactory.dataMocks.selectOptionData({'value': 'HH', 'enabled': false}));

				var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
				var optionElements = comboBox.refs.collection.children;

                //3 options + 1 placeholder
				expect(optionElements.length).toEqual(props.compData.options.length + 1);
			});

			it('should not add empty option if children length is 1', function() {
				props = testUtils.mockFactory.mockProps().setCompData(testUtils.mockFactory.dataMocks.selectableListData({
					"value": 'YY',
					"options": [
						testUtils.mockFactory.dataMocks.selectOptionData({'value': 'YY', 'enabled': false})
					]
				})).setSkin("wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin");
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ComboBoxInput';

				var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);

                //1 options from data + 1 placeholder option
				expect(comboBox.getSkinProperties().collection.children.length).toBe(2);
			});
        });

        describe('WixCode', function(){
            it('should handle action change when item is chosen', function() {
	            var props = testUtils.mockFactory.mockProps().setCompData(testUtils.mockFactory.dataMocks.selectableListData({
		            "value": 'AL',
		            "options": [
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'ZZ', 'enabled': true}),
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'YY', 'enabled': false})
		            ]
	            })).setSkin("wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin");
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ComboBoxInput';

                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

                spyOn(comboBox, 'handleAction');

                React.addons.TestUtils.Simulate.change(select, {target: {value: props.compData.options[0].value}});
                expect(comboBox.handleAction).toHaveBeenCalledWith('change', jasmine.objectContaining({target: {value: 'ZZ'}}));
            });

            it('should handle action focus on focus event', function() {
	            var props = testUtils.mockFactory.mockProps().setCompData(testUtils.mockFactory.dataMocks.selectableListData({
		            "value": 'AL',
		            "options": [
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'ZZ', 'enabled': true}),
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'YY', 'enabled': false})
		            ]
	            })).setSkin("wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin");
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ComboBoxInput';

                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

                spyOn(comboBox, 'handleAction');

                React.addons.TestUtils.Simulate.focus(select, {target: {value: props.compData.options[0].value}});
                expect(comboBox.handleAction).toHaveBeenCalled();

                var actionFired = comboBox.handleAction.calls.mostRecent().args[0];
                expect(actionFired).toEqual('focus');
            });

            it('should handle action blur on blur event', function() {
	            var props = testUtils.mockFactory.mockProps().setCompData(testUtils.mockFactory.dataMocks.selectableListData({
		            "value": 'AL',
		            "options": [
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'ZZ', 'enabled': true}),
			            testUtils.mockFactory.dataMocks.selectOptionData({'value': 'YY', 'enabled': false})
		            ]
	            })).setSkin("wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin");
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ComboBoxInput';

                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

                spyOn(comboBox, 'handleAction');
                // spyOn(select, 'onBlur');

                React.addons.TestUtils.Simulate.blur(select, {});

                expect(comboBox.handleAction).toHaveBeenCalled();

                var actionFired = comboBox.handleAction.calls.mostRecent().args[0];
                expect(actionFired).toEqual('blur');
            });

	        it('should render comboBoxInput with placeholder if placeholder is present in compProp', function () {
		        var options = [
			        testUtils.mockFactory.dataMocks.selectOptionData({'value': 1}),
			        testUtils.mockFactory.dataMocks.selectOptionData({'value': 2})
                ];

		        var compData = testUtils.mockFactory.dataMocks.selectableListData({options: options});
		        var compProp = testUtils.mockFactory.dataMocks.comboBoxInputProperties({
			        placeholder: {
				        text: 'test',
				        value: "2"
			        }
		        });
		        var props = testUtils.mockFactory.mockProps()
			        .setCompData(compData)
			        .setCompProp(compProp)
			        .setSkin("wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin");
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.ComboBoxInput';

                var comboBox = testUtils.getComponentFromDefinition(comboBoxInput, props);
                var select = comboBox.refs.collection;

		        expect(select.children.length).toBe(options.length + 1);

		        var placeHolderElement = select.children[0];
		        expect(placeHolderElement.value).toBe(compProp.placeholder.value);
		        expect(placeHolderElement.text).toBe(compProp.placeholder.text);
            });
        });
    });
