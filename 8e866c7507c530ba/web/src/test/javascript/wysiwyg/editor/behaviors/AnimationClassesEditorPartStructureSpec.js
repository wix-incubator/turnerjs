describe('Animation Classes Editor Part Structure Test', function() {

    describe('Loop over all animations editor parts', function() {
        var editorPartDefinition, animationList;
        var animations = define.getDefinition('animation');
        var animationsEditorPart = define.getDefinition('animationEditorPart');

        for (var name in animationsEditorPart) {
            editorPartDefinition = animationsEditorPart[name];
            animationList = _.keys(animations);
            testSingleAnimation(name, editorPartDefinition, animationList);
        }
    });

    function testSingleAnimation(name, definition, animationList) {
        describe(name + ' editor part', function() {
            describe('General Structure', function(){
                it('should have a corresponding animation mini class', function() {
                    expect(animationList.indexOf(name)).toBeGreaterThan(-1);
                });

                it('should have an "iconUrl" string', function() {
                    expect(definition.iconUrl).toBeOfType('string');
                });

                it('should have a "displayName" string', function() {
                    expect(definition.displayName).toBeOfType('string');
                });

                it('should have a "previewParams" object', function() {
                    expect(definition.previewParams).toBeOfType('object');
                });

                it('should have a "panelControls" object', function() {
                    expect(definition.panelControls).toBeOfType('object');
                });
            });

            describe('validate panelControls structure', function() {
                for (var control in definition.panelControls){
                    describe(control, function(){
                        var controlDefinition = definition.panelControls[control];
                        it('should have a "label" string', function(){
                            expect(controlDefinition.label).toBeOfType('string');
                        });

                        it('should have a "type" string', function(){
                            expect(controlDefinition.type).toBeOfType('string');
                        });

                        it('should have a default "value" defined', function(){
                            expect(controlDefinition.value).toBeDefined();
                        });
                    });

                }
            });
        });
    }


});