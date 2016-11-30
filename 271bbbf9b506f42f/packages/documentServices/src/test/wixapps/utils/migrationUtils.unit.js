define(['documentServices/wixapps/utils/migrationUtils', 'testUtils'], function (migrationUtils, testUtils) {
    'use strict';

    describe('migrationUtils', function () {
        beforeEach(function () {
            this.viewDef = testUtils.proxyViewDef.createVBox([
                    testUtils.proxyViewDef.createTextField('richText1', {'text-align': 'center'}, {bold: true}),
                    testUtils.proxyViewDef.createTextField('richText2', {'text-align': 'left'}, {lineThrough: true}),
                    testUtils.proxyViewDef.createImageField('image1')
                ]
            );
            this.mobileViewDef = testUtils.proxyViewDef.createVBox([
                    testUtils.proxyViewDef.createTextField('richText1', {'text-align': 'left'}, {lineThrough: true}),
                    testUtils.proxyViewDef.createTextField('richText2', {'text-align': 'center'}, {bold: true}),
                    testUtils.proxyViewDef.createImageField('image1')
                ]
            );

            this.items = {
                firstItem: {
                    richText1: testUtils.proxyData.createRichTextData('<hatul>Ogi1</hatul>'),
                    richText2: testUtils.proxyData.createRichTextData('<hatul>Ogi2</hatul>'),
                    image1: testUtils.proxyData.createImageData('1.jpg', 100, 200, 'title1')
                },
                secondItem: {
                    richText1: testUtils.proxyData.createRichTextData('<hatul>Ogi3</hatul>'),
                    richText2: testUtils.proxyData.createRichTextData('<hatul>Ogi4</hatul>'),
                    image1: testUtils.proxyData.createImageData('2.jpg', 200, 400, 'title2')
                }
            };

            this.fields = [
                {name: 'richText1', type: 'wix:RichText'},
                {name: 'richText2', type: 'wix:RichText'},
                {name: 'image1', type: 'wix:Image'}
            ];
        });

        it('should remove text align and comp props from desktop text fields', function () {
            var result = migrationUtils.migrate(this.viewDef, this.mobileViewDef, this.items, this.fields, '2.0');

            var expectedViewDef = testUtils.proxyViewDef.createVBox([
                    testUtils.proxyViewDef.createTextField('richText1'),
                    testUtils.proxyViewDef.createTextField('richText2'),
                    testUtils.proxyViewDef.createImageField('image1')
                ]
            );

            expect(result.viewDef).toEqual(expectedViewDef);
        });

        it('should remove text align and comp props from mobile text fields', function () {
            var result = migrationUtils.migrate(this.viewDef, this.mobileViewDef, this.items, this.fields, '2.0');

            var expectedViewDef = testUtils.proxyViewDef.createVBox([
                    testUtils.proxyViewDef.createTextField('richText1'),
                    testUtils.proxyViewDef.createTextField('richText2'),
                    testUtils.proxyViewDef.createImageField('image1')
                ]
            );

            expect(result.mobileViewDef).toEqual(expectedViewDef);
        });

        xit('should apply text align and comp props to all matching rich text in the items from destop view', function () {
            var result = migrationUtils.migrate(this.viewDef, this.mobileViewDef, this.items, this.fields, '2.0');

            expect(result.items.firstItem.richText1).toEqual(testUtils.proxyData.createRichTextData('<p class="font_8" style="text-align:center;"><strong>Ogi1</strong></p>'));
            expect(result.items.firstItem.richText2).toEqual(testUtils.proxyData.createRichTextData('<p class="font_8" style="text-align:left;"><strike>Ogi2</strike></p>'));
            expect(result.items.secondItem.richText1).toEqual(testUtils.proxyData.createRichTextData('<p class="font_8" style="text-align:center;"><strong>Ogi3</strong></p>'));
            expect(result.items.secondItem.richText2).toEqual(testUtils.proxyData.createRichTextData('<p class="font_8" style="text-align:left;"><strike>Ogi4</strike></p>'));
        });

        it('should not change other fields', function () {
            var result = migrationUtils.migrate(this.viewDef, this.mobileViewDef, this.items, '2.0');

            expect(result.items.firstItem.image1).toEqual(testUtils.proxyData.createImageData('1.jpg', 100, 200, 'title1'));
            expect(result.items.secondItem.image1).toEqual(testUtils.proxyData.createImageData('2.jpg', 200, 400, 'title2'));
        });

    });
});
