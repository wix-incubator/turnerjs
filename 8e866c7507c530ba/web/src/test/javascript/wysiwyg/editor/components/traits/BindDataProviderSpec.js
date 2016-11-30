/**
 * created by Omri
 * Date: 12/15/11
 * Time: 12:20 PM
 */
describe("BindDataProvider", function() {
    beforeEach(function() {
        this.MockDataItem = new MockBuilder('Data')
                .extendClass('core.managers.data.DataItemBase')
                .getClass();
        this.rawData = {items: []};
        this.mockDataItem = new this.MockDataItem(this.rawData, W.Data);
        this.mockDataProvidedClass = new MockBuilder('DataProvidedClass')
                .mockMethods(['_renderIfReady', 'fireEvent'])
                .implementTraits(['wysiwyg.editor.components.traits.BindDataProvider'])
                .getInstance();
    });

    describe("bindToDataProvider", function() {
        describe("behaviour", function() {
            it("should call _dataProviderUpdated when the dataProvider changes (i.e. fires a Constants.DataEvents.DATA_CHANGED event))", function() {
                this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);

                this.mockDataItem.setData({items: [{'other items':1}]});

                // the first call is direct from this.mockDataProvidedClass.bindToDataProvider,
                // the second is the this.mockDataItem.setData
                expect(this.mockDataProvidedClass._dataProviderUpdated).toHaveBeenCalledXTimes(2);
            });

            it("should report an error if the dataProvider is changed to an invalid dataProvider (i.e. an object with not 'items' field)", function() {
                this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);
                var invalidDataProvider = {}; // not 'items' field

                expect(function() {
                    this.mockDataItem.setData(invalidDataProvider);
                }.bind(this)).toReportError(wixErrors.INVALID_INPUT_BIND, this.mockDataProvidedClass.className, '_dataProviderUpdated');
            });


            it("should report an error if the dataProvider has an item which is not a dictionary", function() {
                this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);
                var invalidDataProvider = {items: ['i am not a dictionary']}; // not 'items' field

                expect(function() {
                    this.mockDataItem.setData(invalidDataProvider);
                }.bind(this)).toReportError(wixErrors.INVALID_INPUT_BIND, this.mockDataProvidedClass.className, '_dataProviderUpdated');
            });


            it("should remove existing dataProvider Constants.DataEvents.DATA_CHANGED listener", function() {
                this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);

                this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);

                expect(this.mockDataItem.offByListener).toHaveBeenCalledWith(this.mockDataProvidedClass);
            });
        });

        describe("validations", function() {
            it("should validate the data provider and make sure there is an  'items' fields", function() {
                var invalidDataProvider = {}; // not 'items' field
                this.mockDataItem.setData(invalidDataProvider);

                expect(function() {
                    this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);
                }.bind(this)).toReportError(wixErrors.INVALID_INPUT_BIND, this.mockDataProvidedClass.className, '_dataProviderUpdated', this.mockDataItem);
            });

            it("should call _dataProviderUpdated", function() {
                this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);

                expect(this.mockDataProvidedClass._dataProviderUpdated).toHaveBeenCalledXTimes(1);
            });

            it("should report an error if the data provider's items don't match (have different keys)", function() {
                var invalidDataProvider = {
                    items:[
                        {key1: 1},
                        {key2: 2}
                ]}; //  different keys in items
                this.mockDataItem.setData(invalidDataProvider);

                expect(function() {
                    this.mockDataProvidedClass.bindToDataProvider(this.mockDataItem);
                }.bind(this)).toReportError(wixErrors.INVALID_INPUT_BIND, this.mockDataProvidedClass.className, '_dataProviderUpdated', this.mockDataItem);
            });

        });
    });
});