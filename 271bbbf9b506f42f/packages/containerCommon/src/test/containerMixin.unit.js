define([
    'lodash',
    'testUtils',
    'containerCommon/mixins/containerMixin'
    ],
    function (_, testUtils, containerMixin) {
    'use strict';


    describe("containerMixin", function () {

        function createCompWithMixin(partialProps) {
            var compDef = {
                displayName: 'compWithMixin',
                mixins: [containerMixin],
                getSkinProperties: function () { //eslint-disable-line react/display-name
                    return {
                        '': {}
                    };
                }
            };

            var props = testUtils.santaTypesBuilder.getComponentProps(compDef, _.merge({
                // Default values here
                id: 'compWithMixin_'
            }, partialProps));

            return testUtils.getComponentFromDefinition(compDef, props);
        }

        it("should test containerMixin", function () {
            var compWithMixin = createCompWithMixin({
                //Custom props here
            });

            expect(compWithMixin).toBeDefined();
        });
    });
});
