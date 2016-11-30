/**
 * created by Omri
 * Date: 12/9/11
 * Time: 2:18 PM
 */
describe("BindValueToData", function() {
    var BOUND_FIELD = 'boundField';
    beforeEach(function() {
        // Create a data item
        this.MockDataItem = new MockBuilder('Data')
                .extendClass('core.managers.data.DataItemBase')
                .getClass();
        this.rawData = {boundField:'data from dataItem'};
        this.mockDataItem = new this.MockDataItem(this.rawData, W.Data);

        // Create an instance that implements BindValueToData
        this.mockInput = new MockBuilder('BindValueToData_Implementation')
                .implementTraits(['wysiwyg.editor.components.traits.BindValueToData'])
                .mockMethodThatReturns('getDataItem', this.mockDataItem)
                .getInstance();
    });
    describe("public methods", function() {
        describe("bindToField", function() {
            beforeEach(function() {
                this.mockInput._data = this.mockDataItem;
            });

            it("should update the data item if the input changes", function() {
                this.mockInput.bindToField(BOUND_FIELD);

                this.mockInput.setValue('new value');

                expect(this.mockDataItem.get(BOUND_FIELD)).toBe('new value');
            });

            it("should update the input if the data item changes", function() {
                this.mockInput.bindToField(BOUND_FIELD);

                this.mockInput.getDataItem().set(BOUND_FIELD, 'new value');

                expect(this.mockInput.getValue()).toBe('new value');
            });
        });

        describe("bindToDataItem", function() {
            it("should update the data item if the input changes", function() {
                this.mockInput.bindToDataItem(this.mockDataItem);
                var rawData = {value: 'new value'};

                this.mockInput.setValue(rawData);

                expect(this.mockDataItem.getData()).toBe(rawData);
            });

            it("should update the input if the data item changes", function() {
                this.mockInput.bindToDataItem(this.mockDataItem);
                var rawData = {value: 'new value'};

                this.mockInput.getDataItem().setData(rawData);

                expect(this.mockInput.getValue()).toBe(rawData);
            });

            it("should set the object's data item", function() {
                this.mockInput.bindToDataItemField(this.mockDataItem, BOUND_FIELD);

                expect(this.mockInput.setDataItem).toHaveBeenCalledWith(this.mockDataItem);
            });
        });

        describe("bindToFilteredFields", function() {
            var initialData = {a: 1, b: 2, c: 3};
            var changedData = {a: 10, b:20, d:40};
            var filteredData = {a:10, b:20};
            var filter = ['a','b'];
            beforeEach(function() {
                this.mockDataItem.setData(initialData);
            });

            it("should update the data item if the input changes", function() {
                this.mockInput.bindToDataItemsFilteredFields(this.mockDataItem, filter);

                this.mockInput.setValue(changedData);

                expect(this.mockDataItem.getFields(filter)).toBeEquivalentTo(filteredData);
            });

            it("should update the input if the data item changes", function() {
                this.mockInput.bindToDataItemsFilteredFields(this.mockDataItem, filter);

                this.mockInput.getDataItem().setFields(changedData);

                expect(this.mockInput.getValue()).toBeEquivalentTo(filteredData);
            });

            it("should handle both an array and an object (map) as a filter", function() {
                this.mockInput.bindToDataItemsFilteredFields(this.mockDataItem, filter);
                expect(this.mockInput._dataFieldsFilter).toBeEquivalentTo(filter);

                this.mockInput.bindToDataItemsFilteredFields(this.mockDataItem, {a:0, b:1});
                expect(this.mockInput._dataFieldsFilter).toBeEquivalentTo(filter);
            });
        });

        describe("bindToDataItemField", function() {
            it("should set the object's data item", function() {
                this.mockInput.bindToDataItemField(this.mockDataItem, BOUND_FIELD);

                expect(this.mockInput.setDataItem).toHaveBeenCalledWith(this.mockDataItem);
            });

            it("should bind the data field by calling bindToField", function() {
                this.mockInput.bindToDataItemField(this.mockDataItem, BOUND_FIELD);

                expect(this.mockInput.bindToField).toHaveBeenCalledWith(BOUND_FIELD);
            });
        });

        describe("bindToDataItemsRemappedFields", function() {
            it("should set the object's data item", function() {
                this.mockInput.bindToDataItemsRemappedFields(this.mockDataItem, {});

                expect(this.mockInput.setDataItem).toHaveBeenCalledWith(this.mockDataItem);
            });

            it("should bind the data fields by calling bindRemappedFields", function() {
                var fieldsMap = {
                    'a': 'b'
                };
                this.mockInput.bindToDataItemsRemappedFields(this.mockDataItem, fieldsMap);

                expect(this.mockInput.bindRemappedFields).toHaveBeenCalledWith(fieldsMap);
            });
        });

        describe("bindRemappedFields", function() {
            var initialData = {a: 1, b: 2, c: 3};
            var dataToInputMap = {a: 'va', b: 'vb'};

            beforeEach(function() {
                this.mockDataItem.setData({a: 1, b: 2, c: 3});
                this.mockInput.setDataItem(this.mockDataItem);
            });

            it("should update the data item if the input changes, with the field names remapped", function() {
                var expectedData = {a: 10, b: 20, c: 3};
                var newValue = {va: 10, vb: 20};
                this.mockInput.bindRemappedFields(dataToInputMap);

                expect(this.mockDataItem.getData()).toContainObject(expectedData);
            });

            it("should update the input if the data item changes, with the field names remapped", function() {
                var expectedValue = {va:1, vb:2};
                this.mockInput.bindRemappedFields(dataToInputMap);

                this.mockDataItem.setData(initialData);

                expect(this.mockInput.getValue()).toBeEquivalentTo(expectedValue);
            });
        });


        describe("bindToDataItemsFilteredFields", function() {
            var rawData = {
                a: 1,
                b: 2,
                c: 3
            };
            var filteredData = {
                a:1,
                b:2
            };
            var filter = ['a','b'];
            beforeEach(function() {
                this.mockDataItem.setData(rawData);
            });

            it("should bind the data fields by calling bindToFilteredFields", function() {
                this.mockInput.bindToDataItemsFilteredFields(this.mockDataItem, filter);

                expect(this.mockInput.bindToFilteredFields).toHaveBeenCalledWith(filter);
            });

            it("should set the object's data item", function() {
                this.mockInput.bindToDataItemsFilteredFields(this.mockDataItem, filter);

                expect(this.mockInput.setDataItem).toHaveBeenCalledWith(this.mockDataItem);
            });
        });

        describe("bindHooks", function() {
            describe('basic bindHooks operations', function(){
                beforeEach(function() {
                    this.inputToData = getSpy('inputToData', function(data) {
                        return data.toUpperCase();
                    });
                    this.dataToInput = getSpy('dataToInput', function(data) {
                        return data.toLowerCase();
                    });
                    this.mockInput.bindHooks(this.inputToData, this.dataToInput);
                });

                it('should override local hook functions with new functions', function() {
                    expect(this.mockInput._inputToDataHook).toBe(this.inputToData);
                    expect(this.mockInput._dataToInputHook).toBe(this.dataToInput);
                });

                it('should force input update from data when hooks are loaded', function() {
                    this.mockInput.bindToDataItemField(this.mockDataItem, BOUND_FIELD);

                    this.mockInput.bindHooks(this.inputToData, this.dataToInput);

                    expect(this.mockInput.setValue).toHaveBeenCalledWith('data from dataitem', true);
                });
            });
            describe("binding to data field", function() {
                beforeEach(function() {
                    this.inputToData = getSpy('inputToData', function(data) {
                        return data.toUpperCase();
                    });
                    this.dataToInput = getSpy('dataToInput', function(data) {
                        return data.toLowerCase();
                    });
                    this.mockInput.bindHooks(this.inputToData, this.dataToInput);
                });

                it("should manipulate the data binding with the hooks (data > input)", function() {
                    this.mockInput.bindToDataItemField(this.mockDataItem, BOUND_FIELD);

                    this.mockInput.getDataItem().set(BOUND_FIELD, 'NEW VALUE');

                    expect(this.mockInput.getValue()).toBe('new value');
                });

                it("should manipulate the data binding with the hooks (input > data)", function() {
                    this.mockInput.bindToDataItemField(this.mockDataItem, BOUND_FIELD);

                    this.mockInput.setValue('new value');

                    expect(this.mockDataItem.get(BOUND_FIELD)).toBe('NEW VALUE');
                });

            });

            describe("binding to data item", function() {
                beforeEach(function() {
                    this.inputToData = getSpy('inputToData', function(data) {
                        var dataCopy = Object.clone(data);
                        dataCopy[BOUND_FIELD] = dataCopy[BOUND_FIELD].toUpperCase();
                        return dataCopy;
                    });
                    this.dataToInput = getSpy('dataToInput', function(data) {
                        var dataCopy = Object.clone(data);
                        dataCopy[BOUND_FIELD] = dataCopy[BOUND_FIELD].toLowerCase();
                        return dataCopy;
                    });
                    this.mockInput.bindHooks(this.inputToData, this.dataToInput);
                    this.mockInput.bindToDataItem(this.mockDataItem);
                });


                it("should manipulate the bound data with the defined hooks (data > input)", function() {
                    var text = 'I Should Be Lowercase';
                    var newRawData = {};
                    newRawData[BOUND_FIELD] = text;

                    var lowerCaseText = '';

                    this.mockDataItem.setData(newRawData);
                    lowerCaseText = this.mockInput.getValue()[BOUND_FIELD];

                    expect(lowerCaseText).toBe(text.toLowerCase());
                });

                it("should manipulate the bound data with the defined hooks (input > data)", function() {
                    var text = 'I Should Be Uppercase';
                    var newRawData = {};
                    newRawData[BOUND_FIELD] = text;

                    var upperCaseText = '';


                    this.mockInput.setValue(newRawData);
                    upperCaseText = this.mockDataItem.getData()[BOUND_FIELD];

                    expect(upperCaseText).toBe(text.toUpperCase());
                });
            });

            describe("functional tests", function() {
                beforeEach(function() {
                    this.inputToData = getSpy('inputToData ', function(data) {
                        return data.toUpperCase();
                    });
                    this.dataToInput = getSpy('dataToInput', function(data) {
                        return data.toLowerCase();
                    });
                });

                it("should set _inputToDataHook and _dataToInputHook", function() {
                    this.mockInput.bindHooks(this.inputToData, this.dataToInput);

                    expect(this.mockInput._inputToDataHook).toBe(this.inputToData);
                    expect(this.mockInput._dataToInputHook).toBe(this.dataToInput);
                });

                it("should set default hooks if no arguments are passed", function() {
                    this.mockInput.bindHooks();

                    expect(this.mockInput._inputToDataHook).toBe(this.mockInput._trivialHook);
                    expect(this.mockInput._dataToInputHook).toBe(this.mockInput._trivialHook);
                });
            });
        });
    });
});