define(['lodash', 'documentServices/wixapps/utils/migration/textFieldMigration', 'wixappsCore', 'testUtils'], function (_, textFieldMigration, wixappsCore, testUtils) {
    'use strict';

    describe('textFieldMigration', function () {

        textFieldMigration.compPropsToRemove.forEach(function (prop) {
            it('should remove ' + prop + ' from the viewDef after the migration', function () {
                var compProps = {};
                compProps[prop] = true;
                var textFieldViewDef = testUtils.proxyViewDef.createTextField('richText1', {}, compProps);
                var mobileTextFieldViewDef = testUtils.proxyViewDef.createTextField('richText1', {}, compProps);

                var data = testUtils.proxyData.createRichTextData('<p>Ogi</p>');

                var expectedViewDef = _.cloneDeep(textFieldViewDef);
                delete expectedViewDef.comp.items[0].comp[prop];

                var result = textFieldMigration.migrate(textFieldViewDef, mobileTextFieldViewDef, data);

                expect(result.viewDef).toEqual(expectedViewDef);
                expect(result.mobileViewDef).toEqual(expectedViewDef);
            });
        });

        it('should remove text-align from the viewDef after the migration and put it in the data', function () {
            var textFieldViewDef = testUtils.proxyViewDef.createTextField('richText1', {"text-align": "center"});
            var mobileTextFieldViewDef = testUtils.proxyViewDef.createTextField('richText1', {"text-align": "left"});
            var data = {
                item1: {
                    field1: testUtils.proxyData.createRichTextData('<hatul>Ogi1</hatul>')
                },
                item2: {
                    field2: testUtils.proxyData.createRichTextData('<hatul>Ogi2</hatul>')
                }
            };

            var expectedViewDef = testUtils.proxyViewDef.createTextField('richText1');
            var expectedData = {
                item1: {
                    field1: testUtils.proxyData.createRichTextData('<p class="font_8" style="text-align:center;">Ogi1</p>')
                },
                item2: {
                    field2: testUtils.proxyData.createRichTextData('<p class="font_8" style="text-align:center;">Ogi2</p>')
                }
            };

            var result = textFieldMigration.migrate(textFieldViewDef, mobileTextFieldViewDef, data);
            expect(result.viewDef).toEqual(expectedViewDef);
            expect(result.mobileViewDef).toEqual(expectedViewDef);
            expect(result.data).toEqual(expectedData);
        });
    });
});
