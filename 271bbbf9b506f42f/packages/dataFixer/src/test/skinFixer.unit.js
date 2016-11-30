define(['lodash', 'definition!dataFixer/plugins/skinFixer', 'experiment', 'testUtils'], function (_, skinFixerDef, experiment, testUtils) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    describe("skinFixer spec", function () {
        describe("Text skin fix", function () {

            beforeEach(function () {
                openExperiments('migrateTextStyle');
            });

            it('should create txtNew style if missing', function () {
                var page = {
                    structure: {
                        components: [
                            {
                                componentType: "wysiwyg.viewer.components.WRichText",
                                skin: "wysiwyg.viewer.skins.WRichTextSkin"
                            }
                        ]
                    }
                };

                var skinFixer = skinFixerDef(_, experiment);
                skinFixer.exec(page);

                expect(page.structure.components[0].skin).toEqual('wysiwyg.viewer.skins.WRichTextNewSkin');
            });
        });
    });
});
