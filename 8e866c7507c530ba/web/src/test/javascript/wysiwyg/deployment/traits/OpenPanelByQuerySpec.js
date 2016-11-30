describe(" Open Panel By Query test", function () {

    testRequire().
        classes('wysiwyg.common.utils.OpenPanelByQuery');

    describe("open panel by query tests", function () {
        beforeEach(function () {
            this._openPanelByQueryClass = new this.OpenPanelByQuery();
            this._openPanelByQueryClass._siteIsReady = true;
            this._openPanelByQueryClass._previewIsReady = true;
        });

        it('should not open panel if query value is empty or wrong', function(){
            spyOn(W.Commands, 'executeCommand');
            this._openPanelByQueryClass._query = {'openpanel':'gaga'};
            this._openPanelByQueryClass._openPanelByQueryValue();
            expect(W.Commands.executeCommand).not.toHaveBeenCalled();

            this._openPanelByQueryClass._query = null;
            this._openPanelByQueryClass._openPanelByQueryValue();
            expect(W.Commands.executeCommand).not.toHaveBeenCalled();
        });

        it('should switch view mode to mobile', function(){
            this._openPanelByQueryClass._query = {'openpanel':'mobile'};
            spyOn(this._openPanelByQueryClass, '_openMobileViewMode');
            this._openPanelByQueryClass._openPanelByQueryValue();
            expect(this._openPanelByQueryClass._openMobileViewMode).toHaveBeenCalled();
        });

        it('should return right value in _getValueByQueryParam', function(){
            spyOn(W.Utils, 'getQueryStringAsObject').andCallFake(function() {
                return {'openpanel':'mobilebkg'};
            });
            expect(this._openPanelByQueryClass._getValueByQueryParam('openpanel')).toBe('mobilebkg');
        });

    });
});

