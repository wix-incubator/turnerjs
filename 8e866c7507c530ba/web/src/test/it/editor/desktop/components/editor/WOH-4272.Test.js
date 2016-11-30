integration.noAutomation();
integration.requireStaging();
integration.requireEditor('785afeab-cbf7-4a70-8591-f96167f816ed','be1fe699-6d9c-4c83-aa54-4e36ed28bb1e','texttest321@gmail.com', 'tteexxtt');
integration.requireExperiments(['fix4272']);

////////////////////////////////////////////////////////////
///////////////// This should be in a driver ///////////////

var _stepCounter = 0;

function _currentStep() {
    return parseInt(W.Utils.getQueryParam('itStep') || 1);
}

function _currentSpecIsPassing() {
    function _runnerPassed(runner) {
        return _.every(runner.specs_, function (spec){return spec.results_.failedCount===0}) && _.every(runner.suites_, _runnerPassed);
    }
    return _runnerPassed(jasmine.getEnv().currentRunner_);
}

function describeStep(step, description, cb) {
    _stepCounter++;
    if (step === _currentStep()) {
        describe(description, cb);
        it('should complete all test steps', function() {
            expect(_stepCounter).toEqual(step); //This fails all steps but the last
        });
    }
}

function goToNextUrl(url) {
    if (_currentSpecIsPassing()) {
        waitsFor(function(){});
        window.location.href = url + '&experiment=it&specurl=' + W.Utils.getQueryParam('specurl') + '&itStep=' + (_currentStep() +1);
    }
}

////////////////////////////////////////////////////////////
//////////////// This should be the test ///////////////////


describe("#WOH-4272: font not showing the right value", function () {
    var componentDriver = automation.viewercomponents.ViewerComponent;
    var richTextDriver = automation.editorcomponents.richtext.RichTextDriver;
    var testPlainText = "WOH-4272";

    function startEditing(comp) {
        return richTextDriver.startEditing(comp);
    }

    beforeEach(function(){
        waitsFor(function () {
            return !!W.Preview.getPreviewManagers().Viewer.getCurrentPageNode();
        } , 'waits for current page to be ready', 1000);
    });

    describeStep(1, "Create problematic scenario", function () { //should be describeStep
        function setBodyFontStyle() {
            var previewThemeData = W.Preview.getPreviewManagers().Theme.getDataItem();
            previewThemeData.set("font_8", "normal normal normal 30px/1.4em forum {color_4}");
        }

        function setTestData() {
            var testData = "<div><span style='font-family:anton,sans-serif;'>" + testPlainText + "</span></div>";
            richTextDriver.setEditorData(testData);
        }

        it("Should set the design fonts and create the problematic text", function () {
            window.enableNavigationConfirmation = false;

            setBodyFontStyle();

            automation.Utils.waitsForPromise(function () {
                return componentDriver.addComponent("richText")
                                      .then(startEditing)
                                      .then(setTestData);
            });

            runs(function() {
                richTextDriver.stopEditingSync();

                //save the site
                var saveCompleted = false;
                W.Commands.executeCommand('WEditorCommands.Save', {"onCompleteCallback": function() {
                    saveCompleted = true;
                }});

                waitsFor(function () {
                    return saveCompleted;
                }, "Save completed.", 2500);

                runs(function () {
                    goToNextUrl(window.location.href);
                });
            })
        });
    });

    describeStep(2, "Check that the font family is correct when editing the text", function () {
        it("should display the right value in the font family drop down", function () {
            var textCompsInSite = W.Preview.getPreviewSite().$$('div[comp=wysiwyg.viewer.components.WRichText]');
            var testTextElement = _.find(textCompsInSite, function(textComp) {
                return textComp.textContent.trim() === testPlainText;
            });

            if (!testTextElement) {
                //first pass did not pass
                expect(false).toBeTruthy() ;
                return;
            }

            var testTextComp = testTextElement.$logic;
            W.Editor.setSelectedComp(testTextComp);

            automation.Utils.waitsForPromise(function () {
                return startEditing(testTextComp);
            });

            runs(function() {
                //getCurrent selected font
                expect(richTextDriver.getSelectedFontFamilyLabel()).toEqual("Anton");
                richTextDriver.stopEditingSync();

                //Clean site 4 next tests - remove the test text component and save
                W.Commands.executeCommand('WEditorCommands.WDeleteSelectedComponent');
                W.Commands.executeCommand('WEditorCommands.Save');
            });
        });
    });

});
