describeExperiment({SiteNavigationRefactor: 'New'}, 'CheckboxNavigationButton', function() {
    testRequire().components('wysiwyg.editor.components.CheckboxNavigationButton');

    beforeEach(function () {
        /**@type wysiwyg.editor.components.BaseNavigationButton*/
        this.componentLogic = new this.CheckboxNavigationButton('testCompId', new Element('div'));
    });

    describe('render', function() {

        beforeEach(function() {
            spyOn(this.componentLogic, 'parent').andReturn();

            this.componentLogic._skinParts = {
                checkbox: {
                    checked: false
                }
            };
        });

        it('should call this.parent()', function() {
            this.componentLogic.render();

            expect(this.componentLogic.parent).toHaveBeenCalled();
        });

        it('should set this._checkboxState to false', function() {
            this.componentLogic.render();

            expect(this.componentLogic._checkboxState).toBe(false);
        });
    });

    describe('_isVisible', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, '_getPageId').andReturn('#1234');
        });

        it('should call _isPageVisible with #1234', function() {
            spyOn(this.componentLogic, '_isPageVisible').andReturn();

            this.componentLogic._isVisible();

            expect(this.componentLogic._isPageVisible).toHaveBeenCalledWith('#1234');
        });

        it('should return true when _isPageVisible returns true', function() {
            spyOn(this.componentLogic, '_isPageVisible').andReturn(true);

            var isVisible = this.componentLogic._isVisible();

            expect(isVisible).toBe(true);
        });

        it('should return false when _isPageVisible returns false', function() {
            spyOn(this.componentLogic, '_isPageVisible').andReturn(false);

            var isVisible = this.componentLogic._isVisible();

            expect(isVisible).toBe(false);
        });
    });

    describe('_getItemType', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, '_getPageId').andReturn('#1234');
        });

        it('should call _isHomepage with "#1234"', function() {
            spyOn(this.componentLogic, '_isHomepage').andReturn();

            this.componentLogic._getItemType();

            expect(this.componentLogic._isHomepage).toHaveBeenCalledWith('#1234');
        });

        it('should return "homepage" when _isHomepage returns true', function() {
            spyOn(this.componentLogic, '_isHomepage').andReturn(true);

            var itemType = this.componentLogic._getItemType();

            expect(itemType).toBe('homepage');
        });

        it('should return "" when _isHomepage returns false', function() {
            spyOn(this.componentLogic, '_isHomepage').andReturn(false);

            var itemType = this.componentLogic._getItemType();

            expect(itemType).toBe('page');
        });
    });
});
