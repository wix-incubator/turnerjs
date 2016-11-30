define(['santa-harness'], function (santa) {
    'use strict';

    //when running scrap, sometimes, the tpa.js clientSpecMap json has undefined fields appearing as empty strings causing wrong results
    xdescribe('Document Services - TPA - Widget', function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start({site: 'tpa'}).then(function (harness) {
                documentServices = harness.documentServices;
                done();
            });
        });

        describe('add', function () {

            it("should add widget (Comments) if its already provisioned", function (done) {
                var layout = {width: 100, height: 200, x: 10, y: 15};
                var params = {
                    widgetId: "130165ba-4eeb-4a87-3121-a3cf2a86d2ca",
                    pageId: documentServices.pages.getFocusedPage().id,
                    layout: layout
                };
                var appDefinitionId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';

                var compPointer = documentServices.tpa.widget.add(appDefinitionId, params);

                documentServices.waitForChangesApplied(function () {
                    var compLayout = documentServices.components.layout.get(compPointer);

                    expect(compPointer).toBeDefined();
                    expect(documentServices.components.getAllComponents()).toContain(compPointer);
                    expect(documentServices.components.getType(compPointer)).toEqual('wysiwyg.viewer.components.tpapps.TPAWidget');
                    expect(compLayout.height).toBe(layout.height);
                    expect(compLayout.width).toBe(layout.width);
                    expect(compLayout.x).toBe(layout.x);
                    expect(compLayout.y).toBe(layout.y);

                    done();
                });
            });

            //TODO: faling, fix - TypeError: Cannot read property 'id' of undefined(…)
            xit("should add glued widget (Facebook Like) if its already provisioned", function (done) {
                var layout = {height: 40, width: 200};
                var params = {
                    widgetId: "137a541b-4256-e760-4943-fb02c8306877",
                    pageId: documentServices.pages.getFocusedPage().id,
                    layout: layout
                };
                var appDefinitionId = "137a53e6-9579-5af1-cf55-7d3118c5e4cd";

                var compPointer = documentServices.tpa.widget.add(appDefinitionId, params);

                documentServices.waitForChangesApplied(function () {
                    var compLayout = documentServices.components.layout.get(compPointer);

                    expect(compPointer).toBeDefined();
                    expect(documentServices.components.getAllComponents()).toContain(compPointer);
                    expect(documentServices.components.getType(compPointer)).toEqual("wysiwyg.viewer.components.tpapps.TPAGluedWidget");
                    expect(compLayout.height).toBe(layout.height);
                    expect(compLayout.width).toBe(layout.width);

                    done();
                });
            });

        });
    });
});
