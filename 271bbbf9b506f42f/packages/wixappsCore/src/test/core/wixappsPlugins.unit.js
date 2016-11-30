define(["wixappsCore/core/wixappsPlugins", "wixappsCore/core/wixappsConfiguration"], function (wixappsPlugins, wixappsConfiguration) {
    'use strict';

    describe("wixappsPlugins", function () {

        describe("getAdditionalDomAttributes", function () {

            var proxy = {
                constructor: {
                    displayName: "displayName"
                },
                getViewDefProp: function (prop) {
                    if (prop === 'id') {
                        return 'title';
                    }
                    if (prop === 'data') {
                        return 'field';
                    }
                },
                props: {viewName: "view", forType: 'type'}};

            it("wixappsConfiguration.shouldApplyAutomationAttributes is true - return vcfield, vcview and vctype", function () {
                spyOn(wixappsConfiguration, 'shouldApplyAutomationAttributes').and.returnValue(true);

                var additionalDomAttributes = wixappsPlugins.getAdditionalDomAttributes(proxy);

                var expected = {
                    "data-vcview": "view",
                    "data-vcfield": 'title',
                    "data-vctype": 'type',
                    "data-proxy": "displayName",
                    "data-field-name": 'field'
                };

                expect(additionalDomAttributes).toEqual(expected);
            });

            it("wixappsConfiguration.shouldApplyAutomationAttributes is false - return empty", function () {
                spyOn(wixappsConfiguration, 'shouldApplyAutomationAttributes').and.returnValue(false);

                var additionalDomAttributes = wixappsPlugins.getAdditionalDomAttributes(proxy);

                var expected = {};

                expect(additionalDomAttributes).toEqual(expected);
            });

        });
    });

});
