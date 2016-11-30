describe('ScopeChange', function() {

    testRequire().
        classes('wysiwyg.editor.managers.undoredomanager.ScopeChange').
        resources('W.Editor', 'W.Utils', 'W.Preview').
        components('core.components.Container');

    beforeEach(function(){
        this.scopeChange = new this.ScopeChange();
    });

    describe('undo', function(){

        it('should pass oldState and changedComponentIds as parameters to _addChildrenComponentsToScope and oldState.parentId to _triggerComponentScopeChange', function(){
            spyOn(this.scopeChange, '_addChildrenComponentsToScope');
            spyOn(this.scopeChange, '_triggerComponentScopeChange');
            var input = {
                changedComponentIds: [],
                oldState: {
                    parentId: 'mockId'
                }
            };

            var result = this.scopeChange.undo(input);

            expect(this.scopeChange._addChildrenComponentsToScope).toHaveBeenCalledWith(input.oldState, input.changedComponentIds);
            expect(this.scopeChange._triggerComponentScopeChange).toHaveBeenCalledWith(input.oldState.parentId);
            expect(result).toBeTruthy();
        });

    });

    describe('redo', function(){

        it('should pass newState and changedComponentIds as parameters to _addChildrenComponentsToScope and oldState.parentId to _triggerComponentScopeChange', function(){
            spyOn(this.scopeChange, '_addChildrenComponentsToScope');
            spyOn(this.scopeChange, '_triggerComponentScopeChange');
            var input = {
                changedComponentIds: [],
                newState: {
                    parentId: 'mockId'
                }
            };

            var result = this.scopeChange.redo(input);

            expect(this.scopeChange._addChildrenComponentsToScope).toHaveBeenCalledWith(input.newState, input.changedComponentIds);
            expect(this.scopeChange._triggerComponentScopeChange).toHaveBeenCalledWith(input.newState.parentId);
            expect(result).toBeTruthy();
        });

    });



    describe( '_addComponentToScope', function(){

        beforeEach(function(){
            runs(function(){
                this.ContainerMock = new MockBuilder('ContainerMock').mockClass(this.Container).getClass();
                this.parentContainer = new this.ContainerMock();
                this.parentContainer.$view = new Element('div');

                spyOn(this.W.Preview, 'getCompLogicById').andReturn(this.parentContainer);
                spyOn(this.W.Editor, 'getComponentScope');
                spyOn(this.W.Editor, 'setEditMode');
            });

        });

        it('should get parent component logic from state.parentId and append the component to it', function(){

            runs(function(){
                var inputComponent = new this.ContainerMock();
                inputComponent.$view = new Element('div');
                var inputState = {
                    parentId: 'mockParentId'
                };

                this.scopeChange._addComponentToScope(inputState, inputComponent);

                expect(this.parentContainer.addChild).toHaveBeenCalledWith(inputComponent);
            });

        });

        it('should get parent component logic from state.parentId and append the component to it', function(){

            runs(function(){
                var expectedParentScope = {};
                this.W.Editor.getComponentScope.andReturn(expectedParentScope);
                var inputComponent = new this.ContainerMock();
                inputComponent.$view = new Element('div');
                var inputState = {
                    parentId: 'mockParentId'
                };

                this.scopeChange._addComponentToScope(inputState, inputComponent);

                expect(this.W.Editor.getComponentScope).toHaveBeenCalledWith(this.parentContainer);
                expect(this.W.Editor.setEditMode).toHaveBeenCalledWith(expectedParentScope);
            });

        });

    });

});