describe('wysiwyg.editor.components.panels.base.AutoPanel', function() {
    describe('test creation of inputs', function(){
        beforeEach(function() {
            ComponentsTestUtil.buildComp(
                'wysiwyg.editor.components.panels.base.AutoPanel',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin');
        });

        it('should create a label', function(){
            runs(function(){
                var labelLabel = "test label";

                this.testLabel = this.compLogic._addField(
                        'wysiwyg.editor.components.inputs.Label',
                        'wysiwyg.editor.skins.inputs.LabelSkin',
                        {labelText : labelLabel});

                 waitsFor(function(){
                    var labelCreated = false;
                    var createdLabelLabel = "";
                    if(this.testLabel.getHtmlElement().getLogic){
                        labelCreated = this.testLabel.getHtmlElement().getLogic().className == "wysiwyg.editor.components.inputs.Label";
                        createdLabelLabel = this.testLabel.getHtmlElement().getLogic()._labelText;
                    }
                    return labelCreated && labelLabel == createdLabelLabel;
                }.bind(this),
                'Label input creation',
                1000);
            });
        });

         it('should call _addField', function(){
            spyOn(this.compLogic, '_addField');
            var buttonLabel = "test label"

            this.testLabel = this.compLogic.addLabel(buttonLabel);

            expect(this.compLogic._addField).toHaveBeenCalledWithFollowingPartialArguments(
                    'wysiwyg.editor.components.inputs.Label',
                    'wysiwyg.editor.skins.inputs.LabelSkin');
        });

        it('should hide field1 in mobile mode', function(){
            var field1 = new Element('div');
            var fieldNodesToHide = [field1];
            field1.$logic = {collapse: function(){}};
            this.compLogic._enablePropertySplit = true; //set mobile mode

            spyOn(this.compLogic, '_getFieldNodesToHide').andReturn(fieldNodesToHide);
            spyOn(field1.$logic, 'collapse').andCallFake(function(){
                field1.setStyle('display', 'none');
            });

            this.compLogic.render();

            expect(field1.getStyle('display')).toBe('none')
        });


    });
});