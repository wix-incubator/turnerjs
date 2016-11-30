describe('WRichTextEditor Tests', function(){
    var richTextDriver = automation.editorcomponents.richtext.RichTextDriver;
    var componentDriver = automation.viewercomponents.ViewerComponent;
    var currentTestedComp;
    var dataBeforeEditing;

    function addTextAndStrartEditing() {
        automation.Utils.waitsForPromise(function () {
            return componentDriver.addComponent("richText").then(function (comp) {
                currentTestedComp = comp;
                dataBeforeEditing = currentTestedComp.getDataItem().get("text");
                return richTextDriver.startEditing(currentTestedComp);
            });
        });
    }

    describe("WOH-8996: Blank Text Behavior", function(){
        beforeEach(function() {
            addTextAndStrartEditing();
        });

        afterEach(function(){
            W.Editor.resetNumOfNewComponentsWithoutComponentMovement();
        });

        it("Should not leave blank text component", function () {
            var callbackDone = false,
                compId = currentTestedComp.getComponentId();

            richTextDriver.setEditorData("", function(){
                W.Commands.executeCommand('WEditorCommands.StopEditingText');
                callbackDone = true;
            });

            waitsFor(function(){
                return callbackDone;
            }, "Should set editor data to empty string", 1500);

            runs(function(){
                expect(W.Preview.getPreviewManagers().Viewer.getCompByID(compId)).not.toBeDefined();
            });

            currentTestedComp = null;
        });

        it("Should return the deleted text component with original text before setting blank text", function(){
            var callbackDone = false;

            richTextDriver.setEditorData("", function(){
                W.Commands.executeCommand('WEditorCommands.StopEditingText');
                W.Commands.executeCommand("WEditorCommands.Undo");
                callbackDone = true;
            });

            waitsFor(function(){
                return callbackDone && W.Editor.getEditedComponent() != null;
            }, "Should set editor data to previous data after undo delete", 1500);

            runs(function(){
                //assuming that after undoing the selected component is the reverted original component
                var returnedTextComponent = W.Editor.getEditedComponent();
                expect(returnedTextComponent.getDataItem().get("text")).toEqual(dataBeforeEditing);
            });
        });
    });

    describe("WOH-9179: Text security issue with image", function(){
        it ("Should keep only: src, style, wix-comp - attributes on image tag after editing", function() {
            var whiteListAttributes = ['src', 'style', 'wix-comp'];
            addTextAndStrartEditing();

            runs(function() {
                var callbackDone = false;

                richTextDriver.setEditorData("security test <img src='sdf' wix-comp='sdf' style='sdf' onerror='console.log(\"noam\")' balaab='ads' />", function(){
                    W.Commands.executeCommand('WEditorCommands.StopEditingText');
                    callbackDone = true;
                });

                waitsFor(function(){
                    return callbackDone;
                }, "text editing to stop", 1500);

                runs(function(){
                    var img = currentTestedComp._skinParts.richTextContainer.getElementsByTagName("img")[0];
                    var attributes = _.map(img.attributes, function(attr) {return attr.nodeName.toLowerCase();});
                    expect(_.difference(attributes, whiteListAttributes)).toEqual([]);
                    expect(_.intersection(attributes, whiteListAttributes)).toEqual(whiteListAttributes);
                    currentTestedComp = null;
                });
            });
        });

        it ("Should remove: ['id', 'comp','dataquery','propertyquery','styleid','skin','skinpart','y','x','scale', 'angle', 'idprefix','state','container','listposition','hasproxy', 'vcfield', 'vcview', 'vctype', 'pos' -  attributes after editing", function() {
            var blackListAttributes = ["id", "comp","dataquery","propertyquery","styleid","skin","skinpart","y","x","scale", "angle", "idprefix","state","container","listposition","hasproxy", "vcfield", "vcview", "vctype", "pos"];
            addTextAndStrartEditing();

            runs(function() {
                var callbackDone = false;

                richTextDriver.setEditorData("<div id='deese' comp='deese' dataquery='deese' propertyquery='deese' styleid='deese' skin='deese' skinpart='deese' y='deese' x='deese' scale='deese'  angle='deese'  idprefix='deese' state='deese' container='deese' listposition='deese' hasproxy='deese'  vcfield='deese'  vcview='deese'  vctype='deese'  pos ='deese'>akjsbcdkjabcd</div>",  function(){
                    W.Commands.executeCommand('WEditorCommands.StopEditingText');
                    callbackDone = true;
                });

                waitsFor(function(){
                    return callbackDone;
                }, "text editing to stop", 1500);

                runs(function(){
                    var element = currentTestedComp._skinParts.richTextContainer.firstChild;
                    var attributes = _.map(element.attributes, function(attr) {return attr.nodeName.toLowerCase();});
                    expect(_.intersection(attributes, blackListAttributes)).toEqual([]);
                    currentTestedComp = null;
                });
            });
        });
    });
});