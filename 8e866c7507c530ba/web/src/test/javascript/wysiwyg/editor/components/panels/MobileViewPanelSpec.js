xdescribe('MobileViewPanelSpec', function() {

    testRequire().
        components(
            'wysiwyg.editor.components.inputs.InputGroup',
            'wysiwyg.editor.components.panels.MobileQuickActionsViewPanel'
        );

    beforeEach(function() {

        this.rawDataAllEnabled = {
            id:"quickActionsAllEnabled",
            type:"QuickActions",
            quickActionsMenuEnabled: true,
            navigationMenuEnabled: true,
            phoneEnabled: true,
            emailEnabled: true,
            addressEnabled: true,
            socialLinksEnabled: true,
            colorScheme: 'dark'
        }

        this.dataQuickActionsAllEnabled = W.Data.createDataItem(this.rawDataAllEnabled, 'QuickActions');

        this.InputGroupMock = new MockBuilder('InputGroupMock').mockClass(this.InputGroup).getClass();
        this.mockInputGroup = new this.InputGroupMock();

        ComponentsTestUtil.buildComp(
            'wysiwyg.editor.components.panels.MobileQuickActionsViewPanel',
            'wysiwyg.editor.skins.panels.MobileQuickActionsViewPanelSkin', this.dataQuickActionsAllEnabled);
    });

    describe('specific method functionality', function() {
        xdescribe('_getDisplayOrNotDisplayLabel', function() {
            it('should return --display-- label when quickActionsMenuEnabled==true', function() {
                var panel = this.compLogic;
                panel._data.set('quickActionsMenuEnabled',true, true);
                expect(panel._getDisplayOrNotDisplayLabel()).toBe(panel._translate('MOBILE_VIEW_PANEL_DISPLAY_MOBILE_ACTION_BAR_ON_MOBILE_SITE'));
            });

            it('should return --not display-- label when quickActionsMenuEnabled==false', function() {
                var panel = this.compLogic;
                panel._data.set('quickActionsMenuEnabled',false, true);
                expect(panel._getDisplayOrNotDisplayLabel()).toBe(panel._translate('MOBILE_VIEW_PANEL_DONT_DISPLAY_MOBILE_ACTION_BAR_ON_MOBILE_SITE'));
            });
        });

        describe('_enableOrDisableMainSectionGroup', function() {
            beforeEach(function(){
                this.compLogic._mainSectionGroupLogic = this.mockInputGroup;
            });
            xit('should enable this._mainSectionGroupLogic if quickActionsMenuEnabled==true', function() {
                var panel = this.compLogic;
                panel._data.set('quickActionsMenuEnabled',true, true);

                panel._enableOrDisableMainSectionGroup();

                expect(panel._mainSectionGroupLogic.enable).toHaveBeenCalled();
            });
            it('should disable this._mainSectionGroupLogic if quickActionsMenuEnabled==true', function() {
                var panel = this.compLogic;
                panel._data.set('quickActionsMenuEnabled',false, true);

                panel._enableOrDisableMainSectionGroup();

                expect(panel._mainSectionGroupLogic.disable).toHaveBeenCalled();
            });
        });

    });

    describe('_updateChildrenState', function() {
        it('should do nothing', function() {
            var panel = this.compLogic;
            panel._fieldsProxies = [];
            spyOn(panel._fieldsProxies, 'forEach');

            panel._updateChildrenState();

            expect(panel._fieldsProxies.forEach).not.toHaveBeenCalled();
        });
    });



});