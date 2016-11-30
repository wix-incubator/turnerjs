describeExperiment({SiteNavigationRefactor: 'New'}, 'BaseNavigationButton', function() {
    testRequire().components('wysiwyg.editor.components.BaseNavigationButton');

    beforeEach(function () {
        /**@type wysiwyg.editor.components.BaseNavigationButton*/
        this.componentLogic = new this.BaseNavigationButton('testCompId', new Element('div'));
    });

    describe('render', function() {

        it('should call setIcon', function() {
            spyOn(this.componentLogic, '_setIcon').andReturn();

            this.componentLogic.render();

            expect(this.componentLogic._setIcon).toHaveBeenCalled();
        });
    });

    describe('_onAllSkinPartsReady', function() {
        it('should call _updateItemProps', function() {
            spyOn(this.componentLogic, '_updateItemProps').andReturn();

            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic._updateItemProps).toHaveBeenCalled();
        });
    });

    describe('updateItemProps', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, '_setTitle').andReturn();
            spyOn(this.componentLogic, '_setIcon').andReturn();
        });

        it('should call _setTitle', function() {
            this.componentLogic._updateItemProps();

            expect(this.componentLogic._setTitle).toHaveBeenCalled();
        });

        it('should call _setIcon', function() {
            this.componentLogic._updateItemProps();

            expect(this.componentLogic._setIcon).toHaveBeenCalled();
        });
    });

    describe('updateItemProps', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, '_setTitle').andReturn();
            spyOn(this.componentLogic, '_setIcon').andReturn();
        });

        it('should call _setTitle', function() {
            this.componentLogic._updateItemProps();

            expect(this.componentLogic._setTitle).toHaveBeenCalled();
        });

        it('should call _setIcon', function() {
            this.componentLogic._updateItemProps();

            expect(this.componentLogic._setIcon).toHaveBeenCalled();
        });
    });

    describe('_setTitle', function() {
        beforeEach(function() {
            this.componentLogic._skinParts = {
                label: new Element('div')
            };

            spyOn(this.componentLogic, '_getItemTitle').andReturn('someTitle');
        });

        it('should call _getItemTitle', function() {
            this.componentLogic._setTitle();

            expect(this.componentLogic._getItemTitle).toHaveBeenCalled();
        });

        it('should set the label skinPart\'s HTML to someTitle', function() {
            this.componentLogic._setTitle();

            var labelHtml = this.componentLogic._skinParts.label.innerHTML;
            expect(labelHtml).toEqual('someTitle');
        });
    });

    describe('_setIcon', function() {
        beforeEach(function() {
            this.componentLogic._skinParts = {
                icon: new Element('div')
            };

            spyOn(this.componentLogic, '_getItemType').andReturn();
            spyOn(this.componentLogic, '_isVisible').andReturn();
        });

        it('should call _getItemType', function() {
            this.componentLogic._setIcon();

            expect(this.componentLogic._getItemType).toHaveBeenCalled();
        });

        it('should call _isVisible', function() {
            this.componentLogic._setIcon();

            expect(this.componentLogic._isVisible).toHaveBeenCalled();
        });
    });
});
