define(['lodash', 'santa-harness', 'generalUtils'], function (_, santa, generalUtils) {
    'use strict';

    describe('Preview mode', function () {
        var ds;
        var document;

        beforeAll(function (done) {
            santa.start({site: 'navigation-in-preview'}).then(function (harness) {
                ds = harness.documentServices;
                document = harness.window.document;
                console.log('Testing navigation');
                done();
            });
        });

        beforeEach(function (done) {
            ds.documentMode.setComponentViewMode('preview');
            ds.waitForChangesApplied(done);
        });

        describe('after calling Document Services singleComp method', function () {
            var navigationButton;
            var tryCounter = 0;

            it('should success to make navigation to another page and back', function (done) {
                console.log('Starting test');
                findButtonAndVerifyText(done, 'A', function () {
                    console.log('going to navigate to B');
                    navigationButton.click();
                    findButtonAndVerifyText(done, 'B', function () {
                        console.log('going to navigate to A');
                        navigationButton.click();
                        findButtonAndVerifyText(done, 'A', done);
                    });
                });
            });


            function findButtonAndVerifyText(done, title, callback) {

                window.setTimeout(function () {
                    var buttons = generalUtils.getButtonsElementsWithTitle(ds, document, title);

                    if (buttons.length > 0) {
                        navigationButton = buttons[0];
                        callback();
                    } else if (tryCounter < 4) {
                        tryCounter++;
                        console.log("Try number " + tryCounter);
                        findButtonAndVerifyText(title, callback);
                    } else {
                        expect(buttons.length).toBeGreaterThan(0);
                        console.log("Test failed because page with " + title + " button didn't loaded");
                        done();
                    }
                }, 10);
            }


            beforeEach(function (done) {
                var comp = ds.components.getChildren(ds.pages.getFocusedPage())[0];
                var currLayout = ds.components.layout.get(comp);
                ds.components.layout.update(comp, {y: currLayout.y + 10});
                ds.waitForChangesApplied(done);
            });
        });
    });
}); 
