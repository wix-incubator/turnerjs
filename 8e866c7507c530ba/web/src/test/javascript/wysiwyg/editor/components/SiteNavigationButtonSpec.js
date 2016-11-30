describeExperiment({SiteNavigationRefactor: 'New'}, 'SiteNavigationButton', function() {
    testRequire().components('wysiwyg.editor.components.SiteNavigationButton');

    beforeEach(function () {
        /**@type wysiwyg.editor.components.SiteNavigationButton*/
        this.componentLogic = new this.SiteNavigationButton('testCompId', new Element('div'));
    });

    describe('_onAllSkinPartsReady', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, 'parent').andReturn();
            spyOn(this.componentLogic, '_listenToPageDataChange').andReturn();
            spyOn(this.componentLogic, '_listenToHomepageChange').andReturn();
            spyOn(this.componentLogic, '_setButtonState').andReturn();
            spyOn(this.componentLogic, '_onSetViewerMode').andReturn();
            spyOn(this.componentLogic, '_listenToViewerModeChanges').andReturn();
            spyOn(this.componentLogic, '_getPageId').andReturn('#1234');
            spyOn(this.componentLogic, 'setCommand').andReturn();
        });

        it('should call this.parent', function() {
            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic.parent).toHaveBeenCalled();
        });

        it('should call _listenToPageDataChange', function() {
            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic._listenToPageDataChange).toHaveBeenCalled();
        });

        it('should call _listenToHomepageChange', function() {
            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic._listenToHomepageChange).toHaveBeenCalled();
        });

        it('should call _setButtonState', function() {
            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic._setButtonState).toHaveBeenCalled();
        });

        it('should call _onSetViewerMode', function() {
            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic._onSetViewerMode).toHaveBeenCalled();
        });

        it('should call setCommand', function() {
            this.componentLogic._onAllSkinPartsReady();

            expect(this.componentLogic.setCommand).toHaveBeenCalledWith('EditorCommands.gotoSitePage', '1234');
        });
    });

    describe('_getItemType', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, '_getPageId').andReturn('#1234');
        });

        it('Should call _isHomepage with parameter "#1234"', function() {
            spyOn(this.componentLogic, '_isHomepage').andReturn();

            this.componentLogic._getItemType();

            expect(this.componentLogic._isHomepage).toHaveBeenCalledWith('#1234');
        });

        it('Should return "homepage" when _isHomepage returns true', function() {
            spyOn(this.componentLogic, '_isHomepage').andReturn(true);

            var itemType = this.componentLogic._getItemType();

            expect(itemType).toEqual('homepage');
        });

        it('Should return "" when _isHomepage returns false', function() {
            spyOn(this.componentLogic, '_isHomepage').andReturn(false);

            var itemType = this.componentLogic._getItemType();

            expect(itemType).toEqual('');
        });
    });

    describe('_onSetViewerMode', function() {
        beforeEach(function() {
            spyOn(this.componentLogic, 'setState').andReturn();
            spyOn(this.componentLogic, 'setIcon').andReturn();
        });

        it('should call setState with "readOnlyControls", "controls" when in mobile viewing mode', function() {
            var params = {
                mode: Constants.ViewerTypesParams.TYPES.MOBILE
            };

            this.componentLogic._onSetViewerMode(params);

            expect(this.componentLogic.setState).toHaveBeenCalledWith('readOnlyControls', 'controls');
        });

        it('should call setState with "normalControls", "controls" when in desktop viewing mode', function() {
            var params = {
                mode: Constants.ViewerTypesParams.TYPES.DESKTOP
            };

            this.componentLogic._onSetViewerMode(params);

            expect(this.componentLogic.setState).toHaveBeenCalledWith('normalControls', 'controls');
        });

        it('should call setIcon', function() {
            this.componentLogic._onSetViewerMode();

            expect(this.componentLogic.setIcon).toHaveBeenCalled();
        });
    });

    describe('_onSettingsClicked', function() {
        var commandParams = {
            pageId: '#1234',
            settingsButtonOverride: true
        };

        beforeEach(function() {
            this.componentLogic._refId = '#1234';
        });

        it('should execute the "WEditorCommands.PageSettings" command when controls state is normalControls (desktop)', function() {
            spyOn(this.componentLogic, 'getState').andReturn('normalControls');
            spyOn(this.componentLogic.resources.W.Commands, 'executeCommand').andReturn();

            this.componentLogic._onSettingsClicked();

            expect(this.componentLogic.resources.W.Commands.executeCommand).toHaveBeenCalledWith('WEditorCommands.PageSettings', commandParams);
        });

        it('should execute the "WEditorCommands.MobilePageSettings" command when controls state is readOnlyControls (mobile)', function() {
            spyOn(this.componentLogic, 'getState').andReturn('readOnlyControls');
            spyOn(this.componentLogic.resources.W.Commands, 'executeCommand').andReturn();

            this.componentLogic._onSettingsClicked();

            expect(this.componentLogic.resources.W.Commands.executeCommand).toHaveBeenCalledWith('WEditorCommands.MobilePageSettings', commandParams);
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
});
